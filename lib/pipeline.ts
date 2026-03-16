/**
 * Report Generation Pipeline
 * Step 0: PDF → page screenshots (PNG) via pdf-to-png-converter
 * Step 1: OpenAI Vision Extractor — page images → structured JSON (verbatim)
 * Step 2: Template loader selects best template
 * Step 3: Claude Sonnet 4.5 Structurer — extractedJson → StructuredReport JSON
 * Step 4: Deterministic HTML Renderer — StructuredReport + template → html_final
 * Step 5: Similarity scorer + anti-layout-inventado validation
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import OpenAI from 'openai'
import { selectTemplate, selectTemplateWithGolden, getTemplateFileNames } from './template-loader'
import { computeTemplateSimilarity, MIN_SIMILARITY_SCORE } from './template-similarity'
import { validateTemplateUsage } from './template-validation'
import { convertPdfToImages, downloadPdfAsBuffer, buildVisionContentParts } from './pdf-to-images'
import { callClaude, selectClaudeModel } from './claude'
import { PREMIUM_STRUCTURER_SYSTEM } from '@/ai/prompts/premium-structurer'
import { recognizeBlocks } from './block-recognizer'
import type { SectionBlueprint } from './block-recognizer'
import { validateStructuredReport } from './structured-report-validator'
import type { StructuredReport } from '@/ai/prompts/premium-structurer'
import { renderPremiumHTML } from '@/ai/templates/premiumTemplate'
import type { PdfPageImage } from './pdf-to-images'
import type { TemplateSelection, TemplateSelectionResult } from './template-loader'
import type { SimilarityResult } from './template-similarity'
import type { TemplateValidationResult } from './template-validation'

// Prompt file paths (relative to project root)
const PROMPT_EXTRACTOR = 'ai/prompts/openai/extract-premium-from-pdf.md'
const PROMPT_JSON_CONTRACTS = 'ai/prompts/shared/json-contracts.md'
const PROMPT_RULES_LITERAL = 'ai/prompts/shared/rules-literal-content.md'

export interface PipelineInput {
  reportId: string
  userId: string
  sourceFileUrl: string
  sourceFileName: string
  reportName: string
  pdfBase64?: string  // Base64-encoded PDF file (sent from client when no storage URL)
}

export interface PipelineResult {
  success: boolean
  extractedJson: Record<string, unknown> | null
  htmlFinal: string | null
  templateChosen: string | null
  similarityResult: SimilarityResult | null
  warnings: string[]
  meta: PipelineMeta
  reportTitle?: string  // Extracted title from PDF header for display
  error?: string
}

export interface PipelineMeta {
  prompt_file_used_extractor: string
  structurer_model: string | null
  template_files_seen: string[]
  template_chosen: string | null
  template_file: string | null
  template_hash: string | null
  html_hash: string | null
  extracted_json_size: number
  html_size: number
  template_similarity_score: number | null
  similarity_details: Record<string, unknown> | null
  similarity_diagnostics: string[]
  template_validation: TemplateValidationResult | null
  template_source: 'golden' | 'filesystem' | null
  golden_template_id: string | null
  golden_examples_count: number
  pipeline_started_at: string
  pipeline_finished_at: string | null
  extraction_duration_ms: number | null
  structurer_duration_ms: number | null
  render_duration_ms: number | null
  error_message: string | null
}

/**
 * Load a prompt file from disk
 */
function loadPrompt(relativePath: string): string {
  const fullPath = path.join(process.cwd(), relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Prompt file not found: ${fullPath}`)
  }
  return fs.readFileSync(fullPath, 'utf-8')
}

/**
 * Parse JSON from an LLM response, handling markdown fences and partial JSON.
 */
function parseJsonResponse(raw: string): Record<string, unknown> {
  let str = raw.trim()

  // Strip markdown code fences
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  // Try direct parse
  try {
    return JSON.parse(str)
  } catch {
    // Fallback: find first { ... } block
    const match = str.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error(`Could not parse JSON from response: ${str.slice(0, 200)}...`)
  }
}

/**
 * Get or create the OpenAI SDK client (singleton).
 */
let _openaiClient: OpenAI | null = null
function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not set')
    _openaiClient = new OpenAI({ apiKey, timeout: 300_000, maxRetries: 2 })
  }
  return _openaiClient
}

/**
 * Call OpenAI chat completions for extraction (text-only, no images).
 * Uses the OpenAI SDK for proper timeout/retry handling.
 */
async function extractTextOnly(
  systemPrompt: string,
  pdfTextContent: string,
  sourceFileName: string,
  model: string
): Promise<Record<string, unknown>> {
  console.log(`[pipeline:extract] Text-only extraction with ${model}...`)

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 16384,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Extract the content from this financial report document.\n\nFilename: ${sourceFileName}\n\nDocument content:\n\n${pdfTextContent}`,
      },
    ],
  })

  const content = completion.choices?.[0]?.message?.content || ''
  return parseJsonResponse(content)
}

/**
 * Step 1: 2-pass extraction pipeline.
 *
 * Pass 1 (text-only, ~15s): Extract all content from OCR text — fast, complete, no images.
 * Pass 2 (vision enhancement, ~20s): Send page images (low detail) + Pass 1 JSON summary.
 *   The model enriches with layout hints: chart descriptions, table structures, column layouts.
 * Merge: Deep-merge Pass 2 enhancements into Pass 1 base.
 *
 * This avoids the single massive Vision call that was timing out (10+ min).
 */
async function extractWithOpenAI(
  pageImages: PdfPageImage[],
  pdfTextContent: string,
  sourceFileName: string
): Promise<Record<string, unknown>> {
  const systemPrompt = loadPrompt(PROMPT_EXTRACTOR)
  const rulesLiteral = loadPrompt(PROMPT_RULES_LITERAL)
  const jsonContracts = loadPrompt(PROMPT_JSON_CONTRACTS)
  const fullSystemPrompt = `${systemPrompt}\n\n---\n\n${rulesLiteral}\n\n---\n\n${jsonContracts}`

  const extractorModel = process.env.OPENAI_EXTRACTOR_MODEL || 'gpt-4o'

  // ── PASS 1: Text-only extraction (fast, complete content) ──
  console.log(`[pipeline:extract] Pass 1: Text-only extraction with ${extractorModel}...`)
  const pass1Start = Date.now()
  const pass1Result = await extractTextOnly(fullSystemPrompt, pdfTextContent, sourceFileName, extractorModel)
  const pass1Duration = Date.now() - pass1Start
  const p1 = pass1Result as any
  console.log(`[pipeline:extract] Pass 1 complete in ${pass1Duration}ms. Blocks: ${p1.blocks?.length || 0}, KPIs: ${p1.kpis?.length || p1.kpis_verbatim?.length || 0}`)

  // If no images available, return text-only result
  if (pageImages.length === 0) {
    console.log(`[pipeline:extract] No page images — skipping Pass 2 (vision enhancement)`)
    return pass1Result
  }

  // ── PASS 2: Vision enhancement (images only, no text dump) ──
  console.log(`[pipeline:extract] Pass 2: Vision enhancement with ${extractorModel}...`)
  const pass2Start = Date.now()

  const totalImageBytes = pageImages.reduce((sum, img) => sum + img.base64.length, 0)
  console.log(`[pipeline:extract] Pass 2 payload: ${(totalImageBytes / 1024 / 1024).toFixed(1)}MB across ${pageImages.length} pages (all low detail)`)

  try {
    const openai = getOpenAIClient()

    // Pass 2 prompt: images + compact summary of Pass 1, asking for visual enrichment only
    const pass1Summary = JSON.stringify(pass1Result, null, 0).slice(0, 4000)
    const visionPrompt = `You are a visual layout analyzer for financial reports. You MUST respond with ONLY a valid JSON object.

I already extracted the text content from this report. Below is a compact summary of what was extracted:
${pass1Summary}

Now look at the page screenshots below. Your job is to ENRICH the extraction with visual information that text alone cannot capture:

1. "layout_hints": For each section, describe the visual layout (e.g. "2-column grid", "full-width table", "chart with bars")
2. "chart_descriptions": Describe any charts/graphs you see (type, axes, data points, colors)
3. "table_structures": For any tables, confirm column count, header names, and row count
4. "visual_hierarchy": Note which sections have colored headers (green=calls, red=puts), icons, or special styling
5. "missing_content": Any text visible in images that is NOT in the summary above

Return a JSON object with these keys. Keep descriptions concise. If nothing to add for a key, use an empty array [].`

    const userContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'low' } }> = [
      { type: 'text', text: visionPrompt },
    ]
    for (const img of pageImages) {
      userContent.push({ type: 'text', text: `--- Page ${img.pageNumber} ---` })
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${img.base64}`, detail: 'low' },
      })
    }

    const completion = await openai.chat.completions.create({
      model: extractorModel,
      temperature: 0,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: 'You are a visual document analyzer. Return ONLY valid JSON. No prose.' },
        { role: 'user', content: userContent as any },
      ],
    })

    const content = completion.choices?.[0]?.message?.content || ''
    const pass2Duration = Date.now() - pass2Start
    console.log(`[pipeline:extract] Pass 2 complete in ${pass2Duration}ms. Response: ${content.length} chars`)

    // Merge vision enhancements into Pass 1 result
    try {
      const visionEnhancements = parseJsonResponse(content)
      const merged = { ...pass1Result, _vision_enhancements: visionEnhancements }
      console.log(`[pipeline:extract] Merged Pass 1 + Pass 2 successfully`)
      return merged
    } catch (mergeErr) {
      console.warn(`[pipeline:extract] Pass 2 JSON parse failed, using Pass 1 only`)
      return pass1Result
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const pass2Duration = Date.now() - pass2Start
    console.warn(`[pipeline:extract] Pass 2 vision failed in ${pass2Duration}ms: ${errMsg}`)
    console.log(`[pipeline:extract] Using Pass 1 text-only result (still complete content)`)
    return pass1Result
  }
}

/**
 * Step 3: Call Claude to structure extractedJson into a StructuredReport.
 * Claude only produces JSON — no HTML generation.
 */
async function structureWithClaude(
  extractedJson: Record<string, unknown>,
  model: string
): Promise<{ structured: StructuredReport; warnings: string[]; blueprints: SectionBlueprint[] }> {
  console.log(`[pipeline:structure] Calling Claude (${model}) to structure extracted JSON...`)

  // ── Block Recognizer: analyze extractedJson and generate section blueprint ──
  const { blueprints, prompt_injection } = recognizeBlocks(extractedJson)
  console.log(`[pipeline:structure] Block recognizer: ${blueprints.length} section blueprints generated`)

  // Inject blueprint into system prompt so Claude knows EXACTLY which components to use
  const systemPromptWithBlueprint = PREMIUM_STRUCTURER_SYSTEM + '\n' + prompt_injection

  const userMessage = JSON.stringify(extractedJson, null, 2)
  console.log(`[pipeline:structure] Input JSON size: ${userMessage.length} chars`)

  const responseText = await callClaude(systemPromptWithBlueprint, userMessage, {
    model,
    maxTokens: 32000,
    temperature: 0,
  })

  if (!responseText) {
    throw new Error('Claude structurer returned empty response')
  }

  console.log(`[pipeline:structure] Response length: ${responseText.length}`)

  // Parse JSON (handle markdown fences)
  let jsonStr = responseText.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  let structured: StructuredReport
  try {
    structured = JSON.parse(jsonStr) as StructuredReport
  } catch (parseErr) {
    console.error(`[pipeline:structure] JSON parse failed. First 500 chars:`, jsonStr.slice(0, 500))
    // Try to find JSON object in response
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (match) {
      structured = JSON.parse(match[0]) as StructuredReport
    } else {
      throw new Error(`Failed to parse Claude structurer response as JSON: ${(parseErr as Error).message}`)
    }
  }

  const warnings: string[] = []

  // Basic validation
  if (!structured.title) warnings.push('structurer: missing title')
  if (!structured.kpis || structured.kpis.length === 0) warnings.push('structurer: no KPIs found')
  if (!structured.sections || structured.sections.length === 0) warnings.push('structurer: no sections found')

  console.log(`[pipeline:structure] Structured: title="${structured.title}", kpis=${structured.kpis?.length || 0}, sections=${structured.sections?.length || 0}, strategy=${structured.strategy ? 'yes' : 'no'}, conclusion=${structured.conclusion ? 'yes' : 'no'}`)

  return { structured, warnings, blueprints }
}

/**
 * Run the full pipeline: Extract → Select Template → Structure → Render → Validate
 */
export async function runPipeline(
  input: PipelineInput,
  pdfTextContent: string
): Promise<PipelineResult> {
  const meta: PipelineMeta = {
    prompt_file_used_extractor: PROMPT_EXTRACTOR,
    structurer_model: null,
    template_files_seen: [],
    template_chosen: null,
    template_file: null,
    template_hash: null,
    html_hash: null,
    extracted_json_size: 0,
    html_size: 0,
    template_similarity_score: null,
    similarity_details: null,
    similarity_diagnostics: [],
    template_validation: null,
    template_source: null,
    golden_template_id: null,
    golden_examples_count: 0,
    pipeline_started_at: new Date().toISOString(),
    pipeline_finished_at: null,
    extraction_duration_ms: null,
    structurer_duration_ms: null,
    render_duration_ms: null,
    error_message: null,
  }

  const warnings: string[] = []

  try {
    // Log template files seen
    meta.template_files_seen = getTemplateFileNames()
    console.log(`[pipeline] Template files seen: ${meta.template_files_seen.length}`)

    // STEP 0: Convert PDF to page images for Vision extraction
    // ALL pages extracted at scale 1.0 (small per-page payload)
    // Tiered detail in Vision call: high for pages 1-2, low for rest
    let pageImages: PdfPageImage[] = []
    const imgStart = Date.now()

    if (input.pdfBase64) {
      console.log(`[pipeline] Step 0: Converting base64 PDF to page images (scale=1.0, ALL pages)...`)
      const pdfBuffer = Buffer.from(input.pdfBase64, 'base64')
      pageImages = await convertPdfToImages(pdfBuffer, { scale: 1.0 })
    } else if (input.sourceFileUrl) {
      console.log(`[pipeline] Step 0: Downloading PDF and converting to page images (scale=1.0, ALL pages)...`)
      const pdfBuffer = await downloadPdfAsBuffer(input.sourceFileUrl)
      pageImages = await convertPdfToImages(pdfBuffer, { scale: 1.0 })
    } else {
      console.log(`[pipeline] Step 0: No PDF file available — text-only mode`)
    }

    const imgDuration = Date.now() - imgStart
    if (pageImages.length > 0) {
      console.log(`[pipeline] PDF → ${pageImages.length} page images in ${imgDuration}ms`)
    }

    // STEP 1: Extract with OpenAI Vision (page images + supplementary text)
    const extractStart = Date.now()
    const extractedJson = await extractWithOpenAI(pageImages, pdfTextContent, input.sourceFileName)
    meta.extraction_duration_ms = Date.now() - extractStart
    meta.extracted_json_size = JSON.stringify(extractedJson).length
    console.log(`[pipeline] Extraction took ${meta.extraction_duration_ms}ms, JSON size: ${meta.extracted_json_size}`)

    // STEP 2: Select template (golden templates first, then filesystem)
    const ticker = extractTickerFromJson(extractedJson)
    const templateResult = await selectTemplateWithGolden(
      { category: 'opciones_premium', ticker, userId: input.userId },
      extractedJson
    )
    const chosenTemplate = templateResult.primary
    meta.template_chosen = chosenTemplate.fileName
    meta.template_file = chosenTemplate.fileName
    meta.template_hash = chosenTemplate.hash
    meta.template_source = templateResult.source
    meta.golden_template_id = templateResult.goldenId || null
    meta.golden_examples_count = templateResult.goldenExamples.length
    console.log(`[pipeline] Template chosen: ${chosenTemplate.fileName} (hash: ${chosenTemplate.hash}, source: ${templateResult.source}, golden_examples: ${templateResult.goldenExamples.length})`)

    // STEP 3: Structure with Claude (extractedJson → StructuredReport JSON)
    const blockCount = (extractedJson as any).blocks?.length || 0
    const claudeModel = selectClaudeModel(blockCount, pageImages.length)
    meta.structurer_model = claudeModel

    const structureStart = Date.now()
    const { structured, warnings: structureWarnings, blueprints } = await structureWithClaude(extractedJson, claudeModel)
    meta.structurer_duration_ms = Date.now() - structureStart
    warnings.push(...structureWarnings)
    console.log(`[pipeline] Structuring took ${meta.structurer_duration_ms}ms`)

    // STEP 3b: Validate structured report against blueprints
    const validation = validateStructuredReport(structured, blueprints)
    if (validation.repairs.length > 0) {
      warnings.push(`structurer_auto_repairs: ${validation.repairs.join('; ')}`)
    }
    for (const issue of validation.issues) {
      if (issue.severity === 'error') {
        warnings.push(`structurer_error: [${issue.section}] ${issue.message}`)
      } else {
        warnings.push(`structurer_warning: [${issue.section}] ${issue.message}`)
      }
    }
    console.log(`[pipeline] Structured report validation: ${validation.valid ? 'PASSED' : 'HAS ISSUES'} (${validation.content_block_count} content blocks, ${validation.issues.length} issues, ${validation.repairs.length} repairs)`)

    // STEP 4: Deterministic HTML Render (StructuredReport + template → html_final)
    const renderStart = Date.now()
    const htmlFinal = renderPremiumHTML(structured, chosenTemplate.html)
    meta.render_duration_ms = Date.now() - renderStart
    meta.html_size = htmlFinal.length
    meta.html_hash = crypto.createHash('sha256').update(htmlFinal).digest('hex').slice(0, 16)
    console.log(`[pipeline] Render took ${meta.render_duration_ms}ms, HTML size: ${meta.html_size}`)

    // STEP 5a: Anti-layout-inventado validation
    const templateValidation = validateTemplateUsage(chosenTemplate.html, htmlFinal)
    meta.template_validation = templateValidation

    console.log(`[pipeline] Template validation: ${templateValidation.passed ? 'PASSED' : 'FAILED'}`)
    console.log(`[pipeline] reportId=${input.reportId} templateFile=${chosenTemplate.fileName} templateHash=${chosenTemplate.hash} htmlHash=${meta.html_hash} validate=${templateValidation.passed ? 'passed' : 'failed'}`)

    if (!templateValidation.passed) {
      console.error(`[pipeline] ANTI-LAYOUT-INVENTADO FAILED:`, templateValidation.reasons)
      console.error(`[pipeline] missingClasses (sample):`, templateValidation.missingClasses.slice(0, 10))

      meta.pipeline_finished_at = new Date().toISOString()

      const reportTitle = extractReportTitle(extractedJson, pdfTextContent)

      return {
        success: false,
        extractedJson,
        htmlFinal: null,
        templateChosen: chosenTemplate.fileName,
        similarityResult: null,
        warnings: [
          ...warnings,
          `template_validation_failed: ${templateValidation.reasons.join('; ')}`,
        ],
        meta,
        reportTitle,
        error: `Generated HTML does not match template structure. Reasons: ${templateValidation.reasons.join('; ')}`,
      }
    }

    // STEP 5b: Validate similarity (existing scorer)
    const similarity = computeTemplateSimilarity(htmlFinal, chosenTemplate.html)
    meta.template_similarity_score = similarity.score
    meta.similarity_details = similarity.details as unknown as Record<string, unknown>
    meta.similarity_diagnostics = similarity.diagnostics

    console.log(`[pipeline] Similarity score: ${similarity.score} (min: ${MIN_SIMILARITY_SCORE})`)
    if (similarity.diagnostics.length > 0) {
      console.log(`[pipeline] Diagnostics:`, similarity.diagnostics)
    }

    if (similarity.score < MIN_SIMILARITY_SCORE) {
      warnings.push(`template_similarity_below_threshold: score=${similarity.score}, min=${MIN_SIMILARITY_SCORE}`)
    }

    meta.pipeline_finished_at = new Date().toISOString()

    // Extract a meaningful title from the PDF content
    const reportTitle = extractReportTitle(extractedJson, pdfTextContent)
    if (reportTitle) {
      console.log(`[pipeline] Extracted report title: "${reportTitle}"`)
    }

    return {
      success: true,
      extractedJson,
      htmlFinal,
      templateChosen: chosenTemplate.fileName,
      similarityResult: similarity,
      warnings,
      meta,
      reportTitle,
    }
  } catch (error) {
    meta.pipeline_finished_at = new Date().toISOString()
    const errMsg = error instanceof Error ? error.message : String(error)
    meta.error_message = errMsg
    console.error(`[pipeline] Error: ${errMsg}`)
    if (error instanceof Error && error.stack) {
      console.error(`[pipeline] Stack: ${error.stack.split('\n').slice(0, 5).join('\n')}`)
    }

    return {
      success: false,
      extractedJson: null,
      htmlFinal: null,
      templateChosen: null,
      similarityResult: null,
      warnings,
      meta,
      error: errMsg,
    }
  }
}

/**
 * Extract a meaningful report title from the extracted JSON or raw PDF text.
 * Looks for: meta.document_title, hero heading, first heading block, or first line of PDF.
 */
function extractReportTitle(json: Record<string, unknown>, pdfText: string): string | undefined {
  const meta = json.meta as Record<string, unknown> | undefined

  // 1. meta.document_title from extraction
  if (meta?.document_title && typeof meta.document_title === 'string' && meta.document_title.trim()) {
    return meta.document_title.trim()
  }

  // 2. Look for hero section title in outline
  const outline = json.outline as Array<{ type?: string; title_verbatim?: string }> | undefined
  if (outline) {
    const hero = outline.find(s => s.type === 'hero')
    if (hero?.title_verbatim) return hero.title_verbatim.trim()
    // First section title as fallback
    if (outline[0]?.title_verbatim) return outline[0].title_verbatim.trim()
  }

  // 3. Look for first heading block
  const blocks = json.blocks as Array<{ type?: string; text_verbatim?: string; content_verbatim?: string }> | undefined
  if (blocks) {
    const heading = blocks.find(b => b.type === 'heading')
    if (heading) {
      const text = heading.text_verbatim || heading.content_verbatim
      if (text) return text.trim()
    }
  }

  // 4. Parse first meaningful line from raw PDF text
  if (pdfText) {
    const lines = pdfText.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 120)
    if (lines.length > 0) {
      // Skip generic headers like page numbers, dates alone
      for (const line of lines.slice(0, 10)) {
        if (/informe|análisis|reporte|opciones|premium|estrategia/i.test(line)) {
          return line
        }
      }
      return lines[0]
    }
  }

  return undefined
}

/**
 * Extract ticker from extracted JSON (heuristic: look in kpis, title, blocks).
 */
function extractTickerFromJson(json: Record<string, unknown>): string | undefined {
  // Check kpis_verbatim for "Activo Subyacente" or similar
  const kpis = json.kpis_verbatim as Array<{ label?: string; value?: string }> | undefined
  if (kpis) {
    for (const kpi of kpis) {
      if (/activo|subyacente|ticker/i.test(kpi.label || '')) {
        return kpi.value?.trim()
      }
    }
  }

  // Check blocks for heading with ticker pattern
  const blocks = json.blocks as Array<{ type?: string; content_verbatim?: string }> | undefined
  if (blocks) {
    for (const block of blocks) {
      if (block.type === 'heading' && block.content_verbatim) {
        const tickerMatch = block.content_verbatim.match(/\(([A-Z]{2,6})\)/)
        if (tickerMatch) return tickerMatch[1]
      }
    }
  }

  // Check outline titles
  const outline = json.outline as Array<{ title_verbatim?: string }> | undefined
  if (outline) {
    for (const sec of outline) {
      if (sec.title_verbatim) {
        const tickerMatch = sec.title_verbatim.match(/\(([A-Z]{2,6})\)/)
        if (tickerMatch) return tickerMatch[1]
      }
    }
  }

  return undefined
}
