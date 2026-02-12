"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Check, 
  Loader2,
  Zap,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/browser"
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs"
import { storePDFFile } from "@/lib/pdf-store"

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: 'pdf' | 'image'
  progress: number
  status: 'uploading' | 'ready' | 'error'
  url?: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'opciones_premium'
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): 'pdf' | 'image' => {
    if (file.type === 'application/pdf') return 'pdf'
    return 'image'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const simulateUpload = useCallback((fileId: string) => {
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 100, status: 'ready' } : f
        ))
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ))
      }
    }, 200)
  }, [])

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    
    fileArray.forEach(file => {
      // Validate file type
      const isValidType = file.type === 'application/pdf' || 
                          file.type.startsWith('image/')
      
      if (!isValidType) {
        setError(`Archivo no soportado: ${file.name}`)
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`Archivo muy grande: ${file.name} (máx 50MB)`)
        return
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: getFileType(file),
        progress: 0,
        status: 'uploading',
      }

      setFiles(prev => [...prev, uploadedFile])
      setError(null)
      
      // Simulate upload
      simulateUpload(uploadedFile.id)
    })
  }, [simulateUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const clearAllFiles = useCallback(() => {
    setFiles([])
  }, [])

  const handleCreateReport = async () => {
    if (files.length === 0) return
    
    const allReady = files.every(f => f.status === 'ready')
    if (!allReady) {
      setError('Espera a que todos los archivos terminen de cargar')
      return
    }

    setIsCreating(true)
    setError(null)

    // Store the first PDF file in memory so the editor can display it
    const pdfFile = files.find(f => f.type === 'pdf')
    if (pdfFile) {
      storePDFFile(pdfFile.file)
    }

    try {
      const supabase = createBrowserClient()
      
      // Upload files to Supabase Storage first
      const uploadedFiles = []
      for (const uploadedFile of files) {
        const storagePath = `uploads/${Date.now()}-${uploadedFile.name}`
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('report-sources')
          .upload(storagePath, uploadedFile.file)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('report-sources')
          .getPublicUrl(storagePath)

        uploadedFiles.push({
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          fileSize: uploadedFile.size,
          storagePath,
          fileUrl: urlData.publicUrl,
        })
      }

      // Call API to create report in rb2 schema
      const response = await fetch('/api/rb2/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: `Nuevo Informe - ${new Date().toLocaleDateString()}`,
          files: uploadedFiles,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error creating report:', result.error)
        setError(result.error || 'Error al crear el informe. Verificá tu sesión.')
        setIsCreating(false)
        return
      }

      // Redirect to editor — the editor page will handle pipeline processing
      router.push(`/app/reports/${result.report.id}/editor`)
    } catch (err) {
      console.error('Error creating report:', err)
      setError('Error de conexión al crear el informe. Intentá de nuevo.')
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    router.push('/app/reports/new')
  }

  const allFilesReady = files.length > 0 && files.every(f => f.status === 'ready')

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[
              { label: 'Reports', href: '/app/reports' },
              { label: 'Nuevo', href: '/app/reports/new' },
              { label: 'Carga' }
            ]} />
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-saas-accent">
                  <span className="w-5 h-5 rounded-full bg-saas-accent text-white text-xs flex items-center justify-center font-medium">1</span>
                  Carga
                </span>
                <span className="flex items-center gap-1 text-saas-muted">
                  <span className="w-5 h-5 rounded-full bg-[var(--dashboard-surface-elevated)] text-xs flex items-center justify-center">2</span>
                  Extracción
                </span>
                <span className="flex items-center gap-1 text-saas-muted">
                  <span className="w-5 h-5 rounded-full bg-[var(--dashboard-surface-elevated)] text-xs flex items-center justify-center">3</span>
                  Validación
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-saas-light mb-2">
              Cargar Documentos Fuente
            </h1>
            <p className="text-saas-muted max-w-lg mx-auto">
              Sube tus informes en PDF o capturas de pantalla de datos.
              Nuestra IA extraerá y estructurará automáticamente la
              información financiera para su validación.
            </p>
          </div>

          {/* Dropzone */}
          <Card 
            className={`
              p-8 mb-6 border-2 border-dashed transition-all duration-200 cursor-pointer
              ${isDragging 
                ? 'border-saas-accent bg-saas-accent/10' 
                : 'border-[var(--dashboard-border)] hover:border-saas-accent/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-xl bg-saas-accent/20 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-saas-accent" />
              </div>
              <h3 className="text-lg font-semibold text-saas-light mb-2">
                Subir PDF o Imágenes
              </h3>
              <p className="text-saas-muted mb-4">
                Arrastra y suelta archivos aquí, o{' '}
                <span className="text-saas-accent hover:underline">
                  busca en tu computadora
                </span>
              </p>
              <div className="flex items-center gap-4 text-xs text-saas-muted">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  DOCUMENTOS PDF
                </span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  CAPTURAS PNG / JPG
                </span>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-saas-danger/10 border border-saas-danger/30 flex items-center gap-2 text-saas-danger text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-saas-muted flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ARCHIVOS CARGADOS ({files.length})
                </h4>
                <button 
                  onClick={clearAllFiles}
                  className="text-sm text-saas-accent hover:underline"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="space-y-3">
                {files.map(file => (
                  <Card key={file.id} className="p-4 bg-[var(--dashboard-surface-elevated)]">
                    <div className="flex items-center gap-4">
                      {/* File Icon */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${file.type === 'pdf' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-blue-500/20 text-blue-400'
                        }
                      `}>
                        {file.type === 'pdf' 
                          ? <FileText className="w-5 h-5" /> 
                          : <ImageIcon className="w-5 h-5" />
                        }
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-saas-light truncate">
                            {file.name}
                          </span>
                          <span className={`
                            text-sm font-medium
                            ${file.status === 'ready' ? 'text-saas-success' : 'text-saas-accent'}
                          `}>
                            {file.status === 'ready' ? '100%' : `${Math.round(file.progress)}%`}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 bg-[var(--dashboard-surface)] rounded-full overflow-hidden mb-1">
                          <div 
                            className={`
                              h-full rounded-full transition-all duration-300
                              ${file.status === 'ready' ? 'bg-saas-success' : 'bg-saas-accent'}
                            `}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-saas-muted">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          {file.status === 'ready' ? (
                            <span className="text-saas-success flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Listo para procesar
                            </span>
                          ) : (
                            <span>Cargando...</span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-saas-muted hover:text-saas-light transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="text-xs text-saas-muted flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Soportado: PDF, PNG, JPG (Máx 50MB)
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateReport}
              disabled={!allFilesReady || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  Crear Informe
                  <Zap className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
