import { NextRequest, NextResponse } from 'next/server'
import { loadAllTemplates, getTemplateFileNames } from '@/lib/template-loader'
import { MIN_SIMILARITY_SCORE } from '@/lib/template-similarity'
import { runPipeline } from '@/lib/pipeline'
import { requireAuth } from '@/lib/supabase/auth-guard'

/**
 * Test Pipeline Endpoint
 * 
 * GET  → Dry-run: loads templates, shows structure analysis (no AI calls)
 * POST → Full run: processes provided text through the full pipeline
 * 
 * Usage:
 *   GET  /api/rb2/reports/test-pipeline
 *   POST /api/rb2/reports/test-pipeline  { "pdfTextContent": "...", "sourceFileName": "test.pdf" }
 */

export async function GET() {
  try {
    const { errorResponse } = await requireAuth()
    if (errorResponse) return errorResponse
    const templateNames = getTemplateFileNames()
    const templates = loadAllTemplates()

    const templateSummaries = templates.map(t => ({
      fileName: t.fileName,
      rootWrapper: t.rootWrapper,
      sectionCount: t.sectionCount,
      hasCallsTable: t.hasCallsTable,
      hasPutsTable: t.hasPutsTable,
      hasKpis: t.hasKpis,
      cssVariableCount: t.cssVariables.length,
      htmlSize: t.html.length,
    }))

    // Cross-compare templates for consistency
    const rootWrappers = Array.from(
      new Set(templates.map(t => t.rootWrapper).filter(Boolean))
    )

    return NextResponse.json({
      status: 'ok',
      mode: 'dry-run (no AI calls)',
      templates_found: templateNames.length,
      template_files: templateNames,
      template_analysis: templateSummaries,
      root_wrappers_found: rootWrappers,
      min_similarity_score: MIN_SIMILARITY_SCORE,
      prompt_files: {
        openai: 'ai/prompts/openai/extract-premium-from-pdf.md',
        anthropic: 'ai/prompts/anthropic/assemble-premium-html.md',
        shared: [
          'ai/prompts/shared/json-contracts.md',
          'ai/prompts/shared/rules-literal-content.md',
        ],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Test pipeline failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth()
    if (errorResponse) return errorResponse

    const body = await request.json()
    const { pdfTextContent, sourceFileName } = body

    if (!pdfTextContent) {
      return NextResponse.json(
        { error: 'pdfTextContent is required in request body' },
        { status: 400 }
      )
    }

    console.log('[test-pipeline] Starting full pipeline test...')
    console.log(`[test-pipeline] Source: ${sourceFileName || 'test.pdf'}, content length: ${pdfTextContent.length}`)

    const result = await runPipeline(
      {
        reportId: 'test-run',
        userId: 'test-user',
        sourceFileUrl: '',
        sourceFileName: sourceFileName || 'test.pdf',
        reportName: 'Test Pipeline Run',
      },
      pdfTextContent
    )

    // Build console-friendly summary
    const summary = {
      success: result.success,
      template_chosen: result.templateChosen,
      similarity_score: result.meta.template_similarity_score,
      score_passes: result.meta.template_similarity_score !== null
        ? result.meta.template_similarity_score >= MIN_SIMILARITY_SCORE
        : null,
      min_score: MIN_SIMILARITY_SCORE,
      extracted_json_size: result.meta.extracted_json_size,
      html_size: result.meta.html_size,
      extraction_duration_ms: result.meta.extraction_duration_ms,
      assembly_duration_ms: result.meta.assembly_duration_ms,
      warnings_count: result.warnings.length,
      diagnostics_count: result.meta.similarity_diagnostics.length,
    }

    console.log('[test-pipeline] === RESULTS ===')
    console.log(`[test-pipeline] template_chosen: ${summary.template_chosen}`)
    console.log(`[test-pipeline] similarity_score: ${summary.similarity_score}`)
    console.log(`[test-pipeline] score_passes: ${summary.score_passes}`)
    console.log(`[test-pipeline] extracted_json_size: ${summary.extracted_json_size}`)
    console.log(`[test-pipeline] html_size: ${summary.html_size}`)

    return NextResponse.json({
      summary,
      pipeline: result.meta,
      similarity: result.similarityResult,
      warnings: result.warnings,
      html_preview: result.htmlFinal ? result.htmlFinal.substring(0, 2000) + '...' : null,
      error: result.error || null,
    })
  } catch (error) {
    console.error('[test-pipeline] Error:', error)
    return NextResponse.json(
      { error: 'Test pipeline failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
