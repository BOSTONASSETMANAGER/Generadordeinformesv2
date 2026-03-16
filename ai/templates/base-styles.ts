/**
 * Complete base CSS for all renderer components.
 * 
 * Uses {{ROOT}} as a placeholder for the root class, which gets replaced
 * at render time with the actual root class (e.g. ggal-analisis-estatico).
 *
 * This guarantees every CSS class the renderer can emit has a definition,
 * regardless of which template the pipeline selects.
 * Template-specific overrides still win because the template's <style> block
 * is injected AFTER this base CSS.
 */

export function getBaseCSS(rootClass: string): string {
  return BASE_CSS_TEMPLATE.replace(/\{\{ROOT\}\}/g, rootClass)
}

const BASE_CSS_TEMPLATE = `<style>
/* ═══ Base CSS for Premium Report Renderer ═══ */
body { overflow-x: hidden; }

.{{ROOT}} {
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

.{{ROOT}} * { margin: 0; padding: 0; box-sizing: border-box; }

.{{ROOT}} .section-container { max-width: 1200px; margin: 0 auto; padding: 0 30px; }

/* ─── Hero ─── */
.{{ROOT}} .hero-section {
    background: linear-gradient(135deg, var(--saas-primary) 0%, var(--saas-accent) 100%);
    padding: 60px 0 50px; width: 100vw; margin-left: calc(-50vw + 50%); margin-top: -60px; color: white;
}
.{{ROOT}} .hero-container { max-width: 1200px; margin: 0 auto; padding: 0 30px; }
.{{ROOT}} .back-link { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.9); text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-bottom: 20px; transition: all 0.2s ease; }
.{{ROOT}} .back-link:hover { color: white; transform: translateX(-3px); }
.{{ROOT}} .hero-title { font-size: 2rem; font-weight: 700; line-height: 1.3; color: white; margin-bottom: 8px; }
.{{ROOT}} .hero-subtitle { font-size: 1rem; opacity: 0.9; color: white; }

/* ─── KPIs ─── */
.{{ROOT}} .kpis-section { background: white; padding: 40px 0; width: 100vw; margin-left: calc(-50vw + 50%); border-bottom: 1px solid var(--saas-border); }
.{{ROOT}} .kpis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.{{ROOT}} .kpi-card { display: flex; align-items: flex-start; gap: 15px; padding: 20px; background: var(--saas-light); border-radius: 12px; border: 1px solid var(--saas-border); }
.{{ROOT}} .kpi-card.highlight { background: linear-gradient(135deg, rgba(5,150,105,0.05), rgba(5,150,105,0.1)); border-color: var(--saas-success); }
.{{ROOT}} .kpi-card.highlight-negative { background: linear-gradient(135deg, rgba(220,38,38,0.05), rgba(220,38,38,0.1)); border-color: var(--saas-danger); }
.{{ROOT}} .kpi-card.highlight-danger { background: linear-gradient(135deg, rgba(220,38,38,0.05), rgba(220,38,38,0.1)); border-color: var(--saas-danger); }
.{{ROOT}} .kpi-icon { width: 44px; height: 44px; background: linear-gradient(135deg, rgba(29,57,105,0.08), rgba(37,99,235,0.08)); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--saas-primary); flex-shrink: 0; }
.{{ROOT}} .kpi-icon.success { background: linear-gradient(135deg, rgba(5,150,105,0.1), rgba(5,150,105,0.15)); color: var(--saas-success); }
.{{ROOT}} .kpi-icon.danger { background: linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.15)); color: var(--saas-danger); }
.{{ROOT}} .kpi-content { display: flex; flex-direction: column; gap: 4px; }
.{{ROOT}} .kpi-label { font-size: 0.8rem; color: var(--saas-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
.{{ROOT}} .kpi-value { font-size: 1.1rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .kpi-value.success { color: var(--saas-success); }
.{{ROOT}} .kpi-value.danger { color: var(--saas-danger); }

/* ─── Context ─── */
.{{ROOT}} .context-section { background: var(--saas-light); padding: 40px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .context-card { background: white; border-radius: 12px; padding: 30px; border-left: 4px solid var(--saas-primary); box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .context-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.{{ROOT}} .context-icon { width: 40px; height: 40px; background: linear-gradient(135deg, rgba(29,57,105,0.08), rgba(37,99,235,0.08)); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--saas-primary); }
.{{ROOT}} .context-title { font-size: 1.2rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .context-card p { font-size: 1rem; line-height: 1.8; color: var(--saas-text); }
.{{ROOT}} .context-card strong { color: var(--saas-primary); }

/* ─── News Section & News Blocks ─── */
.{{ROOT}} .news-section { background: white; padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .news-block { background: var(--saas-light); border-radius: 12px; padding: 25px; margin-top: 20px; border-left: 4px solid var(--saas-accent); box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .news-title { font-size: 1.1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 12px; }
.{{ROOT}} .news-block p { font-size: 1rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .news-block strong { color: var(--saas-primary); }
.{{ROOT}} .news-block ul { margin-top: 12px; padding-left: 20px; }
.{{ROOT}} .news-block li { font-size: 1rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 10px; }
.{{ROOT}} .news-block li strong { color: var(--saas-primary); }

/* ─── Section Headers ─── */
.{{ROOT}} .section-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
.{{ROOT}} .section-icon { width: 50px; height: 50px; background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
.{{ROOT}} .section-icon.magnets { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.{{ROOT}} .section-title { font-size: 1.3rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 2px; }
.{{ROOT}} .section-subtitle { font-size: 0.9rem; color: var(--saas-muted); }
.{{ROOT}} .section-text { font-size: 1rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 30px; }

/* ─── Insights / Generic Section ─── */
.{{ROOT}} .insights-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }

/* ─── Analysis Blocks ─── */
.{{ROOT}} .analysis-block { background: white; border-radius: 16px; padding: 30px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(29,57,105,0.08); border: 1px solid var(--saas-border); }
.{{ROOT}} .analysis-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid var(--saas-border); }
.{{ROOT}} .analysis-header.calls { border-bottom-color: var(--saas-success); }
.{{ROOT}} .analysis-header.puts { border-bottom-color: var(--saas-danger); }
.{{ROOT}} .analysis-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.{{ROOT}} .analysis-header.calls .analysis-icon { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .analysis-header.puts .analysis-icon { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .analysis-header h4 { flex: 1; font-size: 1.1rem; font-weight: 600; color: var(--saas-primary); }
.{{ROOT}} .analysis-intro { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 20px; }
.{{ROOT}} .analysis-intro strong { color: var(--saas-primary); }

/* ─── Flow Badge ─── */
.{{ROOT}} .flow-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.{{ROOT}} .flow-badge.bullish { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .flow-badge.bearish { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .flow-badge.neutral { background: rgba(100,116,139,0.1); color: var(--saas-muted); }

/* ─── Flow Events ─── */
.{{ROOT}} .flow-event { background: var(--saas-light); border-radius: 12px; padding: 20px; margin-top: 15px; border-left: 3px solid var(--saas-accent); }
.{{ROOT}} .flow-event h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 10px; }
.{{ROOT}} .flow-event p { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .flow-event strong { color: var(--saas-primary); }
.{{ROOT}} .flow-event.highlight-danger { border-left-color: var(--saas-danger); background: linear-gradient(135deg, rgba(220,38,38,0.03), rgba(220,38,38,0.06)); }

/* ─── Tables ─── */
.{{ROOT}} .table-container { overflow-x: auto; }
.{{ROOT}} .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.{{ROOT}} .data-table thead { background: var(--saas-primary); }
.{{ROOT}} .data-table.puts-table thead { background: linear-gradient(135deg, #991b1b, var(--saas-danger)); }
.{{ROOT}} .data-table th { padding: 14px 16px; text-align: left; color: white; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.3px; }
.{{ROOT}} .data-table td { padding: 16px; border-bottom: 1px solid var(--saas-border); vertical-align: top; }
.{{ROOT}} .data-table tr:last-child td { border-bottom: none; }
.{{ROOT}} .data-table tr:hover { background: rgba(37,99,235,0.02); }
.{{ROOT}} .row-highlight { background: rgba(5,150,105,0.04) !important; }
.{{ROOT}} .oi-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.{{ROOT}} .oi-table thead { background: var(--saas-primary); }
.{{ROOT}} .oi-table th { padding: 14px 16px; text-align: left; color: white; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.3px; }
.{{ROOT}} .oi-table td { padding: 16px; border-bottom: 1px solid var(--saas-border); vertical-align: top; }

/* ─── Strike Tags ─── */
.{{ROOT}} .strike-tag { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; font-family: 'Consolas', monospace; }
.{{ROOT}} .strike-tag.itm { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .strike-tag.atm { background: rgba(37,99,235,0.1); color: var(--saas-accent); }
.{{ROOT}} .strike-tag.otm { background: rgba(245,158,11,0.1); color: var(--saas-warning); }
.{{ROOT}} .strike-tag.put { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .strike-tag.deep-otm { background: rgba(100,116,139,0.08); color: var(--saas-muted); }

/* ─── Price / Change / Volume Badges ─── */
.{{ROOT}} .price-cell { font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .change-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; }
.{{ROOT}} .change-badge.positive { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .change-badge.negative { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .volume-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; }
.{{ROOT}} .volume-badge.high { background: linear-gradient(135deg, rgba(29,57,105,0.1), rgba(37,99,235,0.1)); color: var(--saas-primary); }
.{{ROOT}} .volume-badge.medium { background: rgba(100,116,139,0.1); color: var(--saas-muted); }
.{{ROOT}} .volume-badge.low { background: rgba(100,116,139,0.05); color: var(--saas-muted); }
.{{ROOT}} .interpretation-cell { font-size: 0.9rem; line-height: 1.6; color: var(--saas-text); max-width: 400px; }
.{{ROOT}} .interpretation-cell strong { color: var(--saas-primary); }

/* ─── Insight Cards ─── */
.{{ROOT}} .insight-card { background: linear-gradient(135deg, rgba(5,150,105,0.05), rgba(16,185,129,0.08)); border: 1px solid var(--saas-success); border-radius: 12px; padding: 25px; margin-bottom: 25px; }
.{{ROOT}} .insight-card.bearish { background: linear-gradient(135deg, rgba(220,38,38,0.05), rgba(220,38,38,0.08)); border: 1px solid var(--saas-danger); }
.{{ROOT}} .insight-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--saas-success); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 15px; }
.{{ROOT}} .insight-badge.bullish { background: var(--saas-success); }
.{{ROOT}} .insight-badge.bearish { background: var(--saas-danger); }
.{{ROOT}} .insight-card p { font-size: 1rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .insight-card strong { color: var(--saas-primary); }
.{{ROOT}} .insight-card ul { margin-top: 8px; }
.{{ROOT}} .insight-card li { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .insight-card li strong { color: var(--saas-primary); }

/* ─── Volume Summary ─── */
.{{ROOT}} .volume-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.{{ROOT}} .volume-item { background: var(--saas-light); padding: 20px; border-radius: 12px; border-left: 4px solid; text-align: center; }
.{{ROOT}} .volume-item.calls { border-left-color: var(--saas-success); }
.{{ROOT}} .volume-item.puts { border-left-color: var(--saas-danger); }
.{{ROOT}} .volume-item.ratio { border-left-color: var(--saas-accent); }
.{{ROOT}} .volume-label { display: block; font-size: 0.8rem; color: var(--saas-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; }
.{{ROOT}} .volume-value { font-size: 1.2rem; font-weight: 700; color: var(--saas-primary); }

/* ─── Heatmap Section ─── */
.{{ROOT}} .heatmap-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }

/* ─── Volatility / Metrics Section ─── */
.{{ROOT}} .volatility-section { background: white; padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .metrics-section { background: white; padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }

/* ─── Metrics Grid (Volatility cards) ─── */
.{{ROOT}} .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.{{ROOT}} .metric-card { background: var(--saas-light); border-radius: 12px; padding: 25px; border: 1px solid var(--saas-border); }
.{{ROOT}} .metric-card h4 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }
.{{ROOT}} .metric-card h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }
.{{ROOT}} .metric-card ul { list-style: disc; margin-left: 20px; }
.{{ROOT}} .metric-card li { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 10px; }
.{{ROOT}} .volatility-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.{{ROOT}} .vol-card { background: var(--saas-light); border-radius: 12px; padding: 25px; border: 1px solid var(--saas-border); }
.{{ROOT}} .vol-card h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }
.{{ROOT}} .vol-card ul { list-style: disc; margin-left: 20px; }
.{{ROOT}} .vol-card li { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 10px; }
.{{ROOT}} .vol-list { list-style: disc; margin-left: 20px; }
.{{ROOT}} .vol-list li { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 10px; }

/* ─── Skew / Ranges Grid ─── */
.{{ROOT}} .skew-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.{{ROOT}} .skew-item { background: white; border-radius: 12px; padding: 25px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .skew-item.puts { border-left-color: var(--saas-danger); }
.{{ROOT}} .skew-item.calls { border-left-color: var(--saas-success); }
.{{ROOT}} .skew-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--saas-muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; }
.{{ROOT}} .skew-value { display: block; font-size: 1rem; font-weight: 600; color: var(--saas-primary); margin-bottom: 10px; }
.{{ROOT}} .skew-desc { font-size: 0.9rem; line-height: 1.6; color: var(--saas-text); }
.{{ROOT}} .ranges-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.{{ROOT}} .range-card { background: white; border-radius: 12px; padding: 25px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .range-card.puts { border-left-color: var(--saas-danger); }
.{{ROOT}} .range-card.calls { border-left-color: var(--saas-success); }
.{{ROOT}} .range-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--saas-muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; }
.{{ROOT}} .range-value { display: block; font-size: 1rem; font-weight: 600; color: var(--saas-primary); margin-bottom: 10px; }
.{{ROOT}} .range-desc { font-size: 0.9rem; line-height: 1.6; color: var(--saas-text); }

/* ─── Highlight Box ─── */
.{{ROOT}} .highlight-box { display: flex; align-items: flex-start; gap: 15px; padding: 20px; background: linear-gradient(135deg, rgba(5,150,105,0.08), rgba(16,185,129,0.12)); border: 1px solid var(--saas-success); border-radius: 12px; }
.{{ROOT}} .highlight-box p { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .highlight-box strong { color: var(--saas-primary); }
.{{ROOT}} .highlight-box.warning { background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.12)); border: 1px solid var(--saas-warning); color: var(--saas-warning); }
.{{ROOT}} .highlight-box svg { flex-shrink: 0; margin-top: 2px; }

/* ─── Subsection Title ─── */
.{{ROOT}} .subsection-main-title { font-size: 1.15rem; font-weight: 700; color: var(--saas-primary); margin: 30px 0 15px; }
.{{ROOT}} .subsection-title { font-size: 1.15rem; font-weight: 700; color: var(--saas-primary); margin: 30px 0 15px; }

/* ─── Magnets Grid ─── */
.{{ROOT}} .magnets-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .magnets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.{{ROOT}} .magnet-card { background: white; border-radius: 12px; padding: 25px; border: 1px solid var(--saas-border); }
.{{ROOT}} .magnet-card.support { border-left: 4px solid var(--saas-success); }
.{{ROOT}} .magnet-card.resistance { border-left: 4px solid var(--saas-danger); }
.{{ROOT}} .magnet-card.neutral { border-left: 4px solid var(--saas-accent); }
.{{ROOT}} .magnet-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.{{ROOT}} .magnet-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.{{ROOT}} .magnet-card.support .magnet-icon { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .magnet-card.resistance .magnet-icon { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .magnet-card.neutral .magnet-icon { background: rgba(37,99,235,0.1); color: var(--saas-accent); }
.{{ROOT}} .magnet-type { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; color: var(--saas-muted); }
.{{ROOT}} .magnet-price { font-size: 1.3rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 4px; }
.{{ROOT}} .magnet-name { font-size: 0.9rem; font-weight: 600; color: var(--saas-text); margin-bottom: 10px; }
.{{ROOT}} .magnet-desc { font-size: 0.9rem; line-height: 1.6; color: var(--saas-text); }

/* ─── Greeks Grid ─── */
.{{ROOT}} .greeks-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .greeks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
.{{ROOT}} .greek-card { background: white; border-radius: 12px; padding: 25px; border: 1px solid var(--saas-border); }
.{{ROOT}} .greek-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.{{ROOT}} .greek-symbol { width: 40px; height: 40px; background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.{{ROOT}} .greek-name { font-size: 1rem; font-weight: 600; color: var(--saas-primary); }
.{{ROOT}} .greek-desc { font-size: 0.95rem; line-height: 1.7; color: var(--saas-text); }
.{{ROOT}} .greek-desc strong { color: var(--saas-primary); }

/* ─── Concept Section / Card ─── */
.{{ROOT}} .concept-section { background: white; padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .concept-card { background: var(--saas-light); border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(29,57,105,0.08); }
.{{ROOT}} .concept-header { margin-bottom: 20px; }
.{{ROOT}} .concept-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 15px; }
.{{ROOT}} .concept-title { font-size: 1.4rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .concept-intro { font-size: 1rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 20px; }
.{{ROOT}} .concept-intro strong { color: var(--saas-primary); }

/* ─── Mechanism Block (inside Concept) ─── */
.{{ROOT}} .mechanism-block { background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid var(--saas-border); }
.{{ROOT}} .mechanism-title { font-size: 1.1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 20px; }
.{{ROOT}} .steps-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
.{{ROOT}} .step-card { display: flex; gap: 15px; padding: 20px; background: var(--saas-light); border-radius: 12px; border: 1px solid var(--saas-border); }
.{{ROOT}} .step-number { width: 32px; height: 32px; background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
.{{ROOT}} .step-card p { font-size: 0.95rem; line-height: 1.6; color: var(--saas-text); }
.{{ROOT}} .step-card strong { color: var(--saas-primary); }
.{{ROOT}} .step-card.full-width { grid-column: 1 / -1; }

/* ─── Params Grid ─── */
.{{ROOT}} .params-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
.{{ROOT}} .param-item { background: var(--saas-light); padding: 15px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
.{{ROOT}} .param-label { font-size: 0.9rem; color: var(--saas-text); font-weight: 500; }
.{{ROOT}} .param-value { font-size: 1rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .parameters-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
.{{ROOT}} .parameter-item { background: var(--saas-light); padding: 15px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
.{{ROOT}} .parameter-label { font-size: 0.9rem; color: var(--saas-text); font-weight: 500; }
.{{ROOT}} .parameter-value { font-size: 1rem; font-weight: 700; color: var(--saas-primary); }

/* ─── Strategies Section ─── */
.{{ROOT}} .strategies-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .strategy-section { background: var(--saas-light); padding: 50px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .strategy-card { background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(29,57,105,0.08); border: 2px solid var(--saas-primary); }
.{{ROOT}} .strategy-header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--saas-border); }
.{{ROOT}} .strategy-header h3 { font-size: 1.3rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .strategy-header h4 { font-size: 1.2rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .strategy-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 10px; }
.{{ROOT}} .strategy-badge.bearish { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .strategy-badge.neutral { background: rgba(100,116,139,0.1); color: var(--saas-muted); }
.{{ROOT}} .strategy-badge.bullish { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .strategy-objective { font-size: 1rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 20px; }
.{{ROOT}} .strategy-desc { font-size: 1rem; line-height: 1.7; color: var(--saas-text); margin-bottom: 25px; }
.{{ROOT}} .strategy-structure { background: var(--saas-light); border-radius: 12px; padding: 25px; margin-bottom: 20px; }
.{{ROOT}} .strategy-structure h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }
.{{ROOT}} .strategy-structure ul { list-style: none; }
.{{ROOT}} .strategy-structure li { padding: 10px 0; border-bottom: 1px solid var(--saas-border); font-size: 0.95rem; line-height: 1.6; color: var(--saas-text); }
.{{ROOT}} .strategy-structure li:last-child { border-bottom: none; }
.{{ROOT}} .strategy-structure li strong { color: var(--saas-primary); }
.{{ROOT}} .strategy-analysis { background: var(--saas-light); border-radius: 12px; padding: 25px; margin-bottom: 20px; }
.{{ROOT}} .strategy-analysis h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }
.{{ROOT}} .strategy-metrics { background: var(--saas-light); border-radius: 12px; padding: 25px; margin-bottom: 20px; }
.{{ROOT}} .strategy-metrics h5 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 15px; }

/* ─── Payoff / Metric Items ─── */
.{{ROOT}} .payoff-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--saas-border); }
.{{ROOT}} .payoff-item:last-child { border-bottom: none; }
.{{ROOT}} .payoff-label { font-size: 0.9rem; color: var(--saas-text); }
.{{ROOT}} .payoff-value { font-size: 1rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--saas-border); }
.{{ROOT}} .metric-row:last-child { border-bottom: none; }
.{{ROOT}} .metric-label { font-size: 0.9rem; color: var(--saas-text); }
.{{ROOT}} .metric-value { font-size: 1rem; font-weight: 700; color: var(--saas-primary); }

/* ─── Strategy Legs (legacy) ─── */
.{{ROOT}} .strategy-legs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px; }
.{{ROOT}} .leg { border-radius: 12px; padding: 20px; border: 1px solid var(--saas-border); }
.{{ROOT}} .leg.sell { background: linear-gradient(135deg, rgba(220,38,38,0.05), rgba(220,38,38,0.08)); border-color: var(--saas-danger); }
.{{ROOT}} .leg.buy { background: linear-gradient(135deg, rgba(5,150,105,0.05), rgba(5,150,105,0.08)); border-color: var(--saas-success); }

/* ─── Conclusions Section ─── */
.{{ROOT}} .conclusions-section { background: var(--saas-light); padding: 50px 0 80px; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .conclusion-section { background: var(--saas-light); padding: 50px 0 80px; width: 100vw; margin-left: calc(-50vw + 50%); }
.{{ROOT}} .conclusion-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.{{ROOT}} .conclusion-item { display: flex; gap: 15px; padding: 20px; background: white; border-radius: 12px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .conclusion-item.bullish { border-left-color: var(--saas-success); }
.{{ROOT}} .conclusion-item.neutral { border-left-color: var(--saas-accent); }
.{{ROOT}} .conclusion-item.warning { border-left-color: var(--saas-warning); }
.{{ROOT}} .conclusion-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.{{ROOT}} .conclusion-item.bullish .conclusion-icon { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .conclusion-item.neutral .conclusion-icon { background: rgba(37,99,235,0.1); color: var(--saas-accent); }
.{{ROOT}} .conclusion-item.warning .conclusion-icon { background: rgba(245,158,11,0.1); color: var(--saas-warning); }
.{{ROOT}} .conclusion-content h4 { font-size: 1rem; font-weight: 700; color: var(--saas-primary); margin-bottom: 8px; }
.{{ROOT}} .conclusion-content p { font-size: 0.9rem; line-height: 1.6; color: var(--saas-text); }

/* ─── Conclusion Card (wrap variant) ─── */
.{{ROOT}} .conclusion-card { background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); border-radius: 16px; padding: 30px; color: white; }
.{{ROOT}} .conclusion-block { background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent)); border-radius: 16px; padding: 30px; color: white; }
.{{ROOT}} .conclusion-header { margin-bottom: 20px; }
.{{ROOT}} .conclusion-title { font-size: 1.3rem; font-weight: 700; color: white; }
.{{ROOT}} .conclusion-heading { font-size: 1.3rem; font-weight: 700; color: white; }
.{{ROOT}} .conclusion-text { font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.9); margin-bottom: 15px; }
.{{ROOT}} .conclusion-desc { font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.9); margin-bottom: 15px; }
.{{ROOT}} .data-synthesis { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-top: 20px; }
.{{ROOT}} .data-synthesis h5 { color: white; margin-bottom: 12px; }
.{{ROOT}} .synthesis-list { list-style: disc; margin-left: 20px; }
.{{ROOT}} .synthesis-list li { color: rgba(255,255,255,0.9); margin-bottom: 8px; font-size: 0.95rem; }
.{{ROOT}} .synthesis-block { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-top: 20px; }
.{{ROOT}} .key-data { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-top: 20px; }
.{{ROOT}} .key-data-list { list-style: disc; margin-left: 20px; }
.{{ROOT}} .key-data-list li { color: rgba(255,255,255,0.9); margin-bottom: 8px; font-size: 0.95rem; }
.{{ROOT}} .final-message { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 15px 20px; margin-top: 20px; font-size: 1rem; line-height: 1.6; color: white; }
.{{ROOT}} .final-verdict { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 15px 20px; margin-top: 20px; font-size: 1rem; line-height: 1.6; color: white; }
.{{ROOT}} .conclusion-verdict { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 15px 20px; margin-top: 20px; font-size: 1rem; line-height: 1.6; color: white; }

/* ─── Levels Grid (Conclusion variant) ─── */
.{{ROOT}} .levels-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.{{ROOT}} .level-card { display: flex; align-items: center; gap: 15px; padding: 20px; background: white; border-radius: 12px; border-left: 4px solid; box-shadow: 0 2px 8px rgba(29,57,105,0.06); }
.{{ROOT}} .level-card.resistance { border-left-color: var(--saas-danger); }
.{{ROOT}} .level-card.support { border-left-color: var(--saas-success); }
.{{ROOT}} .level-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.{{ROOT}} .level-card.resistance .level-icon { background: rgba(220,38,38,0.1); color: var(--saas-danger); }
.{{ROOT}} .level-card.support .level-icon { background: rgba(5,150,105,0.1); color: var(--saas-success); }
.{{ROOT}} .level-content { display: flex; flex-direction: column; gap: 4px; }
.{{ROOT}} .level-label { font-size: 0.8rem; color: var(--saas-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.{{ROOT}} .level-value { font-size: 0.95rem; color: var(--saas-text); line-height: 1.5; }
.{{ROOT}} .level-value strong { color: var(--saas-primary); }

/* ─── Metrics Operation (legacy) ─── */
.{{ROOT}} .metrics-operation { display: grid; gap: 15px; }
.{{ROOT}} .metric-op { background: var(--saas-light); padding: 15px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
.{{ROOT}} .metric-op-label { font-size: 0.9rem; color: var(--saas-text); font-weight: 500; }
.{{ROOT}} .metric-op-value { font-size: 1rem; font-weight: 700; color: var(--saas-primary); }
.{{ROOT}} .metric-op-value.positive { color: var(--saas-success); }
.{{ROOT}} .metric-op-value.negative { color: var(--saas-danger); }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
    .{{ROOT}} .kpis-grid,
    .{{ROOT}} .greeks-grid,
    .{{ROOT}} .conclusion-summary { grid-template-columns: repeat(2, 1fr); }
    .{{ROOT}} .metrics-grid,
    .{{ROOT}} .volatility-grid,
    .{{ROOT}} .skew-grid,
    .{{ROOT}} .ranges-grid,
    .{{ROOT}} .strategy-legs,
    .{{ROOT}} .steps-grid,
    .{{ROOT}} .magnets-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .{{ROOT}} .hero-section { padding: 50px 0 40px; }
    .{{ROOT}} .hero-title { font-size: 1.5rem; }
    .{{ROOT}} .kpis-grid,
    .{{ROOT}} .greeks-grid,
    .{{ROOT}} .conclusion-summary { grid-template-columns: 1fr; }
    .{{ROOT}} .section-container { padding: 0 20px; }
    .{{ROOT}} .volume-summary { grid-template-columns: 1fr; }
    .{{ROOT}} .levels-grid { grid-template-columns: 1fr; }
    .{{ROOT}} .data-table th, .{{ROOT}} .data-table td { padding: 12px 10px; font-size: 0.8rem; }
    .{{ROOT}} .interpretation-cell { max-width: 100%; }
    .{{ROOT}} .concept-card, .{{ROOT}} .analysis-block { padding: 20px; }
}
</style>`
