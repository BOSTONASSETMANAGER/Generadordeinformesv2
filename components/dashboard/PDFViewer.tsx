"use client"

import { useState, useCallback } from "react"
import { ZoomIn, ZoomOut, Download, FileText, Maximize2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFViewerProps {
  fileName: string
  pdfUrl?: string
  onFileUpload?: (file: File) => void
}

export function PDFViewer({ fileName, pdfUrl, onFileUpload }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = fileName
      a.click()
    }
  }, [pdfUrl, fileName])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && onFileUpload) {
        onFileUpload(file)
      }
    }
    input.click()
  }, [onFileUpload])

  return (
    <div className="flex flex-col h-full bg-[var(--dashboard-surface)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--dashboard-surface-elevated)] border-b border-[var(--dashboard-border)]">
        <div className="flex items-center gap-3">
          <div className="icon-container">
            <FileText className="w-4 h-4 text-saas-accent" />
          </div>
          <span className="text-sm font-medium text-saas-light truncate max-w-[200px]">{fileName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-saas-muted w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[var(--dashboard-border)] mx-2" />
          <Button variant="ghost" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
          {pdfUrl && (
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto bg-neutral-900">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&zoom=${zoom}`}
            className="w-full h-full"
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top left',
              width: `${10000 / zoom}%`,
              height: `${10000 / zoom}%`,
            }}
          />
        ) : (
          /* Empty state - prompt to upload */
          <div className="flex items-center justify-center h-full">
            <div 
              className="text-center p-8 cursor-pointer group"
              onClick={handleFileSelect}
            >
              <div className="w-16 h-16 rounded-xl bg-saas-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-saas-accent/30 transition-colors">
                <Upload className="w-8 h-8 text-saas-accent" />
              </div>
              <h3 className="text-lg font-semibold text-saas-light mb-2">
                Cargar PDF
              </h3>
              <p className="text-saas-muted text-sm">
                Haz clic para seleccionar un archivo PDF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
