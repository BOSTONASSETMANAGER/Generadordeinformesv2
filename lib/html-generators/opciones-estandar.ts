import type { OpcionesEstandar2Data } from '../types/tool-types'

export function generateOpcionesEstandar2Html(data: OpcionesEstandar2Data): string {
  const isNegative = (data.variacionSemanal || '').includes('-')
  
  // Generar filas de calls para la tabla
  const callsTableRows = data.calls
    .filter(c => c.strike)
    .map((call, index) => `
      <tr${index === 0 ? ' class="row-highlight"' : ''}>
        <td><span class="strike-tag otm">${call.strike}</span></td>
        <td class="price-cell">${call.volumenNominal || 'N/D'}</td>
        <td><span class="change-badge ${(call.variacion || '').includes('-') ? 'negative' : 'positive'}">${call.variacion || 'N/D'}</span></td>
        <td class="interpretation-cell">${call.interpretacion || ''}</td>
      </tr>
    `).join('')

  // Generar filas de puts para la tabla
  const putsTableRows = data.puts
    .filter(p => p.strike)
    .map(put => `
      <tr>
        <td><span class="strike-tag put">${put.strike}</span></td>
        <td class="price-cell">${put.volumenNominal || 'N/D'}</td>
        <td><span class="change-badge ${(put.variacion || '').includes('-') ? 'negative' : 'positive'}">${put.variacion || 'N/D'}</span></td>
        <td class="interpretation-cell">${put.interpretacion || ''}</td>
      </tr>
    `).join('')

  // Generar cards de imanes de precio
  const imanesCards = data.imanesPrecio
    .filter(i => i.nivel)
    .map(iman => {
      const tipo = (iman.tipoMuralla || '').toLowerCase()
      const cardClass = tipo.includes('resist') ? 'resistance' : tipo.includes('soport') ? 'support' : 'neutral'
      const iconSvg = cardClass === 'resistance' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
        : cardClass === 'support'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
      
      return `
        <div class="magnet-card ${cardClass}">
          <div class="magnet-header">
            <div class="magnet-icon">${iconSvg}</div>
            <span class="magnet-type">${iman.tipoMuralla}</span>
          </div>
          <div class="magnet-price">${iman.nivel}</div>
          <p class="magnet-desc">${iman.descripcion}</p>
        </div>
      `
    }).join('')

  // Generar sección de volatilidad histórica (opcional)
  const hvRows = (data.volatilidadHistorica || []).filter(hv => hv.periodo)
  const volatilidadSection = hvRows.length > 0 ? `
    <section class="volatility-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <h2 class="section-title">Volatilidad Histórica</h2>
            <p class="section-subtitle">Análisis de Volatilidad</p>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Volatilidad HV</th>
                <th>Análisis</th>
              </tr>
            </thead>
            <tbody>
              ${hvRows.map(hv => `
                <tr>
                  <td>${hv.periodo}</td>
                  <td class="price-cell">${hv.valor}</td>
                  <td>${hv.analisis}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${data.interpretacionVolatilidad ? `
        <div class="insight-card" style="margin-top: 20px;">
          <p>${data.interpretacionVolatilidad}</p>
        </div>
        ` : ''}
      </div>
    </section>
  ` : ''

  // Concepto del día (opcional)
  const conceptoDelDiaHtml = data.conceptoDelDia?.titulo ? `
    <section class="concept-section">
      <div class="section-container">
        <div class="concept-card">
          <div class="concept-header">
            <div class="concept-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Concepto del Día
            </div>
            <h3 class="concept-title">${data.conceptoDelDia.titulo}</h3>
          </div>
          <p class="concept-intro">${data.conceptoDelDia.explicacion}</p>
          <div class="highlight-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p><strong>Implicancia:</strong> ${data.conceptoDelDia.implicancia}</p>
          </div>
        </div>
      </div>
    </section>
  ` : ''

  // Conclusión final (opcional)
  const conclusionHtml = data.conclusionFinal ? `
    <section class="conclusion-section">
      <div class="section-container">
        <div class="context-card">
          <div class="context-header">
            <div class="context-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h2 class="context-title">Conclusión</h2>
          </div>
          <div style="line-height: 1.8;">${data.conclusionFinal.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    </section>
  ` : ''

  return `<!-- INFORME OPCIONES ESTÁNDAR 2.0 - ${data.activo} -->
<div class="ggal-analisis-estatico">
<style>
body { overflow-x: hidden; }

.ggal-analisis-estatico {
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

.ggal-analisis-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.ggal-analisis-estatico .section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.ggal-analisis-estatico .hero-section {
    background: linear-gradient(135deg, var(--saas-primary) 0%, var(--saas-accent) 100%);
    padding: 60px 0 50px;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-top: -60px;
    color: white;
}

.ggal-analisis-estatico .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
}

.ggal-analisis-estatico .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 20px;
    transition: all 0.2s ease;
}

.ggal-analisis-estatico .hero-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.3;
    color: white;
    margin-bottom: 8px;
}

.ggal-analisis-estatico .hero-subtitle {
    font-size: 1rem;
    opacity: 0.9;
    color: white;
}

.ggal-analisis-estatico .kpis-section {
    background: white;
    padding: 40px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    border-bottom: 1px solid var(--saas-border);
}

.ggal-analisis-estatico .kpis-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.ggal-analisis-estatico .kpi-card {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
    background: var(--saas-light);
    border-radius: 12px;
    border: 1px solid var(--saas-border);
}

.ggal-analisis-estatico .kpi-card.highlight-negative {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(220, 38, 38, 0.1));
    border-color: var(--saas-danger);
}

.ggal-analisis-estatico .kpi-card.highlight-positive {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.1));
    border-color: var(--saas-success);
}

.ggal-analisis-estatico .kpi-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.08), rgba(37, 99, 235, 0.08));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--saas-primary);
    flex-shrink: 0;
}

.ggal-analisis-estatico .kpi-icon.danger {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.15));
    color: var(--saas-danger);
}

.ggal-analisis-estatico .kpi-icon.success {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.15));
    color: var(--saas-success);
}

.ggal-analisis-estatico .kpi-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ggal-analisis-estatico .kpi-label {
    font-size: 0.8rem;
    color: var(--saas-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ggal-analisis-estatico .kpi-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .kpi-value.danger { color: var(--saas-danger); }
.ggal-analisis-estatico .kpi-value.success { color: var(--saas-success); }

.ggal-analisis-estatico .context-section {
    background: var(--saas-light);
    padding: 40px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .context-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    border-left: 4px solid var(--saas-primary);
    box-shadow: 0 2px 8px rgba(29, 57, 105, 0.06);
}

.ggal-analisis-estatico .context-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
}

.ggal-analisis-estatico .context-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.08), rgba(37, 99, 235, 0.08));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .context-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .context-card p {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--saas-text);
}

.ggal-analisis-estatico .context-card strong { color: var(--saas-primary); }

.ggal-analisis-estatico .insights-section {
    background: white;
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .section-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
}

.ggal-analisis-estatico .section-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.ggal-analisis-estatico .section-icon.magnets {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.ggal-analisis-estatico .section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--saas-primary);
    margin-bottom: 2px;
}

.ggal-analisis-estatico .section-subtitle {
    font-size: 0.9rem;
    color: var(--saas-muted);
}

.ggal-analisis-estatico .insight-card {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.08));
    border: 1px solid var(--saas-accent);
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
}

.ggal-analisis-estatico .insight-card p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--saas-text);
}

.ggal-analisis-estatico .insight-card strong { color: var(--saas-primary); }

.ggal-analisis-estatico .volume-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.ggal-analisis-estatico .volume-item {
    background: var(--saas-light);
    padding: 20px;
    border-radius: 12px;
    border-left: 4px solid;
    text-align: center;
}

.ggal-analisis-estatico .volume-item.calls { border-left-color: var(--saas-success); }
.ggal-analisis-estatico .volume-item.puts { border-left-color: var(--saas-danger); }
.ggal-analisis-estatico .volume-item.ratio { border-left-color: var(--saas-accent); }

.ggal-analisis-estatico .volume-label {
    display: block;
    font-size: 0.8rem;
    color: var(--saas-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 8px;
}

.ggal-analisis-estatico .volume-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .heatmap-section {
    background: var(--saas-light);
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .analysis-block {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 4px 12px rgba(29, 57, 105, 0.08);
}

.ggal-analisis-estatico .analysis-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--saas-border);
}

.ggal-analisis-estatico .analysis-header.calls { border-bottom-color: var(--saas-success); }
.ggal-analisis-estatico .analysis-header.puts { border-bottom-color: var(--saas-danger); }

.ggal-analisis-estatico .analysis-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ggal-analisis-estatico .analysis-header.calls .analysis-icon {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.ggal-analisis-estatico .analysis-header.puts .analysis-icon {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-danger);
}

.ggal-analisis-estatico .analysis-header h4 {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .analysis-intro {
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--saas-text);
    margin-bottom: 20px;
}

.ggal-analisis-estatico .analysis-intro strong { color: var(--saas-primary); }

.ggal-analisis-estatico .table-container { overflow-x: auto; }

.ggal-analisis-estatico .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.ggal-analisis-estatico .data-table thead {
    background: var(--saas-primary);
}

.ggal-analisis-estatico .data-table.puts-table thead {
    background: linear-gradient(135deg, #991b1b, var(--saas-danger));
}

.ggal-analisis-estatico .data-table th {
    padding: 14px 16px;
    text-align: left;
    color: white;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ggal-analisis-estatico .data-table td {
    padding: 16px;
    border-bottom: 1px solid var(--saas-border);
    vertical-align: top;
}

.ggal-analisis-estatico .data-table tr:last-child td { border-bottom: none; }
.ggal-analisis-estatico .data-table tr:hover { background: rgba(37, 99, 235, 0.02); }
.ggal-analisis-estatico .row-highlight { background: rgba(5, 150, 105, 0.04) !important; }

.ggal-analisis-estatico .strike-tag {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    font-family: 'Consolas', monospace;
}

.ggal-analisis-estatico .strike-tag.otm {
    background: rgba(245, 158, 11, 0.1);
    color: var(--saas-warning);
}

.ggal-analisis-estatico .strike-tag.put {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-danger);
}

.ggal-analisis-estatico .price-cell {
    font-weight: 700;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .change-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.85rem;
}

.ggal-analisis-estatico .change-badge.positive {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.ggal-analisis-estatico .change-badge.negative {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-danger);
}

.ggal-analisis-estatico .interpretation-cell {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--saas-text);
    max-width: 400px;
}

.ggal-analisis-estatico .interpretation-cell strong { color: var(--saas-primary); }

.ggal-analisis-estatico .magnets-section {
    background: white;
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .magnets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
}

.ggal-analisis-estatico .magnet-card {
    background: var(--saas-light);
    border-radius: 16px;
    padding: 25px;
    border-top: 4px solid;
}

.ggal-analisis-estatico .magnet-card.resistance { border-top-color: var(--saas-danger); }
.ggal-analisis-estatico .magnet-card.support { border-top-color: var(--saas-success); }
.ggal-analisis-estatico .magnet-card.neutral { border-top-color: var(--saas-warning); }

.ggal-analisis-estatico .magnet-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.ggal-analisis-estatico .magnet-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ggal-analisis-estatico .magnet-card.resistance .magnet-icon {
    background: rgba(220, 38, 38, 0.1);
    color: var(--saas-danger);
}

.ggal-analisis-estatico .magnet-card.support .magnet-icon {
    background: rgba(5, 150, 105, 0.1);
    color: var(--saas-success);
}

.ggal-analisis-estatico .magnet-card.neutral .magnet-icon {
    background: rgba(245, 158, 11, 0.1);
    color: var(--saas-warning);
}

.ggal-analisis-estatico .magnet-type {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ggal-analisis-estatico .magnet-card.resistance .magnet-type { color: var(--saas-danger); }
.ggal-analisis-estatico .magnet-card.support .magnet-type { color: var(--saas-success); }
.ggal-analisis-estatico .magnet-card.neutral .magnet-type { color: var(--saas-warning); }

.ggal-analisis-estatico .magnet-price {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--saas-primary);
    margin-bottom: 15px;
}

.ggal-analisis-estatico .magnet-desc {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--saas-text);
}

.ggal-analisis-estatico .magnet-desc strong { color: var(--saas-primary); }

.ggal-analisis-estatico .concept-section {
    background: var(--saas-light);
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .concept-card {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(29, 57, 105, 0.08);
}

.ggal-analisis-estatico .concept-header { margin-bottom: 20px; }

.ggal-analisis-estatico .concept-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 15px;
}

.ggal-analisis-estatico .concept-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--saas-primary);
}

.ggal-analisis-estatico .concept-intro {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--saas-text);
    margin-bottom: 25px;
}

.ggal-analisis-estatico .concept-intro strong { color: var(--saas-primary); }

.ggal-analisis-estatico .highlight-box {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.12));
    border: 1px solid var(--saas-success);
    border-radius: 12px;
    color: var(--saas-success);
}

.ggal-analisis-estatico .highlight-box p {
    font-weight: 600;
    color: var(--saas-success);
    font-size: 1rem;
}

.ggal-analisis-estatico .highlight-box strong { color: var(--saas-success); }

.ggal-analisis-estatico .conclusion-section {
    background: var(--saas-light);
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

.ggal-analisis-estatico .volatility-section {
    background: white;
    padding: 50px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

@media (max-width: 1024px) {
    .ggal-analisis-estatico .kpis-grid { grid-template-columns: repeat(2, 1fr); }
    .ggal-analisis-estatico .magnets-grid { grid-template-columns: 1fr; }
    .ggal-analisis-estatico .volume-summary { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .ggal-analisis-estatico .hero-section { padding: 50px 0 40px; }
    .ggal-analisis-estatico .hero-title { font-size: 1.5rem; }
    .ggal-analisis-estatico .kpis-grid { grid-template-columns: 1fr; }
    .ggal-analisis-estatico .section-container { padding: 0 20px; }
    .ggal-analisis-estatico .data-table th,
    .ggal-analisis-estatico .data-table td { padding: 12px 10px; font-size: 0.8rem; }
    .ggal-analisis-estatico .interpretation-cell { max-width: 100%; }
}
</style>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-container">
            <a href="https://bostonam.ar/opciones-estandar/" class="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Volver a Opciones
            </a>
            <h1 class="hero-title">Derivados Financieros – ${data.activo}</h1>
            <p class="hero-subtitle">Fecha del Informe: ${data.fecha} | ${data.vencimientoOpex ? `Vencimiento OPEX: ${data.vencimientoOpex}` : 'Análisis Estratégico de Opciones'}</p>
        </div>
    </section>

    <!-- KPIs Section -->
    <section class="kpis-section">
        <div class="section-container">
            <div class="kpis-grid">
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Fecha del Informe</span>
                        <span class="kpi-value">${data.fecha}</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Vencimiento Opex</span>
                        <span class="kpi-value">${data.vencimientoOpex || 'N/D'}</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Precio Spot Cierre</span>
                        <span class="kpi-value">${data.precioSpot}</span>
                    </div>
                </div>
                <div class="kpi-card ${isNegative ? 'highlight-negative' : 'highlight-positive'}">
                    <div class="kpi-icon ${isNegative ? 'danger' : 'success'}">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="${isNegative ? '23 18 13.5 8.5 8.5 13.5 1 6' : '23 6 13.5 15.5 8.5 10.5 1 18'}"/><polyline points="${isNegative ? '17 18 23 18 23 12' : '17 6 23 6 23 12'}"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Variación</span>
                        <span class="kpi-value ${isNegative ? 'danger' : 'success'}">${data.variacionSemanal}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contexto de Mercado / Tesis Central -->
    ${data.tesisCentral ? `
    <section class="context-section">
        <div class="section-container">
            <div class="context-card">
                <div class="context-header">
                    <div class="context-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <h2 class="context-title">Contexto de Mercado</h2>
                </div>
                <p>${data.tesisCentral.replace(/\n/g, '</p><p>')}</p>
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Insights de Flujo y Actividad -->
    <section class="insights-section">
        <div class="section-container">
            <div class="section-header">
                <div class="section-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div>
                    <h2 class="section-title">Insights de Flujo y Actividad</h2>
                    <p class="section-subtitle">Microestructura de Mercado</p>
                </div>
            </div>
            
            ${data.introduccionSeccionA ? `
            <div class="insight-card">
                <p>${data.introduccionSeccionA.replace(/\n/g, '</p><p>')}</p>
            </div>
            ` : ''}

            ${data.volumenTotalCalls || data.volumenTotalPuts || data.ratioPutCall ? `
            <div class="volume-summary">
                ${data.volumenTotalCalls ? `
                <div class="volume-item calls">
                    <span class="volume-label">Volumen Total CALLS</span>
                    <span class="volume-value">${data.volumenTotalCalls}</span>
                </div>
                ` : ''}
                ${data.volumenTotalPuts ? `
                <div class="volume-item puts">
                    <span class="volume-label">Volumen Total PUTS</span>
                    <span class="volume-value">${data.volumenTotalPuts}</span>
                </div>
                ` : ''}
                ${data.ratioPutCall ? `
                <div class="volume-item ratio">
                    <span class="volume-label">Ratio Call/Put</span>
                    <span class="volume-value">${data.ratioPutCall}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${data.analisisMapaCalor ? `
            <div class="insight-card">
                <p>${data.analisisMapaCalor.replace(/\n/g, '</p><p>')}</p>
            </div>
            ` : ''}
        </div>
    </section>

    <!-- Mapa de Calor - Tablas -->
    <section class="heatmap-section">
        <div class="section-container">
            <!-- Calls Analysis -->
            ${callsTableRows ? `
            <div class="analysis-block">
                <div class="analysis-header calls">
                    <div class="analysis-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <h4>Mapa de Calor - CALLS</h4>
                </div>
                ${data.analisisPreCalls ? `<p class="analysis-intro">${data.analisisPreCalls.replace(/\n/g, '</p><p class="analysis-intro">')}</p>` : ''}
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Strike (Base)</th>
                                <th>Volumen Nominal</th>
                                <th>Var. %</th>
                                <th>Interpretación del Flujo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${callsTableRows}
                        </tbody>
                    </table>
                </div>

                ${data.interpretacionFinalCalls ? `
                <div class="insight-card" style="margin-top: 25px; background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.1)); border-color: #059669;">
                    <p><strong>Interpretación Profunda:</strong> ${data.interpretacionFinalCalls.replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- Puts Analysis -->
            ${putsTableRows ? `
            <div class="analysis-block">
                <div class="analysis-header puts">
                    <div class="analysis-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                    </div>
                    <h4>Análisis del Flujo en PUTS</h4>
                </div>
                ${data.analisisPrePuts ? `<p class="analysis-intro">${data.analisisPrePuts.replace(/\n/g, '</p><p class="analysis-intro">')}</p>` : ''}
                
                <div class="table-container">
                    <table class="data-table puts-table">
                        <thead>
                            <tr>
                                <th>Strike (Base)</th>
                                <th>Volumen Nominal</th>
                                <th>Var. %</th>
                                <th>Interpretación del Flujo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${putsTableRows}
                        </tbody>
                    </table>
                </div>

                ${data.interpretacionFinalPuts ? `
                <div class="insight-card" style="margin-top: 25px; background: linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(220, 38, 38, 0.1)); border-color: #dc2626;">
                    <p><strong>Interpretación Profunda:</strong> ${data.interpretacionFinalPuts.replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    </section>

    <!-- Imanes de Precio -->
    ${imanesCards ? `
    <section class="magnets-section">
        <div class="section-container">
            <div class="section-header">
                <div class="section-icon magnets">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <div>
                    <h2 class="section-title">Imanes de Precio (Open Interest y Barreras Técnicas)</h2>
                    <p class="section-subtitle">Zonas de Atracción y Repulsión</p>
                </div>
            </div>

            ${data.introduccionImanesPrecio ? `
            <div class="insight-card" style="margin-bottom: 25px;">
                <p>${data.introduccionImanesPrecio.replace(/\n/g, '</p><p>')}</p>
            </div>
            ` : ''}
            
            <div class="magnets-grid">
                ${imanesCards}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Volatilidad Histórica -->
    ${volatilidadSection}

    <!-- Concepto del Día -->
    ${conceptoDelDiaHtml}

    <!-- Conclusión -->
    ${conclusionHtml}

</div>
<!-- FIN INFORME OPCIONES ESTÁNDAR 2.0 -->`
}
