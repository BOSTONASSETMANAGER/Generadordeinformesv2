"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Zap, Save, Loader2, Check, Copy, Eye } from "lucide-react"
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs"
import { InstrumentosForm } from "@/components/tools/InstrumentosForm"
import { ValorRazonableForm } from "@/components/tools/ValorRazonableForm"
import { OpcionesEstandarForm } from "@/components/tools/OpcionesEstandarForm"
import { HtmlOutput } from "@/components/tools/HtmlOutput"
import { ResizableSplitView } from "@/components/reports/ResizableSplitView"
import type { InstrumentosDelDiaData, ValorRazonableData, OpcionesEstandar2Data } from "@/lib/types/tool-types"
import { generateStandardHtml, generatePremiumHtml } from "@/lib/html-generators/instrumentos"
import { generateValorRazonableHtml } from "@/lib/html-generators/valor-razonable"
import { generateOpcionesEstandar2Html } from "@/lib/html-generators/opciones-estandar"

type ManualCategory = 'opciones_estandar' | 'instrumentos_dia' | 'valor_razonable'

const CATEGORY_META: Record<ManualCategory, { title: string; description: string }> = {
  opciones_estandar: {
    title: 'Opciones Estándar',
    description: 'Completa los campos del informe y genera el HTML al instante.',
  },
  instrumentos_dia: {
    title: 'Instrumentos del Día',
    description: 'Genera los bloques HTML estándar y premium para el instrumento.',
  },
  valor_razonable: {
    title: 'Valor Razonable',
    description: 'Informe semanal de valor razonable para acciones argentinas y del NYSE.',
  },
}

const DEFAULT_INSTRUMENTOS: InstrumentosDelDiaData = {
  ticker: '',
  nombreEmpresa: '',
  subtitulo: 'Información detallada para inversores con suscripción activa',
  contenidoEstandar: '',
  contenidoPremium: '',
  insightsPremium: [],
}

const DEFAULT_VALOR_RAZONABLE: ValorRazonableData = {
  titulo: 'Informe de Valor Razonable – Renta Variable',
  fecha: '',
  descripcion: '',
  analisisArgentina: '',
  analisisNYSE: '',
  imagenGraficoUrl: '',
}

const DEFAULT_OPCIONES: OpcionesEstandar2Data = {
  activo: '',
  fecha: '',
  vencimientoOpex: '',
  precioSpot: '',
  variacionSemanal: '',
  tesisCentral: '',
  volumenTotalCalls: '',
  volumenTotalPuts: '',
  ratioPutCall: '',
  calls: [{ strike: '', tipo: 'Call', volumenNominal: '', variacion: '', interpretacion: '' }],
  puts: [{ strike: '', tipo: 'Put', volumenNominal: '', variacion: '', interpretacion: '' }],
  imanesPrecio: [{ nivel: '', tipoMuralla: '', descripcion: '' }],
  volatilidadHistorica: [],
  interpretacionVolatilidad: '',
  conclusionFinal: '',
}

function FormPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') as ManualCategory | null
  const editId = searchParams.get('id') // for editing existing reports

  const [instrumentosData, setInstrumentosData] = useState<InstrumentosDelDiaData>(DEFAULT_INSTRUMENTOS)
  const [valorData, setValorData] = useState<ValorRazonableData>(DEFAULT_VALOR_RAZONABLE)
  const [opcionesData, setOpcionesData] = useState<OpcionesEstandar2Data>(DEFAULT_OPCIONES)

  const [htmlBlocks, setHtmlBlocks] = useState<{ label: string; html: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(!!editId)
  const [copied, setCopied] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  // Fetch form_data when editing an existing report
  useEffect(() => {
    if (!editId || !category) return
    let cancelled = false
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/rb2/reports/${editId}`)
        if (!res.ok) throw new Error('Failed to fetch report')
        const { report } = await res.json()
        if (cancelled || !report?.form_data) return
        const fd = report.form_data
        if (category === 'instrumentos_dia') setInstrumentosData({ ...DEFAULT_INSTRUMENTOS, ...fd })
        if (category === 'valor_razonable') setValorData({ ...DEFAULT_VALOR_RAZONABLE, ...fd })
        if (category === 'opciones_estandar') setOpcionesData({ ...DEFAULT_OPCIONES, ...fd })
      } catch (err) {
        console.error('[form] Error loading report:', err)
      } finally {
        if (!cancelled) setLoadingEdit(false)
      }
    }
    fetchReport()
    return () => { cancelled = true }
  }, [editId, category])

  if (!category || !CATEGORY_META[category]) {
    return (
      <div className="min-h-screen bg-[var(--dashboard-bg)] flex items-center justify-center">
        <p className="text-[var(--saas-muted)]">Categoría no válida. <button onClick={() => router.push('/app/reports/new')} className="text-[var(--saas-accent)] underline">Volver</button></p>
      </div>
    )
  }

  const meta = CATEGORY_META[category]

  const handleGenerate = async () => {
    const blocks: { label: string; html: string }[] = []

    if (category === 'instrumentos_dia') {
      blocks.push({ label: 'Bloque Estándar', html: generateStandardHtml(instrumentosData) })
      blocks.push({ label: 'Bloque Premium', html: generatePremiumHtml(instrumentosData) })
    } else if (category === 'valor_razonable') {
      blocks.push({ label: 'Informe Valor Razonable', html: generateValorRazonableHtml(valorData) })
    } else if (category === 'opciones_estandar') {
      blocks.push({ label: 'Informe Opciones Estándar', html: generateOpcionesEstandar2Html(opcionesData) })
    }

    setHtmlBlocks(blocks)

    // Auto-copy to clipboard
    const fullHtml = blocks.map(b => b.html).join('\n<!-- SEPARATOR -->\n')
    if (fullHtml) {
      try {
        await navigator.clipboard.writeText(fullHtml)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        const textarea = document.createElement('textarea')
        textarea.value = fullHtml
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  const handleCopyAll = async () => {
    const fullHtml = htmlBlocks.map(b => b.html).join('\n<!-- SEPARATOR -->\n')
    if (!fullHtml) return
    try {
      await navigator.clipboard.writeText(fullHtml)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = fullHtml
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2500)
    }
  }

  const getFormData = () => {
    if (category === 'instrumentos_dia') return instrumentosData
    if (category === 'valor_razonable') return valorData
    if (category === 'opciones_estandar') return opcionesData
    return {}
  }

  const getHtmlContent = () => {
    return htmlBlocks.map(b => b.html).join('\n<!-- SEPARATOR -->\n')
  }

  const getReportName = () => {
    if (category === 'instrumentos_dia') {
      return `${instrumentosData.ticker || 'Instrumento'} - ${instrumentosData.nombreEmpresa || ''} - ${new Date().toLocaleDateString()}`
    }
    if (category === 'valor_razonable') {
      return `${valorData.titulo || 'Valor Razonable'} - ${new Date().toLocaleDateString()}`
    }
    if (category === 'opciones_estandar') {
      return `${opcionesData.activo || 'Opciones'} - ${opcionesData.fecha || new Date().toLocaleDateString()}`
    }
    return `Informe - ${new Date().toLocaleDateString()}`
  }

  const handleSave = async () => {
    if (htmlBlocks.length === 0 || htmlBlocks.every(b => !b.html)) {
      setSaveMessage('Genera el HTML primero antes de guardar.')
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    setSaving(true)
    setSaveMessage(null)

    try {
      if (editId) {
        // Update existing report
        const res = await fetch(`/api/rb2/reports/${editId}/update-form`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_data: getFormData(),
            html_content: getHtmlContent(),
          }),
        })
        if (!res.ok) throw new Error('Error al actualizar')
        setSaveMessage('Informe actualizado correctamente.')
      } else {
        // Create new report
        const res = await fetch('/api/rb2/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            name: getReportName(),
            form_data: getFormData(),
            html_content: getHtmlContent(),
          }),
        })
        if (!res.ok) throw new Error('Error al crear')
        setSaveMessage('Informe guardado correctamente.')
      }
      setTimeout(() => router.push('/app/reports'), 1500)
    } catch (err) {
      setSaveMessage('Error al guardar el informe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[
              { label: 'Reports', href: '/app/reports' },
              { label: 'Nuevo Informe', href: '/app/reports/new' },
              { label: meta.title }
            ]} />
            <div className="flex items-center gap-3">
              {htmlBlocks.length > 0 ? (
                <>
                  {/* Vista Previa badge — outline only */}
                  <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white border border-white/40 rounded-lg">
                    <Eye className="w-3.5 h-3.5" />
                    Vista Previa
                  </span>
                  {/* Copy HTML */}
                  <button onClick={handleCopyAll} className="btn-cta">
                    {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedAll ? 'Copiado' : 'Copiar HTML'}
                  </button>
                </>
              ) : (
                <button onClick={handleGenerate} className="btn-cta">
                  {copied ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {copied ? 'Copiado al portapapeles' : 'Generar HTML'}
                </button>
              )}
              <button onClick={handleSave} disabled={saving} className="btn-cta-success">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
          {saveMessage && (
            <div className={`mt-2 text-sm px-3 py-1.5 rounded-lg ${saveMessage.includes('Error') || saveMessage.includes('Genera') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {saveMessage}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      {htmlBlocks.length > 0 ? (
        /* ── Resizable split view: form left | preview right ── */
        <main className="flex-1" style={{ height: 'calc(100vh - 65px)' }}>
          <div className="h-full">
            <ResizableSplitView
              left={
                <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <div>
                      <button
                        onClick={() => router.push('/app/reports/new')}
                        className="flex items-center gap-1.5 text-sm text-[var(--saas-muted)] hover:text-[var(--saas-light)] transition-colors mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a categorías
                      </button>
                      <h1 className="text-xl font-bold text-[var(--saas-light)]">{meta.title}</h1>
                      <p className="text-xs text-[var(--saas-muted)] mt-1">{meta.description}</p>
                    </div>

                    {loadingEdit ? (
                      <div className="flex flex-col items-center justify-center py-20 text-[var(--saas-muted)]">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--saas-accent)]" />
                        <p>Cargando datos del informe...</p>
                      </div>
                    ) : (
                      <>
                        {category === 'instrumentos_dia' && (
                          <InstrumentosForm data={instrumentosData} onChange={setInstrumentosData} />
                        )}
                        {category === 'valor_razonable' && (
                          <ValorRazonableForm data={valorData} onChange={setValorData} />
                        )}
                        {category === 'opciones_estandar' && (
                          <OpcionesEstandarForm data={opcionesData} onChange={setOpcionesData} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              }
              right={
                <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-[var(--saas-light)]">Resultado HTML</h2>
                    <HtmlOutput blocks={htmlBlocks} onRegenerate={handleGenerate} />
                  </div>
                </div>
              }
            />
          </div>
        </main>
      ) : (
        /* ── Full-width form (no preview yet) ── */
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
          <div>
            <button
              onClick={() => router.push('/app/reports/new')}
              className="flex items-center gap-1.5 text-sm text-[var(--saas-muted)] hover:text-[var(--saas-light)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a categorías
            </button>
            <h1 className="text-2xl font-bold text-[var(--saas-light)]">{meta.title}</h1>
            <p className="text-sm text-[var(--saas-muted)] mt-1">{meta.description}</p>
          </div>

          {loadingEdit ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--saas-muted)]">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--saas-accent)]" />
              <p>Cargando datos del informe...</p>
            </div>
          ) : (
            <>
              {category === 'instrumentos_dia' && (
                <InstrumentosForm data={instrumentosData} onChange={setInstrumentosData} />
              )}
              {category === 'valor_razonable' && (
                <ValorRazonableForm data={valorData} onChange={setValorData} />
              )}
              {category === 'opciones_estandar' && (
                <OpcionesEstandarForm data={opcionesData} onChange={setOpcionesData} />
              )}
            </>
          )}
        </main>
      )}
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--dashboard-bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--saas-accent)]" />
      </div>
    }>
      <FormPageInner />
    </Suspense>
  )
}
