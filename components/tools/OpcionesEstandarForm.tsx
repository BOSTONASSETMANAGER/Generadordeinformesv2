"use client"

import type React from "react"
import type { OpcionesEstandar2Data, OpcionEntry2, ImanPrecio2, VolatilidadHV2 } from "@/lib/types/tool-types"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  Activity,
  Plus,
  Trash2,
  Lightbulb,
  FileText
} from "lucide-react"

interface OpcionesEstandarFormProps {
  data: OpcionesEstandar2Data
  onChange: (data: OpcionesEstandar2Data) => void
}

const emptyCall: OpcionEntry2 = { strike: '', tipo: 'Call', volumenNominal: '', variacion: '', interpretacion: '' }
const emptyPut: OpcionEntry2 = { strike: '', tipo: 'Put', volumenNominal: '', variacion: '', interpretacion: '' }
const emptyIman: ImanPrecio2 = { nivel: '', tipoMuralla: '', descripcion: '' }
const emptyHV: VolatilidadHV2 = { periodo: '', valor: '', analisis: '' }

export function OpcionesEstandarForm({ data, onChange }: OpcionesEstandarFormProps) {
  const updateField = <K extends keyof OpcionesEstandar2Data>(key: K, value: OpcionesEstandar2Data[K]) => {
    onChange({ ...data, [key]: value })
  }

  const updateCall = (index: number, field: keyof OpcionEntry2, value: string) => {
    const newCalls = [...data.calls]
    newCalls[index] = { ...newCalls[index], [field]: value }
    updateField('calls', newCalls)
  }

  const updatePut = (index: number, field: keyof OpcionEntry2, value: string) => {
    const newPuts = [...data.puts]
    newPuts[index] = { ...newPuts[index], [field]: value }
    updateField('puts', newPuts)
  }

  const updateIman = (index: number, field: keyof ImanPrecio2, value: string) => {
    const newImanes = [...data.imanesPrecio]
    newImanes[index] = { ...newImanes[index], [field]: value }
    updateField('imanesPrecio', newImanes)
  }

  const updateHV = (index: number, field: keyof VolatilidadHV2, value: string) => {
    const newHV = [...(data.volatilidadHistorica || [])]
    newHV[index] = { ...newHV[index], [field]: value }
    updateField('volatilidadHistorica', newHV)
  }

  const addCall = () => updateField('calls', [...data.calls, { ...emptyCall }])
  const addPut = () => updateField('puts', [...data.puts, { ...emptyPut }])
  const addIman = () => updateField('imanesPrecio', [...data.imanesPrecio, { ...emptyIman }])
  const addHV = () => updateField('volatilidadHistorica', [...(data.volatilidadHistorica || []), { ...emptyHV }])

  const removeCall = (index: number) => {
    if (data.calls.length > 1) updateField('calls', data.calls.filter((_, i) => i !== index))
  }
  const removePut = (index: number) => {
    if (data.puts.length > 1) updateField('puts', data.puts.filter((_, i) => i !== index))
  }
  const removeIman = (index: number) => {
    if (data.imanesPrecio.length > 1) updateField('imanesPrecio', data.imanesPrecio.filter((_, i) => i !== index))
  }
  const removeHV = (index: number) => {
    if ((data.volatilidadHistorica || []).length > 1) updateField('volatilidadHistorica', (data.volatilidadHistorica || []).filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Encabezado / KPIs */}
      <FormCard icon={<FileText className="w-5 h-5 text-blue-400" />} title="Encabezado del Informe" subtitle="Datos principales que aparecen en el header del informe">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldGroup label="Activo">
            <input
              type="text"
              placeholder="Ej: GGAL, YPF, PAMP"
              value={data.activo}
              onChange={(e) => updateField('activo', e.target.value.toUpperCase())}
              className="form-input font-mono uppercase"
            />
          </FieldGroup>

          <FieldGroup label="Fecha" icon={<Calendar className="w-4 h-4 text-[var(--saas-muted)]" />}>
            <input
              type="text"
              placeholder="Ej: 13 de enero de 2026"
              value={data.fecha}
              onChange={(e) => updateField('fecha', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Vencimiento OPEX">
            <input
              type="text"
              placeholder="Ej: 17 de enero de 2026"
              value={data.vencimientoOpex}
              onChange={(e) => updateField('vencimientoOpex', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Precio Spot" icon={<DollarSign className="w-4 h-4 text-emerald-400" />}>
            <input
              type="text"
              placeholder="Ej: $8.370,00"
              value={data.precioSpot}
              onChange={(e) => updateField('precioSpot', e.target.value)}
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup
            label="Variación Semanal"
            icon={
              (data.variacionSemanal || '').startsWith('-')
                ? <TrendingDown className="w-4 h-4 text-red-400" />
                : <TrendingUp className="w-4 h-4 text-emerald-400" />
            }
          >
            <input
              type="text"
              placeholder="Ej: +2,5% o -1,3%"
              value={data.variacionSemanal}
              onChange={(e) => updateField('variacionSemanal', e.target.value)}
              className="form-input"
            />
          </FieldGroup>
        </div>
      </FormCard>

      {/* Card 2: Tesis Central */}
      <FormCard icon={<Target className="w-5 h-5 text-purple-400" />} title="Tesis Central" subtitle="Copia y pega el párrafo de contexto/introducción del informe original" borderColor="border-l-purple-500">
        <textarea
          className="form-input min-h-[150px] text-sm leading-relaxed"
          placeholder={`Pega aquí el texto de la tesis central o introducción del informe...

Ejemplo: 'El mercado de opciones de GGAL mostró una semana de consolidación con el subyacente cotizando en un rango estrecho entre $8.200 y $8.500...'`}
          value={data.tesisCentral}
          onChange={(e) => updateField('tesisCentral', e.target.value)}
        />
      </FormCard>

      {/* Card 3: Flujo y Actividad */}
      <FormCard icon={<BarChart3 className="w-5 h-5 text-blue-400" />} title="Sección A: Flujo y Actividad" subtitle="Texto introductorio de la sección (antes del mapa de calor)" borderColor="border-l-blue-500">
        <FieldGroup label="Introducción de la Sección A">
          <textarea
            className="form-input min-h-[120px] text-sm leading-relaxed"
            placeholder={`Pega aquí el texto introductorio de la Sección A...

Ejemplo: 'El análisis de la matriz de opciones para el vencimiento de febrero de 2026 revela una estructura de mercado compleja, donde la liquidez se concentró en zonas de resistencia claves...'`}
            value={data.introduccionSeccionA || ''}
            onChange={(e) => updateField('introduccionSeccionA', e.target.value)}
          />
        </FieldGroup>
      </FormCard>

      {/* Card 3b: Mapa de Calor */}
      <FormCard icon={<BarChart3 className="w-5 h-5 text-amber-400" />} title="Mapa de Calor - Volúmenes" subtitle="Datos de volumen total y análisis del mapa de calor">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FieldGroup label="Volumen Total Calls">
            <input
              type="text"
              placeholder="Ej: $3.397.030.106"
              value={data.volumenTotalCalls || ''}
              onChange={(e) => updateField('volumenTotalCalls', e.target.value)}
              className="form-input"
            />
          </FieldGroup>
          <FieldGroup label="Volumen Total Puts">
            <input
              type="text"
              placeholder="Ej: $718.234.671"
              value={data.volumenTotalPuts || ''}
              onChange={(e) => updateField('volumenTotalPuts', e.target.value)}
              className="form-input"
            />
          </FieldGroup>
          <FieldGroup label="Ratio Put/Call">
            <input
              type="text"
              placeholder="Ej: 4.73"
              value={data.ratioPutCall || ''}
              onChange={(e) => updateField('ratioPutCall', e.target.value)}
              className="form-input"
            />
          </FieldGroup>
        </div>

        <div className="pt-4 border-t border-[var(--dashboard-border)]">
          <FieldGroup label="Análisis del Mapa de Calor">
            <textarea
              className="form-input min-h-[150px] text-sm leading-relaxed"
              placeholder={`Pega aquí el análisis posterior al mapa de calor...

Ejemplo: 'Este ratio de 4,73 indica una agresividad compradora (o de cierre de lanzamientos) en el lado de los Calls casi cinco veces superior a la actividad en Puts...'`}
              value={data.analisisMapaCalor || ''}
              onChange={(e) => updateField('analisisMapaCalor', e.target.value)}
            />
          </FieldGroup>
        </div>
      </FormCard>

      {/* Card 3c: Análisis Pre-Calls */}
      <FormCard icon={<FileText className="w-5 h-5 text-emerald-400" />} title="Análisis del Flujo en CALLS" subtitle="Texto de análisis antes de la tabla de Calls">
        <FieldGroup label="Análisis Pre-Tabla de Calls">
          <textarea
            className="form-input min-h-[120px] text-sm leading-relaxed"
            placeholder={`Pega aquí el análisis antes de la tabla de Calls...

Ejemplo: Análisis del Flujo en CALLS: La "Muralla" de los $8.500

La actividad en las opciones de compra se concentró masivamente en las bases OTM cercanas, estableciendo techos técnicos muy definidos.`}
            value={data.analisisPreCalls || ''}
            onChange={(e) => updateField('analisisPreCalls', e.target.value)}
          />
        </FieldGroup>
      </FormCard>

      {/* Card 4: Tabla de Calls */}
      <FormCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} title="Tabla de Calls" subtitle="Copia cada fila de la tabla de Calls del informe original" borderColor="border-l-emerald-500">
        <div className="space-y-4">
          {data.calls.map((call, index) => (
            <DynamicRow
              key={index}
              label={`Call #${index + 1}`}
              onRemove={data.calls.length > 1 ? () => removeCall(index) : undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FieldGroup label="Strike (Base)">
                  <input
                    type="text"
                    placeholder="GFGC85539F"
                    value={call.strike}
                    onChange={(e) => updateCall(index, 'strike', e.target.value.toUpperCase())}
                    className="form-input font-mono text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Volumen Nominal">
                  <input
                    type="text"
                    placeholder="$1.402.533.741"
                    value={call.volumenNominal}
                    onChange={(e) => updateCall(index, 'volumenNominal', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Variación %">
                  <input
                    type="text"
                    placeholder="-5,26%"
                    value={call.variacion}
                    onChange={(e) => updateCall(index, 'variacion', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Interpretación" className="md:col-span-4">
                  <textarea
                    placeholder="Epicentro ATM. Es la base con mayor actividad nominal..."
                    value={call.interpretacion}
                    onChange={(e) => updateCall(index, 'interpretacion', e.target.value)}
                    className="form-input text-sm min-h-[80px]"
                  />
                </FieldGroup>
              </div>
            </DynamicRow>
          ))}
          <AddButton onClick={addCall} label="Agregar Call" color="emerald" />

          <div className="pt-4 border-t border-[var(--dashboard-border)]">
            <FieldGroup label="Interpretación Profunda (Calls)">
              <p className="text-xs text-[var(--saas-muted)] mb-2">Análisis final después de la tabla de Calls</p>
              <textarea
                className="form-input min-h-[150px] text-sm leading-relaxed"
                placeholder={`Pega aquí la interpretación profunda de los Calls...

Ejemplo: La base GFGC8530FE negoció más de $1.500 millones, una cifra colosal que representa casi la mitad de todo el dinero movido en opciones de compra...`}
                value={data.interpretacionFinalCalls || ''}
                onChange={(e) => updateField('interpretacionFinalCalls', e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>
      </FormCard>

      {/* Card 4b: Análisis Pre-Puts */}
      <FormCard icon={<FileText className="w-5 h-5 text-red-400" />} title="Análisis del Flujo en PUTS" subtitle="Texto de análisis antes de la tabla de Puts">
        <FieldGroup label="Análisis Pre-Tabla de Puts">
          <textarea
            className="form-input min-h-[120px] text-sm leading-relaxed"
            placeholder={`Pega aquí el análisis antes de la tabla de Puts...

Ejemplo: Análisis del Flujo en PUTS: Cobertura Selectiva

La actividad en opciones de venta fue considerablemente menor, concentrándose en bases específicas que revelan estrategias de cobertura institucional.`}
            value={data.analisisPrePuts || ''}
            onChange={(e) => updateField('analisisPrePuts', e.target.value)}
          />
        </FieldGroup>
      </FormCard>

      {/* Card 5: Tabla de Puts */}
      <FormCard icon={<TrendingDown className="w-5 h-5 text-red-400" />} title="Tabla de Puts" subtitle="Copia cada fila de la tabla de Puts del informe original" borderColor="border-l-red-500">
        <div className="space-y-4">
          {data.puts.map((put, index) => (
            <DynamicRow
              key={index}
              label={`Put #${index + 1}`}
              onRemove={data.puts.length > 1 ? () => removePut(index) : undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FieldGroup label="Strike (Base)">
                  <input
                    type="text"
                    placeholder="GFGV82539F"
                    value={put.strike}
                    onChange={(e) => updatePut(index, 'strike', e.target.value.toUpperCase())}
                    className="form-input font-mono text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Volumen Nominal">
                  <input
                    type="text"
                    placeholder="$890.234.567"
                    value={put.volumenNominal}
                    onChange={(e) => updatePut(index, 'volumenNominal', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Variación %">
                  <input
                    type="text"
                    placeholder="+12,45%"
                    value={put.variacion}
                    onChange={(e) => updatePut(index, 'variacion', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Interpretación" className="md:col-span-4">
                  <textarea
                    placeholder="Cobertura Institucional. Esta base concentró la mayor actividad defensiva..."
                    value={put.interpretacion}
                    onChange={(e) => updatePut(index, 'interpretacion', e.target.value)}
                    className="form-input text-sm min-h-[80px]"
                  />
                </FieldGroup>
              </div>
            </DynamicRow>
          ))}
          <AddButton onClick={addPut} label="Agregar Put" color="red" />

          <div className="pt-4 border-t border-[var(--dashboard-border)]">
            <FieldGroup label="Interpretación Profunda (Puts)">
              <p className="text-xs text-[var(--saas-muted)] mb-2">Análisis final después de la tabla de Puts</p>
              <textarea
                className="form-input min-h-[150px] text-sm leading-relaxed"
                placeholder={`Pega aquí la interpretación profunda de los Puts...

Ejemplo: La actividad en Puts fue notablemente menor que en Calls, lo cual es significativo en un día de caída del 3,33%. Esto sugiere que los inversores institucionales no están en modo pánico...`}
                value={data.interpretacionFinalPuts || ''}
                onChange={(e) => updateField('interpretacionFinalPuts', e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>
      </FormCard>

      {/* Card 6: Imanes de Precio */}
      <FormCard icon={<Target className="w-5 h-5 text-amber-400" />} title="Imanes de Precio (Open Interest)" subtitle="Copia los niveles de soporte, resistencia y zona neutral" borderColor="border-l-amber-500">
        <div className="space-y-4">
          <FieldGroup label="Introducción de la Sección">
            <textarea
              placeholder="Analizando la distribución de la liquidez y las posiciones abiertas, identificamos las zonas de congestión que actuarán como imanes para el precio en las próximas ruedas..."
              value={data.introduccionImanesPrecio || ''}
              onChange={(e) => updateField('introduccionImanesPrecio', e.target.value)}
              className="form-input text-sm min-h-[80px]"
            />
          </FieldGroup>

          {data.imanesPrecio.map((iman, index) => (
            <DynamicRow
              key={index}
              label={`Nivel #${index + 1}`}
              onRemove={data.imanesPrecio.length > 1 ? () => removeIman(index) : undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FieldGroup label="Nivel de Precio">
                  <input
                    type="text"
                    placeholder="$8.500,00"
                    value={iman.nivel}
                    onChange={(e) => updateIman(index, 'nivel', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Tipo de Muralla">
                  <input
                    type="text"
                    placeholder="Resistencia / Soporte / Zona Neutral"
                    value={iman.tipoMuralla}
                    onChange={(e) => updateIman(index, 'tipoMuralla', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Descripción Técnica" className="md:col-span-3">
                  <textarea
                    placeholder="Concentración de OI en calls con 15.000 contratos abiertos..."
                    value={iman.descripcion}
                    onChange={(e) => updateIman(index, 'descripcion', e.target.value)}
                    className="form-input text-sm min-h-[60px]"
                  />
                </FieldGroup>
              </div>
            </DynamicRow>
          ))}
          <AddButton onClick={addIman} label="Agregar Nivel" color="amber" />
        </div>
      </FormCard>

      {/* Card 7: Volatilidad Histórica */}
      <FormCard icon={<Activity className="w-5 h-5 text-violet-400" />} title="Volatilidad Histórica" subtitle="Copia los datos de la tabla de volatilidad histórica" borderColor="border-l-violet-500">
        <div className="space-y-4">
          {(data.volatilidadHistorica || []).map((hv, index) => (
            <DynamicRow
              key={index}
              label={`Período #${index + 1}`}
              onRemove={(data.volatilidadHistorica || []).length > 1 ? () => removeHV(index) : undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FieldGroup label="Período">
                  <input
                    type="text"
                    placeholder="3 días / 5 días / 10 días..."
                    value={hv.periodo}
                    onChange={(e) => updateHV(index, 'periodo', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Volatilidad HV">
                  <input
                    type="text"
                    placeholder="22,16%"
                    value={hv.valor}
                    onChange={(e) => updateHV(index, 'valor', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
                <FieldGroup label="Análisis de Tendencia" className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="Estable / En aumento / En descenso..."
                    value={hv.analisis}
                    onChange={(e) => updateHV(index, 'analisis', e.target.value)}
                    className="form-input text-sm"
                  />
                </FieldGroup>
              </div>
            </DynamicRow>
          ))}
          <AddButton onClick={addHV} label="Agregar Período" color="violet" />

          <div className="pt-4 border-t border-[var(--dashboard-border)]">
            <FieldGroup label="Interpretación de Volatilidad">
              <textarea
                className="form-input mt-2 min-h-[100px] text-sm"
                placeholder="Pega aquí el párrafo de interpretación de la volatilidad histórica..."
                value={data.interpretacionVolatilidad || ''}
                onChange={(e) => updateField('interpretacionVolatilidad', e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>
      </FormCard>

      {/* Card 8: Concepto del Día */}
      <FormCard icon={<Lightbulb className="w-5 h-5 text-cyan-400" />} title="Concepto del Día (Opcional)" subtitle="Si el informe incluye un concepto educativo, cópialo aquí" borderColor="border-l-cyan-500">
        <div className="space-y-4">
          <FieldGroup label="Título del Concepto">
            <input
              type="text"
              placeholder="Ej: Gamma Scalping"
              value={data.conceptoDelDia?.titulo || ''}
              onChange={(e) => updateField('conceptoDelDia', {
                ...data.conceptoDelDia,
                titulo: e.target.value,
                explicacion: data.conceptoDelDia?.explicacion || '',
                implicancia: data.conceptoDelDia?.implicancia || '',
              })}
              className="form-input"
            />
          </FieldGroup>
          <FieldGroup label="Explicación">
            <textarea
              className="form-input min-h-[100px] text-sm"
              placeholder="Pega aquí la explicación del concepto..."
              value={data.conceptoDelDia?.explicacion || ''}
              onChange={(e) => updateField('conceptoDelDia', {
                ...data.conceptoDelDia,
                titulo: data.conceptoDelDia?.titulo || '',
                explicacion: e.target.value,
                implicancia: data.conceptoDelDia?.implicancia || '',
              })}
            />
          </FieldGroup>
          <FieldGroup label="Implicancia Práctica">
            <textarea
              className="form-input min-h-[80px] text-sm"
              placeholder="Pega aquí la implicancia práctica del concepto..."
              value={data.conceptoDelDia?.implicancia || ''}
              onChange={(e) => updateField('conceptoDelDia', {
                ...data.conceptoDelDia,
                titulo: data.conceptoDelDia?.titulo || '',
                explicacion: data.conceptoDelDia?.explicacion || '',
                implicancia: e.target.value,
              })}
            />
          </FieldGroup>
        </div>
      </FormCard>

      {/* Card 9: Conclusión Final */}
      <FormCard
        icon={<FileText className="w-5 h-5 text-blue-300" />}
        title="Conclusión Final"
        subtitle="Resumen y conclusiones del informe"
        borderColor="border-l-blue-400"
        headerGradient
      >
        <FieldGroup label="Conclusión del Informe">
          <textarea
            className="form-input min-h-[200px] text-sm leading-relaxed"
            placeholder={`Pega aquí la conclusión final del informe...

Ejemplo: El análisis del flujo de opciones de GGAL revela un mercado con sesgo alcista moderado, donde los participantes institucionales están estableciendo posiciones defensivas en niveles clave.

Puntos clave:
• La concentración de volumen en calls OTM sugiere expectativas de movimiento al alza
• Los niveles de $8.500 y $8.530 actúan como resistencias técnicas importantes
• La baja actividad en puts indica ausencia de pánico vendedor`}
            value={data.conclusionFinal || ''}
            onChange={(e) => updateField('conclusionFinal', e.target.value)}
          />
        </FieldGroup>
      </FormCard>
    </div>
  )
}

/* ─── Shared Sub-components ─── */

function FormCard({ icon, title, subtitle, borderColor, headerGradient, children }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  borderColor?: string
  headerGradient?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden ${borderColor ? `border-l-4 ${borderColor}` : ''}`}>
      <div className={`px-5 py-4 border-b border-[var(--dashboard-border)] ${headerGradient ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : ''}`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="text-base font-semibold text-[var(--saas-light)]">{title}</h3>
            {subtitle && <p className="text-xs text-[var(--saas-muted)] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
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

function DynamicRow({ label, onRemove, children }: {
  label: string
  onRemove?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="p-4 bg-[var(--dashboard-surface-elevated)] rounded-lg border border-[var(--dashboard-border)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--saas-light)]">{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function AddButton({ onClick, label, color }: {
  onClick: () => void
  label: string
  color: 'emerald' | 'red' | 'amber' | 'violet'
}) {
  const colorMap = {
    emerald: 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10',
    red: 'border-red-500/50 text-red-400 hover:bg-red-500/10',
    amber: 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10',
    violet: 'border-violet-500/50 text-violet-400 hover:bg-violet-500/10',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full py-2.5 rounded-lg border border-dashed text-sm font-medium transition-colors flex items-center justify-center gap-2 ${colorMap[color]}`}
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  )
}
