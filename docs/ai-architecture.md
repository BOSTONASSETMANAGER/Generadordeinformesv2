# AI Architecture — Report Generation Pipeline

## Pipeline Overview

```
PDF/Image
    │
    ▼
┌─────────────────────────────────────────┐
│  STAGE 1: Content Understanding         │
│  OpenAI Vision (gpt-4o) extracts        │
│  structured JSON from page screenshots  │
│  + supplementary OCR text               │
│  Model: gpt-4o (OPENAI_EXTRACTOR_MODEL) │
│  Output: JSON (verbatim content)        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  STAGE 2: Template Selection            │
│  Deterministic — NO AI involved         │
│  1. Query golden templates (DB) first   │
│  2. Fallback to filesystem templates    │
│  Matches by: category → ticker → date   │
│  Source: informes premium ejemplos/      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  STAGE 3: Structuring (JSON only)       │
│  Claude Sonnet 4 (CLAUDE_STRUCTURER_MODEL)│
│  Receives: extracted JSON               │
│  Task: Map content → StructuredReport   │
│  Output: JSON (title, kpis, sections,   │
│          strategy, conclusion)          │
│  NEVER generates HTML — JSON only       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  STAGE 4: Deterministic Rendering       │
│  TypeScript — NO AI involved            │
│  renderPremiumHTML(structured, template) │
│  Stamps JSON into template CSS classes  │
│  Preserves <style>, SVGs, root wrappers │
│  Output: static HTML string             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  STAGE 5: Validation                    │
│  Deterministic — NO AI involved         │
│  5a. Anti-layout-inventado check        │
│      (template-validation.ts)           │
│  5b. Similarity scorer                  │
│      (template-similarity.ts)           │
│  Min score: 0.75                        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  STAGE 6: Storage + Feedback            │
│  Deterministic — NO AI involved         │
│  - Save to rb2.report_versions          │
│  - Update rb2.reports.status            │
│  - User approval → golden template      │
└─────────────────────────────────────────┘
```

## Core Principle

> Never generate full HTML from the model.
> The model reasons about content. The system controls design.

## Model Routing

| Task | Model | Reason |
|------|-------|--------|
| PDF extraction (vision) | gpt-4o | Multimodal, structured JSON output |
| Template selection | **Deterministic** | No AI needed — filesystem + DB lookup |
| JSON structuring | Claude Sonnet 4 | Content reasoning, verbatim text mapping |
| JSON structuring (large) | Claude Opus 4 | >120 blocks or >25 page images |
| HTML rendering | **Deterministic** | TypeScript renderer — zero AI involvement |
| Layout validation | **Deterministic** | Class matching, root wrapper checks |
| Similarity scoring | **Deterministic** | Weighted CSS/structure comparison |

**Rule**: Never use AI for tasks that can be deterministic.

## Layout Strategy

### Locked Components (never AI-generated)
- **Hero section** — `.hero-section` / `.hero`
- **KPI strip** — `.kpis-section` / `.kpis`
- **Context blocks** — `.context-section` / `.context`
- **Disclaimer** — `.disclaimer-section`
- **Design tokens** — CSS variables (`--saas-primary`, `--primary`, etc.)
- **Style block** — copied verbatim from template

### Dynamic Components (AI selects, never invents)
- **Analytical sections** — `.insights-section`, `.analysis-block`
- **Flow events** — `.flow-event` (h5 + p structure)
- **Strategy cards** — `.strategy-card`
- **Tables** — column count must match template exactly

### Root Wrappers (2 variants)
- `.ggal-analisis-estatico` — uses `--saas-*` CSS variables
- `.ggal-premium-report` — uses `--primary`, `--accent`, etc.

## Failure Mode Classification

When output fails, classify before fixing:

| Mode | Symptom | Root Cause | Fix |
|------|---------|------------|-----|
| **Structure Drift** | Missing sections in JSON | Structurer prompt ambiguity | Tighten JSON schema, add required fields |
| **Content Drift** | Paraphrased text, missing data | Prompt ambiguity | Add anti-paraphrasing rules, enforce verbatim |
| **Render Mismatch** | Wrong CSS classes, broken layout | Renderer bug or template change | Fix premiumTemplate.ts, never the prompt |
| **Token Overload** | Truncated JSON | Too much in one call | Auto-upgrade to Opus 4 via selectClaudeModel() |

## Key Files

### Pipeline Code
- `lib/pipeline.ts` — orchestrator (6 stages)
- `lib/claude.ts` — Anthropic client, retry logic, model selection
- `lib/template-loader.ts` — template selection (golden + filesystem)
- `lib/template-similarity.ts` — fidelity scorer
- `lib/template-validation.ts` — anti-layout-inventado checks
- `lib/golden-templates.ts` — golden template CRUD + fingerprinting
- `lib/pdf-to-images.ts` — PDF → page screenshots

### Prompts
- `ai/prompts/openai/extract-premium-from-pdf.md` — extractor (OpenAI gpt-4o)
- `ai/prompts/premium-structurer.ts` — Claude structurer prompt + StructuredReport interfaces
- `ai/prompts/shared/json-contracts.md` — JSON schema contracts
- `ai/prompts/shared/rules-literal-content.md` — verbatim rules

### Renderer
- `ai/templates/premiumTemplate.ts` — deterministic HTML renderer (renderPremiumHTML)

### Templates
- `informes premium ejemplos/` — 9 HTML reference templates (lowercase with spaces)

### API Endpoints
- `app/api/rb2/reports/process/route.ts` — production pipeline
- `app/api/rb2/reports/test-pipeline/route.ts` — dry-run + test
- `app/api/rb2/reports/[id]/approve/route.ts` — golden template approval

### DB Schema (rb2)
- `rb2.reports` — report metadata + status
- `rb2.report_versions` — HTML + meta per generation
- `rb2.extractions` — extracted JSON + issues
- `rb2.golden_templates` — approved reference templates

## Decision Checklist (before any change)

1. Is the model doing too much? → Split stages
2. Can this step be deterministic? → Remove AI
3. Should layout be code-controlled? → Move to renderer
4. Will this increase cross-report consistency? → Proceed
5. Does this reduce hallucination risk? → Proceed
