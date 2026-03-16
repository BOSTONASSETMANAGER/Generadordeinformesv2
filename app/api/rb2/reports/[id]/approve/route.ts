import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { saveGoldenTemplate } from '@/lib/golden-templates'

/**
 * POST /api/rb2/reports/[id]/approve
 * 
 * Approves a report: sets status to 'published' and saves the latest
 * version's HTML as a Golden Template for future reference.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const rb2 = (supabase as any).schema('rb2')
    const reportId = params.id

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get report
    const { data: report, error: reportError } = await rb2
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Get latest version with HTML content
    const { data: version, error: versionError } = await rb2
      .from('report_versions')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', user.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (versionError || !version) {
      return NextResponse.json(
        { error: 'No version found for this report' },
        { status: 404 }
      )
    }

    if (!version.html_content || version.html_content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Version has no HTML content to approve' },
        { status: 400 }
      )
    }

    // Optional: read quality_score from request body
    let qualityScore = 1.0
    try {
      const body = await request.json()
      if (body.quality_score && typeof body.quality_score === 'number') {
        qualityScore = Math.max(0, Math.min(2, body.quality_score))
      }
    } catch {
      // No body or invalid JSON — use default quality_score
    }

    // Save as Golden Template
    const { goldenTemplate, error: goldenError, isDuplicate } = await saveGoldenTemplate({
      userId: user.id,
      reportId,
      versionId: version.id,
      ticker: report.ticker || null,
      category: report.category || 'opciones_premium',
      htmlContent: version.html_content,
      qualityScore,
    })

    if (goldenError) {
      console.error('[approve] Error saving golden template:', goldenError)
      // Don't block approval — still publish the report
    }

    // Update report status to published
    const { error: updateError } = await rb2
      .from('reports')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('[approve] Error updating report status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update report status', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`[approve] Report ${reportId} approved → published. Golden template: ${goldenTemplate?.id || 'error'} (duplicate: ${isDuplicate})`)

    return NextResponse.json({
      success: true,
      report: { ...report, status: 'published' },
      goldenTemplate: goldenTemplate ? {
        id: goldenTemplate.id,
        ticker: goldenTemplate.ticker,
        category: goldenTemplate.category,
        quality_score: goldenTemplate.quality_score,
        is_duplicate: isDuplicate,
      } : null,
    })
  } catch (error) {
    console.error('[approve] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
