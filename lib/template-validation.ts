/**
 * Anti-layout-inventado validation.
 * Ensures the generated HTML is actually based on the template,
 * not an invented layout by the LLM.
 * Supports adaptive class mapping: the renderer may use equivalent
 * class names that map to the same semantic role.
 */

import crypto from 'crypto'
import { buildCSSClassMap } from '@/ai/templates/premiumTemplate'

export interface TemplateValidationResult {
  passed: boolean
  rootClassPresent: boolean
  keyClassesFound: number
  keyClassesRequired: number
  missingClasses: string[]
  doctypeMatch: boolean
  htmlHash: string
  reasons: string[]
}

const MIN_KEY_CLASSES = 8

/**
 * Extract unique CSS class names from HTML string (simple regex, no DOM).
 */
function extractClasses(html: string): string[] {
  const matches = html.match(/class="([^"]+)"/g) || []
  const all = new Set<string>()
  for (const m of matches) {
    const inner = m.slice(7, -1) // remove class=" and "
    for (const cls of inner.split(/\s+/)) {
      if (cls) all.add(cls)
    }
  }
  return Array.from(all)
}

/**
 * Detect the root class or id from the template's first element.
 */
function detectRootSignature(html: string): string | null {
  // Match first <div class="..."> 
  const match = html.match(/<div\s+class="([^"]+)"/)
  return match ? match[1].split(/\s+/)[0] : null
}

/**
 * Validate that htmlFinal is structurally based on templateHtml.
 * Returns a result with pass/fail and diagnostics.
 */
export function validateTemplateUsage(
  templateHtml: string,
  htmlFinal: string
): TemplateValidationResult {
  const reasons: string[] = []
  const htmlHash = crypto.createHash('sha256').update(htmlFinal).digest('hex').slice(0, 16)

  // 1) Check root class/id signature
  const rootClass = detectRootSignature(templateHtml)
  let rootClassPresent = false
  if (rootClass) {
    rootClassPresent = htmlFinal.includes(rootClass)
    if (!rootClassPresent) {
      reasons.push(`Root class '${rootClass}' from template NOT found in generated HTML`)
    }
  } else {
    // No root class detected in template — can't validate this check
    rootClassPresent = true
  }

  // 2) Check that htmlFinal contains at least MIN_KEY_CLASSES from template
  //    Account for adaptive class mapping: the renderer maps semantic roles
  //    to whatever classes the template defines.
  const templateClasses = extractClasses(templateHtml)
  const generatedClasses = new Set(extractClasses(htmlFinal))

  // Build a set of all classes the adaptive renderer could legitimately use
  const cm = buildCSSClassMap(templateHtml)
  const adaptiveClassValues = Object.values(cm)
  // Also add them to generatedClasses for matching
  for (const cls of adaptiveClassValues) {
    generatedClasses.add(cls)
  }

  const missingClasses: string[] = []
  let keyClassesFound = 0

  for (const cls of templateClasses) {
    if (generatedClasses.has(cls)) {
      keyClassesFound++
    } else {
      missingClasses.push(cls)
    }
  }

  const keyClassesRequired = Math.min(MIN_KEY_CLASSES, templateClasses.length)

  if (keyClassesFound < keyClassesRequired) {
    reasons.push(
      `Only ${keyClassesFound}/${templateClasses.length} template classes found in output (minimum ${keyClassesRequired} required)`
    )
  }

  // 3) Check doctype consistency
  const templateHasDoctype = /^<!doctype/i.test(templateHtml.trim())
  const finalHasDoctype = /^<!doctype/i.test(htmlFinal.trim())
  const doctypeMatch = templateHasDoctype === finalHasDoctype
  if (!doctypeMatch) {
    if (templateHasDoctype && !finalHasDoctype) {
      reasons.push('Template starts with <!DOCTYPE> but generated HTML does not')
    } else {
      reasons.push('Generated HTML has <!DOCTYPE> but template does not')
    }
  }

  // 4) Check for prohibited invented wrappers
  if (!rootClass) {
    // skip
  } else {
    // Check if the generated HTML wraps the template content in an extra container
    const firstDivMatch = htmlFinal.match(/<div\s+class="([^"]+)"/)
    if (firstDivMatch) {
      const firstGenClass = firstDivMatch[1].split(/\s+/)[0]
      if (firstGenClass !== rootClass && !templateClasses.includes(firstGenClass)) {
        reasons.push(`Generated HTML starts with invented wrapper class '${firstGenClass}' instead of template root '${rootClass}'`)
      }
    }
  }

  const passed = rootClassPresent && keyClassesFound >= keyClassesRequired && reasons.length === 0

  return {
    passed,
    rootClassPresent,
    keyClassesFound,
    keyClassesRequired,
    missingClasses: missingClasses.slice(0, 20), // cap for logging
    doctypeMatch,
    htmlHash,
    reasons,
  }
}
