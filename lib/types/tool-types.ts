// Datos para el informe "Instrumentos del Día" - basado en redacción, no en PDFs
export interface InstrumentosDelDiaData {
  ticker: string
  nombreEmpresa: string
  subtitulo: string
  // Datos de cotización para el header
  precioCotizacion?: string
  variacionPorcentaje?: string
  // URL de imagen del instrumento (CEDEAR del día)
  imagenUrl?: string
  // Contenido estándar (información pública)
  contenidoEstandar: string
  // Contenido premium (análisis exclusivo) - texto con formato markdown
  contenidoPremium: string
  // Insights premium estructurados (legacy, opcional)
  insightsPremium?: InsightPremium[]
}

export interface InsightPremium {
  tipo: 'valor-razonable' | 'riesgo' | 'proyecciones' | 'prevision'
  titulo: string
  contenido: string
  // Para previsiones con lista de analistas
  analistas?: AnalistaOpinion[]
}

export interface AnalistaOpinion {
  nombre: string
  opinion: string
}

// Datos para el informe "Valor Razonable"
export interface ValorRazonableData {
  // Hero section
  titulo: string
  fecha: string
  descripcion: string
  // Análisis sections
  analisisArgentina: string
  analisisNYSE: string
  // Gráfico
  imagenGraficoUrl: string
}

// Entrada de opción para Opciones Estándar 2.0 (copiar/pegar manual)
export interface OpcionEntry2 {
  strike: string
  tipo: string // "Call" o "Put"
  volumenNominal: string
  variacion: string
  interpretacion: string
}

// Entrada de imán de precio para Opciones Estándar 2.0
export interface ImanPrecio2 {
  nivel: string
  tipoMuralla: string
  descripcion: string
}

// Entrada de volatilidad histórica para Opciones Estándar 2.0
export interface VolatilidadHV2 {
  periodo: string
  valor: string
  analisis: string
}

// Datos para el informe "Opciones Estándar 2.0" - basado en copiar/pegar secciones
export interface OpcionesEstandar2Data {
  // Encabezado / KPIs
  activo: string
  fecha: string
  vencimientoOpex: string
  precioSpot: string
  variacionSemanal: string
  // Tesis Central
  tesisCentral: string
  // Sección A: Flujo y Actividad
  introduccionSeccionA?: string // Texto introductorio de la sección A
  analisisMapaCalor?: string // Análisis después del mapa de calor (volúmenes)
  analisisPreCalls?: string // Análisis antes de la tabla de calls
  interpretacionFinalCalls?: string // Interpretación profunda después de la tabla de calls
  analisisPrePuts?: string // Análisis antes de la tabla de puts
  interpretacionFinalPuts?: string // Interpretación profunda después de la tabla de puts
  volumenTotalCalls?: string
  volumenTotalPuts?: string
  ratioPutCall?: string
  calls: OpcionEntry2[]
  puts: OpcionEntry2[]
  // Imanes de Precio (Open Interest)
  introduccionImanesPrecio?: string // Introducción de la sección de imanes de precio
  imanesPrecio: ImanPrecio2[]
  // Volatilidad Histórica (opcional)
  volatilidadHistorica?: VolatilidadHV2[]
  interpretacionVolatilidad?: string
  // Concepto del Día (opcional)
  conceptoDelDia?: {
    titulo: string
    explicacion: string
    implicancia: string
  }
  // Conclusión Final
  conclusionFinal?: string
}
