import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const CLAUDE_MODELS = {
  STRUCTURE: process.env.CLAUDE_STRUCTURER_MODEL || 'claude-sonnet-4-20250514',
  STRUCTURE_LARGE: 'claude-opus-4-20250514',
}

export interface ClaudeCallOptions {
  model?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Call Claude Messages API with retry logic.
 * Returns the text content from the first text block.
 */
export async function callClaude(
  system: string,
  userMessage: string,
  opts?: ClaudeCallOptions
): Promise<string> {
  const model = opts?.model || CLAUDE_MODELS.STRUCTURE
  const maxTokens = opts?.maxTokens || 16000
  const temperature = opts?.temperature ?? 0

  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[claude] Calling ${model} (attempt ${attempt}/${MAX_RETRIES}), system length: ${system.length}, user length: ${userMessage.length}`)

      // Use streaming to avoid 10-minute timeout on long operations
      const stream = anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [
          { role: 'user', content: userMessage },
        ],
      })

      const response = await stream.finalMessage()

      const textBlock = response.content.find(b => b.type === 'text')
      const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''

      console.log(`[claude] Response: ${text.length} chars, stop_reason: ${response.stop_reason}, usage: ${response.usage.input_tokens}in/${response.usage.output_tokens}out`)

      return text
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[claude] Attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`)

      if (attempt < MAX_RETRIES) {
        const delay = attempt * 3000
        console.log(`[claude] Retrying in ${delay / 1000}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw new Error(`Claude API failed after ${MAX_RETRIES} attempts: ${msg}`)
      }
    }
  }

  throw new Error('Claude API: unreachable')
}

/**
 * Select the appropriate Claude model based on content complexity.
 * Auto-upgrades to Opus for very large documents.
 */
export function selectClaudeModel(blockCount: number, imageCount: number): string {
  if (blockCount > 120 || imageCount > 25) {
    console.log(`[claude] Auto-upgrading to STRUCTURE_LARGE (blocks: ${blockCount}, images: ${imageCount})`)
    return CLAUDE_MODELS.STRUCTURE_LARGE
  }
  return CLAUDE_MODELS.STRUCTURE
}
