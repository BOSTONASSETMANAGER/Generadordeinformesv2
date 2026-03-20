<!-- INFORME OPCIONES ESTÁNDAR 2.0 - GGAL -->
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
            <h1 class="hero-title">Derivados Financieros – GGAL</h1>
            <p class="hero-subtitle">Fecha del Informe:  19 de Marzo de 2026 | Vencimiento OPEX:  17 de abril de 2026 </p>
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
                        <span class="kpi-value"> 19 de Marzo de 2026</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Vencimiento Opex</span>
                        <span class="kpi-value"> 17 de abril de 2026 </span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Precio Spot Cierre</span>
                        <span class="kpi-value"> $6410</span>
                    </div>
                </div>
                <div class="kpi-card highlight-positive">
                    <div class="kpi-icon success">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Variación</span>
                        <span class="kpi-value success">+3,98%</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contexto de Mercado / Tesis Central -->
    
    <section class="context-section">
        <div class="section-container">
            <div class="context-card">
                <div class="context-header">
                    <div class="context-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <h2 class="context-title">Contexto de Mercado</h2>
                </div>
                <p>La sesión se ha caracterizado por una volatilidad extrema impulsada por factores geopolíticos,</p><p>operando en un entorno de "risk-off" global pero con un notable "outperformance" de los</p><p>activos energéticos y financieros argentinos.</p><p>La jornada del 19 de marzo de 2026 ha estado marcada por un recrudecimiento crítico del</p><p>conflicto en Medio Oriente, lo que ha transformado la dinámica de precios en los mercados de</p><p>energía y, por extensión, en el sector financiero argentino. Los ataques dirigidos contra</p><p>infraestructura energética en Irán, específicamente en el campo de gas South Pars, han</p><p>provocado una respuesta militar y diplomática que ha puesto en vilo el suministro global de</p><p>hidrocarburos. Esta situación ha generado un shock de oferta que ha impulsado el precio del</p><p>petróleo Brent a superar la barrera de los USD 110 por barril, alcanzando máximos de USD 119</p><p>durante la mañana.</p><p>SECCION PRE: NOTICIAS DEL DIA</p><p>Argentina ha emergido como un actor con resiliencia táctica. Mientras las bolsas europeas y</p><p>Wall Street operaban en rojo con caídas superiores al 2%, el S&P Merval logró un avance del</p><p>+2,78% en pesos, impulsado principalmente por los títulos vinculados al sector petrolero. El</p><p>ADR de YPF ascendió un 5,3% en Nueva York, lo que arrastró positivamente a GGAL ante la</p><p>percepción de que el país se encuentra geográficamente aislado del conflicto y posee</p><p>recursos energéticos estratégicos (Vaca Muerta) que actúan como cobertura inflacionaria</p><p>global.</p><p>En el ámbito local, tres noticias fundamentales han influido en la formación de precios de</p><p>GGAL y sus derivados:</p><p>1. Distribución de Utilidades Bancarias: El BCRA oficializó la Comunicación A8410,</p><p>permitiendo a las entidades financieras distribuir hasta el 60% de las utilidades de 2025</p><p>en tres cuotas. Esta medida inyecta valor directo al accionista de GGAL, compensando</p><p>las pérdidas contables reportadas en trimestres previos.</p><p>2. Financiamiento Soberano: El ministro Luis Caputo anunció en un simposio de IAEF que</p><p>el Gobierno tiene identificado el financiamiento necesario para cubrir los próximos tres </p><p>vencimientos de capital, lo que busca calmar el mercado de bonos a pesar de que el riesgo país </p><p>se mantuvo por encima de los 600 puntos básicos.</p><p>3. Perspectiva Inflacionaria: El REM de marzo arrojó una proyección de inflación del 2,5%</p><p>mensual, mientras que el dato oficial de febrero se situó en 2,9%. El mercado ajusta sus </p><p>tasas internas de retorno (TIR) ante un proceso de desinflación que parece más lento delo prometido inicialmente por el Ejecutivo.</p><p></p>
            </div>
        </div>
    </section>
    

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
            
            
            <div class="insight-card">
                <p>El flujo operativo en el mercado de opciones de GGAL durante la sesión ha mostrado un</p><p>comportamiento de "barbecho institucional", donde se observa una acumulación estratégica</p><p>de posiciones en strikes específicos, preparándose para la zona de mayor aceleración de la</p><p>curva de tiempo (Theta).</p>
            </div>
            

            
            <div class="volume-summary">
                
                <div class="volume-item calls">
                    <span class="volume-label">Volumen Total CALLS</span>
                    <span class="volume-value"> $2.931.931.343</span>
                </div>
                
                
                <div class="volume-item puts">
                    <span class="volume-label">Volumen Total PUTS</span>
                    <span class="volume-value">$3.473.327.575</span>
                </div>
                
                
            </div>
            

            
            <div class="insight-card">
                <p>La actividad de la rueda revela una presión vendedora en los Puts (venta de volatilidad) y una</p><p>rotación agresiva hacia Calls fuera del dinero (OTM) que actúan como apuestas de ruptura</p><p>alcista. El volumen total operado en CALLS fue de $2.931.931.343, mientras que en PUTS</p><p>ascendió a $3.473.327.575. Este volumen superior en Puts, sin embargo, se explica por el</p><p>colapso de las primas ante la subida del subyacente, lo que generó transacciones masivas de</p><p>cierre de coberturas.</p>
            </div>
            
        </div>
    </section>

    <!-- Mapa de Calor - Tablas -->
    <section class="heatmap-section">
        <div class="section-container">
            <!-- Calls Analysis -->
            
            <div class="analysis-block">
                <div class="analysis-header calls">
                    <div class="analysis-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <h4>Mapa de Calor - CALLS</h4>
                </div>
                
                
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
                            
      <tr class="row-highlight">
        <td><span class="strike-tag otm">GFGC69029A</span></td>
        <td class="price-cell">$1.004.400.417</td>
        <td><span class="change-badge positive"> 7,7%</span></td>
        <td class="interpretation-cell"> Es el líder indiscutido de volumen nominal con
$1.004.400.417. Al cerrar la acción en $6.410, esta base se encuentra aproximadamente
un 7,7% OTM. El masivo volumen de 74.971 lotes indica una apuesta direccional de alto
apalancamiento ante la expectativa de que el papel rompa la barrera de los $7.000 en el
corto plazo</td>
      </tr>
    
      <tr>
        <td><span class="strike-tag otm">GFGC63747A </span></td>
        <td class="price-cell"> $673.273.045</td>
        <td><span class="change-badge positive">+38,69%</span></td>
        <td class="interpretation-cell">Con un volumen de $673.273.045, actúa como el campo
de batalla ATM (At The Money). El cierre de la prima en $415 (+38,69%) refleja un
incremento violento de la demanda institucional.</td>
      </tr>
    
      <tr>
        <td><span class="strike-tag otm">GFGC61262A</span></td>
        <td class="price-cell">$347.580.417</td>
        <td><span class="change-badge positive">N/D</span></td>
        <td class="interpretation-cell">Registro de $347.580.417. Esta base ITM (In The Money)
funciona como sustituto de capital; los operadores compran este Call para replicar la
acción con apalancamiento, liberando liquidez para caución.</td>
      </tr>
    
      <tr>
        <td><span class="strike-tag otm">GFGC65747A</span></td>
        <td class="price-cell"> $232.228.453</td>
        <td><span class="change-badge positive">+49,19%</span></td>
        <td class="interpretation-cell"> Operó $232.228.453 con una suba de prima del +49,19%.
Es la base con mayor incremento porcentual en valor intrínseco/temporal de la jornada,
indicando una aceleración del Delta.</td>
      </tr>
    
                        </tbody>
                    </table>
                </div>

                
            </div>
            

            <!-- Puts Analysis -->
            
            <div class="analysis-block">
                <div class="analysis-header puts">
                    <div class="analysis-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                    </div>
                    <h4>Análisis del Flujo en PUTS</h4>
                </div>
                
                
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
                            
      <tr>
        <td><span class="strike-tag put">GFGV61262A </span></td>
        <td class="price-cell">$1.069.763.629</td>
        <td><span class="change-badge negative">-40,47%</span></td>
        <td class="interpretation-cell">Es la base más operada de toda la matriz con un volumen
nominal de $1.069.763.629. La caída de la prima del -40,47% con el papel subiendo solo
un 4% indica una contracción masiva de la Volatilidad Implícita (VI). Los lanzadores están
inundando esta base de oferta, asumiendo que los $6.100 son un piso infranqueable.</td>
      </tr>
    
      <tr>
        <td><span class="strike-tag put">GFGV63747A</span></td>
        <td class="price-cell"> $1.029.087.786</td>
        <td><span class="change-badge negative"> -36,11%</span></td>
        <td class="interpretation-cell">Volumen de $1.029.087.786. El colapso del -36,11% en la
prima muestra el desarme de coberturas por parte de quienes esperaban una corrección
ante la tensión global.</td>
      </tr>
    
      <tr>
        <td><span class="strike-tag put">GFGV65747A</span></td>
        <td class="price-cell">$737.435.473</td>
        <td><span class="change-badge negative">-33,82%</span></td>
        <td class="interpretation-cell">Operó $737.435.473. Actúa como el nivel de protección
inmediata. Su caída del -33,82% confirma el sesgo alcista de la jornada.</td>
      </tr>
    
                        </tbody>
                    </table>
                </div>

                
            </div>
            
        </div>
    </section>

    <!-- Imanes de Precio -->
    
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

            
            <div class="insight-card" style="margin-bottom: 25px;">
                <p>Aunque la matriz no desglosa el Open Interest (OI) consolidado, la acumulación de volumen</p><p>nominal en bases específicas permite identificar las zonas de fricción o "murallas" que actuarán</p><p>como imanes para el precio.</p>
            </div>
            
            
            <div class="magnets-grid">
                
        <div class="magnet-card resistance">
          <div class="magnet-header">
            <div class="magnet-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
            <span class="magnet-type">Resistencia Dinámica</span>
          </div>
          <div class="magnet-price">$6.900</div>
          <p class="magnet-desc"> El volumen superior a los $1.000
millones en la base GFGC69029A genera una zona de fuerte resistencia. Si el precio spot
se acerca a este nivel, los lanzadores deberán recomprar opciones para cubrir su Delta
negativo, lo que podría provocar un "Gamma Squeeze".
</p>
        </div>
      
        <div class="magnet-card support">
          <div class="magnet-header">
            <div class="magnet-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
            <span class="magnet-type"> Soporte</span>
          </div>
          <div class="magnet-price"> $6.100 - $6.150</div>
          <p class="magnet-desc">La confluencia de volumen en los
strikes 6126 (tanto en Calls como en Puts) marca el piso psicológico del mercado. Este
nivel coincide con la zona de soporte técnico observada en los gráficos intradiarios.</p>
        </div>
      
        <div class="magnet-card neutral">
          <div class="magnet-header">
            <div class="magnet-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>
            <span class="magnet-type">Vacío de Liquidez</span>
          </div>
          <div class="magnet-price">$8.000</div>
          <p class="magnet-desc">Por encima de la base 7726, el volumen cae
drásticamente (ej. GFGC88262A solo operó $4,1M). Esto indica que, a pesar del
optimismo, el mercado no está priceando un movimiento parabólico de corto plazo más
allá del 15% del valor actual.</p>
        </div>
      
            </div>
        </div>
    </section>
    

    <!-- Volatilidad Histórica -->
    
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
              
                <tr>
                  <td>HV (3d)</td>
                  <td class="price-cell">27,21%</td>
                  <td>Compresión extrema; inminencia de movimiento direccional</td>
                </tr>
              
                <tr>
                  <td>HV (5d)</td>
                  <td class="price-cell">44,44%</td>
                  <td>Nivel de normalización de corto plazo</td>
                </tr>
              
                <tr>
                  <td>HV (20d)</td>
                  <td class="price-cell">45,38%</td>
                  <td>Volatilidad de régimen actual</td>
                </tr>
              
                <tr>
                  <td>HV (40d) </td>
                  <td class="price-cell">49,74%</td>
                  <td>Pico de volatilidad histórico reciente</td>
                </tr>
              
                <tr>
                  <td>HV (90d)</td>
                  <td class="price-cell">45,19%</td>
                  <td>Media de largo plazo</td>
                </tr>
              
            </tbody>
          </table>
        </div>
        
        <div class="insight-card" style="margin-top: 20px;">
          <p>La brecha entre la HV (3d) del 27,21% y la HV (40d) del 49,74% sugiere que el activo ha pasado
por una fase de consolidación lateral que hoy parece haber roto al alza.</p>
        </div>
        
      </div>
    </section>
  

    <!-- Concepto del Día -->
    
    <section class="concept-section">
      <div class="section-container">
        <div class="concept-card">
          <div class="concept-header">
            <div class="concept-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Concepto del Día
            </div>
            <h3 class="concept-title">"War-Risk IV Skew" e Inversión de Volatilidad</h3>
          </div>
          <p class="concept-intro">En la sesión de hoy se ha observado un fenómeno técnico de libro de texto: la Inversión del
Skew de Volatilidad ante Riesgo Geopolítico.
Normalmente, ante un riesgo de guerra, los Puts se encarecen (la curva de VI tiene pendiente
negativa). Sin embargo, hoy hemos visto que la Volatilidad Implícita (VI) de los Calls OTM se ha
mantenido en niveles elevados o ha subido (ej. GFGC11775A con VI de 81,88%), mientras que la
VI de los Puts ha colapsado ante la subida del spot.</p>
          <div class="highlight-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p><strong>Implicancia:</strong> Este comportamiento sugiere que el mercado local está utilizando a GGAL como un "Call de
Energía" sintético. Los inversores prefieren pagar una prima de volatilidad más alta para no
quedar fuera de una posible subida explosiva (impulsada por el petróleo) que protegerse
contra una baja. Este sesgo alcista extremo en la volatilidad es una señal de que el mercado
considera que el riesgo de "quedarse afuera" es mayor que el riesgo de una corrección
sistémica.</p>
          </div>
        </div>
      </div>
    </section>
  

    <!-- Conclusión -->
    
    <section class="conclusion-section">
      <div class="section-container">
        <div class="context-card">
          <div class="context-header">
            <div class="context-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h2 class="context-title">Conclusión</h2>
          </div>
          <div style="line-height: 1.8;">Basado en el análisis de la matriz de opciones y el contexto macro-geopolítico, se establecen<br>los siguientes escenarios para las próximas 48-72 horas de operación:<br>Escenario Base (Alcista - Continuidad):<br>● Mecánica: Si el ADR de GGAL consolida por encima de los USD 44,00 y el Brent se<br>mantiene firme, el spot local buscará el testeo de la "Muralla de los $6.900".<br>● Impacto Opciones: Las bases OTM (6902, 7174) verán una expansión agresiva de sus<br>primas por incremento de Gamma.<br>● Nivel de Control: $6.440 (Máximo de hoy). Superar este nivel con volumen creciente<br>validará la ruptura.<br>Escenario de Corrección (Tensión Global):<br>● Mecánica: Una desescalada inesperada en Medio Oriente que provoque la caída del<br>petróleo podría arrastrar al Merval.<br>● Impacto Opciones: Los Puts verán una recuperación violenta de VI (mean reversion),<br>encareciendo las coberturas.<br>● Nivel de Soporte: $6.150 (Base 6126). Este es el nivel donde se encuentra la mayor<br>defensa de los lanzadores de Puts.<br>Recomendación Estratégica:<br>Dada la alta Volatilidad Implícita (VI) en las bases OTM alcistas (superior al 80% en algunos<br>casos), no se recomienda la compra directa de lotes ("puntas"), ya que el decaimiento temporal<br>(Theta) será muy agresivo a medida que se acerque el vencimiento de abril. La estrategia<br>óptima en este entorno de " War-Risk" es el armado de Bull Call Spreads (ej. comprar base<br>6374 y lanzar base 6902) para financiar la volatilidad y posicionarse ante la posible ruptura de<br>los $7.000.</div>
        </div>
      </div>
    </section>
  

</div>
<!-- FIN INFORME OPCIONES ESTÁNDAR 2.0 -->