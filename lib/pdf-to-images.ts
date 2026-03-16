/**
 * PDF to Images converter
 * Converts PDF pages to base64-encoded PNG images for vision API consumption.
 */

import { pdfToPng } from 'pdf-to-png-converter'

export interface PdfPageImage {
  pageNumber: number
  base64: string  // base64-encoded PNG (no data: prefix)
  width: number
  height: number
}

/**
 * Convert a PDF buffer to an array of base64-encoded PNG page images.
 * @param pdfBuffer - The PDF file as a Buffer
 * @param options - Optional settings
 * @returns Array of page images with base64 data
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  options?: {
    /** DPI scale factor (default: 2 for good quality without being too large) */
    scale?: number
    /** Max pages to convert (default: all) */
    maxPages?: number
  }
): Promise<PdfPageImage[]> {
  const scale = options?.scale ?? 2

  console.log(`[pdf-to-images] Converting PDF (${(pdfBuffer.length / 1024).toFixed(0)}KB) to images at scale ${scale}...`)

  const pages = await pdfToPng(pdfBuffer as unknown as ArrayBuffer, {
    viewportScale: scale,
    pagesToProcess: options?.maxPages ? Array.from({ length: options.maxPages }, (_, i) => i + 1) : undefined,
  })

  const images: PdfPageImage[] = pages.map((page, index) => ({
    pageNumber: index + 1,
    base64: page.content ? page.content.toString('base64') : '',
    width: page.width,
    height: page.height,
  }))

  console.log(`[pdf-to-images] Converted ${images.length} pages. Sizes: ${images.map(i => `p${i.pageNumber}:${(Buffer.byteLength(i.base64, 'utf8') / 1024).toFixed(0)}KB`).join(', ')}`)

  return images
}

/**
 * Download a PDF from a URL and return it as a Buffer.
 */
export async function downloadPdfAsBuffer(url: string): Promise<Buffer> {
  console.log(`[pdf-to-images] Downloading PDF from: ${url.slice(0, 80)}...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Build OpenAI vision content array from page images.
 * Returns an array of content parts suitable for the OpenAI messages API.
 */
export function buildVisionContentParts(
  images: PdfPageImage[],
  textPrefix?: string,
  detail: 'high' | 'low' | 'auto' = 'auto'
): Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' | 'auto' } }> {
  const parts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' | 'auto' } }> = []

  if (textPrefix) {
    parts.push({ type: 'text', text: textPrefix })
  }

  for (const img of images) {
    parts.push({
      type: 'text',
      text: `--- Page ${img.pageNumber} ---`,
    })
    parts.push({
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${img.base64}`,
        detail,
      },
    })
  }

  return parts
}
