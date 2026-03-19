"use client"

import type React from "react"
import type { InstrumentosDelDiaData } from "@/lib/types/tool-types"
import { Star, BarChart3, DollarSign, TrendingDown, TrendingUp, ImageIcon } from "lucide-react"

interface InstrumentosFormProps {
  data: InstrumentosDelDiaData
  onChange: (data: InstrumentosDelDiaData) => void
}

export function InstrumentosForm({ data, onChange }: InstrumentosFormProps) {
  const update = <K extends keyof InstrumentosDelDiaData>(key: K, value: InstrumentosDelDiaData[K]) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Información del Instrumento */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-[var(--saas-light)]">Información del Instrumento</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldGroup label="Ticker">
            <input
              type="text"
              placeholder="Ej: MCD, AAPL, MSFT"
              value={data.ticker}
              onChange={(e) => update('ticker', e.target.value.toUpperCase())}
              className="form-input font-mono uppercase"
            />
          </FieldGroup>

          <FieldGroup label="Nombre de la Empresa">
            <input
              type="text"
              placeholder="Ej: McDonald's Corporation"
              value={data.nombreEmpresa}
              onChange={(e) => update('nombreEmpresa', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Subtítulo" className="md:col-span-2 lg:col-span-1">
            <input
              type="text"
              placeholder="Ej: Información detallada para inversores con suscripción activa"
              value={data.subtitulo}
              onChange={(e) => update('subtitulo', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Precio Cotización" icon={<DollarSign className="w-4 h-4 text-emerald-400" />}>
            <input
              type="text"
              placeholder="Ej: $20.490,00"
              value={data.precioCotizacion || ''}
              onChange={(e) => update('precioCotizacion', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup
            label="Variación %"
            icon={
              (data.variacionPorcentaje || '').startsWith('-')
                ? <TrendingDown className="w-4 h-4 text-red-400" />
                : <TrendingUp className="w-4 h-4 text-emerald-400" />
            }
          >
            <input
              type="text"
              placeholder="Ej: -0,87% o +2,5%"
              value={data.variacionPorcentaje || ''}
              onChange={(e) => update('variacionPorcentaje', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="URL de Imagen (CEDEAR del Día)" icon={<ImageIcon className="w-4 h-4 text-blue-400" />} className="md:col-span-2 lg:col-span-3">
            <input
              type="text"
              placeholder="https://ejemplo.com/imagen-cedear.png"
              value={data.imagenUrl || ''}
              onChange={(e) => update('imagenUrl', e.target.value)}
              className="form-input"
            />
            <p className="text-xs text-[var(--saas-muted)] mt-1">
              Pega la URL de la imagen del CEDEAR del día. Esta imagen aparecerá en el bloque estándar.
            </p>
          </FieldGroup>
        </div>
      </div>

      {/* Card 2: Contenido Estándar */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden border-l-4 border-l-blue-500">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-semibold text-[var(--saas-light)]">Contenido Estándar</h3>
            <p className="text-xs text-[var(--saas-muted)] mt-0.5">
              Información pública disponible para todos los usuarios. Se genera como HTML independiente.
            </p>
          </div>
        </div>
        <div className="p-5">
          <FieldGroup label="Redacción del Contenido Estándar">
            <textarea
              className="form-input min-h-[300px] text-sm leading-relaxed"
              placeholder={`Escribe aquí el análisis estándar del instrumento. Este contenido será visible para todos los usuarios.

Puedes incluir:
• Descripción general de la empresa
• Datos fundamentales públicos
• Contexto del mercado
• Información relevante del sector
• Noticias recientes
• Métricas básicas

Usa **texto** para negritas y saltos de línea para separar párrafos.`}
              value={data.contenidoEstandar}
              onChange={(e) => update('contenidoEstandar', e.target.value)}
            />
          </FieldGroup>
        </div>
      </div>

      {/* Card 3: Contenido Premium */}
      <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden border-l-4 border-l-purple-500">
        <div className="px-5 py-4 border-b border-[var(--dashboard-border)] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--saas-light)]">Insights Premium</h3>
              <p className="text-xs text-[var(--saas-muted)] mt-0.5">
                Análisis exclusivo para suscriptores premium. Se genera como HTML independiente con diseño premium.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <FieldGroup label="Redacción del Contenido Premium">
            <textarea
              className="form-input min-h-[300px] text-sm leading-relaxed"
              placeholder={`Escribe aquí los insights premium del instrumento. Este contenido será exclusivo para suscriptores.

Estructura sugerida (usa ## para títulos de sección):

## Valor Razonable
El valor razonable de la acción...

## Riesgo
El beta a 1 año fue de...

## Proyecciones Financieras
Se proyecta un crecimiento...

## Previsión a 12 Meses
De acuerdo al consenso de analistas...

### JP Morgan
Espera un precio de...

### Morgan Stanley
Mantiene una postura neutral...`}
              value={data.contenidoPremium || ''}
              onChange={(e) => update('contenidoPremium', e.target.value)}
            />
          </FieldGroup>
          <p className="text-xs text-[var(--saas-muted)] mt-3">
            💡 Usa <code className="bg-[var(--dashboard-surface-elevated)] px-1.5 py-0.5 rounded text-purple-400">## Título</code> para crear secciones y <code className="bg-[var(--dashboard-surface-elevated)] px-1.5 py-0.5 rounded text-purple-400">### Nombre</code> para opiniones de analistas.
            Usa <code className="bg-[var(--dashboard-surface-elevated)] px-1.5 py-0.5 rounded text-purple-400">**texto**</code> para negritas.
          </p>
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
