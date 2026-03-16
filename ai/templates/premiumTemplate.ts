/**
 * Deterministic HTML Renderer for Premium Reports.
 * Takes a StructuredReport JSON and the chosen template HTML,
 * extracts the template's <style> block and root wrapper,
 * then stamps the structured data into the exact same CSS class patterns.
 *
 * Component library matches: Informe_GGAL_12_16_enero_2026.html
 * ZERO LLM involvement — pure string templating.
 */

import { getBaseCSS } from './base-styles'
import type {
  StructuredReport,
  StructuredKPI,
  ReportSection,
  ContentBlock,
  AnalysisBlockContent,
  FlowEventBlock,
  DataTableBlock,
  ParamsGridBlock,
  InsightCardBlock,
  MetricsGridBlock,
  SkewGridBlock,
  VolumeSummaryBlock,
  HighlightBoxBlock,
  OrderedListBlock,
  UnorderedListBlock,
  MagnetsGridBlock,
  GreeksGridBlock,
  ConceptCardBlock,
  NewsBlockBlock,
  ConclusionSummaryBlock,
  Strategy,
  Conclusion,
} from '@/ai/prompts/premium-structurer'

// ─── SVG Icon Library (extracted from templates) ───

const ICONS = {
  calendar: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  dollar: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  chart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  globe: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  cube: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  pulse: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  layers: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  trendDown: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  trendUp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  question: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  warning: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  back: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
}

// ─── Template Parsing ───

function extractStyleBlock(templateHtml: string): string {
  const matches = templateHtml.match(/<style[\s\S]*?<\/style>/gi)
  return matches ? matches.join('\n') : ''
}

function extractRootClass(templateHtml: string): string {
  const match = templateHtml.match(/<div\s+class="([^"]+)"/)
  return match ? match[1].split(/\s+/)[0] : 'ggal-analisis-estatico'
}

// ─── Adaptive CSS Class Map ───

export interface CSSClassMap {
  metricsGrid: string
  metricsCard: string
  metricsCardList: string
  rangesGrid: string
  rangeCard: string
  rangeLabel: string
  rangeValue: string
  rangeDesc: string
  oiTable: string
  dataTable: string
  putsTable: string
  strategiesSection: string
  strategyCard: string
  strategyHeader: string
  strategyBadge: string
  strategyObjective: string
  strategyStructure: string
  strategyAnalysis: string
  payoffItem: string
  payoffLabel: string
  payoffValue: string
  conclusionSection: string
  conclusionCard: string
  conclusionHeader: string
  conclusionTitle: string
  conclusionText: string
  dataSynthesis: string
  synthesisList: string
  finalMessage: string
  flowEvent: string
  paramsGrid: string
  paramItem: string
  paramLabel: string
  paramValue: string
  subsectionTitle: string
  metricsSection: string
  conclusionSummaryGrid: string
  conclusionItem: string
  conclusionIcon: string
  conclusionContent: string
}

const CLASS_DETECTION_RULES: { key: keyof CSSClassMap; candidates: string[] }[] = [
  { key: 'metricsGrid', candidates: ['volatility-grid', 'metrics-grid', 'vol-grid'] },
  { key: 'metricsCard', candidates: ['vol-card', 'metric-card', 'volatility-card'] },
  { key: 'metricsCardList', candidates: ['vol-list', 'metric-list'] },
  { key: 'rangesGrid', candidates: ['ranges-grid', 'skew-grid', 'range-grid'] },
  { key: 'rangeCard', candidates: ['range-card', 'skew-item', 'skew-card'] },
  { key: 'rangeLabel', candidates: ['range-label', 'skew-label'] },
  { key: 'rangeValue', candidates: ['range-value', 'skew-value'] },
  { key: 'rangeDesc', candidates: ['range-desc', 'skew-desc', 'range-description'] },
  { key: 'oiTable', candidates: ['oi-table', 'data-table'] },
  { key: 'dataTable', candidates: ['data-table', 'oi-table'] },
  { key: 'putsTable', candidates: ['puts-table', 'data-table'] },
  { key: 'strategiesSection', candidates: ['strategies-section', 'strategy-section', 'insights-section'] },
  { key: 'strategyCard', candidates: ['strategy-card', 'insight-card'] },
  { key: 'strategyHeader', candidates: ['strategy-header', 'insight-header'] },
  { key: 'strategyBadge', candidates: ['strategy-badge', 'insight-badge'] },
  { key: 'strategyObjective', candidates: ['strategy-objective', 'strategy-desc'] },
  { key: 'strategyStructure', candidates: ['strategy-structure', 'strategy-legs'] },
  { key: 'strategyAnalysis', candidates: ['strategy-analysis', 'strategy-metrics'] },
  { key: 'payoffItem', candidates: ['payoff-item', 'metric-row', 'strategy-metric'] },
  { key: 'payoffLabel', candidates: ['payoff-label', 'metric-label'] },
  { key: 'payoffValue', candidates: ['payoff-value', 'metric-value'] },
  { key: 'conclusionSection', candidates: ['conclusion-section', 'conclusions-section', 'insights-section'] },
  { key: 'conclusionCard', candidates: ['conclusion-card', 'conclusion-block', 'conclusion-summary'] },
  { key: 'conclusionHeader', candidates: ['conclusion-header', 'conclusion-top'] },
  { key: 'conclusionTitle', candidates: ['conclusion-title', 'conclusion-heading'] },
  { key: 'conclusionText', candidates: ['conclusion-text', 'conclusion-desc', 'conclusion-content'] },
  { key: 'dataSynthesis', candidates: ['data-synthesis', 'synthesis-block', 'key-data'] },
  { key: 'synthesisList', candidates: ['synthesis-list', 'key-data-list'] },
  { key: 'finalMessage', candidates: ['final-message', 'final-verdict', 'conclusion-verdict'] },
  { key: 'flowEvent', candidates: ['flow-event', 'event-card', 'flow-card'] },
  { key: 'paramsGrid', candidates: ['params-grid', 'parameters-grid', 'param-grid'] },
  { key: 'paramItem', candidates: ['param-item', 'parameter-item'] },
  { key: 'paramLabel', candidates: ['param-label', 'parameter-label'] },
  { key: 'paramValue', candidates: ['param-value', 'parameter-value'] },
  { key: 'subsectionTitle', candidates: ['subsection-main-title', 'subsection-title', 'sub-title'] },
  { key: 'metricsSection', candidates: ['metrics-section', 'volatility-section', 'insights-section'] },
  { key: 'conclusionSummaryGrid', candidates: ['conclusion-summary', 'conclusions-grid'] },
  { key: 'conclusionItem', candidates: ['conclusion-item', 'conclusion-point'] },
  { key: 'conclusionIcon', candidates: ['conclusion-icon'] },
  { key: 'conclusionContent', candidates: ['conclusion-content', 'conclusion-body'] },
]

function extractDefinedClasses(templateHtml: string): Set<string> {
  const styleBlock = extractStyleBlock(templateHtml)
  const classPattern = /\.([a-zA-Z][\w-]*)/g
  const defined = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = classPattern.exec(styleBlock)) !== null) {
    defined.add(m[1])
  }
  return defined
}

export function buildCSSClassMap(templateHtml: string): CSSClassMap {
  const defined = extractDefinedClasses(templateHtml)

  const map: Record<string, string> = {}

  for (const rule of CLASS_DETECTION_RULES) {
    let found = false
    for (const candidate of rule.candidates) {
      if (defined.has(candidate)) {
        map[rule.key] = candidate
        found = true
        break
      }
    }
    if (!found) {
      map[rule.key] = rule.candidates[0]
    }
  }

  return map as unknown as CSSClassMap
}

// ─── Component Renderers ───

function renderKPI(kpi: StructuredKPI): string {
  const icon = ICONS[kpi.icon_hint] || ICONS.calendar
  const cardClass = kpi.highlight === 'danger' ? ' highlight-danger' : kpi.highlight === 'success' ? ' highlight' : ''
  const iconClass = kpi.highlight === 'danger' ? ' danger' : kpi.highlight === 'success' ? ' success' : ''
  const valueClass = kpi.highlight === 'danger' ? ' danger' : kpi.highlight === 'success' ? ' success' : ''

  return `                <div class="kpi-card${cardClass}">
                    <div class="kpi-icon${iconClass}">
                        ${icon}
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">${kpi.label}</span>
                        <span class="kpi-value${valueClass}">${kpi.value}</span>
                    </div>
                </div>`
}

function renderAnalysisBlock(block: AnalysisBlockContent, cm: CSSClassMap): string {
  const headerType = block.header_type === 'neutral' ? '' : ` ${block.header_type}`
  const icon = block.header_type === 'calls' ? ICONS.trendUp
    : block.header_type === 'puts' ? ICONS.trendDown
    : ICONS.question

  // Neutral headers get accent color styling (like Max Pain in the reference)
  const neutralStyle = block.header_type === 'neutral'
    ? ` style="border-bottom-color: var(--saas-accent);"`
    : ''
  const neutralIconStyle = block.header_type === 'neutral'
    ? ` style="background: rgba(37, 99, 235, 0.1); color: var(--saas-accent);"`
    : ''

  const flowBadgeHtml = block.flow_badge
    ? `\n                    <span class="flow-badge ${block.flow_badge_variant || 'neutral'}">${block.flow_badge}</span>`
    : ''

  let html = `            <div class="analysis-block">
                <div class="analysis-header${headerType}"${neutralStyle}>
                    <div class="analysis-icon"${neutralIconStyle}>
                        ${icon}
                    </div>
                    <h4>${block.header}</h4>${flowBadgeHtml}
                </div>\n`

  for (let i = 0; i < block.paragraphs.length; i++) {
    const cls = i === 0 ? ' class="analysis-intro"' : ` style="font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-top: 15px;"`
    html += `                <p${cls}>${block.paragraphs[i]}</p>\n`
  }

  if (block.list_items && block.list_items.length > 0) {
    html += `                <ul style="list-style: disc; margin: 15px 0 15px 25px; font-size: 0.95rem; line-height: 1.7; color: var(--saas-text);">
`
    for (const item of block.list_items) {
      html += `                    <li>${item}</li>
`
    }
    html += `                </ul>
`
  }

  // Render flow_events sub-blocks inside the analysis card
  if (block.flow_events && block.flow_events.length > 0) {
    for (const fe of block.flow_events) {
      html += renderFlowEvent(fe, cm)
      html += '\n'
    }
  }

  html += `            </div>`
  return html
}

function renderDataTable(block: DataTableBlock, cm: CSSClassMap): string {
  let html = ''
  if (block.title) {
    html += `                <p style="font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-top: 15px; margin-bottom: 15px;"><strong>${block.title}</strong></p>\n`
  }
  const tableClass = block.table_variant === 'oi' ? cm.oiTable
    : block.table_variant === 'puts' ? `${cm.dataTable} ${cm.putsTable}`
    : cm.dataTable
  html += `                <div class="table-container">
                    <table class="${tableClass}">
                        <thead>
                            <tr>\n`
  for (const h of block.headers) {
    html += `                                <th>${h}</th>\n`
  }
  html += `                            </tr>
                        </thead>
                        <tbody>\n`

  for (const row of block.rows) {
    const rowClass = row.highlight ? ' class="row-highlight"' : ''
    html += `                            <tr${rowClass}>\n`
    for (let i = 0; i < row.cells.length; i++) {
      const style = row.cell_styles?.[i] || 'plain'
      let cellContent = row.cells[i]

      if (style === 'strike_otm') {
        cellContent = `<span class="strike-tag otm">${cellContent}</span>`
      } else if (style === 'strike_atm') {
        cellContent = `<span class="strike-tag atm">${cellContent}</span>`
      } else if (style === 'strike_itm') {
        cellContent = `<span class="strike-tag itm">${cellContent}</span>`
      } else if (style === 'strike_put') {
        cellContent = `<span class="strike-tag put">${cellContent}</span>`
      } else if (style === 'strike_deep_otm') {
        cellContent = `<span class="strike-tag deep-otm">${cellContent}</span>`
      } else if (style === 'change_positive') {
        cellContent = `<span class="change-badge positive">${cellContent}</span>`
      } else if (style === 'change_negative') {
        cellContent = `<span class="change-badge negative">${cellContent}</span>`
      } else if (style === 'volume_high') {
        cellContent = `<span class="volume-badge high">${cellContent}</span>`
      } else if (style === 'volume_medium') {
        cellContent = `<span class="volume-badge medium">${cellContent}</span>`
      } else if (style === 'volume_low') {
        cellContent = `<span class="volume-badge low">${cellContent}</span>`
      }

      const tdClass = style === 'interpretation' ? ' class="interpretation-cell"'
        : style === 'price' ? ' class="price-cell"'
        : ''
      html += `                                <td${tdClass}>${cellContent}</td>\n`
    }
    html += `                            </tr>\n`
  }

  html += `                        </tbody>
                    </table>
                </div>`
  return html
}

function renderFlowEvent(block: FlowEventBlock, cm: CSSClassMap): string {
  const dangerClass = block.highlight_danger ? ' highlight-danger' : ''
  let html = `                <div class="${cm.flowEvent}${dangerClass}">
                    <h5>${block.title}</h5>
                    <p>${block.text}</p>\n`
  if (block.list_items && block.list_items.length > 0) {
    html += `                    <ul style="margin-top: 10px; padding-left: 20px;">\n`
    for (const item of block.list_items) {
      html += `                        <li style="margin-bottom: 8px;">${item}</li>\n`
    }
    html += `                    </ul>\n`
  }
  html += `                </div>`
  return html
}

function renderParamsGrid(block: ParamsGridBlock, cm: CSSClassMap): string {
  let html = `            <div class="${cm.paramsGrid}">\n`
  for (const item of block.items) {
    html += `                <div class="${cm.paramItem}">
                    <span class="${cm.paramLabel}">${item.label}</span>
                    <span class="${cm.paramValue}">${item.value}</span>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderInsightCard(block: InsightCardBlock): string {
  const smallCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
  let html = `            <div class="insight-card" style="margin-top: 25px;">
                <div class="insight-badge">
                    ${smallCheck}
                    ${block.badge}
                </div>\n`
  for (const p of block.paragraphs) {
    html += `                <p${block.paragraphs.indexOf(p) > 0 ? ' style="margin-top: 15px;"' : ''}>${p}</p>\n`
  }
  html += `            </div>`
  return html
}

function renderMetricsGrid(block: MetricsGridBlock, cm: CSSClassMap): string {
  let html = `            <div class="${cm.metricsGrid}">\n`
  for (const card of block.cards) {
    html += `                <div class="${cm.metricsCard}">
                    <h5>${card.title}</h5>
                    <ul class="${cm.metricsCardList}">\n`
    for (const item of card.items) {
      html += `                        <li>${item}</li>\n`
    }
    html += `                    </ul>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderSkewGrid(block: SkewGridBlock, cm: CSSClassMap): string {
  let html = `            <div class="${cm.rangesGrid}">\n`
  for (const item of block.items) {
    html += `                <div class="${cm.rangeCard} ${item.variant}">
                    <div class="${cm.rangeLabel}">${item.label}</div>
                    <div class="${cm.rangeValue}">${item.value}</div>
                    <div class="${cm.rangeDesc}">${item.description}</div>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderVolumeSummary(block: VolumeSummaryBlock): string {
  let html = `            <div class="volume-summary">\n`
  for (const item of block.items) {
    html += `                <div class="volume-item ${item.variant}">
                    <span class="volume-label">${item.label}</span>
                    <span class="volume-value">${item.value}</span>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderHighlightBox(block: HighlightBoxBlock): string {
  return `            <div class="highlight-box ${block.variant}" style="margin-top: 25px;">
                ${ICONS.warning}
                <p>${block.text}</p>
            </div>`
}

function renderOrderedList(block: OrderedListBlock): string {
  let html = `            <ol style="list-style: decimal; margin: 0 0 25px 25px; font-size: 0.95rem; line-height: 1.8; color: var(--saas-text);">\n`
  for (const item of block.items) {
    html += `                <li>${item}</li>\n`
  }
  html += `            </ol>`
  return html
}

function renderUnorderedList(block: UnorderedListBlock): string {
  let html = `            <ul style="list-style: disc; margin: 0 0 25px 25px; font-size: 0.95rem; line-height: 1.8; color: var(--saas-text);">\n`
  for (const item of block.items) {
    html += `                <li>${item}</li>\n`
  }
  html += `            </ul>`
  return html
}

function renderMagnetsGrid(block: MagnetsGridBlock): string {
  const magnetIcons: Record<string, string> = {
    support: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`,
    neutral: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    resistance: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
  }

  let html = `            <div class="magnets-grid">\n`
  for (const item of block.items) {
    const icon = magnetIcons[item.type] || magnetIcons.neutral
    html += `                <div class="magnet-card ${item.type}">
                    <div class="magnet-header">
                        <div class="magnet-icon">
                            ${icon}
                        </div>
                        <span class="magnet-type">${item.type_label}</span>
                    </div>
                    <div class="magnet-price">${item.price}</div>
                    <div class="magnet-name">${item.name}</div>
                    <p class="magnet-desc">${item.description}</p>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderGreeksGrid(block: GreeksGridBlock): string {
  let html = `            <div class="greeks-grid">\n`
  for (const item of block.items) {
    html += `                <div class="greek-card">
                    <div class="greek-header">
                        <span class="greek-symbol">${item.symbol}</span>
                        <span class="greek-name">${item.name}</span>
                    </div>
                    <p class="greek-desc">${item.description}</p>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderConceptCard(block: ConceptCardBlock): string {
  let html = `            <div class="concept-card">
                <div class="concept-header">
                    <div class="concept-badge">
                        ${ICONS.question}
                        ${block.badge}
                    </div>
                    <h3 class="concept-title">${block.title}</h3>
                </div>\n`

  for (const p of block.intro_paragraphs) {
    html += `                <p class="concept-intro">${p}</p>\n`
  }

  if (block.mechanism_title && block.steps && block.steps.length > 0) {
    html += `                <div class="mechanism-block">
                    <h4 class="mechanism-title">${block.mechanism_title}</h4>
                    <div class="steps-grid">\n`
    for (let i = 0; i < block.steps.length; i++) {
      const isLast = i === block.steps.length - 1 && block.steps.length % 2 !== 0
      const fullWidthClass = isLast ? ' full-width' : ''
      html += `                        <div class="step-card${fullWidthClass}">
                            <div class="step-number">${i + 1}</div>
                            <p>${block.steps[i]}</p>
                        </div>\n`
    }
    html += `                    </div>
                </div>\n`
  }

  if (block.closing_paragraphs) {
    for (const p of block.closing_paragraphs) {
      html += `                <p class="concept-intro">${p}</p>\n`
    }
  }

  if (block.highlight) {
    html += `                <div class="highlight-box ${block.highlight.variant}">
                    ${block.highlight.variant === 'success' ? ICONS.check : ICONS.warning}
                    <p>${block.highlight.text}</p>
                </div>\n`
  }

  html += `            </div>`
  return html
}

function renderNewsBlock(block: NewsBlockBlock): string {
  let html = `            <div class="news-block">
                <h3 class="news-title">${block.title}</h3>\n`
  for (const p of block.paragraphs) {
    html += `                <p>${p}</p>\n`
  }
  html += `            </div>`
  return html
}

function renderConclusionSummary(block: ConclusionSummaryBlock, cm: CSSClassMap): string {
  const conclusionIcons: Record<string, string> = {
    bullish: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`,
    neutral: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  }

  let html = `            <div class="${cm.conclusionSummaryGrid}">\n`
  for (const item of block.items) {
    const icon = conclusionIcons[item.variant] || conclusionIcons.neutral
    html += `                <div class="${cm.conclusionItem} ${item.variant}">
                    <div class="${cm.conclusionIcon}">
                        ${icon}
                    </div>
                    <div class="${cm.conclusionContent}">
                        <h4>${item.title}</h4>
                        <p>${item.text}</p>
                    </div>
                </div>\n`
  }
  html += `            </div>`
  return html
}

function renderContentBlock(block: ContentBlock, cm: CSSClassMap): string {
  switch (block.type) {
    case 'paragraph':
      return `            <p class="section-text">${block.text}</p>`
    case 'subsection_title':
      return `            <h3 class="${cm.subsectionTitle}">${block.text}</h3>`
    case 'volume_summary':
      return renderVolumeSummary(block)
    case 'analysis_block':
      return renderAnalysisBlock(block, cm)
    case 'flow_event':
      return renderFlowEvent(block, cm)
    case 'data_table':
      return renderDataTable(block, cm)
    case 'params_grid':
      return renderParamsGrid(block, cm)
    case 'insight_card':
      return renderInsightCard(block)
    case 'metrics_grid':
      return renderMetricsGrid(block, cm)
    case 'skew_grid':
      return renderSkewGrid(block, cm)
    case 'highlight_box':
      return renderHighlightBox(block)
    case 'ordered_list':
      return renderOrderedList(block)
    case 'unordered_list':
      return renderUnorderedList(block)
    case 'magnets_grid':
      return renderMagnetsGrid(block)
    case 'greeks_grid':
      return renderGreeksGrid(block)
    case 'concept_card':
      return renderConceptCard(block)
    case 'news_block':
      return renderNewsBlock(block)
    case 'conclusion_summary':
      return renderConclusionSummary(block, cm)
    default:
      return ''
  }
}

function renderSection(section: ReportSection, rootClass: string, cm: CSSClassMap): string {
  const iconStyleMap: Record<string, string> = {
    default: `background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));`,
    purple: `background: linear-gradient(135deg, #7c3aed, #a855f7);`,
    red: `background: linear-gradient(135deg, #dc2626, #ef4444);`,
  }
  const iconStyle = section.icon_style ? iconStyleMap[section.icon_style] || '' : ''
  const iconStyleAttr = iconStyle ? ` style="${iconStyle}"` : ''
  const sectionClass = section.section_class || 'insights-section'

  // Determine background style — some section classes have their own bg in CSS
  const sectionClassesWithOwnBg = ['volatility-section', 'news-section', 'magnets-section', 'greeks-section', 'concept-section', 'conclusions-section', 'heatmap-section', 'metrics-section', 'strategies-section']
  const bgStyle = !sectionClassesWithOwnBg.includes(sectionClass) && section.bg_alt ? ` style="background: var(--saas-light);"` : ''

  // Pick section-appropriate icon
  const sectionIconMap: Record<string, string> = {
    'magnets-section': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  }
  const sectionIcon = sectionIconMap[sectionClass]
    || (section.icon_style === 'purple' ? ICONS.pulse
    : section.icon_style === 'red' ? ICONS.layers
    : ICONS.cube)

  // Sections that skip the standard section-header
  const noHeaderSections = ['heatmap-section', 'concept-section']
  // magnets-section uses a special icon class
  const magnetIconClass = sectionClass === 'magnets-section' || sectionClass === 'news-section' ? ' magnets' : ''

  let html = `    <section class="${sectionClass}"${bgStyle}>
        <div class="section-container">\n`

  if (!noHeaderSections.includes(sectionClass)) {
    html += `            <div class="section-header">
                <div class="section-icon${magnetIconClass}"${iconStyleAttr}>
                    ${sectionIcon}
                </div>
                <div>
                    <h2 class="section-title">${section.title}</h2>
                    ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
                </div>
            </div>\n\n`
  }

  for (const block of section.content_blocks) {
    html += renderContentBlock(block, cm) + '\n\n'
  }

  html += `        </div>
    </section>`
  return html
}

function renderStrategy(strategy: Strategy, cm: CSSClassMap): string {
  // Determine badge style from subtitle (e.g. "RIESGO: Alto" → bearish badge)
  const badgeClass = strategy.section_subtitle?.toLowerCase().includes('alto') ? 'bearish'
    : strategy.section_subtitle?.toLowerCase().includes('moderado') ? 'bearish'
    : 'neutral'

  let html = `    <section class="${cm.strategiesSection}">
        <div class="section-container">
            <div class="section-header">
                <div class="section-icon">
                    ${ICONS.layers}
                </div>
                <div>
                    <h2 class="section-title">${strategy.section_title}</h2>
                    ${strategy.section_subtitle ? `<p class="section-subtitle">${strategy.section_subtitle}</p>` : ''}
                </div>
            </div>\n`

  for (const p of strategy.intro_paragraphs) {
    html += `            <p class="section-text">${p}</p>\n`
  }

  for (const list of strategy.intro_lists) {
    const tag = list.type === 'ordered' ? 'ol' : 'ul'
    html += `            <${tag} style="list-style: none; margin-bottom: 20px; font-size: 0.95rem;">\n`
    for (const item of list.items) {
      html += `                <li style="padding: 5px 0;">${item}</li>\n`
    }
    html += `            </${tag}>\n`
  }

  // Strategy card — matches template's .strategy-card structure
  html += `            <div class="${cm.strategyCard}">
                <div class="${cm.strategyHeader}">
                    <div class="${cm.strategyBadge} ${badgeClass}">${strategy.section_subtitle || 'MODERADO / PROFESIONAL'}</div>
                    <h4>Estrategia Sugerida: ${strategy.name}</h4>
                </div>\n`

  html += `                <p class="${cm.strategyObjective}">${strategy.description}</p>\n`

  // Legs — rendered as strategy-structure block (matches template)
  if (strategy.legs.length > 0) {
    html += `                <div class="${cm.strategyStructure}">
                    <h5>Estructura de la Operación:</h5>
                    <ul>\n`
    for (const leg of strategy.legs) {
      const details = leg.details.map(d => `<em>${d.label}:</em> ${d.value}`).join('. ')
      html += `                        <li><strong>${leg.action === 'VENDER' ? `${leg.action_symbol}. VENDER (-)` : `${leg.action_symbol}. COMPRAR (+)`}: ${leg.strike_label}.</strong> ${details}</li>\n`
    }
    html += `                    </ul>
                </div>\n`
  }

  // Metrics — rendered as strategy-analysis block with payoff-items (matches template)
  if (strategy.metrics.length > 0) {
    html += `                <div class="${cm.strategyAnalysis}">
                    <h5>${strategy.metrics_title || 'Análisis del Trade'}</h5>\n`
    for (const m of strategy.metrics) {
      html += `                    <div class="${cm.payoffItem}">
                        <span class="${cm.payoffLabel}">${m.label}</span>
                        <span class="${cm.payoffValue}">${m.value}</span>
                    </div>\n`
    }
    html += `                </div>\n`
  }

  // Rationale — rendered as flow-event inside the strategy card
  if (strategy.rationale_items.length > 0) {
    html += `                <div class="${cm.flowEvent}" style="margin-top: 20px;">
                    <h5>${strategy.rationale_title || 'Por qué funciona matemáticamente:'}</h5>\n`
    if (strategy.rationale_items.length === 1) {
      html += `                    <p>${strategy.rationale_items[0]}</p>\n`
    } else {
      html += `                    <ul style="margin-top: 10px; padding-left: 20px;">\n`
      for (const item of strategy.rationale_items) {
        html += `                        <li style="margin-bottom: 8px;">${item}</li>\n`
      }
      html += `                    </ul>\n`
    }
    html += `                </div>\n`
  }

  html += `            </div>
        </div>
    </section>`
  return html
}

function renderConclusion(conclusion: Conclusion, rootClass: string, cm: CSSClassMap): string {
  let html = `    <section class="${cm.conclusionSection}">
        <div class="section-container">
            <div class="${cm.conclusionCard}">
                <div class="${cm.conclusionHeader}">
                    <h2 class="${cm.conclusionTitle}">${conclusion.section_title}</h2>
                </div>\n`

  for (const p of conclusion.intro_paragraphs) {
    html += `                <p class="${cm.conclusionText}">${p}</p>\n`
  }

  // Data synthesis block (levels + key data)
  if (conclusion.levels.length > 0 || conclusion.insight_card) {
    html += `                <div class="${cm.dataSynthesis}">
                    <h5>Resumen de Datos Clave:</h5>
                    <ul class="${cm.synthesisList}">\n`
    for (const level of conclusion.levels) {
      html += `                        <li>${level.value}</li>\n`
    }
    if (conclusion.insight_card) {
      html += `                        <li>${conclusion.insight_card.text}</li>\n`
    }
    html += `                    </ul>
                </div>\n`
  }

  // Final message / veredicto
  if (conclusion.insight_card) {
    html += `                <div class="${cm.finalMessage}">
                    <strong>${conclusion.insight_card.badge}:</strong> ${conclusion.insight_card.text}
                </div>\n`
  }

  // Disclaimer
  if (conclusion.disclaimer) {
    html += `                <p style="margin-top: 25px; font-size: 0.9rem; color: rgba(255,255,255,0.7); font-style: italic;">${conclusion.disclaimer}</p>\n`
  }

  html += `            </div>
        </div>
    </section>`
  return html
}

// ─── Main Renderer ───

export function renderPremiumHTML(data: StructuredReport, templateHtml: string): string {
  const styleBlock = extractStyleBlock(templateHtml)
  const rootClass = extractRootClass(templateHtml)
  const cm = buildCSSClassMap(templateHtml)

  console.log(`[renderer] Root class: ${rootClass}, CSS map sample: metricsGrid=${cm.metricsGrid}, conclusionSection=${cm.conclusionSection}, strategiesSection=${cm.strategiesSection}`)

  let html = `<div class="${rootClass}">\n\n`

  // Hero Section
  html += `    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-container">
            <a href="https://bostonam.ar/informes-de-opciones-premium/" class="back-link">
                ${ICONS.back}
                Volver a Opciones
            </a>
            <h1 class="hero-title">${data.title}</h1>
            <p class="hero-subtitle">${data.subtitle}</p>
        </div>
    </section>\n\n`

  // KPIs Section
  if (data.kpis && data.kpis.length > 0) {
    const kpiCount = data.kpis.length
    const gridStyle = kpiCount !== 4
      ? ` style="display: grid; grid-template-columns: repeat(${kpiCount}, 1fr); gap: 20px; max-width: ${kpiCount * 280}px; margin: 0 auto;"`
      : ''
    html += `    <!-- KPIs Section -->
    <section class="kpis-section">
        <div class="section-container">
            <div class="kpis-grid"${gridStyle}>\n`
    for (const kpi of data.kpis) {
      html += renderKPI(kpi) + '\n'
    }
    html += `            </div>
        </div>
    </section>\n\n`
  }

  // Context (Sección PRE)
  if (data.context) {
    html += `    <!-- Contexto -->
    <section class="context-section">
        <div class="section-container">
            <div class="context-card">
                <div class="context-header">
                    <div class="context-icon">
                        ${ICONS.globe}
                    </div>
                    <h2 class="context-title">${data.context.title}</h2>
                </div>\n`
    for (let i = 0; i < data.context.paragraphs.length; i++) {
      const style = i > 0 ? ' style="margin-top: 15px;"' : ''
      html += `                <p${style}>${data.context.paragraphs[i]}</p>\n`
    }
    html += `            </div>
        </div>
    </section>\n\n`
  }

  // Main sections
  for (const section of data.sections) {
    const commentTitle = section.title || section.section_class || 'Section'
    html += `    <!-- ${commentTitle} -->\n`
    html += renderSection(section, rootClass, cm) + '\n\n'
  }

  // Strategy
  if (data.strategy) {
    html += `    <!-- Estrategia -->\n`
    html += renderStrategy(data.strategy, cm) + '\n\n'
  }

  // Conclusion
  if (data.conclusion) {
    html += `    <!-- Conclusión -->\n`
    html += renderConclusion(data.conclusion, rootClass, cm) + '\n\n'
  }

  html += `</div>\n\n`

  // Base CSS: complete component coverage for all renderer output
  html += getBaseCSS(rootClass) + '\n'

  // Template CSS: specific overrides from the selected template
  html += styleBlock + '\n'

  // Standalone rendering overrides (iframe preview context)
  html += `<style>
.${rootClass} .hero-section { margin-top: 0 !important; padding-top: 40px !important; }
</style>\n`

  return html
}
