"use client"

import type React from "react"
import type { ValorRazonableData } from "@/lib/types/tool-types"
import { FileText, Globe, BarChart3, ImageIcon } from "lucide-react"

interface ValorRazonableFormProps {
  data: ValorRazonableData
  onChange: (data: ValorRazonableData) => void
}

export function ValorRazonableForm({ data, onChange }: ValorRazonableFormProps) {
  const update = <K extends keyof ValorRazonableData>(key: K, value: ValorRazonableData[K]) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Información General */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-[var(--saas-light)]">Información General</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="Título del Informe" className="md:col-span-2">
            <input
              type="text"
              placeholder="Ej: Informe de Valor Razonable – Renta Variable"
              value={data.titulo}
              onChange={(e) => update('titulo', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Fecha">
            <input
              type="text"
              placeholder="Ej: Semana del 10 al 14 de marzo de 2025"
              value={data.fecha}
              onChange={(e) => update('fecha', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="URL de Imagen del Gráfico" icon={<ImageIcon className="w-4 h-4 text-blue-400" />}>
            <input
              type="text"
              placeholder="https://ejemplo.com/grafico-semanal.png"
              value={data.imagenGraficoUrl || ''}
              onChange={(e) => update('imagenGraficoUrl', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Descripción" className="md:col-span-2">
            <textarea
              className="form-input min-h-[80px] text-sm leading-relaxed"
              placeholder="Ej: Actualización semanal de acciones argentinas y del NYSE, con foco en valor razonable..."
              value={data.descripcion}
              onChange={(e) => update('descripcion', e.target.value)}
            />
          </FieldGroup>
        </div>
      </div>

      {/* Card 2: Análisis Argentina */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden border-l-4 border-l-blue-500">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-semibold text-[var(--saas-light)]">🇦🇷 Acciones Argentinas</h3>
            <p className="text-xs text-[var(--saas-muted)] mt-0.5">Análisis de acciones argentinas con valor razonable y potencial.</p>
          </div>
        </div>
        <div className="p-5">
          <FieldGroup label="Análisis Argentina">
            <textarea
              className="form-input min-h-[250px] text-sm leading-relaxed"
              placeholder={`Escribe el análisis de acciones argentinas.

Ejemplo:
**YPF (YPFD)** — Cotización actual: $42.500. Valor razonable estimado: $52.000. Potencial de suba: +22,4%. El consenso de analistas mantiene recomendación de compra...

**Pampa Energía (PAMP)** — Cotización actual: $3.200. Valor razonable: $3.800...

Usa **texto** para negritas y doble salto de línea para separar párrafos.`}
              value={data.analisisArgentina}
              onChange={(e) => update('analisisArgentina', e.target.value)}
            />
          </FieldGroup>
        </div>
      </div>

      {/* Card 3: Análisis NYSE */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden border-l-4 border-l-emerald-500">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-semibold text-[var(--saas-light)]">🇺🇸 NYSE (en USD)</h3>
            <p className="text-xs text-[var(--saas-muted)] mt-0.5">Análisis de acciones del NYSE con valor razonable y potencial.</p>
          </div>
        </div>
        <div className="p-5">
          <FieldGroup label="Análisis NYSE">
            <textarea
              className="form-input min-h-[250px] text-sm leading-relaxed"
              placeholder={`Escribe el análisis de acciones del NYSE en USD.

Ejemplo:
**Apple (AAPL)** — Precio actual: $178,50. Valor razonable: $195,00. Potencial: +9,2%. Los analistas de Wall Street mantienen expectativa positiva...

**Microsoft (MSFT)** — Precio actual: $415,20. Valor razonable: $450,00...

Usa **texto** para negritas y doble salto de línea para separar párrafos.`}
              value={data.analisisNYSE}
              onChange={(e) => update('analisisNYSE', e.target.value)}
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, icon, className, children }: {
  label: string
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <label className="text-sm font-medium text-[var(--saas-muted)] flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}
