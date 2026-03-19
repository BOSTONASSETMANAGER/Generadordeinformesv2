import type { InstrumentosDelDiaData } from '../types/tool-types'

// Convierte texto con formato markdown básico a HTML
function markdownToHtml(text: string): string {
  if (!text) return ''
  
  // Procesar negritas primero
  let processed = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // Dividir por párrafos (doble salto de línea)
  const paragraphs = processed.split(/\n\n+/)
  
  return paragraphs
    .map(paragraph => {
      const trimmed = paragraph.trim()
      // Ignorar líneas que son títulos de sección (se manejan por separado)
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        return ''
      }
      if (trimmed) {
        // Convertir saltos de línea simples a <br/>
        return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`
      }
      return ''
    })
    .filter(p => p)
    .join('\n                        ')
}

// Genera el HTML del bloque estándar con el diseño exacto del archivo instrumentoestandar.html
export function generateStandardHtml(data: InstrumentosDelDiaData): string {
  const contenidoHtml = markdownToHtml(data.contenidoEstandar)
  const isNegative = (data.variacionPorcentaje || '').includes('-')
  const variacionClass = isNegative ? 'negativa' : 'positiva'
  const variacionIcon = isNegative 
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                                <polyline points="17 18 23 18 23 12"/>
                            </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                <polyline points="17 6 23 6 23 12"/>
                            </svg>`
  
  const imagenHtml = data.imagenUrl 
    ? `<!-- Imagen a la izquierda -->
                        <div class="analisis-imagen">
                            <img src="${data.imagenUrl}" alt="CEDEAR ${data.ticker} - Análisis">
                        </div>`
    : ''
  
  const gridColumns = data.imagenUrl ? '350px 1fr' : '1fr'
  
  return `<!-- BLOQUE ESTÁNDAR - ${data.ticker} -->
<style>
/* Prevenir scroll horizontal global */
body {
    overflow-x: hidden;
}

/* Variables CSS para consistencia */
.instrumentos-dia-estatico {
    --saas-primary: #1d3969;
    --saas-accent: #2563eb;
    --saas-light: #f8fafc;
    --saas-border: #e2e8f0;
    --saas-text: #374151;
    --saas-muted: #64748b;
    --saas-success: #059669;
    --saas-warning: #dc2626;
}

/* Reset y base */
.instrumentos-dia-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Hero Section */
.instrumentos-dia-estatico .instrumentos-hero {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    color: white;
    padding: 100px 0 80px 0;
    position: relative;
    overflow: hidden;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-top: -110px;
    min-height: 300px;
}

.instrumentos-dia-estatico .instrumentos-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
}

.instrumentos-dia-estatico .hero-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    position: relative;
    z-index: 2;
    text-align: center;
}

.instrumentos-dia-estatico .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.instrumentos-dia-estatico .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: white;
}

.instrumentos-dia-estatico .hero-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Sección de Contenido Principal */
.instrumentos-dia-estatico .instrumentos-content {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: var(--saas-text);
    padding: 80px 0;
    position: relative;
    overflow: hidden;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.instrumentos-dia-estatico .content-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    position: relative;
    z-index: 2;
}

/* Card de Instrumento - ANCHO COMPLETO */
.instrumentos-dia-estatico .instrumento-card {
    background: white;
    border-radius: 24px;
    padding: 40px 50px;
    box-shadow: 0 20px 50px rgba(29, 57, 105, 0.1);
    border: 2px solid var(--saas-border);
    margin-bottom: 40px;
    transition: all 0.3s ease;
    width: 100%;
}

.instrumentos-dia-estatico .instrumento-card:hover {
    box-shadow: 0 30px 60px rgba(29, 57, 105, 0.15);
    border-color: var(--saas-accent);
}

/* Header del Instrumento - UNA SOLA LÍNEA */
.instrumentos-dia-estatico .instrumento-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 2px solid var(--saas-border);
    flex-wrap: wrap;
}

.instrumentos-dia-estatico .instrumento-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.instrumentos-dia-estatico .instrumento-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.08), rgba(37, 99, 235, 0.08));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.instrumentos-dia-estatico .instrumento-icon svg {
    width: 28px;
    height: 28px;
    color: var(--saas-primary);
}

.instrumentos-dia-estatico .instrumento-title-group {
    display: flex;
    align-items: center;
    gap: 15px;
}

.instrumentos-dia-estatico .instrumento-name {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--saas-primary);
}

.instrumentos-dia-estatico .instrumento-ticker {
    display: inline-block;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    color: white;
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.5px;
}

/* Cotización en el Header */
.instrumentos-dia-estatico .cotizacion-header {
    display: flex;
    align-items: center;
    gap: 25px;
}

.instrumentos-dia-estatico .cotizacion-data {
    text-align: right;
}

.instrumentos-dia-estatico .cotizacion-label {
    font-size: 0.85rem;
    color: var(--saas-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.instrumentos-dia-estatico .cotizacion-precio {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--saas-primary);
}

.instrumentos-dia-estatico .cotizacion-variacion {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
}

.instrumentos-dia-estatico .cotizacion-variacion.negativa {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-warning);
}

.instrumentos-dia-estatico .cotizacion-variacion.positiva {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.instrumentos-dia-estatico .cotizacion-variacion svg {
    width: 18px;
    height: 18px;
}

/* Análisis con Imagen */
.instrumentos-dia-estatico .analisis-section {
    margin-bottom: 0;
}

.instrumentos-dia-estatico .analisis-layout {
    display: grid;
    grid-template-columns: ${gridColumns};
    gap: 40px;
    align-items: start;
}

.instrumentos-dia-estatico .analisis-imagen {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(29, 57, 105, 0.12);
    border: 2px solid var(--saas-border);
    transition: all 0.3s ease;
}

.instrumentos-dia-estatico .analisis-imagen:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(29, 57, 105, 0.18);
    border-color: var(--saas-accent);
}

.instrumentos-dia-estatico .analisis-imagen img {
    width: 100%;
    height: auto;
    display: block;
}

.instrumentos-dia-estatico .analisis-contenido {
    flex: 1;
}

.instrumentos-dia-estatico .analisis-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--saas-primary);
    margin-bottom: 20px;
}

.instrumentos-dia-estatico .analisis-title-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.08), rgba(37, 99, 235, 0.08));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.instrumentos-dia-estatico .analisis-title-icon svg {
    width: 20px;
    height: 20px;
    color: var(--saas-primary);
}

.instrumentos-dia-estatico .analisis-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--saas-text);
    text-align: justify;
}

.instrumentos-dia-estatico .analisis-text p {
    margin-bottom: 20px;
}

.instrumentos-dia-estatico .analisis-text p:last-child {
    margin-bottom: 0;
}

.instrumentos-dia-estatico .analisis-text strong {
    color: var(--saas-primary);
}

/* Responsive */
@media (max-width: 900px) {
    .instrumentos-dia-estatico .instrumento-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
    
    .instrumentos-dia-estatico .cotizacion-header {
        width: 100%;
        justify-content: space-between;
    }
    
    .instrumentos-dia-estatico .cotizacion-data {
        text-align: left;
    }
    
    .instrumentos-dia-estatico .analisis-layout {
        grid-template-columns: 1fr;
    }
    
    .instrumentos-dia-estatico .analisis-imagen {
        max-width: 400px;
        margin: 0 auto 30px auto;
    }
}

@media (max-width: 768px) {
    .instrumentos-dia-estatico .instrumentos-hero {
        width: 100%;
        margin-left: 0;
        padding: 80px 0 60px 0;
        margin-top: -110px;
    }
    
    .instrumentos-dia-estatico .hero-title {
        color: white;
        font-size: 2.2rem;
    }
    
    .instrumentos-dia-estatico .hero-subtitle {
        font-size: 1.1rem;
    }
    
    .instrumentos-dia-estatico .instrumentos-content {
        width: 100%;
        margin-left: 0;
        padding: 60px 0;
    }
    
    .instrumentos-dia-estatico .content-container {
        padding: 0 15px;
    }
    
    .instrumentos-dia-estatico .instrumento-card {
        padding: 25px 20px;
        border-radius: 20px;
    }
    
    .instrumentos-dia-estatico .instrumento-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .instrumentos-dia-estatico .instrumento-title-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .instrumentos-dia-estatico .instrumento-name {
        font-size: 1.5rem;
    }
    
    .instrumentos-dia-estatico .cotizacion-precio {
        font-size: 1.5rem;
    }
    
    .instrumentos-dia-estatico .analisis-text {
        font-size: 1rem;
        text-align: left;
    }
}

@media (max-width: 480px) {
    .instrumentos-dia-estatico .hero-title {
        font-size: 1.8rem;
    }
    
    .instrumentos-dia-estatico .hero-subtitle {
        font-size: 1rem;
    }
    
    .instrumentos-dia-estatico .instrumento-icon {
        width: 50px;
        height: 50px;
    }
    
    .instrumentos-dia-estatico .instrumento-name {
        font-size: 1.3rem;
    }
    
    .instrumentos-dia-estatico .cotizacion-precio {
        font-size: 1.3rem;
    }
    
    .instrumentos-dia-estatico .analisis-title {
        font-size: 1.1rem;
    }
}

/* Animaciones */
.instrumentos-dia-estatico .instrumentos-hero {
    animation: fadeIn 0.6s ease-out forwards;
}

.instrumentos-dia-estatico .instrumento-card {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

<div class="instrumentos-dia-estatico">
    <!-- Hero Section -->
    <section class="instrumentos-hero">
        <div class="hero-container">
            <div class="hero-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                Actualización Diaria
            </div>
            <h1 class="hero-title">Instrumentos del Día</h1>
            <p class="hero-subtitle">${data.subtitulo || 'Análisis detallado de los instrumentos financieros más relevantes del mercado, con información actualizada para tomar mejores decisiones de inversión.'}</p>
        </div>
    </section>

    <!-- Sección de Contenido Principal - Público -->
    <section class="instrumentos-content">
        <div class="content-container">
            <div class="instrumento-card">
                <!-- Header del Instrumento - Una sola línea -->
                <div class="instrumento-header">
                    <div class="instrumento-info">
                        <div class="instrumento-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <div class="instrumento-title-group">
                            <h2 class="instrumento-name">${data.nombreEmpresa || data.ticker}</h2>
                            <span class="instrumento-ticker">${data.ticker}</span>
                        </div>
                    </div>
                    
                    ${data.precioCotizacion ? `
                    <div class="cotizacion-header">
                        <div class="cotizacion-data">
                            <div class="cotizacion-label">Cotización CEDEAR</div>
                            <div class="cotizacion-precio">${data.precioCotizacion}</div>
                        </div>
                        ${data.variacionPorcentaje ? `
                        <div class="cotizacion-variacion ${variacionClass}">
                            ${variacionIcon}
                            ${data.variacionPorcentaje}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>

                <!-- Análisis con Imagen -->
                <div class="analisis-section">
                    <div class="analisis-layout">
                        ${imagenHtml}
                        
                        <!-- Contenido a la derecha -->
                        <div class="analisis-contenido">
                            <h3 class="analisis-title">
                                <span class="analisis-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="20" x2="18" y2="10"/>
                                        <line x1="12" y1="20" x2="12" y2="4"/>
                                        <line x1="6" y1="20" x2="6" y2="14"/>
                                    </svg>
                                </span>
                                Análisis del Instrumento
                            </h3>
                            <div class="analisis-text">
                                ${contenidoHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
<!-- FIN BLOQUE ESTÁNDAR -->`
}

// Parsea el contenido premium y extrae las secciones
interface PremiumSection {
  tipo: 'valor-razonable' | 'riesgo' | 'proyecciones' | 'prevision' | 'liquidez' | 'solvencia' | 'dividendos' | 'fundamentales'
  titulo: string
  contenido: string
  analistas?: { nombre: string; opinion: string }[]
}

// Lista de encabezados conocidos para detección en cualquier formato
const KNOWN_HEADERS = [
  'valoración', 'valoracion',
  'valor razonable',
  'riesgo',
  'proyecciones', 'proyecciones financieras',
  'liquidez',
  'solvencia',
  'dividendos',
  'fundamentales', 'análisis fundamental',
  'previsión', 'prevision', 'previsiones',
  'consenso', 'consenso de analistas',
]

// Detecta si una línea es un encabezado de sección
function isHeaderLine(line: string): boolean {
  const trimmed = line.trim()
  
  // Formato markdown: ## Título o ### Título
  if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
    return true
  }
  
  // Excluir líneas que parecen títulos de documento (contienen paréntesis, guiones largos, o palabras como VERSION/PREMIUM)
  if (trimmed.includes('(') || trimmed.includes(')') || trimmed.includes('–') || trimmed.includes('—')) {
    return false
  }
  if (/VERSION|PREMIUM|REPORTE|INFORME|ANÁLISIS DE/i.test(trimmed)) {
    return false
  }
  
  // Formato mayúsculas: VALOR RAZONABLE, RIESGO, etc.
  // Debe ser una línea corta (menos de 50 chars), mayormente mayúsculas
  if (trimmed.length > 0 && trimmed.length < 50) {
    const upperCount = (trimmed.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length
    const letterCount = (trimmed.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/g) || []).length
    // Si más del 70% son mayúsculas y tiene al menos 4 letras
    if (letterCount >= 4 && upperCount / letterCount > 0.7) {
      return true
    }
  }
  
  // Formato Title Case: "Valoración", "Riesgo", "Proyecciones Financieras"
  // Detectar si la línea coincide con un encabezado conocido
  const lowerTrimmed = trimmed.toLowerCase()
  if (trimmed.length > 0 && trimmed.length < 50) {
    for (const header of KNOWN_HEADERS) {
      if (lowerTrimmed === header || lowerTrimmed.startsWith(header + ':')) {
        return true
      }
    }
  }
  
  return false
}

// Extrae el título de una línea de encabezado
function extractHeaderTitle(line: string): string {
  const trimmed = line.trim()
  if (trimmed.startsWith('## ')) return trimmed.slice(3).trim()
  if (trimmed.startsWith('### ')) return trimmed.slice(4).trim()
  return trimmed
}

// Detecta si una línea es un analista numerado (1. Morgan Stanley, 2. Goldman, etc.)
function parseAnalistaLine(line: string): { nombre: string; opinion: string } | null {
  const trimmed = line.trim()
  
  // Formato: "1. Nombre analista texto..." o "1.Nombre analista texto..."
  const match = trimmed.match(/^\d+\.\s*([A-Za-z][A-Za-z\s&]+?)(?:\s+(?:sugiere|mantiene|adopta|tiene|espera|recomienda|indica)|[,:])(.*)$/i)
  if (match) {
    const nombre = match[1].trim()
    // Reconstruir la opinión completa
    const restOfLine = trimmed.slice(trimmed.indexOf(nombre) + nombre.length).trim()
    // Limpiar el inicio de la opinión
    const opinion = restOfLine.replace(/^[,:\s]+/, '').trim()
    return { nombre, opinion: opinion || '' }
  }
  
  // Formato alternativo: "1. Nombre: opinión" o "1. Nombre - opinión"
  const altMatch = trimmed.match(/^\d+\.\s*([^:–\-]+?)[\s]*[:–\-]\s*(.+)$/i)
  if (altMatch) {
    return { nombre: altMatch[1].trim(), opinion: altMatch[2].trim() }
  }
  
  return null
}

function parsePremiumContent(text: string): PremiumSection[] {
  if (!text) return []
  
  const sections: PremiumSection[] = []
  const lines = text.split('\n')
  
  let currentSection: PremiumSection | null = null
  let currentContent: string[] = []
  let currentAnalistas: { nombre: string; opinion: string }[] = []
  
  const getTipoFromTitle = (title: string): PremiumSection['tipo'] => {
    const lower = title.toLowerCase()
    // Valoración: detecta "valor razonable", "valor intrínseco", o simplemente "valoración"
    if (lower.includes('valoraci') || (lower.includes('valor') && (lower.includes('razonable') || lower.includes('intrínseco')))) return 'valor-razonable'
    if (lower.includes('fundamental')) return 'fundamentales'
    if (lower.includes('riesgo')) return 'riesgo'
    // Proyecciones: detecta "proyecciones", "proyecciones financieras", etc.
    if (lower.includes('proyecc')) return 'proyecciones'
    if (lower.includes('liquidez')) return 'liquidez'
    if (lower.includes('solvencia')) return 'solvencia'
    if (lower.includes('dividend')) return 'dividendos'
    if (lower.includes('previs') || lower.includes('12 meses') || lower.includes('calificacion') || lower.includes('consenso') || lower.includes('analista')) return 'prevision'
    // Por defecto, intentar detectar por contenido
    return 'valor-razonable'
  }
  
  const saveCurrentSection = () => {
    if (currentSection) {
      currentSection.contenido = currentContent.join('\n').trim()
      if (currentAnalistas.length > 0) {
        currentSection.analistas = [...currentAnalistas]
      }
      // Solo agregar si tiene contenido
      if (currentSection.contenido || currentSection.analistas?.length) {
        sections.push(currentSection)
      }
      currentSection = null
      currentContent = []
      currentAnalistas = []
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Ignorar líneas vacías al inicio
    if (!trimmedLine && !currentSection) continue
    
    // Detectar encabezado de sección
    if (isHeaderLine(trimmedLine)) {
      saveCurrentSection()
      const titulo = extractHeaderTitle(trimmedLine)
      currentSection = {
        tipo: getTipoFromTitle(titulo),
        titulo: formatTitleCase(titulo),
        contenido: '',
      }
      continue
    }
    
    // Detectar analista numerado
    const analistaInfo = parseAnalistaLine(trimmedLine)
    if (analistaInfo && currentSection) {
      currentAnalistas.push(analistaInfo)
      continue
    }
    
    // Contenido normal
    if (currentSection) {
      currentContent.push(line)
    }
  }
  
  // Guardar última sección
  saveCurrentSection()
  
  return sections
}

// Convierte título a formato Title Case
function formatTitleCase(text: string): string {
  // Si ya está en formato normal, devolverlo
  if (text !== text.toUpperCase()) return text
  
  // Convertir de MAYÚSCULAS a Title Case
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Genera el ícono SVG según el tipo
function getIconSvg(tipo: PremiumSection['tipo']): string {
  switch (tipo) {
    case 'valor-razonable':
    case 'fundamentales':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`
    case 'riesgo':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`
    case 'proyecciones':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>`
    case 'prevision':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>`
    case 'liquidez':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>`
    case 'solvencia':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>`
    case 'dividendos':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>`
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`
  }
}

// Genera el HTML de una sección de insight
function generateInsightCardHtml(section: PremiumSection, index: number): string {
  const contenidoHtml = markdownToHtml(section.contenido)
  const iconSvg = getIconSvg(section.tipo)
  
  let analistasHtml = ''
  if (section.analistas && section.analistas.length > 0) {
    analistasHtml = `
                        <div class="analistas-list">
${section.analistas.map(a => `                            <div class="analista-item">
                                <div class="analista-nombre">${a.nombre}</div>
                                <div class="analista-opinion">${markdownToHtml(a.opinion).replace(/<\/?p>/g, '')}</div>
                            </div>`).join('\n')}
                        </div>`
  }
  
  return `                <!-- ${section.titulo.toUpperCase()} -->
                <div class="insight-card ${section.tipo}">
                    <div class="insight-header">
                        <div class="insight-icon">
                            ${iconSvg}
                        </div>
                        <h3 class="insight-title">${section.titulo}</h3>
                    </div>
                    <div class="insight-content">
                        ${contenidoHtml}${analistasHtml}
                    </div>
                </div>`
}

// Orden preferido de las secciones premium
const SECTION_ORDER: PremiumSection['tipo'][] = [
  'valor-razonable',
  'fundamentales',
  'riesgo',
  'proyecciones',
  'dividendos',
  'liquidez',
  'solvencia',
  'prevision',
]

// Genera el HTML completo del bloque premium
export function generatePremiumHtml(data: InstrumentosDelDiaData): string {
  const sections = parsePremiumContent(data.contenidoPremium)
  
  if (sections.length === 0) {
    return '<!-- No hay contenido premium para generar -->'
  }
  
  // Ordenar secciones según el orden preferido (valor-razonable primero, luego riesgo, etc.)
  sections.sort((a, b) => {
    const indexA = SECTION_ORDER.indexOf(a.tipo)
    const indexB = SECTION_ORDER.indexOf(b.tipo)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })
  
  const insightsHtml = sections.map((section, index) => generateInsightCardHtml(section, index)).join('\n\n')
  
  return `<!-- BLOQUE PREMIUM - ${data.ticker} -->
<style>
/* Variables CSS para consistencia - Bloque Premium */
.instrumentos-premium-estatico {
    --saas-primary: #1d3969;
    --saas-accent: #2563eb;
    --saas-light: #f8fafc;
    --saas-border: #e2e8f0;
    --saas-text: #374151;
    --saas-muted: #64748b;
    --saas-success: #059669;
    --saas-warning: #dc2626;
    --saas-info: #0891b2;
    --saas-purple: #7c3aed;
}

/* Reset y base */
.instrumentos-premium-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Sección Premium */
.instrumentos-premium-estatico .premium-section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: white;
    color: var(--saas-text);
    padding: 80px 0;
    position: relative;
    overflow: hidden;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-bottom: -60px;
}

.instrumentos-premium-estatico .premium-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    position: relative;
    z-index: 2;
}

/* Header Premium */
.instrumentos-premium-estatico .premium-header {
    text-align: center;
    margin-bottom: 50px;
}

.instrumentos-premium-estatico .premium-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    color: white;
    padding: 10px 25px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 20px;
}

.instrumentos-premium-estatico .premium-badge svg {
    width: 18px;
    height: 18px;
}

.instrumentos-premium-estatico .premium-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--saas-primary);
    margin-bottom: 10px;
}

.instrumentos-premium-estatico .premium-subtitle {
    font-size: 1.1rem;
    color: var(--saas-muted);
}

/* Grid de Insights */
.instrumentos-premium-estatico .insights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
}

/* Card de Insight */
.instrumentos-premium-estatico .insight-card {
    background: white;
    border-radius: 20px;
    padding: 35px;
    box-shadow: 0 15px 40px rgba(29, 57, 105, 0.08);
    border: 2px solid var(--saas-border);
    transition: all 0.3s ease;
}

.instrumentos-premium-estatico .insight-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(29, 57, 105, 0.12);
    border-color: var(--saas-accent);
}

/* Variantes de color para cada insight */
.instrumentos-premium-estatico .insight-card.valor-razonable {
    border-top: 4px solid var(--saas-success);
}

.instrumentos-premium-estatico .insight-card.riesgo {
    border-top: 4px solid var(--saas-warning);
}

.instrumentos-premium-estatico .insight-card.proyecciones {
    border-top: 4px solid var(--saas-info);
}

.instrumentos-premium-estatico .insight-card.prevision {
    border-top: 4px solid var(--saas-purple);
}

.instrumentos-premium-estatico .insight-card.liquidez {
    border-top: 4px solid #0ea5e9;
}

.instrumentos-premium-estatico .insight-card.solvencia {
    border-top: 4px solid #14b8a6;
}

.instrumentos-premium-estatico .insight-card.dividendos {
    border-top: 4px solid #f59e0b;
}

.instrumentos-premium-estatico .insight-card.fundamentales {
    border-top: 4px solid var(--saas-success);
}

/* Header del Insight */
.instrumentos-premium-estatico .insight-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.instrumentos-premium-estatico .insight-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.instrumentos-premium-estatico .insight-icon svg {
    width: 24px;
    height: 24px;
}

.instrumentos-premium-estatico .insight-card.valor-razonable .insight-icon {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.instrumentos-premium-estatico .insight-card.riesgo .insight-icon {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-warning);
}

.instrumentos-premium-estatico .insight-card.proyecciones .insight-icon {
    background: rgba(8, 145, 178, 0.1);
    color: var(--saas-info);
}

.instrumentos-premium-estatico .insight-card.prevision .insight-icon {
    background: rgba(124, 58, 237, 0.1);
    color: var(--saas-purple);
}

.instrumentos-premium-estatico .insight-card.liquidez .insight-icon {
    background: rgba(14, 165, 233, 0.1);
    color: #0ea5e9;
}

.instrumentos-premium-estatico .insight-card.solvencia .insight-icon {
    background: rgba(20, 184, 166, 0.1);
    color: #14b8a6;
}

.instrumentos-premium-estatico .insight-card.dividendos .insight-icon {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
}

.instrumentos-premium-estatico .insight-card.fundamentales .insight-icon {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.instrumentos-premium-estatico .insight-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--saas-primary);
}

/* Contenido del Insight */
.instrumentos-premium-estatico .insight-content {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--saas-text);
}

.instrumentos-premium-estatico .insight-content p {
    margin-bottom: 15px;
}

.instrumentos-premium-estatico .insight-content p:last-child {
    margin-bottom: 0;
}

.instrumentos-premium-estatico .insight-content strong {
    color: var(--saas-primary);
}

/* Lista de Analistas */
.instrumentos-premium-estatico .analistas-list {
    margin-top: 20px;
}

.instrumentos-premium-estatico .analista-item {
    background: linear-gradient(135deg, var(--saas-light) 0%, white 100%);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 12px;
    border-left: 3px solid var(--saas-purple);
}

.instrumentos-premium-estatico .analista-item:last-child {
    margin-bottom: 0;
}

.instrumentos-premium-estatico .analista-nombre {
    font-weight: 700;
    color: var(--saas-primary);
    margin-bottom: 5px;
}

.instrumentos-premium-estatico .analista-opinion {
    font-size: 0.95rem;
    color: var(--saas-text);
    line-height: 1.6;
}

/* Responsive */
@media (max-width: 1024px) {
    .instrumentos-premium-estatico .insights-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .instrumentos-premium-estatico .premium-section {
        width: 100%;
        margin-left: 0;
        padding: 60px 0;
    }
    
    .instrumentos-premium-estatico .premium-container {
        padding: 0 15px;
    }
    
    .instrumentos-premium-estatico .premium-title {
        font-size: 1.8rem;
    }
    
    .instrumentos-premium-estatico .insight-card {
        padding: 25px 20px;
    }
    
    .instrumentos-premium-estatico .insight-title {
        font-size: 1.15rem;
    }
    
    .instrumentos-premium-estatico .insight-content {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .instrumentos-premium-estatico .insight-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .instrumentos-premium-estatico .analista-item {
        padding: 15px;
    }
}

/* Animaciones */
.instrumentos-premium-estatico .insight-card {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
}

.instrumentos-premium-estatico .insight-card:nth-child(1) { animation-delay: 0.1s; }
.instrumentos-premium-estatico .insight-card:nth-child(2) { animation-delay: 0.2s; }
.instrumentos-premium-estatico .insight-card:nth-child(3) { animation-delay: 0.3s; }
.instrumentos-premium-estatico .insight-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

<div class="instrumentos-premium-estatico">
    <section class="premium-section">
        <div class="premium-container">
            <div class="premium-header">
                <div class="premium-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Análisis Premium
                </div>
                <h2 class="premium-title">Insights Exclusivos - ${data.ticker}</h2>
                <p class="premium-subtitle">${data.subtitulo || 'Información detallada para inversores con suscripción activa'}</p>
            </div>

            <div class="insights-grid">
${insightsHtml}
            </div>
        </div>
    </section>
</div>
<!-- FIN BLOQUE PREMIUM -->`
}
