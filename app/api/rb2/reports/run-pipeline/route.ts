import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runPipeline } from '@/lib/pipeline'
import { MIN_SIMILARITY_SCORE } from '@/lib/template-similarity'

export const maxDuration = 300

/**
 * Internal pipeline endpoint — called by /process via fire-and-forget fetch.
 * Uses service-role client (no cookies needed) so it can run independently.
 * Authenticated via a shared secret in the Authorization header.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify internal secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.PIPELINE_INTERNAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportId, userId, sourceFileUrl, sourceFileName, reportName, pdfBase64, pdfTextContent, currentVersion, sourceId } = body

    if (!reportId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const rb2 = (supabase as any).schema('rb2')
    const textContent = pdfTextContent || ''

    console.log(`[run-pipeline] Starting pipeline for report ${reportId}, textContent length=${textContent.length}`)

    try {
      const pipelineResult = await runPipeline(
        {
          reportId,
          userId,
          sourceFileUrl: sourceFileUrl || '',
          sourceFileName: sourceFileName || 'unknown.pdf',
          reportName: reportName || '',
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
            source_id: sourceId || null,
            user_id: userId,
            extracted_json: extractedJson,
            issues: extractedJson.issues || [],
            needs_review: extractedJson.needs_review || false,
            validation_issues: pipelineResult.meta.similarity_diagnostics || [],
          })

        if (extractionError) {
          console.error('[run-pipeline] Error saving extraction:', extractionError)
        } else {
          console.log(`[run-pipeline] Extraction saved`)
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
        console.error(`[run-pipeline] Pipeline failed: ${pipelineErrorMsg}`)
      } else if (templateValidation && !templateValidation.passed) {
        finalStatus = 'error'
        pipelineErrorMsg = `Template validation failed: ${templateValidation.reasons?.join('; ') || 'unknown'}`
        console.error(`[run-pipeline] Template validation FAILED → status=error`)
      } else if (similarityScore !== null && similarityScore < MIN_SIMILARITY_SCORE) {
        finalStatus = 'error'
        pipelineErrorMsg = `Similarity score ${similarityScore} below threshold ${MIN_SIMILARITY_SCORE}`
        console.warn(`[run-pipeline] Similarity ${similarityScore} < ${MIN_SIMILARITY_SCORE} → status=error`)
      } else {
        finalStatus = 'ready'
      }

      // Always save a version row (even on error)
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
            version_number: currentVersion || 1,
            html_content: pipelineResult.htmlFinal || '',
            report_data: pipelineResult.extractedJson,
            warnings: pipelineResult.warnings,
            meta: versionMeta,
          })

        if (versionError) {
          console.error('[run-pipeline] Error saving version:', versionError)
        } else {
          console.log(`[run-pipeline] Version v${currentVersion} saved`)
        }
      }

      // Update report status
      const reportUpdate: Record<string, unknown> = {
        status: finalStatus,
        current_version: currentVersion || 1,
        updated_at: new Date().toISOString(),
      }

      if (pipelineResult.reportTitle) {
        reportUpdate.name = pipelineResult.reportTitle
      }

      await rb2
        .from('reports')
        .update(reportUpdate)
        .eq('id', reportId)

      console.log(`[run-pipeline] Report ${reportId} → status=${finalStatus}, version=v${currentVersion}`)
      console.log(`[run-pipeline] Timings: extract=${pipelineResult.meta.extraction_duration_ms}ms, structure=${pipelineResult.meta.structurer_duration_ms}ms, render=${pipelineResult.meta.render_duration_ms}ms`)

      return NextResponse.json({ status: finalStatus, success: pipelineResult.success })

    } catch (pipelineError) {
      const errMsg = pipelineError instanceof Error ? pipelineError.message : String(pipelineError)
      const errStack = pipelineError instanceof Error ? pipelineError.stack : undefined
      console.error(`[run-pipeline] Pipeline crashed for ${reportId}: ${errMsg}`)
      if (errStack) console.error(`[run-pipeline] Stack trace: ${errStack}`)

      // Save error version row
      try {
        await rb2
          .from('report_versions')
          .insert({
            report_id: reportId,
            user_id: userId,
            version_number: currentVersion || 1,
            html_content: '',
            report_data: {},
            warnings: [`pipeline_crash: ${errMsg}`],
            meta: { error_message: errMsg, error_stack: errStack || null, pipeline_crashed: true },
          })
      } catch (saveErr) {
        console.error('[run-pipeline] Failed to save error version:', saveErr)
      }

      // Mark report as error
      await rb2
        .from('reports')
        .update({ status: 'error', updated_at: new Date().toISOString() })
        .eq('id', reportId)
        .catch((e: any) => console.error('[run-pipeline] Failed to update error status:', e))

      return NextResponse.json({ status: 'error', error: errMsg })
    }
  } catch (error) {
    console.error('[run-pipeline] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
