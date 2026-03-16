/**
 * Block Recognizer — Deterministic section→component mapper.
 *
 * Analyzes the extractedJson (outline + blocks + tables) from OpenAI extraction
 * and produces a SectionBlueprint[] that tells Claude EXACTLY which components
 * each section must use. No AI — pure pattern matching on section titles.
 *
 * Based on cross-template analysis of 11 production templates + ultimoinformebienhecho.md.
 */

// ─── Types ───

export interface ComponentRequirement {
  type: string
  count?: number
  details?: string
}

export interface SubsectionBlueprint {
  title_pattern: string
  matched_title?: string
  required_components: ComponentRequirement[]
}

export interface SectionBlueprint {
  outline_id: string
  matched_title: string
  target_field: 'context' | 'section' | 'strategy' | 'conclusion'
  section_class: string | null
  icon_style: 'default' | 'purple' | 'red' | null
  required_components: ComponentRequirement[]
  subsections: SubsectionBlueprint[]
  detected_tables: number
  detected_blocks: number
}

export interface BlueprintResult {
  blueprints: SectionBlueprint[]
  prompt_injection: string
}

// ─── Section Detection Rules ───
// Ordered by specificity — first match wins.

interface SectionRule {
  id: string
  pattern: RegExp
  target_field: 'context' | 'section' | 'strategy' | 'conclusion'
  section_class: string | null
  icon_style: 'default' | 'purple' | 'red' | null
  required_components: ComponentRequirement[]
  subsection_rules: SubsectionRule[]
}

interface SubsectionRule {
  pattern: RegExp
  required_components: ComponentRequirement[]
}

const SECTION_RULES: SectionRule[] = [
  // ── Resumen Ejecutivo / Contexto ──
  {
    id: 'context',
    pattern: /resumen\s*ejecutivo|contexto\s*(de\s*)?mercado|introducci[oó]n/i,
    target_field: 'context',
    section_class: null,
    icon_style: null,
    required_components: [
      { type: 'paragraph', details: 'Resumen ejecutivo verbatim' },
    ],
    subsection_rules: [],
  },

  // ── SECCIÓN PRE: Contexto Macro / Drivers / Noticias ──
  {
    id: 'seccion_pre',
    pattern: /secci[oó]n\s*pre|contexto\s*macro|drivers?\s*(ex[oó]genos|de\s*(volatilidad|mercado))|noticias\s*relevantes|factores\s*clave/i,
    target_field: 'section',
    section_class: 'news-section',
    icon_style: 'purple',
    required_components: [
      { type: 'news_block', details: 'One news_block per sub-topic (title + paragraphs). NEVER use separate sections or flow_events for news items.' },
    ],
    subsection_rules: [],
  },

  // ── SECCIÓN A: Insights de Flujo / Microestructura ──
  {
    id: 'seccion_a',
    pattern: /secci[oó]n\s*a|insights?\s*de\s*flujo|microestructura\s*(de\s*)?mercado/i,
    target_field: 'section',
    section_class: 'insights-section',
    icon_style: 'default',
    required_components: [
      { type: 'paragraph', details: 'Section intro text' },
      { type: 'analysis_block', details: 'Each subsection MUST be wrapped in an analysis_block with flow_badge' },
    ],
    subsection_rules: [
      {
        pattern: /mapa\s*de\s*calor|capitulaci[oó]n|volumen.*calls/i,
        required_components: [
          { type: 'analysis_block', details: 'header_type="puts" or "calls", flow_badge with descriptive text (e.g. "Liquidación Forzada")' },
          { type: 'data_table', details: 'Strike table with columns: Strike, Volumen Nominal, Volumen Efectivo, Interpretación. Use cell_styles: strike_atm/strike_otm for strike column, price for volume columns, interpretation for last column.' },
          { type: 'insight_card', details: 'Analysis summary card with badge (e.g. "Análisis por Strike") and bullet list of key strike insights' },
        ],
      },
      {
        pattern: /imanes?\s*de\s*precio|concentraci[oó]n.*volumen.*puts|open\s*interest/i,
        required_components: [
          { type: 'analysis_block', details: 'header_type="puts", flow_badge (e.g. "Seguro de Catástrofe")' },
          { type: 'data_table', details: 'Puts table with table_variant="puts" (red header). Columns: Strike, Volumen Nominal (Lotes), Variación, Interpretación. Use cell_styles: strike_put, price, change_negative, interpretation.' },
          { type: 'insight_card', details: 'Strike analysis summary with bearish badge' },
        ],
      },
      {
        pattern: /interpretaci[oó]n.*microestructura|manos?\s*fuertes|rango\s*bajista/i,
        required_components: [
          { type: 'analysis_block', details: 'header_type="calls" or "neutral", flow_badge (e.g. "Rango Bajista"). Only analysis_intro paragraph, no table needed.' },
        ],
      },
    ],
  },

  // ── SECCIÓN B: Métricas Cuantitativas ──
  {
    id: 'seccion_b',
    pattern: /secci[oó]n\s*b|m[eé]tricas?\s*cuantitativas|motor\s*estad[ií]stico|volatilidad.*griegas/i,
    target_field: 'section',
    section_class: 'greeks-section',
    icon_style: 'red',
    required_components: [
      { type: 'paragraph', details: 'Section intro text' },
      { type: 'analysis_block', details: 'Each subsection MUST be wrapped in an analysis_block with flow_badge containing key data' },
    ],
    subsection_rules: [
      {
        pattern: /diagn[oó]stico.*volatilidad|iv\s*vs\s*hv|gran\s*descalce/i,
        required_components: [
          { type: 'analysis_block', details: 'flow_badge with alert data (e.g. "Dato Alerta: HV10 72,52%")' },
          { type: 'greeks_grid', count: 3, details: 'MUST have exactly 3 greek-cards: (1) HV - Volatilidad Histórica with symbol="HV" and bullet list of HV values, (2) IV - Volatilidad Implícita with symbol="IV" and bullet list of IV ATM values, (3) Veredicto with symbol="!" and analysis paragraphs' },
        ],
      },
      {
        pattern: /lectura.*skew|sesgo.*sonrisa|skew.*volatilidad/i,
        required_components: [
          { type: 'analysis_block', details: 'flow_badge (e.g. "Skew Negativo")' },
          { type: 'data_table', details: 'Skew comparison table. Columns: Tipo de Strike, Strike, IV, Relación. Use cell_styles for strike_put/strike_otm, price, plain, change_negative.' },
          { type: 'insight_card', details: 'Badge "Interpretación Técnica" with analysis paragraph + bullet list' },
        ],
      },
      {
        pattern: /rangos?\s*probabil[ií]sticos|movimiento\s*browniano|proyecci[oó]n\s*estad[ií]stica/i,
        required_components: [
          { type: 'analysis_block', details: 'flow_badge with parameters (e.g. "Spot $6.540 / TLR 19,10% / IV ponderada 51%")' },
          { type: 'greeks_grid', count: 3, details: 'MUST have exactly 3 greek-cards: (1) Short-term range (symbol="1W") with σ1 and σ2 ranges, (2) Expiration range (symbol with days, e.g. "47d") with σ1 and σ2 ranges, (3) Insight Operativo (symbol="⚡") with probability statement' },
        ],
      },
    ],
  },

  // ── Concepto del Día (standalone) ──
  {
    id: 'concepto',
    pattern: /concepto\s*del\s*d[ií]a|iv\s*crush|contraparte/i,
    target_field: 'section',
    section_class: 'concept-section',
    icon_style: 'default',
    required_components: [
      { type: 'concept_card', details: 'Educational concept with badge, title, intro_paragraphs, mechanism steps' },
    ],
    subsection_rules: [],
  },

  // ── SECCIÓN C: Idea de Trading / Estrategia ──
  {
    id: 'seccion_c',
    pattern: /secci[oó]n\s*c|idea\s*de\s*trading|estrategia\s*(sugerida|recomendada)?/i,
    target_field: 'strategy',
    section_class: null,
    icon_style: null,
    required_components: [
      { type: 'strategy', details: 'Must include: name, description, legs[] with action/strike_label/details, metrics[] with label/value/variant, rationale_items[]' },
    ],
    subsection_rules: [],
  },

  // ── SECCIÓN D: Conclusión ──
  {
    id: 'seccion_d',
    pattern: /secci[oó]n\s*d|conclusi[oó]n|perspectiva\s*estrat[eé]gica/i,
    target_field: 'conclusion',
    section_class: null,
    icon_style: null,
    required_components: [
      { type: 'conclusion', details: 'Must include: intro_paragraphs, levels[] (resistance/support), disclaimer. Use conclusion_summary (3 items: warning, neutral, bullish) in the section content.' },
    ],
    subsection_rules: [],
  },

  // ── Volatilidad Histórica (standalone, Gen 2) ──
  {
    id: 'volatilidad_hv',
    pattern: /plazos?\s*de\s*volatilidad\s*hist[oó]rica|volatilidad\s*hist[oó]rica\s*\(hv\)/i,
    target_field: 'section',
    section_class: 'greeks-section',
    icon_style: 'default',
    required_components: [
      { type: 'data_table', details: 'HV values table' },
    ],
    subsection_rules: [],
  },

  // ── Imanes de Precio (standalone) ──
  {
    id: 'imanes_standalone',
    pattern: /imanes?\s*de\s*precio|open\s*interest.*murallas|zonas?\s*de\s*pinning/i,
    target_field: 'section',
    section_class: 'magnets-section',
    icon_style: 'purple',
    required_components: [
      { type: 'magnets_grid', details: 'Grid of price magnets with support/resistance/neutral cards' },
    ],
    subsection_rules: [],
  },
]

// ─── Core Recognition Logic ───

interface ExtractedOutline {
  id: string
  type?: string
  title_verbatim?: string
  subtitle_verbatim?: string | null
}

interface ExtractedBlock {
  id: string
  parent_outline_id?: string
  type?: string
  title_verbatim?: string
  text_verbatim?: string
}

interface ExtractedTable {
  id: string
  parent_outline_id?: string
  title_verbatim?: string
  column_count?: number
  headers_verbatim?: string[]
  rows_verbatim?: string[][]
}

function matchSectionRule(title: string): SectionRule | null {
  for (const rule of SECTION_RULES) {
    if (rule.pattern.test(title)) {
      return rule
    }
  }
  return null
}

function matchSubsectionRules(title: string, parentRule: SectionRule): SubsectionBlueprint[] {
  const matched: SubsectionBlueprint[] = []
  for (const sub of parentRule.subsection_rules) {
    if (sub.pattern.test(title)) {
      matched.push({
        title_pattern: sub.pattern.source,
        matched_title: title,
        required_components: sub.required_components,
      })
    }
  }
  return matched
}

function countChildBlocks(outlineId: string, blocks: ExtractedBlock[]): number {
  return blocks.filter(b => b.parent_outline_id === outlineId).length
}

function countChildTables(outlineId: string, tables: ExtractedTable[]): number {
  return tables.filter(t => t.parent_outline_id === outlineId).length
}

function buildFallbackComponents(
  outlineId: string,
  blocks: ExtractedBlock[],
  tables: ExtractedTable[]
): ComponentRequirement[] {
  const components: ComponentRequirement[] = []
  const childBlocks = blocks.filter(b => b.parent_outline_id === outlineId)
  const childTables = tables.filter(t => t.parent_outline_id === outlineId)

  if (childTables.length > 0) {
    components.push({ type: 'data_table', count: childTables.length, details: 'Auto-detected tables' })
  }

  const hasFlowEvents = childBlocks.some(b => b.type === 'flow_event')
  if (hasFlowEvents) {
    const feCount = childBlocks.filter(b => b.type === 'flow_event').length
    components.push({ type: 'flow_event', count: feCount, details: 'Auto-detected flow events' })
  }

  const hasBullets = childBlocks.some(b => b.type === 'bullet')
  if (hasBullets) {
    components.push({ type: 'unordered_list', details: 'Auto-detected bullet list' })
  }

  const hasNumericData = childBlocks.some(b => {
    const text = b.text_verbatim || b.title_verbatim || ''
    return /\$[\d.,]+|\d+[.,]\d+%/.test(text)
  })
  if (hasNumericData && !childTables.length) {
    components.push({ type: 'analysis_block', details: 'Auto-detected: section contains numeric data that should be in a structured component' })
  }

  if (components.length === 0) {
    components.push({ type: 'paragraph', details: 'Fallback: render as paragraphs' })
  }

  return components
}

// ─── Main Entry Point ───

export function recognizeBlocks(extractedJson: Record<string, unknown>): BlueprintResult {
  const outline = (extractedJson.outline || []) as ExtractedOutline[]
  const blocks = (extractedJson.blocks || []) as ExtractedBlock[]
  const tables = (extractedJson.tables || []) as ExtractedTable[]

  const blueprints: SectionBlueprint[] = []

  for (const section of outline) {
    const title = section.title_verbatim || ''
    if (!title || section.type === 'hero' || section.type === 'kpis') continue

    const rule = matchSectionRule(title)

    if (rule) {
      // Collect subsection matches from child blocks
      const subsections: SubsectionBlueprint[] = []
      const childBlocks = blocks.filter(b => b.parent_outline_id === section.id)
      for (const block of childBlocks) {
        const blockTitle = block.title_verbatim || block.text_verbatim || ''
        if (blockTitle && rule.subsection_rules.length > 0) {
          const subMatches = matchSubsectionRules(blockTitle, rule)
          for (const sm of subMatches) {
            // Avoid duplicates
            if (!subsections.some(s => s.title_pattern === sm.title_pattern)) {
              subsections.push(sm)
            }
          }
        }
      }

      // Also check other outline entries that might be subsections of this section
      // (some extractors put subsections as separate outline items)
      for (const otherSection of outline) {
        if (otherSection.id === section.id) continue
        const otherTitle = otherSection.title_verbatim || ''
        if (otherTitle) {
          const subMatches = matchSubsectionRules(otherTitle, rule)
          for (const sm of subMatches) {
            if (!subsections.some(s => s.title_pattern === sm.title_pattern)) {
              subsections.push(sm)
            }
          }
        }
      }

      blueprints.push({
        outline_id: section.id,
        matched_title: title,
        target_field: rule.target_field,
        section_class: rule.section_class,
        icon_style: rule.icon_style,
        required_components: rule.required_components,
        subsections,
        detected_tables: countChildTables(section.id, tables),
        detected_blocks: countChildBlocks(section.id, blocks),
      })
    } else {
      // Fallback: unknown section → insights-section with auto-detected components
      blueprints.push({
        outline_id: section.id,
        matched_title: title,
        target_field: 'section',
        section_class: 'insights-section',
        icon_style: 'default',
        required_components: buildFallbackComponents(section.id, blocks, tables),
        subsections: [],
        detected_tables: countChildTables(section.id, tables),
        detected_blocks: countChildBlocks(section.id, blocks),
      })
    }
  }

  const prompt_injection = formatBlueprintForPrompt(blueprints)

  console.log(`[block-recognizer] Recognized ${blueprints.length} sections from ${outline.length} outline items`)
  for (const bp of blueprints) {
    console.log(`  [${bp.outline_id}] "${bp.matched_title}" → ${bp.target_field}${bp.section_class ? ` (${bp.section_class})` : ''}, ${bp.required_components.length} required components, ${bp.subsections.length} subsections`)
  }

  return { blueprints, prompt_injection }
}

// ─── Format Blueprint as Prompt Injection ───

function formatBlueprintForPrompt(blueprints: SectionBlueprint[]): string {
  const lines: string[] = [
    '',
    '## SECTION_BLUEPRINT — MANDATORY STRUCTURE',
    '',
    'The following blueprint was auto-detected from the input PDF structure.',
    'You MUST follow this blueprint exactly. Each section MUST contain ALL listed components.',
    'Do NOT simplify sections to just paragraphs — use the specified component types.',
    '',
  ]

  let idx = 1
  for (const bp of blueprints) {
    const targetLabel = bp.target_field === 'section'
      ? `section_class="${bp.section_class}"`
      : `→ "${bp.target_field}" field`

    lines.push(`[${idx}] "${bp.matched_title}" → ${targetLabel}${bp.icon_style ? `, icon_style="${bp.icon_style}"` : ''}`)

    for (const comp of bp.required_components) {
      const countStr = comp.count ? ` (${comp.count}×)` : ''
      lines.push(`    MUST use: ${comp.type}${countStr}${comp.details ? ` — ${comp.details}` : ''}`)
    }

    if (bp.subsections.length > 0) {
      lines.push(`    Subsections detected:`)
      for (const sub of bp.subsections) {
        lines.push(`      - "${sub.matched_title}":`)
        for (const comp of sub.required_components) {
          const countStr = comp.count ? ` (${comp.count}×)` : ''
          lines.push(`        MUST use: ${comp.type}${countStr}${comp.details ? ` — ${comp.details}` : ''}`)
        }
      }
    }

    if (bp.detected_tables > 0) {
      lines.push(`    [auto-detected: ${bp.detected_tables} table(s) in source — MUST produce data_table for each]`)
    }

    lines.push('')
    idx++
  }

  lines.push('CRITICAL: If a subsection blueprint says "MUST use greeks_grid (3×)", you MUST produce a greeks_grid with exactly 3 items — NOT paragraphs, NOT metrics_grid, NOT flow_events.')
  lines.push('CRITICAL: If a section blueprint says "news_block", NEVER use separate sections or flow_events. Use news_block items inside ONE news-section.')
  lines.push('CRITICAL: Every analysis_block MUST have a flow_badge with descriptive text. NEVER omit flow_badge.')
  lines.push('')

  return lines.join('\n')
}
