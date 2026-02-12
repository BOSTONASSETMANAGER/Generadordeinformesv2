"use client"

import { ParsedReportData } from "@/lib/pdf-parser"
import { 
  Calendar, Clock, DollarSign, TrendingDown, TrendingUp, 
  Globe, Box, AlertTriangle, Target
} from "lucide-react"

interface PremiumReportPreviewProps {
  data: ParsedReportData | null
  isLoading?: boolean
}

export function PremiumReportPreview({ data, isLoading }: PremiumReportPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-saas-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-saas-muted text-sm">Extrayendo datos del PDF...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-xl bg-saas-accent/20 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-saas-accent" />
          </div>
          <h3 className="text-lg font-semibold text-saas-light mb-2">
            Sube un PDF para comenzar
          </h3>
          <p className="text-saas-muted text-sm">
            El informe premium se generará automáticamente a partir del contenido del PDF.
          </p>
        </div>
      </div>
    )
  }

  const kpiIcons = [
    <Calendar key="cal" className="w-5 h-5" />,
    <Clock key="clock" className="w-5 h-5" />,
    <DollarSign key="dollar" className="w-5 h-5" />,
    <TrendingDown key="trend" className="w-5 h-5" />,
    <TrendingUp key="trendup" className="w-5 h-5" />,
    <Globe key="globe" className="w-5 h-5" />,
  ]

  return (
    <div className="premium-report overflow-y-auto h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1d3969] to-[#2563eb] px-6 py-10">
        <h1 className="text-white text-xl font-bold leading-tight mb-3">
          {data.title}
        </h1>
        <p className="text-white/80 text-sm leading-relaxed">
          {data.subtitle}
        </p>
      </section>

      {/* KPIs Section */}
      <section className="bg-[var(--dashboard-surface)] border-b border-[var(--dashboard-border)] px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          {data.kpis.map((kpi, i) => (
            <div 
              key={i} 
              className={`
                flex items-start gap-3 p-4 rounded-xl border
                ${kpi.isNegative 
                  ? 'bg-red-500/5 border-red-500/30' 
                  : 'bg-[var(--dashboard-surface-elevated)] border-[var(--dashboard-border)]'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${kpi.isNegative 
                  ? 'bg-red-500/10 text-red-400' 
                  : 'bg-saas-accent/10 text-saas-accent'
                }
              `}>
                {kpiIcons[i] || <DollarSign className="w-5 h-5" />}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-saas-muted font-medium uppercase tracking-wider">
                  {kpi.label}
                </span>
                <span className={`text-sm font-bold ${kpi.isNegative ? 'text-red-400' : 'text-saas-light'}`}>
                  {kpi.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <section 
          key={section.id} 
          className={`px-6 py-6 border-b border-[var(--dashboard-border)] ${
            i % 2 === 0 ? 'bg-[var(--dashboard-surface)]' : 'bg-[var(--dashboard-surface-elevated)]'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1d3969] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
              {i === 0 ? <Globe className="w-5 h-5 text-white" /> : <Box className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-sm font-bold text-saas-light uppercase tracking-wide leading-tight">
              {section.title}
            </h2>
          </div>
          <div className="text-sm text-saas-muted leading-relaxed whitespace-pre-line">
            {section.content}
          </div>
        </section>
      ))}

      {/* Calls Table */}
      {data.callsTable.length > 0 && (
        <section className="px-6 py-6 bg-[var(--dashboard-surface)] border-b border-[var(--dashboard-border)]">
          <div className="rounded-xl overflow-hidden border border-[var(--dashboard-border)]">
            <div className="px-4 py-3 border-b border-green-500/30 bg-green-500/5">
              <h4 className="text-sm font-semibold text-saas-light">
                Matriz de Actividad en Opciones CALL
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1d3969]">
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Strike</th>
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Var %</th>
                    <th className="text-right py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Volumen</th>
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  {data.callsTable.map((row, i) => (
                    <tr 
                      key={i} 
                      className={`border-b border-[var(--dashboard-border)] ${
                        row.isHighlight ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono font-semibold text-[11px]">
                          {row.strike}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          row.change.includes('-') 
                            ? 'bg-red-500/10 text-red-400' 
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {row.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-saas-muted">{row.volume}</td>
                      <td className="py-2.5 px-3 text-saas-muted leading-relaxed">{row.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Puts Table */}
      {data.putsTable.length > 0 && (
        <section className="px-6 py-6 bg-[var(--dashboard-surface-elevated)] border-b border-[var(--dashboard-border)]">
          <div className="rounded-xl overflow-hidden border border-[var(--dashboard-border)]">
            <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/5">
              <h4 className="text-sm font-semibold text-saas-light">
                Matriz de Actividad en Opciones PUT
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1d3969]">
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Strike</th>
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Var %</th>
                    <th className="text-right py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Volumen</th>
                    <th className="text-left py-2.5 px-3 text-white font-semibold uppercase text-[10px]">Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  {data.putsTable.map((row, i) => (
                    <tr 
                      key={i} 
                      className={`border-b border-[var(--dashboard-border)] ${
                        row.isHighlight ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-1 rounded bg-red-500/10 text-red-400 font-mono font-semibold text-[11px]">
                          {row.strike}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          row.change.includes('+') 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {row.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-saas-muted">{row.volume}</td>
                      <td className="py-2.5 px-3 text-saas-muted leading-relaxed">{row.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Conclusion & Levels */}
      {(data.conclusion || data.supportLevels.length > 0 || data.resistanceLevels.length > 0) && (
        <section className="px-6 py-6 bg-[var(--dashboard-surface)] border-b border-[var(--dashboard-border)]">
          <h2 className="text-sm font-bold text-saas-light uppercase tracking-wide mb-4">
            Conclusión y Perspectiva Estratégica
          </h2>
          
          {data.conclusion && (
            <p className="text-sm text-saas-muted leading-relaxed mb-4">
              {data.conclusion}
            </p>
          )}

          {(data.resistanceLevels.length > 0 || data.supportLevels.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {data.resistanceLevels.length > 0 && (
                <div className="p-4 bg-[var(--dashboard-surface-elevated)] rounded-xl border-l-4 border-l-red-500">
                  <span className="text-[10px] text-saas-muted font-semibold uppercase tracking-wider">
                    Resistencia
                  </span>
                  <p className="text-sm text-saas-light font-bold mt-1">
                    {data.resistanceLevels.join(' / ')}
                  </p>
                </div>
              )}
              {data.supportLevels.length > 0 && (
                <div className="p-4 bg-[var(--dashboard-surface-elevated)] rounded-xl border-l-4 border-l-green-500">
                  <span className="text-[10px] text-saas-muted font-semibold uppercase tracking-wider">
                    Soporte
                  </span>
                  <p className="text-sm text-saas-light font-bold mt-1">
                    {data.supportLevels.join(' / ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-saas-muted leading-relaxed">
                <strong className="text-amber-400">Disclaimer:</strong> Operar con opciones conlleva riesgos significativos. 
                Este informe es educativo y no constituye asesoramiento financiero personalizado.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
