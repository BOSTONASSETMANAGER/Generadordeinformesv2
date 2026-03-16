/**
 * Template Similarity Scorer
 * Compares generated HTML against the chosen template to ensure structural fidelity.
 * Supports adaptive class mapping: the renderer may use equivalent class names.
 */

import { buildCSSClassMap } from '@/ai/templates/premiumTemplate'

export interface SimilarityResult {
  score: number
  details: {
    classOverlap: number
    rootWrapperPresent: boolean
    sectionsCovered: Record<string, boolean>
    sectionsScore: number
    styleBlockPresent: boolean
    cssVariablesPreserved: number
  }
  diagnostics: string[]
}

const KEY_SECTIONS = [
  'hero',
  'kpis',
  'context',
  'insights',
  'heatmap',
  'disclaimer',
] as const

/**
 * Compute similarity between generated HTML and the template HTML.
 * Returns a score between 0.0 and 1.0.
 */
export function computeTemplateSimilarity(
  generatedHtml: string,
  templateHtml: string
): SimilarityResult {
  const diagnostics: string[] = []

  // 1. Extract CSS classes from both, augmented with adaptive class map
  const templateClasses = extractClasses(templateHtml)
  const generatedClasses = extractClasses(generatedHtml)

  // Add adaptive class map values to generated classes for fair comparison
  const cm = buildCSSClassMap(templateHtml)
  const adaptiveValues = Object.values(cm)
  for (const cls of adaptiveValues) {
    if (generatedClasses.indexOf(cls) === -1) {
      generatedClasses.push(cls)
    }
  }

  const sharedClasses = templateClasses.filter(c => generatedClasses.indexOf(c) !== -1)
  const classOverlap = templateClasses.length > 0
    ? sharedClasses.length / templateClasses.length
    : 0

  if (classOverlap < 0.5) {
    diagnostics.push(`Low class overlap: ${sharedClasses.length}/${templateClasses.length} (${(classOverlap * 100).toFixed(0)}%)`)
  }

  // 2. Check root wrapper
  const templateRootMatch = templateHtml.match(/<div\s+class="([^"]+)"/)
  const templateRoot = templateRootMatch ? templateRootMatch[1] : null
  const rootWrapperPresent = templateRoot
    ? generatedHtml.includes(`class="${templateRoot}"`)
    : false

  if (!rootWrapperPresent && templateRoot) {
    diagnostics.push(`Missing root wrapper: .${templateRoot}`)
  }

  // 3. Check key sections
  const sectionsCovered: Record<string, boolean> = {}
  let sectionsFound = 0

  for (const section of KEY_SECTIONS) {
    const patterns = getSectionPatterns(section)
    const inTemplate = patterns.some(p => templateHtml.includes(p))
    const inGenerated = patterns.some(p => generatedHtml.includes(p))

    if (inTemplate) {
      sectionsCovered[section] = inGenerated
      if (inGenerated) sectionsFound++
      else diagnostics.push(`Missing section: ${section}`)
    }
  }

  const templateSectionCount = Object.keys(sectionsCovered).length
  const sectionsScore = templateSectionCount > 0
    ? sectionsFound / templateSectionCount
    : 1

  // 4. Check <style> block
  const templateHasStyle = /<style[\s>]/.test(templateHtml)
  const generatedHasStyle = /<style[\s>]/.test(generatedHtml)
  const styleBlockPresent = !templateHasStyle || generatedHasStyle

  if (templateHasStyle && !generatedHasStyle) {
    diagnostics.push('Missing <style> block from template')
  }

  // 5. Check CSS variables preserved
  const templateVars = extractCssVariables(templateHtml)
  const generatedVars = extractCssVariables(generatedHtml)
  const preservedVars = templateVars.filter(v => generatedVars.indexOf(v) !== -1)
  const cssVariablesPreserved = templateVars.length > 0
    ? preservedVars.length / templateVars.length
    : 1

  if (cssVariablesPreserved < 0.8) {
    diagnostics.push(`CSS variables lost: ${preservedVars.length}/${templateVars.length}`)
  }

  // 6. Check for prohibited patterns (dashboard wrappers)
  if (generatedHtml.includes('class="report-container"')) {
    diagnostics.push('PROHIBITED: Found dashboard-style .report-container wrapper')
  }
  if (/<html[\s>]/.test(generatedHtml) || /<!DOCTYPE/i.test(generatedHtml)) {
    diagnostics.push('PROHIBITED: Found <html> or <!DOCTYPE> tags (template fragments should not have these)')
  }

  // Compute weighted score
  const weights = {
    classOverlap: 0.30,
    rootWrapper: 0.20,
    sections: 0.25,
    styleBlock: 0.10,
    cssVars: 0.15,
  }

  const score =
    classOverlap * weights.classOverlap +
    (rootWrapperPresent ? 1 : 0) * weights.rootWrapper +
    sectionsScore * weights.sections +
    (styleBlockPresent ? 1 : 0) * weights.styleBlock +
    cssVariablesPreserved * weights.cssVars

  return {
    score: Math.round(score * 1000) / 1000,
    details: {
      classOverlap: Math.round(classOverlap * 1000) / 1000,
      rootWrapperPresent,
      sectionsCovered,
      sectionsScore: Math.round(sectionsScore * 1000) / 1000,
      styleBlockPresent,
      cssVariablesPreserved: Math.round(cssVariablesPreserved * 1000) / 1000,
    },
    diagnostics,
  }
}

/**
 * Extract all CSS class names from HTML
 */
function extractClasses(html: string): string[] {
  const matches = html.match(/class="([^"]+)"/g) || []
  const allClasses: string[] = []

  for (const m of matches) {
    const inner = m.replace(/class="/, '').replace(/"$/, '')
    const parts = inner.split(/\s+/)
    for (const p of parts) {
      if (p && allClasses.indexOf(p) === -1) {
        allClasses.push(p)
      }
    }
  }

  return allClasses
}

/**
 * Extract CSS variable names from HTML
 */
function extractCssVariables(html: string): string[] {
  const matches = html.match(/--[\w-]+/g) || []
  const unique: string[] = []
  for (const m of matches) {
    if (unique.indexOf(m) === -1) unique.push(m)
  }
  return unique
}

/**
 * Get search patterns for a key section
 */
function getSectionPatterns(section: string): string[] {
  switch (section) {
    case 'hero':
      return ['hero-section', 'class="hero"', 'hero-title', 'hero-container', 'hero-content']
    case 'kpis':
      return ['kpis-section', 'class="kpis"', 'kpis-grid', 'kpi-card', 'class="kpi"']
    case 'context':
      return ['context-section', 'class="context"', 'context-card', 'context-title']
    case 'insights':
      return ['insights-section', 'section-title', 'section-header', 'section-text']
    case 'heatmap':
      return ['heatmap-section', 'data-table', 'analysis-block', 'analysis-header']
    case 'disclaimer':
      return ['highlight-box', 'Disclaimer', 'disclaimer']
    default:
      return [section]
  }
}

/**
 * Minimum acceptable similarity score
 */
export const MIN_SIMILARITY_SCORE = 0.75
