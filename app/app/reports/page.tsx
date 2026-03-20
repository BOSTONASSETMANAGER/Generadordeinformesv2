"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Clock, Loader2, AlertCircle, CheckCircle2, RefreshCw, Pencil } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs"
import { UserAvatar } from "@/components/dashboard/UserAvatar"

interface Report {
  id: string
  name: string
  category: string
  status: string
  created_at: string
  updated_at: string
}

export default function ReportsListPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rb2/reports/list')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al cargar informes')
        return
      }
      setReports(data.reports || [])
    } catch (err) {
      setError('Error de conexión al cargar informes')
      console.error('[reports] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const MANUAL_CATEGORIES = ['opciones_estandar', 'instrumentos_dia', 'valor_razonable']

  const getCategoryLabel = (category: string) => {
    const map: Record<string, { label: string; color: string }> = {
      opciones_premium: { label: 'Premium', color: 'bg-blue-500/20 text-blue-400' },
      opciones_estandar: { label: 'Opciones Estándar', color: 'bg-emerald-500/20 text-emerald-400' },
      instrumentos_dia: { label: 'Instrumentos', color: 'bg-purple-500/20 text-purple-400' },
      valor_razonable: { label: 'Valor Razonable', color: 'bg-amber-500/20 text-amber-400' },
    }
    const info = map[category] || { label: category, color: 'bg-gray-500/20 text-gray-400' }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}>
        {info.label}
      </span>
    )
  }

  const handleReportClick = (report: Report) => {
    if (MANUAL_CATEGORIES.includes(report.category)) {
      const params = new URLSearchParams({ category: report.category, id: report.id })
      router.push(`/app/reports/new/form?${params.toString()}`)
    } else {
      router.push(`/app/reports/${report.id}/editor`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="warning">Borrador</Badge>
      case 'processing':
        return <Badge variant="default"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Procesando</Badge>
      case 'ready':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Listo</Badge>
      case 'published':
        return <Badge variant="success">Publicado</Badge>
      case 'error':
        return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumbs items={[
              { label: 'Reports' }
            ]} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-saas-light">Mis Informes</h1>
              <p className="text-sm text-saas-muted">Gestiona y crea nuevos informes financieros</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/app/reports/new')} className="btn-cta">
                <Plus className="w-4 h-4" />
                Nuevo Informe
              </button>
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-saas-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Cargando informes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-saas-muted">
            <AlertCircle className="w-8 h-8 mb-4 text-red-400" />
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchReports} className="btn-cta-secondary">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-saas-muted">
            <FileText className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg mb-2">No tenés informes todavía</p>
            <p className="text-sm mb-6">Creá tu primer informe financiero</p>
            <button onClick={() => router.push('/app/reports/new')} className="btn-cta">
              <Plus className="w-4 h-4" />
              Nuevo Informe
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map(report => (
              <Card 
                key={report.id}
                className="p-4 hover:border-saas-accent/50 cursor-pointer transition-colors"
                onClick={() => handleReportClick(report)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="icon-container">
                      {MANUAL_CATEGORIES.includes(report.category)
                        ? <Pencil className="w-5 h-5 text-saas-accent" />
                        : <FileText className="w-5 h-5 text-saas-accent" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-saas-light">{report.name}</h3>
                        {getCategoryLabel(report.category)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-saas-muted mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(report.updated_at)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
