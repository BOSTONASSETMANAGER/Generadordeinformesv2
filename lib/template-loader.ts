import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getGoldenTemplatesPrioritized, incrementGoldenUsage } from './golden-templates'
import type { GoldenTemplate } from './golden-templates'

export interface TemplateFile {
  fileName: string
  filePath: string
  html: string
  hash: string
  rootWrapper: string | null
  sectionCount: number
  hasCallsTable: boolean
  hasPutsTable: boolean
  hasKpis: boolean
  cssVariables: string[]
}

export interface TemplateSelection {
  fileName: string
  html: string
  hash: string
}

export interface TemplateSelectionResult {
  primary: TemplateSelection
  goldenExamples: TemplateSelection[]
  source: 'golden' | 'filesystem'
  goldenId?: string
}

const TEMPLATES_DIR = path.join(process.cwd(), 'informes premium ejemplos')

/**
 * Load all HTML template files from /informes premium ejemplos/
 */
export function loadAllTemplates(): TemplateFile[] {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`[template-loader] Directory not found: ${TEMPLATES_DIR}`)
    return []
  }

  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.html'))
  console.log(`[template-loader] Found ${files.length} template files:`, files)

  return files.map(fileName => {
    const filePath = path.join(TEMPLATES_DIR, fileName)
    const html = fs.readFileSync(filePath, 'utf-8')
    return analyzeTemplate(fileName, filePath, html)
  })
}

/**
 * Load a single template by filename
 */
export function loadTemplate(fileName: string): TemplateFile | null {
  const filePath = path.join(TEMPLATES_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    console.error(`[template-loader] Template not found: ${filePath}`)
    return null
  }
  const html = fs.readFileSync(filePath, 'utf-8')
  return analyzeTemplate(fileName, filePath, html)
}

/**
 * Analyze a template HTML to extract structural metadata
 */
function analyzeTemplate(fileName: string, filePath: string, html: string): TemplateFile {
  // Detect root wrapper class
  const rootMatch = html.match(/<div\s+class="([^"]+)"/)
  const rootWrapper = rootMatch ? rootMatch[1] : null

  // Count sections
  const sectionCount = (html.match(/<section\s/g) || []).length

  // Detect tables
  const hasCallsTable = /calls|CALL/i.test(html) && /<table/.test(html)
  const hasPutsTable = /puts|PUT/i.test(html) && /<table/.test(html)

  // Detect KPIs
  const hasKpis = /kpi/i.test(html)

  // Extract CSS variables
  const cssVarMatches = html.match(/--[\w-]+/g) || []
  const cssVariables = Array.from(new Set(cssVarMatches))

  const hash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 16)

  return {
    fileName,
    filePath,
    html,
    hash,
    rootWrapper,
    sectionCount,
    hasCallsTable,
    hasPutsTable,
    hasKpis,
    cssVariables,
  }
}

const RENDERER_KEY_CLASSES = [
  'volatility-grid', 'metrics-grid',
  'vol-card', 'metric-card',
  'ranges-grid', 'skew-grid',
  'range-card', 'skew-item',
  'oi-table', 'data-table',
  'strategies-section', 'strategy-section',
  'strategy-card', 'strategy-badge', 'strategy-structure', 'strategy-analysis',
  'payoff-item', 'payoff-label', 'payoff-value',
  'conclusion-section', 'conclusions-section',
  'conclusion-card', 'conclusion-summary',
  'conclusion-item', 'conclusion-icon', 'conclusion-content',
  'flow-event', 'params-grid', 'param-item',
  'data-synthesis', 'synthesis-list', 'final-message',
  'subsection-main-title', 'subsection-title',
  'analysis-block', 'analysis-header', 'analysis-icon',
  'section-header', 'section-title', 'section-icon',
  'hero-section', 'hero-title', 'kpis-section', 'kpi-card',
  'context-section', 'context-card',
  'highlight-box', 'insight-card',
]

function computeRendererCompatibility(html: string): number {
  const styleBlock = (html.match(/<style[\s\S]*?<\/style>/gi) || []).join('\n')
  let found = 0
  for (const cls of RENDERER_KEY_CLASSES) {
    if (styleBlock.includes(`.${cls}`)) found++
  }
  return found / RENDERER_KEY_CLASSES.length
}

/**
 * Choose the best template for a given extracted JSON.
 * Scoring: section count proximity + table match + kpi match + renderer compatibility
 */
export function chooseBestTemplate(
  templates: TemplateFile[],
  extractedJson: {
    outline?: { section_id: string }[]
    tables_verbatim?: { table_id: string }[]
    kpis_verbatim?: { label: string }[]
  }
): TemplateFile {
  const sourceSections = extractedJson.outline?.length || 0
  const hasTables = (extractedJson.tables_verbatim?.length || 0) > 0
  const hasKpis = (extractedJson.kpis_verbatim?.length || 0) > 0

  let bestTemplate = templates[0]
  let bestScore = -Infinity

  for (const t of templates) {
    let score = 0

    // Section count proximity (closer = better, max 10 points)
    const sectionDiff = Math.abs(t.sectionCount - sourceSections)
    score += Math.max(0, 10 - sectionDiff * 2)

    // Table match (5 points each)
    if (hasTables && (t.hasCallsTable || t.hasPutsTable)) score += 5
    if (!hasTables && !t.hasCallsTable && !t.hasPutsTable) score += 3

    // KPI match
    if (hasKpis && t.hasKpis) score += 5
    if (!hasKpis && !t.hasKpis) score += 3

    // Prefer templates with more CSS variables (richer styling)
    score += Math.min(t.cssVariables.length / 5, 3)

    // Prefer larger templates (more complete)
    score += Math.min(t.html.length / 20000, 3)

    // Renderer compatibility (max 15 points — highest weight)
    const compat = computeRendererCompatibility(t.html)
    score += compat * 15
    
    if (score > bestScore) {
      bestScore = score
      bestTemplate = t
    }
  }

  const compat = computeRendererCompatibility(bestTemplate.html)
  console.log(`[template-loader] Chose template: ${bestTemplate.fileName} (score: ${bestScore.toFixed(1)}, renderer_compat: ${(compat * 100).toFixed(0)}%)`)
  return bestTemplate
}

/**
 * Get list of template filenames (for logging)
 */
export function getTemplateFileNames(): string[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return []
  return fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.html'))
}

/**
 * Select a template by ticker, category, and date.
 * Priority: 1) ticker match in filename, 2) ticker match in HTML content,
 * 3) most recent by date in filename, 4) fallback to chooseBestTemplate.
 */
export function selectTemplate(
  params: { category?: string; ticker?: string; date?: string },
  extractedJson?: Record<string, unknown>
): TemplateSelection {
  const templates = loadAllTemplates()
  if (templates.length === 0) {
    throw new Error('No templates found in /informes premium ejemplos/')
  }

  const ticker = params.ticker?.toUpperCase()

  // 1) Match by ticker in filename
  if (ticker) {
    const byFilename = templates.filter(t =>
      t.fileName.toUpperCase().includes(ticker)
    )
    if (byFilename.length > 0) {
      // Pick the most recent by filename date heuristic
      const best = pickMostRecent(byFilename)
      console.log(`[template-loader] selectTemplate: matched by filename ticker '${ticker}' → ${best.fileName}`)
      return { fileName: best.fileName, html: best.html, hash: best.hash }
    }

    // 2) Match by ticker in HTML content
    const byContent = templates.filter(t =>
      t.html.toUpperCase().includes(ticker)
    )
    if (byContent.length > 0) {
      const best = pickMostRecent(byContent)
      console.log(`[template-loader] selectTemplate: matched by content ticker '${ticker}' → ${best.fileName}`)
      return { fileName: best.fileName, html: best.html, hash: best.hash }
    }
  }

  // 3) Fallback: use chooseBestTemplate if we have extractedJson
  if (extractedJson) {
    const best = chooseBestTemplate(templates, extractedJson as any)
    console.log(`[template-loader] selectTemplate: fallback to chooseBestTemplate → ${best.fileName}`)
    return { fileName: best.fileName, html: best.html, hash: best.hash }
  }

  // 4) Ultimate fallback: most recent template
  const best = pickMostRecent(templates)
  console.log(`[template-loader] selectTemplate: ultimate fallback (most recent) → ${best.fileName}`)
  return { fileName: best.fileName, html: best.html, hash: best.hash }
}

/**
 * Pick the most recent template by parsing date fragments from filenames.
 * Falls back to the last file alphabetically.
 */
function pickMostRecent(templates: TemplateFile[]): TemplateFile {
  const MONTH_MAP: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  }

  let best = templates[0]
  let bestScore = -1

  for (const t of templates) {
    const lower = t.fileName.toLowerCase()
    let score = 0

    // Try to extract year
    const yearMatch = lower.match(/(202[4-9])/)
    if (yearMatch) score += parseInt(yearMatch[1]) * 100

    // Try to extract month
    for (const [name, num] of Object.entries(MONTH_MAP)) {
      if (lower.includes(name)) {
        score += num
        break
      }
    }

    // Try to extract day
    const dayMatch = lower.match(/(\d{1,2})_/)
    if (dayMatch) score += parseInt(dayMatch[1]) * 0.01

    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }

  return best
}

/**
 * Select a template with Golden Template priority.
 * Priority: 1) Golden Template (same ticker) → 2) Golden Template (same category) → 3) Filesystem template
 * Also returns up to 2 additional golden examples for few-shot context.
 */
export async function selectTemplateWithGolden(
  params: { category?: string; ticker?: string; date?: string; userId?: string },
  extractedJson?: Record<string, unknown>
): Promise<TemplateSelectionResult> {
  // If no userId, fall back to filesystem-only selection
  if (!params.userId) {
    console.log('[template-loader] No userId — falling back to filesystem selection')
    const primary = selectTemplate(params, extractedJson)
    return { primary, goldenExamples: [], source: 'filesystem' }
  }

  try {
    const { primary: goldenPrimary, examples: goldenExamples } = await getGoldenTemplatesPrioritized({
      userId: params.userId,
      ticker: params.ticker,
      category: params.category || 'opciones_premium',
      maxResults: 3,
    })

    if (goldenPrimary) {
      const hash = crypto.createHash('sha256').update(goldenPrimary.html_content).digest('hex').slice(0, 16)
      console.log(`[template-loader] selectTemplateWithGolden: using golden template ${goldenPrimary.id} (ticker=${goldenPrimary.ticker}, score=${goldenPrimary.quality_score})`)

      // Increment usage counter (fire-and-forget)
      incrementGoldenUsage(goldenPrimary.id).catch(() => {})

      const primary: TemplateSelection = {
        fileName: `golden:${goldenPrimary.id}`,
        html: goldenPrimary.html_content,
        hash,
      }

      const examples: TemplateSelection[] = goldenExamples.map((g: GoldenTemplate) => ({
        fileName: `golden:${g.id}`,
        html: g.html_content,
        hash: crypto.createHash('sha256').update(g.html_content).digest('hex').slice(0, 16),
      }))

      return {
        primary,
        goldenExamples: examples,
        source: 'golden',
        goldenId: goldenPrimary.id,
      }
    }
  } catch (err) {
    console.warn('[template-loader] Error querying golden templates, falling back to filesystem:', err instanceof Error ? err.message : err)
  }

  // Fallback: filesystem templates
  console.log('[template-loader] No golden templates found — using filesystem')
  const primary = selectTemplate(params, extractedJson)
  return { primary, goldenExamples: [], source: 'filesystem' }
}
