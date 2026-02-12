# Pipeline de Generación de Informes Premium

## Arquitectura

```
PDF/Imagen → [OpenAI Extractor] → JSON → [Template Loader] → Template HTML
                                      ↓                           ↓
                                 rb2.extractions    [Anthropic Assembler] → HTML Final
                                                           ↓
                                                  [Similarity Scorer]
                                                           ↓
                                                  rb2.report_versions (con meta)
                                                           ↓
                                                  rb2.reports.status = ready|error
```

## Ubicación de Archivos Clave

### Prompts
| Archivo | Agente | Descripción |
|---------|--------|-------------|
| `ai/prompts/openai/extract-premium-from-pdf.md` | OpenAI (gpt-4o) | Extrae JSON estructurado del PDF |
| `ai/prompts/anthropic/assemble-premium-html.md` | Anthropic (Claude) | Clona template e inyecta contenido |
| `ai/prompts/shared/json-contracts.md` | Ambos | Contratos JSON entre agentes |
| `ai/prompts/shared/rules-literal-content.md` | Ambos | Reglas de contenido verbatim |

### Templates
| Carpeta | Descripción |
|---------|-------------|
| `informes premium ejemplos/` | Templates HTML reales (9 archivos) |

**IMPORTANTE**: La carpeta usa minúsculas y espacios: `informes premium ejemplos` (no `Informes`).

### Código del Pipeline
| Archivo | Descripción |
|---------|-------------|
| `lib/pipeline.ts` | Orquestador principal (extract → assemble → validate) |
| `lib/template-loader.ts` | Carga y analiza templates desde disco |
| `lib/template-similarity.ts` | Scorer de fidelidad HTML vs template |
| `app/api/rb2/reports/process/route.ts` | Endpoint POST que ejecuta el pipeline |
| `app/api/rb2/reports/test-pipeline/route.ts` | Endpoint de prueba (GET dry-run, POST full) |

## Cómo Ejecutar el Pipeline

### 1. Dry-run (sin llamadas a AI)
```bash
curl http://localhost:3000/api/rb2/reports/test-pipeline
```
Retorna: lista de templates, análisis estructural, wrappers encontrados.

### 2. Full pipeline test
```bash
curl -X POST http://localhost:3000/api/rb2/reports/test-pipeline \
  -H "Content-Type: application/json" \
  -d '{"pdfTextContent": "Análisis Cuantitativo... (texto del PDF)", "sourceFileName": "test.pdf"}'
```
Retorna: template elegido, similarity score, preview del HTML, warnings.

### 3. Pipeline real (requiere auth + report en DB)
```bash
curl -X POST http://localhost:3000/api/rb2/reports/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"reportId": "<uuid>", "pdfTextContent": "..."}'
```

## Similarity Score

El **template_similarity_score** mide qué tan fiel es el HTML generado respecto al template elegido.

### Componentes del Score (pesos)
| Componente | Peso | Qué mide |
|-----------|------|----------|
| `classOverlap` | 30% | % de clases CSS del template presentes en el output |
| `rootWrapper` | 20% | Presencia del wrapper raíz (`.ggal-analisis-estatico` o `.ggal-premium-report`) |
| `sections` | 25% | Cobertura de secciones clave (hero, kpis, context, insights, heatmap, disclaimer) |
| `styleBlock` | 10% | Presencia del bloque `<style>` del template |
| `cssVariables` | 15% | % de variables CSS preservadas |

### Interpretación
| Score | Significado | Acción |
|-------|-------------|--------|
| ≥ 0.90 | Excelente | HTML casi idéntico al template |
| 0.75 – 0.89 | Aceptable | Estructura correcta, posibles diferencias menores |
| 0.50 – 0.74 | **Falla** | Status → `error`. Revisar diagnostics |
| < 0.50 | Crítico | El assembler no está clonando el template |

### Umbral mínimo
- **0.75** (75%) → Si el score es menor, `rb2.reports.status` se setea a `error`
- Los diagnostics se guardan en `rb2.report_versions.meta.similarity_diagnostics`

## Trazabilidad en DB

Cada ejecución del pipeline deja estos registros:

### `rb2.extractions`
- `extracted_json`: JSON completo del extractor OpenAI
- `issues`: problemas detectados por el extractor
- `needs_review`: flag de revisión manual
- `validation_issues`: diagnostics del similarity scorer

### `rb2.report_versions`
- `html_content`: HTML final generado
- `report_data`: JSON extraído (copia)
- `warnings`: warnings del assembler + similarity
- `meta`: objeto con toda la trazabilidad:
  - `prompt_file_used_openai`
  - `prompt_file_used_anthropic`
  - `template_files_seen`
  - `template_chosen`
  - `extracted_json_size`
  - `html_size`
  - `template_similarity_score`
  - `similarity_details`
  - `similarity_diagnostics`
  - `pipeline_started_at` / `pipeline_finished_at`
  - `extraction_duration_ms` / `assembly_duration_ms`

### `rb2.reports`
- `status`: `processing` → `ready` (score ≥ 0.75) o `error` (score < 0.75)
- `current_version`: incrementado en cada ejecución

## Templates: Estructura Identificada

Los templates usan 2 wrappers raíz principales:

### `.ggal-analisis-estatico`
- Variables: `--saas-primary`, `--saas-accent`, `--saas-light`, etc.
- Secciones: `.hero-section` → `.kpis-section` → `.context-section` → `.insights-section` → `.heatmap-section`
- Usado en: `Informe_GGAL_29_enero_2026.html`, `Informe opciones premium.html`, etc.

### `.ggal-premium-report`
- Variables: `--primary`, `--accent`, `--light`, etc. (sin prefijo `saas-`)
- Secciones: `.hero` → `.kpis` → `.context` → `.section.white` / `.section.light`
- Usado en: `informe premium 2 de febrero.html`, etc.

## Troubleshooting

### Score bajo (< 0.75)
1. Revisar `similarity_diagnostics` en la respuesta
2. Causas comunes:
   - Assembler creó wrapper propio (`report-container`) → PROHIBIDO
   - Falta el bloque `<style>` → el assembler lo eliminó
   - Clases CSS renombradas o eliminadas
3. Solución: el prompt del assembler ya prohíbe estas acciones. Si persiste, revisar `ai/prompts/anthropic/assemble-premium-html.md`

### Error en extracción
1. Revisar `rb2.extractions.issues`
2. Si `needs_review = true`, el PDF tiene contenido ambiguo
3. Verificar que `OPENAI_API_KEY` esté configurado en `.env.local`

### Error en ensamblaje
1. Verificar que `ANTHROPIC_API_KEY` esté configurado en `.env.local`
2. Revisar que la carpeta `informes premium ejemplos/` exista y tenga archivos `.html`
