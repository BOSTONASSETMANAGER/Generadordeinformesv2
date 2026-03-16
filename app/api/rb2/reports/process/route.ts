import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runPipeline } from '@/lib/pipeline'
import { MIN_SIMILARITY_SCORE } from '@/lib/template-similarity'

export const maxDuration = 300

/**
 * Async Pipeline: fires the pipeline in the background and returns immediately.
 * The editor polls /api/rb2/reports/status to pick up results.
 *
 * Flow:
 * 1. Validate request + auth
 * 2. Save PDF source to DB
 * 3. Set report status = 'processing'
 * 4. Fire pipeline in background (no await)
 * 5. Return { status: 'processing' } immediately
 *
 * The background pipeline:
 * - Runs extraction (text-only, fast) → structuring → rendering → validation
 * - Saves extraction, version, and final status to DB
 * - Editor picks up results via polling
 */

export async function POST(request: NextRequest) {
  const checkpoints: string[] = []
  try {
    checkpoints.push('start')
    const supabase = createServerClient()
    checkpoints.push('supabase_created')
    const rb2 = (supabase as any).schema('rb2')
    checkpoints.push('rb2_schema')
    
    const body = await request.json()
    checkpoints.push(`body_parsed: keys=${Object.keys(body).join(',')}, pdfTextContent_len=${body.pdfTextContent?.length || 0}, pdfBase64_len=${body.pdfBase64?.length || 0}`)
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
      const pdfSize = Math.round((pdfBase64.length * 3) / 4)

      try {
        const existingSource = sources?.find((s: any) => s.report_id === reportId)

        if (existingSource) {
          const { error: updateError } = await rb2
            .from('report_sources')
            .update({
              file_name: sourceFileName,
              file_type: 'pdf',
              source_type: 'pdf',
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
          const { error: insertError } = await rb2
            .from('report_sources')
            .insert({
              report_id: reportId,
              user_id: user.id,
              file_name: sourceFileName,
              file_type: 'pdf',
              source_type: 'pdf',
              file_size: pdfSize,
              storage_path: `inline:${reportId}/${sourceFileName}`,
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
    // RUN PIPELINE (awaited — fast with text-only extraction)
    // ============================================
    const textContent = pdfTextContent || ''
    const currentVersion = (report.current_version || 0) + 1
    const userId = user.id
    const sourceId = sources?.[0]?.id || null

    checkpoints.push(`pre_pipeline: textContent_len=${textContent.length}, hasPdfBase64=${!!pdfBase64}, sourceFileUrl=${sources?.[0]?.file_url ? 'yes' : 'no'}`)
    console.log(`[process] Starting pipeline for report ${reportId}, textContent length=${textContent.length}, hasPdfBase64=${!!pdfBase64}, sourceFileUrl=${sources?.[0]?.file_url ? 'yes' : 'no'}, sourceFileName=${sourceFileName}`)

    try {
      const pipelineResult = await runPipeline(
        {
          reportId,
          userId,
          sourceFileUrl: sources?.[0]?.file_url || '',
          sourceFileName,
          reportName: report.name,
          pdfBase64: pdfBase64 || undefined,
        },
        textContent
      )

      // Save extraction
      if (pipelineResult.extractedJson) {
        const extractedJson = pipelineResult.extractedJson as any
        const { error: extractionError } = await rb2
          .from('extractions')
          .insert({
            report_id: reportId,
            source_id: sourceId,
            user_id: userId,
            extracted_json: extractedJson,
            issues: extractedJson.issues || [],
            needs_review: extractedJson.needs_review || false,
            validation_issues: pipelineResult.meta.similarity_diagnostics || [],
          })

        if (extractionError) {
          console.error('[process] Error saving extraction:', extractionError)
        } else {
          console.log(`[process] Extraction saved`)
        }
      }

      // Determine final status
      const similarityScore = pipelineResult.meta.template_similarity_score
      const templateValidation = pipelineResult.meta.template_validation
      let finalStatus: string
      let pipelineErrorMsg: string | null = null

      if (!pipelineResult.success) {
        finalStatus = 'error'
        pipelineErrorMsg = (pipelineResult as any).error || pipelineResult.meta.error_message || 'Pipeline returned success=false'
        console.error(`[process] Pipeline failed: ${pipelineErrorMsg}`)
      } else if (templateValidation && !templateValidation.passed) {
        finalStatus = 'error'
        pipelineErrorMsg = `Template validation failed: ${templateValidation.reasons?.join('; ') || 'unknown'}`
        console.error(`[process] Template validation FAILED → status=error`)
      } else if (similarityScore !== null && similarityScore < MIN_SIMILARITY_SCORE) {
        finalStatus = 'error'
        pipelineErrorMsg = `Similarity score ${similarityScore} below threshold ${MIN_SIMILARITY_SCORE}`
        console.warn(`[process] Similarity ${similarityScore} < ${MIN_SIMILARITY_SCORE} → status=error`)
      } else {
        finalStatus = 'ready'
      }

      // Always save a version row (even on error) for diagnosis
      const hasHtml = pipelineResult.htmlFinal || pipelineResult.extractedJson || (finalStatus === 'error')
      if (hasHtml) {
        const versionMeta: Record<string, unknown> = {
          ...pipelineResult.meta,
          template_similarity_score: similarityScore,
          final_status: finalStatus,
        }

        if (templateValidation && !templateValidation.passed) {
          versionMeta.change_log = {
            reason: templateValidation.reasons.join('; '),
            missing_classes: templateValidation.missingClasses,
            validation_passed: false,
          }
        }

        const { error: versionError } = await rb2
          .from('report_versions')
          .insert({
            report_id: reportId,
            user_id: userId,
            version_number: currentVersion,
            html_content: pipelineResult.htmlFinal || '',
            report_data: pipelineResult.extractedJson,
            warnings: pipelineResult.warnings,
            meta: versionMeta,
          })

        if (versionError) {
          console.error('[process] Error saving version:', versionError)
        } else {
          console.log(`[process] Version v${currentVersion} saved`)
        }
      }

      // Update report status
      const reportUpdate: Record<string, unknown> = {
        status: finalStatus,
        current_version: currentVersion,
        updated_at: new Date().toISOString(),
      }

      if (pipelineResult.reportTitle) {
        reportUpdate.name = pipelineResult.reportTitle
      }

      await rb2
        .from('reports')
        .update(reportUpdate)
        .eq('id', reportId)

      console.log(`[process] Report ${reportId} → status=${finalStatus}, version=v${currentVersion}`)
      console.log(`[process] Timings: extract=${pipelineResult.meta.extraction_duration_ms}ms, structure=${pipelineResult.meta.structurer_duration_ms}ms, render=${pipelineResult.meta.render_duration_ms}ms`)

      // Return result — editor polling will pick up the saved results
      return NextResponse.json({
        status: finalStatus,
        reportId,
        success: pipelineResult.success,
        error: pipelineErrorMsg || undefined,
        _checkpoints: checkpoints,
      })

    } catch (pipelineError) {
      const errMsg = pipelineError instanceof Error ? pipelineError.message : String(pipelineError)
      const errStack = pipelineError instanceof Error ? pipelineError.stack : undefined
      console.error(`[process] Pipeline failed for ${reportId}: ${errMsg}`)
      if (errStack) console.error(`[process] Stack trace: ${errStack}`)

      // Save error details to a version row for remote diagnosis
      try {
        await rb2
          .from('report_versions')
          .insert({
            report_id: reportId,
            user_id: userId,
            version_number: currentVersion,
            html_content: '',
            report_data: {},
            warnings: [`pipeline_crash: ${errMsg}`],
            meta: { error_message: errMsg, error_stack: errStack || null, pipeline_crashed: true },
          })
      } catch (saveErr) {
        console.error('[process] Failed to save error version:', saveErr)
      }

      // Mark report as error in DB — save error in name for diagnosis
      await rb2
        .from('reports')
        .update({ status: 'error', name: `PIPELINE_ERROR: ${errMsg.slice(0, 200)}`, updated_at: new Date().toISOString() })
        .eq('id', reportId)
        .catch((e: any) => console.error('[process] Failed to update error status:', e))

      return NextResponse.json({
        status: 'error',
        reportId,
        success: false,
        error: errMsg,
        _checkpoints: checkpoints,
      })
    }
  } catch (error) {
    const outerErr = error instanceof Error ? error.message : String(error)
    const outerStack = error instanceof Error ? error.stack?.slice(0, 300) : undefined
    console.error('[process] Unhandled error:', error)
    
    // Try to save error to report row for diagnosis
    try {
      const { createServerClient: csc } = await import('@/lib/supabase/server')
      const s = csc()
      const r = (s as any).schema('rb2')
      // Try to find reportId from body if available
      const bodyText = await request.clone().text().catch(() => '')
      const bodyMatch = bodyText.match(/"reportId"\s*:\s*"([^"]+)"/)
      const rId = bodyMatch?.[1]
      if (rId) {
        await r.from('reports').update({ status: 'error', name: `OUTER_ERROR: ${outerErr.slice(0, 200)}`, updated_at: new Date().toISOString() }).eq('id', rId)
      }
    } catch (_) { /* ignore */ }
    
    return NextResponse.json(
      { error: 'Internal server error', details: outerErr, stack: outerStack, _checkpoints: checkpoints },
      { status: 500 }
    )
  }
}
