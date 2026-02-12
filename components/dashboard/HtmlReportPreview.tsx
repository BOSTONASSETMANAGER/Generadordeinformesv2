"use client"

import { useMemo } from "react"
import { AlertTriangle, FileWarning } from "lucide-react"

interface HtmlReportPreviewProps {
  htmlContent: string | null
  isLoading?: boolean
  error?: string | null
  validationFailed?: boolean
}

/**
 * Renders pipeline-generated HTML inside an iframe srcDoc.
 * No wrappers, no sanitization, no prose — the HTML is displayed as-is.
 * If the HTML lacks CSS variables, a fallback <style> is injected.
 */
export function HtmlReportPreview({
  htmlContent,
  isLoading,
  error,
  validationFailed,
}: HtmlReportPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--dashboard-surface)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-saas-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-saas-muted text-sm">Generando informe...</p>
        </div>
      </div>
    )
  }

  if (validationFailed) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--dashboard-surface)]">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FileWarning className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Validación fallida
          </h3>
          <p className="text-saas-muted text-sm mb-3">
            El HTML generado no respeta la estructura del template original.
            El sistema rechazó el output para evitar mostrar un layout inventado.
          </p>
          {error && (
            <p className="text-xs text-red-400/80 bg-red-500/10 rounded-lg p-3 text-left">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (error && !htmlContent) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--dashboard-surface)]">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-saas-light mb-2">
            Error en el pipeline
          </h3>
          <p className="text-saas-muted text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!htmlContent) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--dashboard-surface)]">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-saas-light mb-2">
            Sin contenido HTML
          </h3>
          <p className="text-saas-muted text-sm">
            Procesá un PDF para generar el informe premium.
          </p>
        </div>
      </div>
    )
  }

  // Build the srcDoc: inject fallback CSS variables if the HTML doesn't include them
  const srcDoc = useMemo(() => {
    const hasStyleBlock = /<style[\s>]/i.test(htmlContent)
    const hasCssVars = /--saas-/i.test(htmlContent)

    const fallbackStyle = (!hasStyleBlock || !hasCssVars) ? `<style>
:root {
  --saas-primary: #1d3969;
  --saas-accent: #2563eb;
  --saas-light: #f8fafc;
  --saas-muted: #64748b;
  --saas-border: #e2e8f0;
  --saas-bg: #ffffff;
}
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  color: #1e293b;
}
</style>
` : ''

    return `${fallbackStyle}${htmlContent}`
  }, [htmlContent])

  return (
    <iframe
      srcDoc={srcDoc}
      title="Report Preview"
      className="w-full h-full border-0"
      sandbox="allow-same-origin"
      style={{ background: '#ffffff' }}
    />
  )
}
