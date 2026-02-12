/**
 * Report Generation Pipeline (OpenAI-only, Vision-enabled)
 * Step 0: PDF → page screenshots (PNG) via pdf-to-png-converter
 * Step 1: OpenAI Vision Extractor — page images → structured JSON (verbatim)
 * Step 2: Template loader selects best template
 * Step 3: OpenAI Vision Assembler — page images + template HTML → html_final (patch mode)
 * Step 4: Similarity scorer + anti-layout-inventado validation
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { selectTemplate, getTemplateFileNames } from './template-loader'
import { computeTemplateSimilarity, MIN_SIMILARITY_SCORE } from './template-similarity'
import { validateTemplateUsage } from './template-validation'
import { convertPdfToImages, downloadPdfAsBuffer, buildVisionContentParts } from './pdf-to-images'
import type { PdfPageImage } from './pdf-to-images'
import type { TemplateSelection } from './template-loader'
import type { SimilarityResult } from './template-similarity'
import type { TemplateValidationResult } from './template-validation'

// Prompt file paths (relative to project root)
const PROMPT_EXTRACTOR = 'ai/prompts/openai/extract-premium-from-pdf.md'
const PROMPT_ASSEMBLER = 'ai/prompts/openai/assemble-premium-html-from-template.md'
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
  prompt_file_used_assembler: string
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
  pipeline_started_at: string
  pipeline_finished_at: string | null
  extraction_duration_ms: number | null
  assembly_duration_ms: number | null
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
 * Call OpenAI chat completions for extraction (text-only, no images).
 */
async function extractTextOnly(
  systemPrompt: string,
  pdfTextContent: string,
  sourceFileName: string,
  model: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  console.log(`[pipeline:extract] Text-only extraction with ${model}...`)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
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
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${errText.slice(0, 300)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  return parseJsonResponse(content)
}

/**
 * Step 1: Call OpenAI Vision to extract structured JSON from PDF page screenshots.
 * Falls back to text-only extraction if vision fails.
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

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const extractorModel = process.env.OPENAI_EXTRACTOR_MODEL || 'gpt-4o'

  // If we have page images, try vision extraction first
  if (pageImages.length > 0) {
    console.log(`[pipeline:extract] Calling OpenAI Vision (${extractorModel}) for extraction...`)
    console.log(`[pipeline:extract] Source: ${sourceFileName}, pages: ${pageImages.length}, text length: ${pdfTextContent.length}`)

    try {
      const userContent = buildVisionContentParts(
        pageImages,
        `You are a financial data extraction engine. You MUST respond with ONLY a valid JSON object — no explanations, no apologies, no text before or after the JSON.\n\nExtract ALL content from this financial report.\nFilename: ${sourceFileName}\n\nBelow are screenshots of every page. Extract EVERY piece of text, number, table, KPI, heading, and paragraph you see — VERBATIM.\n\nSupplementary OCR text:\n${pdfTextContent.slice(0, 6000)}`,
        'auto'
      )

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: extractorModel,
          temperature: 0,
          max_tokens: 16384,
          messages: [
            { role: 'system', content: fullSystemPrompt + '\n\nIMPORTANT: You MUST return ONLY a valid JSON object. No prose, no apologies, no refusals. If you cannot extract something, use null in the JSON.' },
            { role: 'user', content: userContent },
          ],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.warn(`[pipeline:extract] Vision API error ${response.status}, falling back to text-only:`, errText.slice(0, 200))
      } else {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || ''
        console.log(`[pipeline:extract] Vision response length: ${content.length}, preview: ${content.slice(0, 100)}...`)

        const parsed = parseJsonResponse(content)
        const p = parsed as any
        console.log(`[pipeline:extract] Vision extraction complete. Blocks: ${p.blocks?.length || 0}, KPIs: ${p.kpis?.length || p.kpis_verbatim?.length || 0}`)
        return parsed
      }
    } catch (err) {
      console.warn(`[pipeline:extract] Vision extraction failed, falling back to text-only:`, err instanceof Error ? err.message : err)
    }
  }

  // Fallback: text-only extraction
  console.log(`[pipeline:extract] Using text-only extraction (no vision)...`)
  const parsed = await extractTextOnly(fullSystemPrompt, pdfTextContent, sourceFileName, extractorModel, apiKey)
  const p = parsed as any
  console.log(`[pipeline:extract] Text-only extraction complete. Blocks: ${p.blocks?.length || 0}, KPIs: ${p.kpis?.length || p.kpis_verbatim?.length || 0}`)
  return parsed
}

/**
 * Step 2: Call OpenAI to assemble HTML from page images + template
 * Sends page screenshots + template HTML for vision-based single-pass replacement.
 * Also sends raw PDF text and extracted JSON as supplementary context.
 */
async function assembleWithOpenAI(
  pageImages: PdfPageImage[],
  pdfText: string,
  template: TemplateSelection,
  extractedJson?: Record<string, unknown>
): Promise<{ html_final: string; warnings: string[]; sections_mapped: unknown[] }> {
  const systemPrompt = loadPrompt(PROMPT_ASSEMBLER)
  const rulesLiteral = loadPrompt(PROMPT_RULES_LITERAL)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const assemblerModel = process.env.OPENAI_ASSEMBLER_MODEL || 'o3'
  console.log(`[pipeline:assemble] Calling OpenAI (${assemblerModel}) with template: ${template.fileName}`)
  console.log(`[pipeline:assemble] Template HTML length: ${template.html.length}, pages: ${pageImages.length}, PDF text length: ${pdfText.length}`)

  // Build text instructions (template + supplementary data)
  let textInstructions = `TASK: Clone the TEMPLATE_HTML below and replace ONLY the text content with matching content from the PDF pages shown above.

TEMPLATE_HTML (Filename: ${template.fileName}):
${template.html}

PDF_TEXT (supplementary OCR text — use page screenshots as PRIMARY source, this text as backup):
${pdfText}`

  if (extractedJson) {
    textInstructions += `

EXTRACTED_JSON (supplementary structured data):
${JSON.stringify(extractedJson, null, 2)}`
  }

  textInstructions += `

INSTRUCTIONS:
- Clone the TEMPLATE_HTML above. Replace ONLY the text content inside existing HTML elements with matching text from the PDF pages.
- Look at EVERY page screenshot carefully — extract ALL text, numbers, tables, KPIs verbatim.
- DO NOT invent new HTML structure. DO NOT change classes. DO NOT reorder sections.
- Copy the <style> block VERBATIM — every single character.
- Preserve ALL SVG icons exactly as they appear in the template.
- Use PDF content verbatim — do not summarize or paraphrase.
- If a value is not found in the PDF, use "—" and add a warning.

TABLE RULES (CRITICAL):
- Count the number of <th> elements in the template's <thead>. Your output MUST have the EXACT same number of <th> and <td> per row.
- NEVER remove, merge, or collapse table columns. If the template has 4 columns, output 4 columns.
- If the PDF table has different columns than the template, map by meaning (Strike→Strike, Volume→Volume, etc.) but keep ALL template columns.
- If a column has no matching data, fill cells with "—" but keep the <td>.

SECTION STRUCTURE RULES (CRITICAL):
- Every flow-event div MUST contain <h5>Title</h5> followed by <p>Body text</p>. NEVER flatten into just a paragraph.
- Every analysis-block MUST preserve its analysis-header div (with SVG icon + h4 title).
- Every section-header MUST preserve section-icon (SVG) + section-title (h2) + section-subtitle (p).
- Keep ALL container divs: section-container, analysis-block, flow-event, context-card, strategy-card, etc.

- Return ONLY a JSON object with: template_chosen, html_final, warnings, sections_mapped.`

  // Detect model type to choose correct API endpoint and params
  const isCodexModel = /codex/i.test(assemblerModel)
  const isReasoningModel = /^(o1|o3|o4)/.test(assemblerModel)

  let response: Response
  let content: string

  if (isCodexModel) {
    // Codex models use v1/responses (Responses API) — text only, no vision
    const fullPrompt = `${systemPrompt}\n\n---\n\n${rulesLiteral}\n\n---\n\n${textInstructions}`

    console.log(`[pipeline:assemble] Using Responses API for Codex model. Prompt length: ${fullPrompt.length}`)

    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: assemblerModel,
        input: fullPrompt,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[pipeline:assemble] OpenAI Responses API error ${response.status}:`, errText.slice(0, 500))
      throw new Error(`OpenAI API error ${response.status}: ${errText.slice(0, 300)}`)
    }

    const data = await response.json()
    content = data.output?.filter((o: { type: string }) => o.type === 'message')
      ?.flatMap((o: { content: Array<{ type: string; text: string }> }) => o.content)
      ?.filter((c: { type: string }) => c.type === 'output_text')
      ?.map((c: { text: string }) => c.text)
      ?.join('') || ''

  } else {
    // Chat models with vision support — send page images + text instructions
    const userContent = buildVisionContentParts(pageImages, textInstructions)

    const requestBody: Record<string, unknown> = {
      model: assemblerModel,
      messages: [
        {
          role: isReasoningModel ? 'developer' : 'system',
          content: `${systemPrompt}\n\n---\n\n${rulesLiteral}`,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    }

    if (isReasoningModel) {
      requestBody.max_completion_tokens = 100000
    } else {
      // gpt-4o supports max 16384 completion tokens; gpt-4o-mini supports 16384
      requestBody.max_tokens = 16384
      requestBody.temperature = 0
    }

    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[pipeline:assemble] OpenAI API error ${response.status}:`, errText.slice(0, 500))
      throw new Error(`OpenAI API error ${response.status}: ${errText.slice(0, 300)}`)
    }

    const data = await response.json()
    content = data.choices?.[0]?.message?.content || ''
  }

  if (!content) {
    console.error(`[pipeline:assemble] OpenAI returned empty content.`)
    throw new Error('OpenAI assembler returned empty content')
  }

  console.log(`[pipeline:assemble] Raw response length: ${content.length}`)
  console.log(`[pipeline:assemble] Response preview: ${content.slice(0, 200)}...`)

  // Parse JSON from response (handle possible markdown wrapping)
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonStr)
  } catch (parseErr) {
    console.error(`[pipeline:assemble] JSON parse failed. First 500 chars:`, jsonStr.slice(0, 500))
    console.error(`[pipeline:assemble] Last 500 chars:`, jsonStr.slice(-500))
    // Try to extract html_final directly if JSON parse fails
    const htmlMatch = jsonStr.match(/"html_final"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/) 
    if (htmlMatch) {
      console.log(`[pipeline:assemble] Recovered html_final via regex (${htmlMatch[1].length} chars)`)
      parsed = { html_final: htmlMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'), warnings: ['JSON parse failed, recovered html_final via regex'], sections_mapped: [] }
    } else {
      throw new Error(`Failed to parse OpenAI response as JSON: ${(parseErr as Error).message}`)
    }
  }

  // Check for integrity failure
  if (parsed.error === 'TEMPLATE_INTEGRITY_FAILED') {
    throw new Error('Assembler reported TEMPLATE_INTEGRITY_FAILED — could not match template structure')
  }

  console.log(`[pipeline:assemble] Assembly complete. HTML size: ${(parsed.html_final as string)?.length || 0}`)
  console.log(`[pipeline:assemble] Warnings: ${(parsed.warnings as unknown[])?.length || 0}`)

  return {
    html_final: (parsed.html_final as string) || '',
    warnings: ((parsed.warnings || []) as Array<{ type?: string; message?: string; reason?: string } | string>).map((w) =>
      typeof w === 'string' ? w : `${w.type || 'warning'}: ${w.message || w.reason || ''}`
    ),
    sections_mapped: (parsed.sections_mapped as unknown[]) || [],
  }
}

/**
 * Run the full pipeline: Extract → Select Template → Assemble → Validate
 */
export async function runPipeline(
  input: PipelineInput,
  pdfTextContent: string
): Promise<PipelineResult> {
  const meta: PipelineMeta = {
    prompt_file_used_extractor: PROMPT_EXTRACTOR,
    prompt_file_used_assembler: PROMPT_ASSEMBLER,
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
    pipeline_started_at: new Date().toISOString(),
    pipeline_finished_at: null,
    extraction_duration_ms: null,
    assembly_duration_ms: null,
  }

  const warnings: string[] = []

  try {
    // Log template files seen
    meta.template_files_seen = getTemplateFileNames()
    console.log(`[pipeline] Template files seen: ${meta.template_files_seen.length}`)

    // STEP 0: Get PDF buffer and convert to page screenshots
    let pageImages: PdfPageImage[] = []
    const imgStart = Date.now()

    if (input.pdfBase64) {
      // Client sent the PDF as base64
      console.log(`[pipeline] Step 0: Converting base64 PDF to page images...`)
      const pdfBuffer = Buffer.from(input.pdfBase64, 'base64')
      pageImages = await convertPdfToImages(pdfBuffer, { scale: 2 })
    } else if (input.sourceFileUrl) {
      // Download from storage URL
      console.log(`[pipeline] Step 0: Downloading PDF and converting to page images...`)
      const pdfBuffer = await downloadPdfAsBuffer(input.sourceFileUrl)
      pageImages = await convertPdfToImages(pdfBuffer, { scale: 2 })
    } else {
      console.log(`[pipeline] Step 0: No PDF file available — using text-only mode (no vision)`)
    }

    const imgDuration = Date.now() - imgStart
    if (pageImages.length > 0) {
      console.log(`[pipeline] PDF → ${pageImages.length} page images in ${imgDuration}ms`)
    }

    // STEP 1: Extract with OpenAI Vision (page screenshots + supplementary text)
    const extractStart = Date.now()
    const extractedJson = await extractWithOpenAI(pageImages, pdfTextContent, input.sourceFileName)
    meta.extraction_duration_ms = Date.now() - extractStart
    meta.extracted_json_size = JSON.stringify(extractedJson).length
    console.log(`[pipeline] Extraction took ${meta.extraction_duration_ms}ms, JSON size: ${meta.extracted_json_size}`)

    // STEP 2: Select template (ticker-aware matching)
    const ticker = extractTickerFromJson(extractedJson)
    const chosenTemplate = selectTemplate(
      { category: 'opciones_premium', ticker },
      extractedJson
    )
    meta.template_chosen = chosenTemplate.fileName
    meta.template_file = chosenTemplate.fileName
    meta.template_hash = chosenTemplate.hash
    console.log(`[pipeline] Template chosen: ${chosenTemplate.fileName} (hash: ${chosenTemplate.hash})`)

    // STEP 3: Assemble with OpenAI Vision (page screenshots + template HTML)
    const assembleStart = Date.now()
    const assemblyResult = await assembleWithOpenAI(pageImages, pdfTextContent, chosenTemplate, extractedJson)
    meta.assembly_duration_ms = Date.now() - assembleStart
    meta.html_size = assemblyResult.html_final.length
    meta.html_hash = crypto.createHash('sha256').update(assemblyResult.html_final).digest('hex').slice(0, 16)
    warnings.push(...assemblyResult.warnings)
    console.log(`[pipeline] Assembly took ${meta.assembly_duration_ms}ms, HTML size: ${meta.html_size}`)

    // STEP 4a: Anti-layout-inventado validation
    const templateValidation = validateTemplateUsage(chosenTemplate.html, assemblyResult.html_final)
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

    // STEP 4b: Validate similarity (existing scorer)
    const similarity = computeTemplateSimilarity(assemblyResult.html_final, chosenTemplate.html)
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
      htmlFinal: assemblyResult.html_final,
      templateChosen: chosenTemplate.fileName,
      similarityResult: similarity,
      warnings,
      meta,
      reportTitle,
    }
  } catch (error) {
    meta.pipeline_finished_at = new Date().toISOString()
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`[pipeline] Error: ${errMsg}`)

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
