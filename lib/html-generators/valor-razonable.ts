import type { ValorRazonableData } from '../types/tool-types'

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
      if (trimmed) {
        // Convertir saltos de línea simples a <br/>
        return `<p class="card-text">${trimmed.replace(/\n/g, '<br/>')}</p>`
      }
      return ''
    })
    .filter(p => p)
    .join('\n                        ')
}

// Genera el HTML completo del informe de valor razonable
export function generateValorRazonableHtml(data: ValorRazonableData): string {
  const analisisArgentinaHtml = markdownToHtml(data.analisisArgentina)
  const analisisNYSEHtml = markdownToHtml(data.analisisNYSE)
  
  const graficoSection = data.imagenGraficoUrl ? `
    <!-- Gráfico Section -->
    <section class="grafico-section">
        <div class="grafico-container">
            <div class="grafico-wrapper">
                <img src="${data.imagenGraficoUrl}" alt="Informe de Valor Razonable - Gráfico Semanal" class="grafico-image">
            </div>
        </div>
    </section>
` : ''

  return `<div class="valor-razonable-estatico">
    
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-container">
            <div class="hero-content">
                <h1 class="hero-title">${data.titulo || 'Informe de Valor Razonable – Renta Variable'}</h1>
                <p class="hero-date">${data.fecha || ''}</p>
                <p class="hero-description">${data.descripcion || 'Actualización semanal de acciones argentinas y del NYSE, con foco en valor razonable, valuación actual y potencial promedio de suba o baja, según distintos modelos de análisis.'}</p>
            </div>
        </div>
    </section>

    <!-- Análisis Section -->
    <section class="analisis-section">
        <div class="analisis-container">
            <div class="analisis-grid">
                
                <!-- Argentina Card -->
                <div class="analisis-card">
                    <div class="card-header argentina">
                        <div class="card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        </div>
                        <h2 class="card-title">🇦🇷 Acciones Argentinas</h2>
                    </div>
                    <div class="card-content">
                        ${analisisArgentinaHtml || '<p class="card-text">Sin análisis disponible.</p>'}
                    </div>
                </div>

                <!-- NYSE Card -->
                <div class="analisis-card">
                    <div class="card-header nyse">
                        <div class="card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10"/>
                                <line x1="12" y1="20" x2="12" y2="4"/>
                                <line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                        </div>
                        <h2 class="card-title">🇺🇸 NYSE (en USD)</h2>
                    </div>
                    <div class="card-content">
                        ${analisisNYSEHtml || '<p class="card-text">Sin análisis disponible.</p>'}
                    </div>
                </div>

            </div>
        </div>
    </section>
${graficoSection}
    <!-- Legal Section -->
    <section class="legal-section">
        <div class="legal-container">
            <div class="legal-content">
                <p class="legal-text">Los informes de inversión expuestos en nuestra web fueron realizados por expertos en el mercado de capitales. Los mismos son elaborados con lineamientos generales aunque recomendamos contactarnos para recibir asesoramiento personalizado.</p>
                <p class="legal-text">Los rendimientos no son garantizados, las inversiones en títulos de valores pueden provocar pérdidas en el capital invertido.</p>
                <p class="legal-text">Precios indicativos. No constituyen oferta. Recomendación de inversión realizada por Boston Asset Manager S.A. Cuit 30-71652406-6 Inscripta ante la IGJ bajo el número RL2019-22722943-GDEBA-DLYRMJGP y autorizada por la Comisión Nacional de Valores para prestar asesoramiento en inversiones en la República Argentina según resolución DI-2021-59-APN-GAYM#CNV Matricula 1406. La decisión de inversión y los riesgos asociados son responsabilidad exclusiva del inversor.</p>
                <p class="legal-text">Boston Asset Manager S.A., sus directivos, empleados y colaboradores no se responsabilizan por los resultados de la inversión realizada.</p>
            </div>
        </div>
    </section>

</div>

<style>
body { overflow-x: hidden; }

.valor-razonable-estatico {
    --saas-primary: #1d3969;
    --saas-accent: #2563eb;
    --saas-light: #f8fafc;
    --saas-border: #e2e8f0;
    --saas-text: #374151;
    --saas-muted: #64748b;
    --saas-success: #059669;
    --saas-warning: #f59e0b;
    --saas-danger: #dc2626;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--saas-text);
}

.valor-razonable-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Hero Section */
.valor-razonable-estatico .hero-section {
    background: linear-gradient(135deg, var(--saas-primary) 0%, var(--saas-accent) 100%);
    padding: 80px 0 60px;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-top: -100px;
    color: white;
    position: relative;
    overflow: hidden;
}

.valor-razonable-estatico .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.valor-razonable-estatico .hero-content {
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
}

.valor-razonable-estatico .hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 15px;
    color: white;
}

.valor-razonable-estatico .hero-date {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
}

.valor-razonable-estatico .hero-description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.95);
    max-width: 800px;
    margin: 0 auto;
}

/* Análisis Section */
.valor-razonable-estatico .analisis-section {
    background: white;
    padding: 60px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.valor-razonable-estatico .analisis-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.valor-razonable-estatico .analisis-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
}

.valor-razonable-estatico .analisis-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(29, 57, 105, 0.1);
    transition: all 0.3s ease;
    border: 1px solid var(--saas-border);
}

.valor-razonable-estatico .analisis-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(29, 57, 105, 0.15);
}

.valor-razonable-estatico .card-header {
    padding: 25px 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 2px solid var(--saas-border);
}

.valor-razonable-estatico .card-header.argentina {
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.05), rgba(37, 99, 235, 0.05));
    border-bottom-color: var(--saas-accent);
}

.valor-razonable-estatico .card-header.nyse {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.08));
    border-bottom-color: var(--saas-success);
}

.valor-razonable-estatico .card-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.1), rgba(37, 99, 235, 0.1));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--saas-primary);
    flex-shrink: 0;
}

.valor-razonable-estatico .card-header.nyse .card-icon {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.15));
    color: var(--saas-success);
}

.valor-razonable-estatico .card-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--saas-primary);
}

.valor-razonable-estatico .card-content {
    padding: 30px;
}

.valor-razonable-estatico .card-text {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--saas-text);
    margin-bottom: 15px;
}

.valor-razonable-estatico .card-text:last-child {
    margin-bottom: 0;
}

.valor-razonable-estatico .card-text strong {
    color: var(--saas-primary);
    font-weight: 700;
}

/* Gráfico Section */
.valor-razonable-estatico .grafico-section {
    background: var(--saas-light);
    padding: 60px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.valor-razonable-estatico .grafico-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.valor-razonable-estatico .grafico-wrapper {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(29, 57, 105, 0.1);
}

.valor-razonable-estatico .grafico-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
}

/* Legal Section */
.valor-razonable-estatico .legal-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-bottom: -90px;
}

.valor-razonable-estatico .legal-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.valor-razonable-estatico .legal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    border-left: 4px solid var(--saas-accent);
    box-shadow: 0 2px 10px rgba(29, 57, 105, 0.08);
}

.valor-razonable-estatico .legal-text {
    font-size: 0.85rem;
    line-height: 1.7;
    color: var(--saas-muted);
    margin-bottom: 12px;
}

.valor-razonable-estatico .legal-text:last-child {
    margin-bottom: 0;
}

/* Responsive */
@media (max-width: 1024px) {
    .valor-razonable-estatico .analisis-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .valor-razonable-estatico .hero-section {
        padding: 60px 0 40px;
    }
    
    .valor-razonable-estatico .hero-title {
        font-size: 1.8rem;
    }
    
    .valor-razonable-estatico .hero-date {
        font-size: 1rem;
    }
    
    .valor-razonable-estatico .hero-description {
        font-size: 1rem;
    }
    
    .valor-razonable-estatico .analisis-section,
    .valor-razonable-estatico .grafico-section,
    .valor-razonable-estatico .legal-section {
        padding: 40px 0;
    }
    
    .valor-razonable-estatico .analisis-container,
    .valor-razonable-estatico .grafico-container,
    .valor-razonable-estatico .legal-container {
        padding: 0 20px;
    }
    
    .valor-razonable-estatico .card-header {
        padding: 20px;
    }
    
    .valor-razonable-estatico .card-content {
        padding: 20px;
    }
    
    .valor-razonable-estatico .card-title {
        font-size: 1.2rem;
    }
    
    .valor-razonable-estatico .grafico-wrapper {
        padding: 20px;
    }
}
</style>`
}
