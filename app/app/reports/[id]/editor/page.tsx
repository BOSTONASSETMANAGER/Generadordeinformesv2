"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Topbar } from "@/components/dashboard/Topbar"
import { PDFViewer } from "@/components/dashboard/PDFViewer"
import { HtmlReportPreview } from "@/components/dashboard/HtmlReportPreview"
import { ResizableSplitView } from "@/components/reports/ResizableSplitView"
import { getStoredPDF, storePDFFile } from "@/lib/pdf-store"
import { extractTextFromPDF } from "@/lib/pdf-parser"

export default function ReportEditorPage() {
  const params = useParams()
  const reportId = params.id as string
  
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
  const [pdfFileName, setPdfFileName] = useState<string>('Sin archivo cargado')
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [pipelineError, setPipelineError] = useState<string | null>(null)
  const [validationFailed, setValidationFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reportName, setReportName] = useState('Nuevo Informe')
  const [reportStatus, setReportStatus] = useState<'draft' | 'pending_review' | 'published'>('draft')

  // Guard against React Strict Mode double-firing
  const hasProcessedRef = useRef(false)

  // On mount: try to load existing report data from DB, then check for stored PDF
  useEffect(() => {
    async function loadExistingReport() {
      try {
        const res = await fetch(`/api/rb2/reports/status?id=${reportId}`)
        if (res.ok) {
          const data = await res.json()

          // Load report metadata
          if (data.report) {
            setReportName(data.report.name || 'Nuevo Informe')
            const status = data.report.status
            if (status === 'ready' || status === 'published') {
              setReportStatus(status === 'ready' ? 'pending_review' : 'published')
            } else if (status === 'draft') {
              setReportStatus('draft')
            }
          }

          // Load latest version HTML
          if (data.latestVersion?.html_content) {
            setHtmlContent(data.latestVersion.html_content)
            console.log('[editor] Loaded saved HTML from version', data.latestVersion.version_number)
          }

          // Load PDF from source (base64 stored in DB or URL)
          if (data.sources?.length > 0) {
            const source = data.sources[0]
            if (source.pdf_base64) {
              // Convert base64 to blob URL for the PDF viewer
              const binaryStr = atob(source.pdf_base64)
              const bytes = new Uint8Array(binaryStr.length)
              for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i)
              }
              const blob = new Blob([bytes], { type: 'application/pdf' })
              const blobUrl = URL.createObjectURL(blob)
              setPdfUrl(blobUrl)
              setPdfFileName(source.file_name || 'report.pdf')
              console.log('[editor] Loaded PDF from base64 source:', source.file_name)
            } else if (source.file_url) {
              setPdfUrl(source.file_url)
              setPdfFileName(source.file_name || 'report.pdf')
              console.log('[editor] Loaded PDF URL from source:', source.file_name)
            }
          }

          // If we already have HTML, don't process again
          if (data.latestVersion?.html_content) {
            hasProcessedRef.current = true
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('[editor] Could not load existing report:', err)
      }

      // No saved data — check for stored PDF from upload flow
      const stored = getStoredPDF()
      if (stored && !hasProcessedRef.current) {
        hasProcessedRef.current = true
        setPdfUrl(stored.objectUrl)
        setPdfFileName(stored.fileName)
        processPDFFile(stored.file)
      }
      setIsLoading(false)
    }

    loadExistingReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  /**
   * Ensure the report exists in the DB. If the current reportId is a mock/invalid ID,
   * create a new report and return the real DB ID.
   */
  const ensureReportExists = useCallback(async (fileName: string): Promise<string | null> => {
    // First, try to check if the report exists via the status endpoint
    try {
      const statusRes = await fetch(`/api/rb2/reports/status?id=${reportId}`)
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.report) {
          return reportId // Report exists
        }
      }
    } catch {
      // Status check failed, try to create
    }

    // Report doesn't exist — create it
    console.log('[editor] Report not found in DB, creating...')
    try {
      const createRes = await fetch('/api/rb2/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'opciones_premium',
          name: fileName.replace('.pdf', ''),
          files: [],
        }),
      })

      const createData = await createRes.json()
      if (createRes.ok && createData.report?.id) {
        console.log('[editor] Created report:', createData.report.id)
        return createData.report.id
      } else {
        console.error('[editor] Failed to create report:', createData)
        return null
      }
    } catch (err) {
      console.error('[editor] Error creating report:', err)
      return null
    }
  }, [reportId])

  // Process a PDF file: extract text, then call the pipeline API
  const processPDFFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setHtmlContent(null)
    setPipelineError(null)
    setValidationFailed(false)
    try {
      const rawText = await extractTextFromPDF(file)
      setReportName(file.name.replace('.pdf', ''))

      // Ensure the report exists in the DB before calling the pipeline
      const activeReportId = await ensureReportExists(file.name)
      if (!activeReportId) {
        setPipelineError('No se pudo crear el reporte en la base de datos. Verificá tu sesión.')
        return
      }

      // Convert PDF to base64 for vision pipeline (browser-compatible)
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const pdfBase64 = btoa(binary)

      // Call the pipeline API to generate HTML from the template
      const response = await fetch('/api/rb2/reports/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: activeReportId,
          pdfTextContent: rawText,
          pdfBase64,
          sourceFileName: file.name,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const isValidationFail = result.pipeline?.meta?.template_validation?.passed === false
        setValidationFailed(isValidationFail)
        setPipelineError(result.error || result.pipeline?.warnings?.join('; ') || 'Error en el pipeline')
        console.error('[editor] Pipeline error:', result)
        return
      }

      // Use the HTML from the pipeline (rendered via iframe srcDoc)
      if (result.version?.html_content) {
        setHtmlContent(result.version.html_content)
      } else if (result.pipeline?.meta?.html_size > 0) {
        // Fallback: the HTML might be in the pipeline result directly
        setPipelineError('HTML generado pero no guardado en versión')
      }

      if (result.report?.name) {
        setReportName(result.report.name)
      }
      if (result.report?.status === 'ready') {
        setReportStatus('pending_review')
      }

      console.log('[editor] Pipeline result:', {
        templateFile: result.pipeline?.meta?.template_file,
        templateHash: result.pipeline?.meta?.template_hash,
        htmlHash: result.pipeline?.meta?.html_hash,
        validate: result.pipeline?.meta?.template_validation?.passed ? 'passed' : 'failed',
        similarity: result.pipeline?.similarity_score,
      })
    } catch (error) {
      console.error('[editor] Error processing PDF:', error)
      setPipelineError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsProcessing(false)
    }
  }, [reportId, ensureReportExists])

  // Handle PDF upload from the PDFViewer component
  const handleFileUpload = useCallback((file: File) => {
    const url = storePDFFile(file)
    setPdfUrl(url)
    setPdfFileName(file.name)
    processPDFFile(file)
  }, [processPDFFile])

  const handleSaveDraft = useCallback(async () => {
    console.log('Draft saved, reportId:', reportId)
  }, [reportId])

  const handleValidate = useCallback(async () => {
    console.log('Running validation...')
  }, [])

  const handlePublish = useCallback(async () => {
    setReportStatus('published')
    console.log('Report published!')
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--dashboard-bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-saas-accent animate-spin mx-auto mb-4" />
          <p className="text-saas-muted">Cargando informe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] relative">
      {/* Fixed Topbar */}
      <Topbar
        breadcrumbs={[
          { label: 'Reports', href: '/app/reports' },
          { label: 'Opciones Premium', href: '/app/reports' },
          { label: reportName }
        ]}
        status={reportStatus}
        pendingIssues={0}
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidate}
        onPublish={handlePublish}
      />

      {/* Main Content - Resizable Split View */}
      <main className="pt-16 h-screen">
        <div className="h-[calc(100vh-4rem)]">
          <ResizableSplitView
            left={
              <div className="h-full p-4">
                <PDFViewer 
                  fileName={pdfFileName} 
                  pdfUrl={pdfUrl}
                  onFileUpload={handleFileUpload}
                />
              </div>
            }
            right={
              <HtmlReportPreview
                htmlContent={htmlContent}
                isLoading={isProcessing}
                error={pipelineError}
                validationFailed={validationFailed}
              />
            }
          />
        </div>
      </main>
    </div>
  )
}
