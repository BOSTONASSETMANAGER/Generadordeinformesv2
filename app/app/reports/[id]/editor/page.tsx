"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
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
  const [isApproving, setIsApproving] = useState(false)
  const [approveMessage, setApproveMessage] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  // Guard against React Strict Mode double-firing
  const hasProcessedRef = useRef(false)

  // On mount: try to load existing report data from DB, then check for stored PDF
  useEffect(() => {
    async function loadExistingReport() {
      let reportFoundInDB = false
      let pdfLoadedFromDB = false

      try {
        const res = await fetch(`/api/rb2/reports/status?id=${reportId}`)
        if (res.ok) {
          const data = await res.json()

          if (data.report) {
            reportFoundInDB = true

            // Load report metadata
            setReportName(data.report.name || 'Nuevo Informe')
            const status = data.report.status
            if (status === 'ready' || status === 'published') {
              setReportStatus(status === 'ready' ? 'pending_review' : 'published')
            } else if (status === 'draft' || status === 'error') {
              setReportStatus('draft')
            }

            // Load latest version HTML (may be empty for error/draft reports)
            if (data.latestVersion?.html_content) {
              setHtmlContent(data.latestVersion.html_content)
              hasProcessedRef.current = true
              console.log('[editor] Loaded saved HTML from version', data.latestVersion.version_number)
            } else {
              console.log('[editor] No HTML content in latest version (status:', status, ')')
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
                pdfLoadedFromDB = true
                console.log('[editor] Loaded PDF from base64 source:', source.file_name)
              } else if (source.file_url) {
                setPdfUrl(source.file_url)
                setPdfFileName(source.file_name || 'report.pdf')
                pdfLoadedFromDB = true
                console.log('[editor] Loaded PDF URL from source:', source.file_name)
              } else {
                console.log('[editor] Source exists but no pdf_base64 or file_url:', source.file_name)
              }
            } else {
              console.log('[editor] No sources found for report')
            }

            // If report has error status and has a PDF source, show error message
            if (status === 'error' && !data.latestVersion?.html_content) {
              const errorMeta = data.latestVersion?.meta?.error_message
              setPipelineError(errorMeta || 'El pipeline falló en la generación anterior. Podés volver a procesar subiendo el PDF.')
            }

            // If report has no HTML and needs processing, try to fire the pipeline
            if (!data.latestVersion?.html_content && !hasProcessedRef.current) {
              // Try the in-memory stored PDF first (from upload page)
              const stored = getStoredPDF()
              if (stored) {
                hasProcessedRef.current = true
                console.log('[editor] Report needs processing — using stored PDF from upload page')
                // Don't override pdfUrl if already loaded from DB
                if (!pdfLoadedFromDB) {
                  setPdfUrl(stored.objectUrl)
                  setPdfFileName(stored.fileName)
                }
                processPDFFile(stored.file)
              } else if (status === 'processing') {
                // No stored PDF but status is processing — someone else may have started it, poll
                hasProcessedRef.current = true
                setIsProcessing(true)
                console.log('[editor] Report is processing (no stored PDF), starting poll...')
                pollForResults(reportId)
              }
            }
          }
        }
      } catch (err) {
        console.warn('[editor] Could not load existing report:', err)
      }

      // Check for stored PDF if:
      // - Report was NOT found in DB (completely new report), OR
      // - Report exists but has no sources and no HTML (fresh draft, just created without PDF in DB)
      const needsStoredPdf = !reportFoundInDB || (!hasProcessedRef.current && !pdfLoadedFromDB)
      if (needsStoredPdf) {
        const stored = getStoredPDF()
        if (stored && !hasProcessedRef.current) {
          hasProcessedRef.current = true
          setPdfUrl(stored.objectUrl)
          setPdfFileName(stored.fileName)
          processPDFFile(stored.file)
        }
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

  // Poll for pipeline results — called after firing the process request
  const pollForResults = useCallback(async (targetReportId: string) => {
    const POLL_INTERVAL = 3000
    const MAX_POLLS = 100 // 5 min max
    let polls = 0

    console.log(`[editor] Starting poll for report ${targetReportId}`)

    const poll = async (): Promise<void> => {
      polls++
      try {
        const res = await fetch(`/api/rb2/reports/status?id=${targetReportId}`)
        if (!res.ok) {
          console.warn(`[editor] Poll ${polls}: status API error ${res.status}`)
          if (polls < MAX_POLLS) {
            setTimeout(() => { poll() }, POLL_INTERVAL)
          } else {
            setPipelineError('Timeout esperando resultados del pipeline')
            setIsProcessing(false)
          }
          return
        }

        const data = await res.json()
        const status = data.report?.status

        if (status === 'processing') {
          // Still processing — keep polling
          if (polls < MAX_POLLS) {
            setTimeout(() => { poll() }, POLL_INTERVAL)
          } else {
            setPipelineError('Timeout esperando resultados del pipeline (>5 min)')
            setIsProcessing(false)
          }
          return
        }

        // Pipeline finished — pick up results
        console.log(`[editor] Poll ${polls}: pipeline finished with status=${status}`)

        if (data.latestVersion?.html_content) {
          setHtmlContent(data.latestVersion.html_content)
          console.log(`[editor] HTML loaded from version ${data.latestVersion.version_number}`)
        }

        if (data.report?.name) {
          setReportName(data.report.name)
        }

        if (status === 'ready') {
          setReportStatus('pending_review')
        } else if (status === 'error') {
          const errorMeta = data.latestVersion?.meta?.error_message
          setPipelineError(errorMeta || 'El pipeline falló durante la generación.')
          const isValidationFail = data.latestVersion?.meta?.template_validation?.passed === false
          setValidationFailed(isValidationFail)
        }

        setIsProcessing(false)
      } catch (err) {
        console.warn(`[editor] Poll ${polls} error:`, err)
        if (polls < MAX_POLLS) {
          setTimeout(() => { poll() }, POLL_INTERVAL)
        } else {
          setPipelineError('Error de conexión al verificar estado del pipeline')
          setIsProcessing(false)
        }
      }
    }

    // Start first poll after a short delay (give pipeline time to start)
    setTimeout(() => { poll() }, POLL_INTERVAL)
  }, [])

  // Process a PDF file: extract text, fire pipeline, then poll for results
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
        setIsProcessing(false)
        return
      }

      // Convert PDF to base64 for storage in DB
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const pdfBase64 = btoa(binary)

      // Fire pipeline (awaited server-side, editor polls for results)
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

      if (!response.ok) {
        setPipelineError(result.error || 'Error al iniciar el pipeline')
        setIsProcessing(false)
        return
      }

      console.log('[editor] Pipeline fired, starting poll...', result)
      if (result.error) console.error('[editor] Pipeline error:', result.error)

      // If server already returned error status, show it immediately
      if (result.status === 'error') {
        setPipelineError(result.error || 'Pipeline falló — ver consola para detalles')
        setIsProcessing(false)
        return
      }

      // Start polling for results
      pollForResults(activeReportId)

    } catch (error) {
      console.error('[editor] Error processing PDF:', error)
      setPipelineError(error instanceof Error ? error.message : 'Error desconocido')
      setIsProcessing(false)
    }
  }, [reportId, ensureReportExists, pollForResults])

  // Handle PDF upload from the PDFViewer component
  const handleFileUpload = useCallback((file: File) => {
    const url = storePDFFile(file)
    setPdfUrl(url)
    setPdfFileName(file.name)
    processPDFFile(file)
  }, [processPDFFile])

  const handleCopyHtml = useCallback(async () => {
    if (!htmlContent) return
    try {
      await navigator.clipboard.writeText(htmlContent)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      console.log('[editor] HTML copied to clipboard')
    } catch (err) {
      console.error('[editor] Failed to copy HTML:', err)
    }
  }, [htmlContent])

  const handleApprove = useCallback(async () => {
    setIsApproving(true)
    setApproveMessage(null)
    try {
      const res = await fetch(`/api/rb2/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setReportStatus('published')
        const gtInfo = data.goldenTemplate
        if (gtInfo?.is_duplicate) {
          setApproveMessage('Informe aprobado (template ya existía como referencia)')
        } else if (gtInfo) {
          setApproveMessage('Informe aprobado y guardado como referencia para futuras generaciones')
        } else {
          setApproveMessage('Informe aprobado')
        }
        console.log('[editor] Report approved:', data)
      } else {
        setApproveMessage(`Error al aprobar: ${data.error || 'Error desconocido'}`)
        console.error('[editor] Approve error:', data)
      }
    } catch (err) {
      setApproveMessage(`Error al aprobar: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      console.error('[editor] Approve error:', err)
    } finally {
      setIsApproving(false)
    }
  }, [reportId])

  const handlePublish = handleApprove

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
        onApprove={handleApprove}
        onCopyHtml={handleCopyHtml}
        isApproving={isApproving}
        isCopied={isCopied}
        hasHtml={!!htmlContent}
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
              <div className="h-full flex flex-col">
                <HtmlReportPreview
                  htmlContent={htmlContent}
                  isLoading={isProcessing}
                  error={pipelineError}
                  validationFailed={validationFailed}
                />
                {/* Status bar */}
                {approveMessage && (
                  <div className="flex-shrink-0 border-t border-emerald-500/30 bg-emerald-950/30 px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-400">
                      {approveMessage}
                    </p>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </main>
    </div>
  )
}
