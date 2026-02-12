import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runPipeline } from '@/lib/pipeline'
import { MIN_SIMILARITY_SCORE } from '@/lib/template-similarity'

/**
 * Pipeline: Extract → Select Template → Assemble → Validate → Save
 * 
 * This endpoint orchestrates the AI agents:
 * 1. Agent A (OpenAI): Extract structured JSON from PDF/images
 * 2. Template Loader: Select best matching template from /informes premium ejemplos/
 * 3. Agent B (Claude): Clone template and inject extracted content
 * 4. Similarity Scorer: Validate HTML fidelity to template
 * 5. Save: Store extraction, version, and meta in rb2 schema
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const rb2 = (supabase as any).schema('rb2')
    
    const body = await request.json()
    const { reportId, pdfTextContent, pdfBase64 } = body

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get report and sources
    const { data: report, error: reportError } = await rb2
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const { data: sources, error: sourcesError } = await rb2
      .from('report_sources')
      .select('*')
      .eq('report_id', reportId)

    if (sourcesError) {
      console.error('[process] Error fetching sources:', sourcesError)
    }

    // Update report status to processing
    await rb2
      .from('reports')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', reportId)

    // ============================================
    // SAVE PDF TO report_sources (base64 in DB)
    // ============================================
    let sourceFileName = sources?.[0]?.file_name || 'unknown.pdf'

    if (pdfBase64) {
      sourceFileName = body.sourceFileName || 'report.pdf'
      const pdfSize = Math.round((pdfBase64.length * 3) / 4) // approximate decoded size

      try {
        // Check if source already exists for this report
        const existingSource = sources?.find((s: any) => s.report_id === reportId)

        if (existingSource) {
          // Update existing source with new PDF
          const { error: updateError } = await rb2
            .from('report_sources')
            .update({
              file_name: sourceFileName,
              file_type: 'pdf',
              file_size: pdfSize,
              pdf_base64: pdfBase64,
              status: 'ready',
            })
            .eq('id', existingSource.id)

          if (updateError) {
            console.warn('[process] Error updating source:', updateError)
          } else {
            console.log(`[process] PDF saved to report_sources (updated), size: ${(pdfSize / 1024).toFixed(0)}KB`)
          }
        } else {
          // Insert new source
          const { error: insertError } = await rb2
            .from('report_sources')
            .insert({
              report_id: reportId,
              user_id: user.id,
              file_name: sourceFileName,
              file_type: 'pdf',
              file_size: pdfSize,
              pdf_base64: pdfBase64,
              status: 'ready',
            })

          if (insertError) {
            console.warn('[process] Error saving source:', insertError)
          } else {
            console.log(`[process] PDF saved to report_sources (new), size: ${(pdfSize / 1024).toFixed(0)}KB`)
          }
        }
      } catch (err) {
        console.error('[process] Error saving PDF source:', err)
      }
    }

    // ============================================
    // RUN FULL PIPELINE
    // ============================================
    const textContent = pdfTextContent || ''
    if (!textContent) {
      console.warn('[process] No pdfTextContent provided — pipeline will use empty content')
    }

    console.log(`[process] Starting pipeline for report ${reportId}`)
    console.log(`[process] User: ${user.id}, Sources: ${sources?.length || 0}`)

    const pipelineResult = await runPipeline(
      {
        reportId,
        userId: user.id,
        sourceFileUrl: sources?.[0]?.file_url || '',
        sourceFileName,
        reportName: report.name,
        pdfBase64: pdfBase64 || undefined,
      },
      textContent
    )

    // ============================================
    // SAVE EXTRACTION to rb2.extractions
    // ============================================
    let extraction = null
    if (pipelineResult.extractedJson) {
      const extractedJson = pipelineResult.extractedJson as any
      const { data: extractionData, error: extractionError } = await rb2
        .from('extractions')
        .insert({
          report_id: reportId,
          source_id: sources?.[0]?.id || null,
          user_id: user.id,
          extracted_json: extractedJson,
          issues: extractedJson.issues || [],
          needs_review: extractedJson.needs_review || false,
          validation_issues: pipelineResult.meta.similarity_diagnostics || [],
        })
        .select()
        .single()

      if (extractionError) {
        console.error('[process] Error saving extraction:', extractionError)
      } else {
        extraction = extractionData
        console.log(`[process] Extraction saved: ${extractionData?.id}`)
      }
    }

    // ============================================
    // DETERMINE STATUS based on validation + similarity
    // ============================================
    const similarityScore = pipelineResult.meta.template_similarity_score
    const templateValidation = pipelineResult.meta.template_validation
    let finalStatus: string

    if (!pipelineResult.success) {
      finalStatus = 'error'
    } else if (templateValidation && !templateValidation.passed) {
      finalStatus = 'error'
      console.error(`[process] Template validation FAILED → status=error`)
    } else if (similarityScore !== null && similarityScore < MIN_SIMILARITY_SCORE) {
      finalStatus = 'error'
      pipelineResult.warnings.push(
        `Template similarity score ${similarityScore} is below minimum ${MIN_SIMILARITY_SCORE}. Status set to error.`
      )
      console.warn(`[process] Similarity score ${similarityScore} < ${MIN_SIMILARITY_SCORE} → status=error`)
    } else {
      finalStatus = 'ready'
    }

    // ============================================
    // SAVE VERSION to rb2.report_versions
    // ============================================
    const currentVersion = (report.current_version || 0) + 1
    let version = null

    const hasHtml = pipelineResult.htmlFinal || (finalStatus === 'error' && pipelineResult.extractedJson)
    if (hasHtml) {
      const versionMeta: Record<string, unknown> = {
        ...pipelineResult.meta,
        template_file: pipelineResult.meta.template_file,
        template_hash: pipelineResult.meta.template_hash,
        html_hash: pipelineResult.meta.html_hash,
        template_similarity_score: similarityScore,
        final_status: finalStatus,
      }

      // If validation failed, store change_log with reasons
      if (templateValidation && !templateValidation.passed) {
        versionMeta.change_log = {
          reason: templateValidation.reasons.join('; '),
          missing_classes: templateValidation.missingClasses,
          validation_passed: false,
        }
      }

      const { data: versionData, error: versionError } = await rb2
        .from('report_versions')
        .insert({
          report_id: reportId,
          user_id: user.id,
          version_number: currentVersion,
          html_content: pipelineResult.htmlFinal || '',
          report_data: pipelineResult.extractedJson,
          warnings: pipelineResult.warnings,
          meta: versionMeta,
        })
        .select()
        .single()

      if (versionError) {
        console.error('[process] Error saving version:', versionError)
        return NextResponse.json(
          { error: 'Failed to save version', details: versionError.message },
          { status: 500 }
        )
      }

      version = versionData
      console.log(`[process] Version saved: ${versionData?.id}, v${currentVersion}`)
    }

    // ============================================
    // UPDATE REPORT STATUS
    // ============================================
    // Build update payload — include extracted title if available
    const reportUpdate: Record<string, unknown> = {
      status: finalStatus,
      current_version: currentVersion,
      updated_at: new Date().toISOString(),
    }

    if (pipelineResult.reportTitle) {
      reportUpdate.name = pipelineResult.reportTitle
      console.log(`[process] Updating report name to: "${pipelineResult.reportTitle}"`)
    }

    await rb2
      .from('reports')
      .update(reportUpdate)
      .eq('id', reportId)

    console.log(`[process] Report ${reportId} → status=${finalStatus}, version=${currentVersion}`)
    console.log(`[process] Pipeline meta:`, JSON.stringify({
      reportId,
      templateFile: pipelineResult.meta.template_file,
      templateHash: pipelineResult.meta.template_hash,
      htmlHash: pipelineResult.meta.html_hash,
      validate: templateValidation?.passed ? 'passed' : 'failed',
      missingClasses: templateValidation && !templateValidation.passed ? templateValidation.missingClasses.slice(0, 10) : [],
      similarity_score: similarityScore,
      extracted_json_size: pipelineResult.meta.extracted_json_size,
      html_size: pipelineResult.meta.html_size,
      extraction_ms: pipelineResult.meta.extraction_duration_ms,
      assembly_ms: pipelineResult.meta.assembly_duration_ms,
    }))

    return NextResponse.json({
      success: pipelineResult.success,
      report: { ...report, status: finalStatus, current_version: currentVersion },
      extraction,
      version,
      pipeline: {
        template_chosen: pipelineResult.templateChosen,
        similarity_score: similarityScore,
        similarity_details: pipelineResult.similarityResult?.details || null,
        diagnostics: pipelineResult.similarityResult?.diagnostics || [],
        warnings: pipelineResult.warnings,
        meta: pipelineResult.meta,
      },
    })
  } catch (error) {
    console.error('[process] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
