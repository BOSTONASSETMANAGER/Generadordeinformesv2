/**
 * Client-side PDF text extraction using pdfjs-dist.
 * Extracts structured text content from uploaded PDF files.
 */

import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface ParsedReportData {
  title: string
  subtitle: string
  date: string
  ticker: string
  spotPrice: string
  spotChange: string
  expiration: string
  kpis: ParsedKPI[]
  sections: ParsedSection[]
  callsTable: ParsedOptionRow[]
  putsTable: ParsedOptionRow[]
  conclusion: string
  supportLevels: string[]
  resistanceLevels: string[]
  rawText: string
}

export interface ParsedKPI {
  label: string
  value: string
  change?: string
  isNegative?: boolean
}

export interface ParsedSection {
  id: string
  title: string
  content: string
  subsections?: { title: string; content: string }[]
}

export interface ParsedOptionRow {
  strike: string
  change: string
  volume: string
  interpretation: string
  isHighlight?: boolean
}

/**
 * Extract all text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n\n'
  }
  
  return fullText.trim()
}

/**
 * Parse extracted text into structured report data.
 * Uses heuristics to identify sections, KPIs, tables, etc.
 */
export function parseReportText(rawText: string): ParsedReportData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  
  // Extract title
  const title = extractTitle(rawText)
  
  // Extract ticker
  const ticker = extractTicker(rawText)
  
  // Extract date
  const date = extractDate(rawText)
  
  // Extract spot price
  const { price: spotPrice, change: spotChange } = extractSpotPrice(rawText)
  
  // Extract expiration
  const expiration = extractExpiration(rawText)
  
  // Extract KPIs
  const kpis = extractKPIs(rawText, date, expiration, spotPrice, spotChange)
  
  // Extract sections
  const sections = extractSections(rawText)
  
  // Extract options tables
  const { calls, puts } = extractOptionsTables(rawText)
  
  // Extract conclusion
  const conclusion = extractConclusion(rawText)
  
  // Extract levels
  const { support, resistance } = extractLevels(rawText)

  return {
    title: title || `Análisis Cuantitativo y Estratégico de Derivados Financieros – (${ticker})`,
    subtitle: `Activo Subyacente: ${ticker} | Precio Spot: ${spotPrice} (${spotChange})`,
    date,
    ticker,
    spotPrice,
    spotChange,
    expiration,
    kpis,
    sections,
    callsTable: calls,
    putsTable: puts,
    conclusion,
    supportLevels: support,
    resistanceLevels: resistance,
    rawText,
  }
}

function extractTitle(text: string): string {
  // Look for common title patterns
  const patterns = [
    /Análisis\s+Cuantitativo[^–—-]*[–—-]\s*\(?(\w+)\)?/i,
    /Informe\s+de\s+Opciones[^–—-]*[–—-]\s*\(?(\w+)\)?/i,
    /Strategy\s+Analysis[^–—-]*[–—-]\s*\(?(\w+)\)?/i,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0].trim()
  }
  
  // Try first meaningful line
  const firstLine = text.split('\n').find(l => l.trim().length > 20)
  return firstLine?.trim() || 'Informe de Análisis'
}

function extractTicker(text: string): string {
  // Look for ticker in parentheses like (GGAL), (YPF), etc.
  const match = text.match(/\(([A-Z]{2,5})\)/)
  if (match) return match[1]
  
  // Look for common Argentine tickers
  const tickers = ['GGAL', 'YPF', 'PAMP', 'BBAR', 'SUPV', 'CEPU', 'LOMA', 'TXAR', 'ALUA', 'TECO2']
  for (const t of tickers) {
    if (text.includes(t)) return t
  }
  
  return 'N/A'
}

function extractDate(text: string): string {
  // Spanish date patterns
  const patterns = [
    /Fecha\s+del\s+Informe:\s*([^\n|]+)/i,
    /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
    /Report\s+Date[:\s]*([^\n]+)/i,
    /Fecha:\s*([^\n]+)/i,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  
  return new Date().toLocaleDateString('es-AR')
}

function extractSpotPrice(text: string): { price: string; change: string } {
  // Look for price patterns
  const pricePatterns = [
    /Precio\s+Spot[^:]*:\s*\$?([\d.,]+)/i,
    /Precio\s+de\s+Cierre[^:]*:\s*\$?([\d.,]+)/i,
    /Precio\s+Local[^:]*:\s*\$?([\d.,]+)/i,
    /Cierre:\s*\$?([\d.,]+)/i,
  ]
  
  let price = 'N/A'
  for (const pattern of pricePatterns) {
    const match = text.match(pattern)
    if (match) {
      price = `$${match[1]}`
      break
    }
  }
  
  // Look for change
  const changePatterns = [
    /\(([-+]?\d+[.,]\d+%)\)/,
    /Variación[^:]*:\s*([-+]?\d+[.,]\d+%)/i,
    /([-+]\d+[.,]\d+%)/,
  ]
  
  let change = '0%'
  for (const pattern of changePatterns) {
    const match = text.match(pattern)
    if (match) {
      change = match[1]
      break
    }
  }
  
  return { price, change }
}

function extractExpiration(text: string): string {
  const patterns = [
    /Vencimiento[^:]*:\s*([^\n|]+)/i,
    /Opex[^:]*:\s*([^\n|]+)/i,
    /Expiration[^:]*:\s*([^\n|]+)/i,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  
  return 'N/A'
}

function extractKPIs(text: string, date: string, expiration: string, spotPrice: string, spotChange: string): ParsedKPI[] {
  const kpis: ParsedKPI[] = [
    { label: 'Fecha del Informe', value: date },
    { label: 'Vencimiento Opex', value: expiration },
    { label: 'Precio Spot Cierre', value: spotPrice },
    { label: 'Variación Diaria', value: spotChange, isNegative: spotChange.includes('-') },
  ]
  
  // Try to find additional KPIs
  const volMatch = text.match(/Volatilidad\s+(?:IV|Implícita)[^:]*:\s*([\d.,]+%?)/i)
  if (volMatch) {
    kpis.push({ label: 'Volatilidad IV', value: volMatch[1] })
  }
  
  const volumeMatch = text.match(/Volumen\s+(?:total|operado)[^:]*:\s*\$?([\d.,]+)/i)
  if (volumeMatch) {
    kpis.push({ label: 'Volumen Total', value: `$${volumeMatch[1]}` })
  }
  
  return kpis
}

function extractSections(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  
  // Look for section headers (SECCIÓN, SECTION, numbered sections)
  const sectionPatterns = [
    /SECCIÓN\s+\w+:\s*([^\n]+)/gi,
    /SECTION\s+\w+:\s*([^\n]+)/gi,
    /\d+\.\s+([A-ZÁÉÍÓÚÑ][^\n]+)/g,
  ]
  
  // Split text by section markers
  const sectionMarkers = text.match(/SECCIÓN\s+\w+:[^\n]+/gi) || []
  
  if (sectionMarkers.length > 0) {
    for (let i = 0; i < sectionMarkers.length; i++) {
      const startIdx = text.indexOf(sectionMarkers[i])
      const endIdx = i < sectionMarkers.length - 1 
        ? text.indexOf(sectionMarkers[i + 1]) 
        : text.indexOf('CONCLUSIÓN') !== -1 ? text.indexOf('CONCLUSIÓN') : text.length
      
      const sectionContent = text.substring(startIdx + sectionMarkers[i].length, endIdx).trim()
      
      sections.push({
        id: `sec_${i + 1}`,
        title: sectionMarkers[i].trim(),
        content: sectionContent.substring(0, 2000), // Limit content length
      })
    }
  } else {
    // Fallback: split by paragraphs and create generic sections
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)
    paragraphs.slice(0, 5).forEach((p, i) => {
      sections.push({
        id: `sec_${i + 1}`,
        title: `Sección ${i + 1}`,
        content: p.trim().substring(0, 2000),
      })
    })
  }
  
  return sections
}

function extractOptionsTables(text: string): { calls: ParsedOptionRow[]; puts: ParsedOptionRow[] } {
  const calls: ParsedOptionRow[] = []
  const puts: ParsedOptionRow[] = []
  
  // Look for CALL option entries (e.g., GFGC8530FE, -24.90%, volume, interpretation)
  const callPattern = /GF[A-Z]C(\d+\w{2})\s+([-+]?\d+[.,]\d+%)\s+([\d.,]+)\s+(.+?)(?=GF[A-Z]|$)/gi
  let match
  
  while ((match = callPattern.exec(text)) !== null) {
    calls.push({
      strike: `GFGC${match[1]}`,
      change: match[2],
      volume: match[3],
      interpretation: match[4].trim().substring(0, 200),
      isHighlight: calls.length === 0,
    })
  }
  
  // Look for PUT option entries
  const putPattern = /GF[A-Z]V(\d+\w{2})\s+([-+]?\d+[.,]\d+%)\s+([\d.,]+)\s+(.+?)(?=GF[A-Z]|$)/gi
  
  while ((match = putPattern.exec(text)) !== null) {
    puts.push({
      strike: `GFGV${match[1]}`,
      change: match[2],
      volume: match[3],
      interpretation: match[4].trim().substring(0, 200),
      isHighlight: puts.length === 0,
    })
  }
  
  // If regex didn't match, try a more generic approach for tabular data
  if (calls.length === 0) {
    const strikeLines = text.match(/Strike\s+[\d.,]+[^]*?(?=Strike|\n\n)/gi) || []
    // Generic fallback - just note that tables were found
  }
  
  return { calls, puts }
}

function extractConclusion(text: string): string {
  const patterns = [
    /CONCLUSIÓN[^:]*:?\s*([^]*?)(?=Disclaimer|$)/i,
    /PERSPECTIVA\s+ESTRATÉGICA[^:]*:?\s*([^]*?)(?=Disclaimer|$)/i,
    /CONCLUSI[ÓO]N\s+Y\s+PERSPECTIVA[^]*?(?=Disclaimer|$)/i,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]?.trim().substring(0, 1000) || match[0].trim().substring(0, 1000)
  }
  
  return ''
}

function extractLevels(text: string): { support: string[]; resistance: string[] } {
  const support: string[] = []
  const resistance: string[] = []
  
  // Look for support levels
  const supportPatterns = [
    /Soporte[^:]*:\s*\$?([\d.,]+)/gi,
    /soporte\s+(?:en|de)\s+\$?([\d.,]+)/gi,
    /Put\s+Wall[^:]*:\s*\$?([\d.,]+)/gi,
  ]
  
  for (const pattern of supportPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      support.push(`$${match[1]}`)
    }
  }
  
  // Look for resistance levels
  const resistancePatterns = [
    /Resistencia[^:]*:\s*\$?([\d.,]+)/gi,
    /resistencia\s+(?:en|de)\s+\$?([\d.,]+)/gi,
    /Call\s+Wall[^:]*:\s*\$?([\d.,]+)/gi,
  ]
  
  for (const pattern of resistancePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      resistance.push(`$${match[1]}`)
    }
  }
  
  return { support, resistance }
}
