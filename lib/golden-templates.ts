import crypto from 'crypto'
import { createServiceClient } from './supabase/server'
import { buildCSSClassMap } from '@/ai/templates/premiumTemplate'

export interface StructuralFingerprint {
  root_classes: string[]
  section_classes: string[]
  section_count: number
  table_count: number
  table_columns: number[]
  flow_event_count: number
  has_kpis: boolean
  has_strategy: boolean
  has_conclusion: boolean
  css_variable_count: number
  total_class_count: number
  css_class_map?: Record<string, string>
}

export interface GoldenTemplate {
  id: string
  user_id: string
  report_id: string | null
  version_id: string | null
  ticker: string | null
  category: string
  html_content: string
  html_hash: string
  structural_fingerprint: StructuralFingerprint | null
  quality_score: number
  usage_count: number
  is_active: boolean
  created_at: string
}

/**
 * Compute a structural fingerprint from HTML content.
 * Used to compare templates structurally and pick the best match.
 */
export function computeStructuralFingerprint(html: string): StructuralFingerprint {
  // Root wrapper classes
  const rootMatch = html.match(/<div\s+class="([^"]+)"/)
  const root_classes = rootMatch ? rootMatch[1].split(/\s+/) : []

  // All CSS classes used
  const classMatches = html.match(/class="([^"]+)"/g) || []
  const allClasses = new Set<string>()
  for (const m of classMatches) {
    const val = m.match(/class="([^"]+)"/)?.[1] || ''
    val.split(/\s+/).forEach(c => allClasses.add(c))
  }

  // Section classes (classes containing "section")
  const section_classes = Array.from(allClasses).filter(c => /section/i.test(c))

  // Count sections
  const section_count = (html.match(/<section[\s>]/g) || []).length

  // Count tables and their column counts
  const tables = html.match(/<table[\s\S]*?<\/table>/g) || []
  const table_columns: number[] = tables.map(t => {
    const ths = t.match(/<th[\s>]/g) || []
    return ths.length
  })

  // Count flow-event divs
  const flow_event_count = (html.match(/class="[^"]*flow-event[^"]*"/g) || []).length

  // Feature detection
  const has_kpis = /kpi/i.test(html)
  const has_strategy = /strategy/i.test(html)
  const has_conclusion = /conclusion/i.test(html)

  // CSS variables
  const cssVars = html.match(/--[\w-]+/g) || []
  const css_variable_count = new Set(cssVars).size

  const cssClassMap = buildCSSClassMap(html) as unknown as Record<string, string>

  return {
    root_classes,
    section_classes,
    section_count,
    table_count: tables.length,
    table_columns,
    flow_event_count,
    has_kpis,
    has_strategy,
    has_conclusion,
    css_variable_count,
    total_class_count: allClasses.size,
    css_class_map: cssClassMap,
  }
}

/**
 * Save an approved report as a Golden Template.
 * Deduplicates by html_hash — returns existing if duplicate.
 */
export async function saveGoldenTemplate(params: {
  userId: string
  reportId: string
  versionId: string
  ticker: string | null
  category: string
  htmlContent: string
  qualityScore?: number
}): Promise<{ goldenTemplate: GoldenTemplate | null; error: string | null; isDuplicate: boolean }> {
  const supabase = createServiceClient()
  const rb2 = (supabase as any).schema('rb2')

  const htmlHash = crypto.createHash('sha256').update(params.htmlContent).digest('hex').slice(0, 32)

  // Check for duplicate
  const { data: existing } = await rb2
    .from('golden_templates')
    .select('*')
    .eq('html_hash', htmlHash)
    .eq('user_id', params.userId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { goldenTemplate: existing[0], error: null, isDuplicate: true }
  }

  // Compute structural fingerprint
  const fingerprint = computeStructuralFingerprint(params.htmlContent)

  const { data, error } = await rb2
    .from('golden_templates')
    .insert({
      user_id: params.userId,
      report_id: params.reportId,
      version_id: params.versionId,
      ticker: params.ticker?.toUpperCase() || null,
      category: params.category,
      html_content: params.htmlContent,
      html_hash: htmlHash,
      structural_fingerprint: fingerprint,
      quality_score: params.qualityScore ?? 1.0,
      usage_count: 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[golden-templates] Error saving:', error)
    return { goldenTemplate: null, error: error.message, isDuplicate: false }
  }

  console.log(`[golden-templates] Saved golden template ${data.id} for ticker=${params.ticker}, report=${params.reportId}`)
  return { goldenTemplate: data, error: null, isDuplicate: false }
}

/**
 * Get golden templates, ordered by quality_score DESC.
 * Optionally filter by ticker and/or category.
 */
export async function getGoldenTemplates(params: {
  userId: string
  ticker?: string | null
  category?: string
  limit?: number
}): Promise<GoldenTemplate[]> {
  const supabase = createServiceClient()
  const rb2 = (supabase as any).schema('rb2')

  let query = rb2
    .from('golden_templates')
    .select('*')
    .eq('user_id', params.userId)
    .eq('is_active', true)
    .order('quality_score', { ascending: false })
    .limit(params.limit || 10)

  if (params.ticker) {
    query = query.eq('ticker', params.ticker.toUpperCase())
  }
  if (params.category) {
    query = query.eq('category', params.category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[golden-templates] Error fetching:', error)
    return []
  }

  // Tiebreaker: prefer templates with more CSS classes (richer styling covers more renderer components)
  const sorted = (data || []).sort((a: GoldenTemplate, b: GoldenTemplate) => {
    if (b.quality_score !== a.quality_score) return b.quality_score - a.quality_score
    const aClasses = (a.structural_fingerprint as StructuralFingerprint | null)?.total_class_count || 0
    const bClasses = (b.structural_fingerprint as StructuralFingerprint | null)?.total_class_count || 0
    return bClasses - aClasses
  })

  return sorted
}

/**
 * Get golden templates with priority ordering:
 * 1. Same ticker → best quality_score
 * 2. Same category → best quality_score
 * 3. Any active → best quality_score
 */
export async function getGoldenTemplatesPrioritized(params: {
  userId: string
  ticker?: string | null
  category?: string
  maxResults?: number
}): Promise<{ primary: GoldenTemplate | null; examples: GoldenTemplate[] }> {
  const max = params.maxResults || 3

  // 1. Try same ticker first
  if (params.ticker) {
    const byTicker = await getGoldenTemplates({
      userId: params.userId,
      ticker: params.ticker,
      category: params.category,
      limit: max,
    })

    if (byTicker.length > 0) {
      return {
        primary: byTicker[0],
        examples: byTicker.slice(1, max),
      }
    }
  }

  // 2. Fall back to same category
  const byCategory = await getGoldenTemplates({
    userId: params.userId,
    category: params.category || 'opciones_premium',
    limit: max,
  })

  if (byCategory.length > 0) {
    return {
      primary: byCategory[0],
      examples: byCategory.slice(1, max),
    }
  }

  // 3. No golden templates found
  return { primary: null, examples: [] }
}

/**
 * Increment usage_count for a golden template (called when used as reference).
 */
export async function incrementGoldenUsage(goldenId: string): Promise<void> {
  const supabase = createServiceClient()
  const rb2 = (supabase as any).schema('rb2')

  const { error } = await rb2.rpc('increment_golden_usage', { golden_id: goldenId })

  if (error) {
    // Fallback: manual increment if RPC doesn't exist
    const { data } = await rb2
      .from('golden_templates')
      .select('usage_count')
      .eq('id', goldenId)
      .single()

    if (data) {
      await rb2
        .from('golden_templates')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', goldenId)
    }
  }
}
