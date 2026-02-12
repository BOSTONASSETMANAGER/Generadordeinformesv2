# Rules for Literal Content Handling

## Core Principle: VERBATIM Mode

This system operates in **verbatim mode**. All extracted and assembled content must be reproduced EXACTLY as it appears in the source document.

## Prohibited Actions

1. **NO Summarization**: Do not condense or shorten any text
2. **NO Paraphrasing**: Do not reword or rephrase content
3. **NO Correction**: Do not fix typos, grammar, or formatting errors in source
4. **NO Enhancement**: Do not add explanations, context, or "improvements"
5. **NO Inference**: Do not fill in missing data with assumptions

## Required Actions

1. **Preserve Exact Text**: Copy text character-for-character
2. **Maintain Structure**: Keep original paragraph breaks, lists, and formatting
3. **Flag Ambiguity**: If reading order is unclear (columns, tables), mark `needs_review: true`
4. **Document Issues**: Add warnings for any content that couldn't be extracted cleanly

## Handling Ambiguous Content

When encountering:
- **Multi-column layouts**: Extract left-to-right, top-to-bottom, flag for review
- **Overlapping text**: Extract best interpretation, flag for review
- **Unclear tables**: Preserve structure as best as possible, flag for review
- **Missing sections**: Note in issues array, do not invent content

## Quality Markers

A successful extraction/assembly:
- Contains zero invented content
- Flags all ambiguous sections
- Preserves original formatting intent
- Produces valid JSON output
