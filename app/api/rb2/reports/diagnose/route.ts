import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

/**
 * Diagnostic endpoint — tests each pipeline dependency individually.
 * GET /api/rb2/reports/diagnose
 */
export async function GET(request: NextRequest) {
  const results: Record<string, string> = {}

  // 1. Basic Node.js
  results['node_version'] = process.version
  results['platform'] = process.platform

  // 2. fs module
  try {
    const fs = await import('fs')
    results['fs'] = 'ok'
  } catch (e: any) {
    results['fs'] = `FAIL: ${e.message}`
  }

  // 3. Template files
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dir = path.default.join(process.cwd(), 'informes premium ejemplos')
    const exists = fs.default.existsSync(dir)
    if (exists) {
      const files = fs.default.readdirSync(dir)
      results['templates_dir'] = `ok (${files.length} files)`
    } else {
      results['templates_dir'] = `FAIL: dir not found at ${dir}`
    }
  } catch (e: any) {
    results['templates_dir'] = `FAIL: ${e.message}`
  }

  // 4. Prompt files
  try {
    const fs = await import('fs')
    const path = await import('path')
    const promptDir = path.default.join(process.cwd(), 'ai', 'prompts')
    const exists = fs.default.existsSync(promptDir)
    results['prompts_dir'] = exists ? 'ok' : `FAIL: not found at ${promptDir}`
  } catch (e: any) {
    results['prompts_dir'] = `FAIL: ${e.message}`
  }

  // 5. OpenAI SDK
  try {
    const { default: OpenAI } = await import('openai')
    const hasKey = !!process.env.OPENAI_API_KEY
    results['openai_sdk'] = `ok (key: ${hasKey ? 'present' : 'MISSING'})`
  } catch (e: any) {
    results['openai_sdk'] = `FAIL: ${e.message}`
  }

  // 6. Anthropic/Claude
  try {
    const claude = await import('@/lib/claude')
    results['claude_module'] = 'ok'
  } catch (e: any) {
    results['claude_module'] = `FAIL: ${e.message}`
  }

  // 7. pdf-to-images (without the native binary)
  try {
    const pdfImages = await import('@/lib/pdf-to-images')
    results['pdf_to_images_module'] = 'ok'
  } catch (e: any) {
    results['pdf_to_images_module'] = `FAIL: ${e.message}`
  }

  // 8. pdf-to-png-converter (the native binary)
  try {
    const { pdfToPng } = await import('pdf-to-png-converter')
    results['pdf_to_png_native'] = 'ok (binary available)'
  } catch (e: any) {
    results['pdf_to_png_native'] = `FAIL (expected on Vercel): ${e.message}`
  }

  // 9. Template loader
  try {
    const tl = await import('@/lib/template-loader')
    const files = tl.getTemplateFileNames()
    results['template_loader'] = `ok (${files.length} templates)`
  } catch (e: any) {
    results['template_loader'] = `FAIL: ${e.message}`
  }

  // 10. Block recognizer
  try {
    const br = await import('@/lib/block-recognizer')
    results['block_recognizer'] = 'ok'
  } catch (e: any) {
    results['block_recognizer'] = `FAIL: ${e.message}`
  }

  // 11. Structured report validator
  try {
    const srv = await import('@/lib/structured-report-validator')
    results['validator'] = 'ok'
  } catch (e: any) {
    results['validator'] = `FAIL: ${e.message}`
  }

  // 12. Premium structurer prompt
  try {
    const ps = await import('@/ai/prompts/premium-structurer')
    results['premium_structurer'] = `ok (prompt length: ${ps.PREMIUM_STRUCTURER_SYSTEM?.length || 0})`
  } catch (e: any) {
    results['premium_structurer'] = `FAIL: ${e.message}`
  }

  // 13. Premium template renderer
  try {
    const pt = await import('@/ai/templates/premiumTemplate')
    results['premium_renderer'] = 'ok'
  } catch (e: any) {
    results['premium_renderer'] = `FAIL: ${e.message}`
  }

  // 14. Pipeline module
  try {
    const pipeline = await import('@/lib/pipeline')
    results['pipeline_module'] = 'ok'
  } catch (e: any) {
    results['pipeline_module'] = `FAIL: ${e.message}`
  }

  // 15. Supabase client
  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    results['supabase'] = `ok (user: ${user?.id?.slice(0, 8) || 'anon'})`
  } catch (e: any) {
    results['supabase'] = `FAIL: ${e.message}`
  }

  // 16. Environment variables
  results['env_OPENAI_API_KEY'] = process.env.OPENAI_API_KEY ? 'present' : 'MISSING'
  results['env_ANTHROPIC_API_KEY'] = process.env.ANTHROPIC_API_KEY ? 'present' : 'MISSING'
  results['env_NEXT_PUBLIC_SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'MISSING'
  results['env_NEXT_PUBLIC_SUPABASE_ANON_KEY'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'MISSING'

  // Check for any FAILs
  const fails = Object.entries(results).filter(([, v]) => v.startsWith('FAIL'))

  return NextResponse.json({
    status: fails.length === 0 ? 'ALL_OK' : 'HAS_FAILURES',
    failures: fails.length,
    cwd: process.cwd(),
    results,
  }, { status: 200 })
}
