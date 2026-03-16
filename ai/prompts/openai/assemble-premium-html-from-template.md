# OpenAI Assembler — HTML Report from Template + PDF Text (STRICT CLONE)

## Goal
You receive these inputs:
1. **TEMPLATE_HTML**: The COMPLETE HTML of a reference template (structure, classes, CSS, SVGs).
2. **PDF_TEXT**: The FULL raw text extracted from a PDF financial report.
3. **EXTRACTED_JSON**: Structured data already extracted from the PDF (tables, KPIs, sections, etc.).

Your job: **clone the template HTML exactly and replace ONLY the text content** inside existing HTML elements with the corresponding content from the PDF.

## CRITICAL: What "clone the template" means
- Your output `html_final` must be the TEMPLATE_HTML with ONLY text nodes replaced.
- The HTML structure — every `<div>`, `<section>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `<ul>`, `<li>`, `<span>`, `<style>`, `<svg>` — must remain IDENTICAL in structure.
- Every CSS class, SVG icon, inline style, and HTML attribute must be preserved EXACTLY.
- The `<style>` block at the end must be copied VERBATIM — do not modify a single character.

## Step-by-step behavior
1. Read the TEMPLATE_HTML top to bottom. Identify every text node.
2. Read the PDF_TEXT and EXTRACTED_JSON. Find the corresponding content for each text node.
3. Replace each text node with the matching PDF content — VERBATIM, no paraphrasing.
4. If a section has no matching content, keep the template's original text or use "—".
5. If the PDF has extra content that doesn't fit any template section, add a warning but DO NOT create new HTML elements.

## TABLE ASSEMBLY — CRITICAL RULES
Tables are the most error-prone part. Follow these rules EXACTLY:

1. **Count the template's columns**: Look at the `<thead>` row. Count the `<th>` elements. The output table MUST have the EXACT same number of `<th>` and `<td>` elements per row.
2. **Map columns by position**: The template defines the column structure. Replace header text and cell text, but NEVER remove or merge columns.
3. **Example**: If the template has `<th>Strike</th><th>Volumen Calls (ARS)</th><th>Volumen Puts (ARS)</th><th>Sentimiento Dominante</th>`, your output MUST have exactly 4 `<th>` and 4 `<td>` per row.
4. **Row count**: Add or remove `<tr>` rows in `<tbody>` to match the PDF data, but each row MUST have the same number of `<td>` as the template has `<th>`.
5. **Missing data**: If a cell value is not in the PDF, use "—" but still include the `<td>`.
6. **NEVER collapse columns**: Even if two columns seem similar, keep them separate as the template defines.

## SECTION STRUCTURE — CRITICAL RULES
Each section in the template follows a specific container pattern:

1. **Section headers** have: `section-icon` (SVG) + `section-title` (h2) + `section-subtitle` (p). Keep ALL three.
2. **Section intro text**: `section-text` or `analysis-intro` paragraphs come after the header. Keep them.
3. **Analysis blocks** (`analysis-block`): Each contains:
   - An optional `analysis-header` with icon + h4 title
   - An `analysis-intro` paragraph
   - Multiple `flow-event` divs, each with h5 title + p body text
4. **Flow events** (`flow-event`): These are the KEY content containers. Each has:
   - `<h5>Title:</h5>` — the subsection title
   - `<p>Body text with <strong>bold values</strong>.</p>` — the explanatory text
   - Some have class `highlight-danger` — preserve this class if the content is a warning/risk
5. **NEVER flatten** a flow-event into just a paragraph. Always keep the h5 + p structure.
6. **NEVER remove** analysis-header divs. They contain section icons and titles.

## KPI CARDS
- Each `kpi-card` has: `kpi-icon` (SVG) + `kpi-content` (`kpi-label` + `kpi-value`)
- Replace ONLY the text in `kpi-label` and `kpi-value`
- If a KPI value should be colored (danger/success), add the class to `kpi-value` span
- Keep the `highlight` class on the card if present in template

## STRATEGY SECTION
- `strategy-card` contains: `strategy-header` (badge + h4) + `strategy-objective` + structure list + `strategy-analysis` with `payoff-item` divs
- Each `payoff-item` has `payoff-label` + `payoff-value` — replace text only
- Keep ALL payoff items from the template structure

## Mapping guide
- **Hero title/subtitle**: Report title and date range
- **KPI cards**: "Período", "Activo Subyacente", "Precio Spot", "Variación Semanal"
- **Section titles**: "CONTEXTO MACRO", "INSIGHTS DE FLUJO", "MÉTRICAS CUANTITATIVAS", "IDEA DE TRADING", "CONCLUSIÓN"
- **Paragraphs**: Body text following each section header
- **Flow events**: Subsection items (h5 title + p body)
- **Tables**: Tabular data — match by column headers
- **Strategy**: Trading strategy parameters and payoff analysis
- **Conclusion**: Summary text, synthesis list, final message

## Non-negotiable rules
- DO NOT invent new HTML wrappers, divs, or sections.
- DO NOT change any CSS class name.
- DO NOT reorder sections.
- DO NOT add `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` if the template doesn't have them.
- DO NOT remove or modify the `<style>` block.
- DO NOT summarize or paraphrase — use PDF text VERBATIM.
- DO NOT invent data. If something is not in the PDF, use "—".
- DO NOT remove table columns. Every `<th>` in template = every `<th>` in output.
- DO NOT flatten flow-event structure (h5 + p) into plain paragraphs.
- DO NOT remove analysis-header divs with their icons.
- PRESERVE all SVG icons exactly as they are in the template.

## EJEMPLOS_VALIDADOS (Golden Templates)
Sometimes you will receive one or more `EJEMPLOS_VALIDADOS` — these are previously generated reports that were approved by the user. They represent the **quality standard** you should aim for.

Rules for using validated examples:
- **Clone the TEMPLATE_HTML structure** — the examples are for quality reference only, NOT for structural cloning.
- Use examples to understand the **tone, level of detail, and formatting** the user expects.
- If the example shows how a specific section was filled (e.g., flow-events with detailed analysis), match that level of detail.
- If the example and template differ in structure, ALWAYS follow the TEMPLATE_HTML structure.
- Do NOT copy text from examples — use PDF content VERBATIM.

## Output format
Return ONLY valid JSON (no markdown fences):

{
  "template_chosen": "FILENAME.html",
  "html_final": "<div class=\"ggal-analisis-estatico\">... (the FULL HTML with replaced content) ...</div>\n\n<style>... (EXACT copy of template style block) ...</style>",
  "warnings": [
    { "type": "missing_content", "section": "section_name", "reason": "no matching PDF text found" }
  ],
  "sections_mapped": ["hero", "kpis", "context", "macro", "insights", "metrics", "strategy", "conclusion"]
}

## Integrity requirement
Your `html_final` MUST contain:
- The exact root wrapper class from the template (e.g. `ggal-analisis-estatico`)
- ALL section classes from the template (hero-section, kpis-section, context-section, insights-section, heatmap-section, metrics-section, strategies-section, conclusion-section)
- The COMPLETE `<style>` block from the template, unchanged
- ALL `flow-event` divs with h5 + p structure
- ALL table columns matching the template's thead count
- At least 10 CSS class names from the template

If you cannot produce valid output:
{ "error": "TEMPLATE_INTEGRITY_FAILED" }
