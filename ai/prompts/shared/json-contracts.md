# JSON Contracts for Agent Communication

All agents in this pipeline communicate via strict JSON contracts. No free-form text is allowed.

## Extraction Contract (Agent A → Storage)

```json
{
  "outline": [
    {
      "section_id": "string",
      "title_verbatim": "string",
      "order": "number"
    }
  ],
  "blocks": [
    {
      "block_id": "string",
      "section_id": "string",
      "type": "heading | paragraph | table | list | kpi | chart_description",
      "content_verbatim": "string",
      "metadata": {
        "row_count": "number (optional)",
        "column_headers": ["string"] (optional)
      }
    }
  ],
  "kpis_verbatim": [
    {
      "label": "string",
      "value": "string",
      "unit": "string (optional)",
      "change": "string (optional)"
    }
  ],
  "tables_verbatim": [
    {
      "table_id": "string",
      "headers": ["string"],
      "rows": [["string"]]
    }
  ],
  "issues": [
    {
      "type": "ambiguity | missing_data | format_error",
      "message": "string",
      "location": "string (optional)"
    }
  ],
  "needs_review": "boolean"
}
```

## Assembly Contract (Agent B → Storage)

```json
{
  "template_chosen": "string (template filename)",
  "html_final": "string (complete HTML)",
  "warnings": [
    {
      "type": "layout_mismatch | content_overflow | missing_section",
      "message": "string"
    }
  ],
  "sections_mapped": [
    {
      "template_section": "string",
      "source_section_id": "string"
    }
  ]
}
```

## Validation Rules

1. All `*_verbatim` fields MUST contain exact text from source
2. No summarization, paraphrasing, or "improvement" allowed
3. If content is ambiguous, set `needs_review: true` and add to `issues`
4. Empty fields should be `null`, not empty strings
