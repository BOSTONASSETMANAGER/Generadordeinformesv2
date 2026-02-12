import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

/**
 * Choose the best template for a given extracted JSON.
 * Scoring: section count proximity + table match + kpi match
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

    if (score > bestScore) {
      bestScore = score
      bestTemplate = t
    }
  }

  console.log(`[template-loader] Chose template: ${bestTemplate.fileName} (score: ${bestScore.toFixed(1)})`)
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
