/**
 * Structured Report Validator — Post-Claude validation.
 *
 * Checks that Claude's StructuredReport JSON contains all expected components
 * based on the section blueprints from the Block Recognizer.
 * Also performs auto-repair for common minor issues.
 */

import type {
  StructuredReport,
  ReportSection,
  ContentBlock,
  DataTableBlock,
  AnalysisBlockContent,
} from '@/ai/prompts/premium-structurer'
import type { SectionBlueprint } from './block-recognizer'

// ─── Types ───

export interface ValidationIssue {
  severity: 'error' | 'warning'
  section: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  repairs: string[]
  content_block_count: number
}

// ─── Required fields per content_block type ───

const REQUIRED_FIELDS: Record<string, string[]> = {
  paragraph: ['text'],
  subsection_title: ['text'],
  volume_summary: ['items'],
  flow_event: ['title', 'text'],
  analysis_block: ['header', 'header_type', 'paragraphs'],
  data_table: ['headers', 'rows'],
  params_grid: ['items'],
  insight_card: ['badge', 'paragraphs'],
  metrics_grid: ['cards'],
  skew_grid: ['items'],
  highlight_box: ['variant', 'text'],
  ordered_list: ['items'],
  unordered_list: ['items'],
  magnets_grid: ['items'],
  greeks_grid: ['items'],
  concept_card: ['badge', 'title', 'intro_paragraphs'],
  news_block: ['title', 'paragraphs'],
  conclusion_summary: ['items'],
}

// ─── Core Validation ───

function countContentBlocks(sections: ReportSection[]): number {
  let count = 0
  for (const section of sections) {
    count += section.content_blocks?.length || 0
  }
  return count
}

function hasBlockType(blocks: ContentBlock[], type: string): boolean {
  return blocks.some(b => b.type === type)
}

function countBlockType(blocks: ContentBlock[], type: string): number {
  return blocks.filter(b => b.type === type).length
}

function validateBlockFields(block: ContentBlock, index: number, sectionTitle: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const required = REQUIRED_FIELDS[block.type]

  if (!required) {
    issues.push({
      severity: 'warning',
      section: sectionTitle,
      message: `Unknown content_block type "${block.type}" at index ${index}. It will be silently dropped by the renderer.`,
    })
    return issues
  }

  for (const field of required) {
    const value = (block as unknown as Record<string, unknown>)[field]
    if (value === undefined || value === null) {
      issues.push({
        severity: 'error',
        section: sectionTitle,
        message: `content_block[${index}] type="${block.type}" missing required field "${field}"`,
      })
    } else if (Array.isArray(value) && value.length === 0 && field !== 'flow_events' && field !== 'list_items') {
      // Empty arrays for non-optional fields
      if (['items', 'cards', 'rows', 'headers', 'paragraphs'].includes(field)) {
        issues.push({
          severity: 'warning',
          section: sectionTitle,
          message: `content_block[${index}] type="${block.type}" has empty "${field}" array`,
        })
      }
    }
  }

  // Specific checks for analysis_block
  if (block.type === 'analysis_block') {
    const ab = block as AnalysisBlockContent
    if (!ab.flow_badge && !ab.flow_badge_variant) {
      issues.push({
        severity: 'warning',
        section: sectionTitle,
        message: `analysis_block "${ab.header}" is missing flow_badge. Every analysis_block SHOULD have a flow_badge.`,
      })
    }
  }

  // Specific checks for data_table
  if (block.type === 'data_table') {
    const dt = block as DataTableBlock
    if (dt.rows && dt.rows.length > 0 && dt.headers && dt.headers.length > 0) {
      for (let r = 0; r < dt.rows.length; r++) {
        const row = dt.rows[r]
        if (row.cells && row.cells.length !== dt.headers.length) {
          issues.push({
            severity: 'warning',
            section: sectionTitle,
            message: `data_table row[${r}] has ${row.cells.length} cells but ${dt.headers.length} headers`,
          })
        }
      }
    }
  }

  return issues
}

function validateSectionAgainstBlueprint(
  section: ReportSection,
  blueprint: SectionBlueprint
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const blocks = section.content_blocks || []

  // Check section_class matches
  if (blueprint.section_class && section.section_class !== blueprint.section_class) {
    issues.push({
      severity: 'warning',
      section: section.title,
      message: `section_class mismatch: expected "${blueprint.section_class}" but got "${section.section_class}"`,
    })
  }

  // Check required component types from blueprint
  for (const req of blueprint.required_components) {
    if (req.type === 'paragraph' || req.type === 'strategy' || req.type === 'conclusion') continue

    if (!hasBlockType(blocks, req.type)) {
      issues.push({
        severity: 'error',
        section: section.title,
        message: `Blueprint requires "${req.type}" but none found in section content_blocks. ${req.details || ''}`,
      })
    } else if (req.count && countBlockType(blocks, req.type) < req.count) {
      issues.push({
        severity: 'warning',
        section: section.title,
        message: `Blueprint expects ${req.count}× "${req.type}" but only ${countBlockType(blocks, req.type)} found.`,
      })
    }
  }

  // Check subsection requirements
  for (const sub of blueprint.subsections) {
    for (const req of sub.required_components) {
      if (req.type === 'analysis_block') {
        // Check that at least one analysis_block matches the subsection title
        const analysisBlocks = blocks.filter(b => b.type === 'analysis_block') as AnalysisBlockContent[]
        const matchingTitle = sub.matched_title || ''
        const hasMatch = analysisBlocks.some(ab => {
          const header = ab.header || ''
          // Check partial title overlap
          const titleWords = matchingTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3)
          return titleWords.some(w => header.toLowerCase().includes(w))
        })
        if (!hasMatch && analysisBlocks.length === 0) {
          issues.push({
            severity: 'error',
            section: section.title,
            message: `Subsection "${sub.matched_title}" requires analysis_block but no analysis_blocks found in section.`,
          })
        }
      } else if (req.type !== 'paragraph') {
        if (!hasBlockType(blocks, req.type)) {
          issues.push({
            severity: 'error',
            section: section.title,
            message: `Subsection "${sub.matched_title}" requires "${req.type}" but none found. ${req.details || ''}`,
          })
        }
      }
    }
  }

  return issues
}

// ─── Auto-Repair ───

function autoRepair(structured: StructuredReport): string[] {
  const repairs: string[] = []

  // Repair missing section_class
  for (const section of structured.sections || []) {
    if (!section.section_class) {
      section.section_class = 'insights-section'
      repairs.push(`section "${section.title}": set missing section_class to "insights-section"`)
    }
    if (!section.id) {
      section.id = `section_${Math.random().toString(36).slice(2, 8)}`
      repairs.push(`section "${section.title}": generated missing id`)
    }

    // Repair data_table missing cell_styles
    for (const block of section.content_blocks || []) {
      if (block.type === 'data_table') {
        const dt = block as DataTableBlock
        if (dt.rows) {
          for (const row of dt.rows) {
            if (!row.cell_styles && row.cells) {
              row.cell_styles = row.cells.map(() => 'plain')
              repairs.push(`data_table in "${section.title}": added missing cell_styles (defaulted to "plain")`)
            }
          }
        }
      }
    }
  }

  // Repair missing KPI highlights
  for (const kpi of structured.kpis || []) {
    if (!kpi.highlight) {
      kpi.highlight = 'neutral'
      repairs.push(`KPI "${kpi.label}": set missing highlight to "neutral"`)
    }
  }

  // Repair missing conclusion disclaimer
  if (structured.conclusion && !structured.conclusion.disclaimer) {
    structured.conclusion.disclaimer = '<strong>Disclaimer:</strong> Operar con opciones conlleva riesgos significativos y puede resultar en la pérdida total del capital invertido. Este informe es de carácter educativo y no constituye asesoramiento financiero personalizado.'
    repairs.push('conclusion: added default disclaimer')
  }

  return repairs
}

// ─── Main Entry Point ───

export function validateStructuredReport(
  structured: StructuredReport,
  blueprints?: SectionBlueprint[]
): ValidationResult {
  const issues: ValidationIssue[] = []

  // 1. Basic structure checks
  if (!structured.title) {
    issues.push({ severity: 'error', section: 'root', message: 'Missing title' })
  }
  if (!structured.kpis || structured.kpis.length === 0) {
    issues.push({ severity: 'error', section: 'root', message: 'No KPIs found' })
  }
  if (!structured.sections || structured.sections.length === 0) {
    issues.push({ severity: 'error', section: 'root', message: 'No sections found' })
  }

  // 2. Auto-repair before validation
  const repairs = autoRepair(structured)

  // 3. Validate each section's content_blocks
  for (const section of structured.sections || []) {
    const blocks = section.content_blocks || []
    for (let i = 0; i < blocks.length; i++) {
      issues.push(...validateBlockFields(blocks[i], i, section.title))
    }
  }

  // 4. Validate against blueprints if provided
  if (blueprints && blueprints.length > 0) {
    for (const bp of blueprints) {
      if (bp.target_field !== 'section') continue

      // Find matching section by title similarity
      const matchedSection = findMatchingSection(structured.sections || [], bp.matched_title)
      if (matchedSection) {
        issues.push(...validateSectionAgainstBlueprint(matchedSection, bp))
      } else {
        issues.push({
          severity: 'warning',
          section: bp.matched_title,
          message: `Blueprint section "${bp.matched_title}" not found in structured output. Content may be missing.`,
        })
      }
    }

    // Validate strategy/conclusion fields from blueprints
    const strategyBp = blueprints.find(bp => bp.target_field === 'strategy')
    if (strategyBp && !structured.strategy) {
      issues.push({
        severity: 'warning',
        section: strategyBp.matched_title,
        message: 'Blueprint expects a "strategy" field but none found in output.',
      })
    }
    const conclusionBp = blueprints.find(bp => bp.target_field === 'conclusion')
    if (conclusionBp && !structured.conclusion) {
      issues.push({
        severity: 'warning',
        section: conclusionBp.matched_title,
        message: 'Blueprint expects a "conclusion" field but none found in output.',
      })
    }
  }

  // 5. Content completeness check
  const totalBlocks = countContentBlocks(structured.sections || [])
  if (totalBlocks < 10) {
    issues.push({
      severity: 'warning',
      section: 'root',
      message: `Only ${totalBlocks} content_blocks total across all sections. Expected at least 10 for a complete report. Possible content loss.`,
    })
  }

  // Check for "paragraph-only" sections (Claude simplification failure)
  for (const section of structured.sections || []) {
    const blocks = section.content_blocks || []
    const onlyParagraphs = blocks.every(b => b.type === 'paragraph' || b.type === 'subsection_title')
    if (onlyParagraphs && blocks.length > 2) {
      issues.push({
        severity: 'warning',
        section: section.title,
        message: `Section has ${blocks.length} blocks but ALL are paragraph/subsection_title. This likely means Claude simplified rich content to plain text. Expected typed components (data_table, greeks_grid, insight_card, etc.)`,
      })
    }
  }

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  console.log(`[validator] Validation complete: ${errors.length} errors, ${warnings.length} warnings, ${repairs.length} auto-repairs, ${totalBlocks} content_blocks`)
  for (const issue of issues) {
    const prefix = issue.severity === 'error' ? '❌' : '⚠️'
    console.log(`  ${prefix} [${issue.section}] ${issue.message}`)
  }
  for (const repair of repairs) {
    console.log(`  🔧 ${repair}`)
  }

  return {
    valid: errors.length === 0,
    issues,
    repairs,
    content_block_count: totalBlocks,
  }
}

// ─── Helpers ───

function findMatchingSection(sections: ReportSection[], blueprintTitle: string): ReportSection | null {
  const normalized = blueprintTitle.toLowerCase().replace(/[^a-záéíóúñü\s\d]/g, '')

  // Try exact match first
  for (const section of sections) {
    if (section.title.toLowerCase().includes(normalized.slice(0, 20))) {
      return section
    }
  }

  // Try keyword match
  const keywords = normalized.split(/\s+/).filter(w => w.length > 4)
  for (const section of sections) {
    const sectionLower = section.title.toLowerCase()
    const matches = keywords.filter(kw => sectionLower.includes(kw))
    if (matches.length >= 2 || (matches.length >= 1 && keywords.length <= 2)) {
      return section
    }
  }

  return null
}
