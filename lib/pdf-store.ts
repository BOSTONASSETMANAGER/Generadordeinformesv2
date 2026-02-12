/**
 * Simple in-memory store to pass PDF file data between upload and editor pages.
 * Uses a singleton pattern since both pages run in the same browser session.
 */

interface StoredPDF {
  file: File
  objectUrl: string
  fileName: string
}

let storedPDF: StoredPDF | null = null

export function storePDFFile(file: File): string {
  // Revoke previous URL if exists
  if (storedPDF?.objectUrl) {
    URL.revokeObjectURL(storedPDF.objectUrl)
  }
  
  const objectUrl = URL.createObjectURL(file)
  storedPDF = {
    file,
    objectUrl,
    fileName: file.name,
  }
  return objectUrl
}

export function getStoredPDF(): StoredPDF | null {
  return storedPDF
}

export function clearStoredPDF(): void {
  if (storedPDF?.objectUrl) {
    URL.revokeObjectURL(storedPDF.objectUrl)
  }
  storedPDF = null
}
