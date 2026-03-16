import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Lightweight dispatcher: validates request, saves PDF, sets status=processing,
 * then fires the pipeline in a separate serverless function via fetch() (no await).
 * Returns immediately with { status: 'processing' }.
 * The editor polls /api/rb2/reports/status to pick up results.
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const rb2 = (supabase as any).schema('rb2')
    
    const body = await request.json()
    const { reportId, pdfTextContent, pdfBase64 } = body

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get report and sources
    const { data: report, error: reportError } = await rb2
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const { data: sources, error: sourcesError } = await rb2
      .from('report_sources')
      .select('*')
      .eq('report_id', reportId)

    if (sourcesError) {
      console.error('[process] Error fetching sources:', sourcesError)
    }

    // Update report status to processing
    await rb2
      .from('reports')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', reportId)

    // ============================================
    // SAVE PDF TO report_sources (base64 in DB)
    // ============================================
    let sourceFileName = sources?.[0]?.file_name || 'unknown.pdf'

    if (pdfBase64) {
      sourceFileName = body.sourceFileName || 'report.pdf'
      const pdfSize = Math.round((pdfBase64.length * 3) / 4)

      try {
        const existingSource = sources?.find((s: any) => s.report_id === reportId)

        if (existingSource) {
          const { error: updateError } = await rb2
            .from('report_sources')
            .update({
              file_name: sourceFileName,
              file_type: 'pdf',
              source_type: 'pdf',
              file_size: pdfSize,
              pdf_base64: pdfBase64,
              status: 'ready',
            })
            .eq('id', existingSource.id)

          if (updateError) {
            console.warn('[process] Error updating source:', updateError)
          } else {
            console.log(`[process] PDF saved to report_sources (updated), size: ${(pdfSize / 1024).toFixed(0)}KB`)
          }
        } else {
          const { error: insertError } = await rb2
            .from('report_sources')
            .insert({
              report_id: reportId,
              user_id: user.id,
              file_name: sourceFileName,
              file_type: 'pdf',
              source_type: 'pdf',
              file_size: pdfSize,
              storage_path: `inline:${reportId}/${sourceFileName}`,
              pdf_base64: pdfBase64,
              status: 'ready',
            })

          if (insertError) {
            console.warn('[process] Error saving source:', insertError)
          } else {
            console.log(`[process] PDF saved to report_sources (new), size: ${(pdfSize / 1024).toFixed(0)}KB`)
          }
        }
      } catch (err) {
        console.error('[process] Error saving PDF source:', err)
      }
    }

    // ============================================
    // FIRE PIPELINE IN BACKGROUND (separate serverless function)
    // ============================================
    const currentVersion = (report.current_version || 0) + 1
    const sourceId = sources?.[0]?.id || null

    console.log(`[process] Dispatching pipeline for report ${reportId} to /run-pipeline`)

    // Build the base URL for the internal fetch
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    // Fire-and-forget: do NOT await this fetch
    const pipelineSecret = process.env.PIPELINE_INTERNAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
    fetch(`${baseUrl}/api/rb2/reports/run-pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pipelineSecret}`,
      },
      body: JSON.stringify({
        reportId,
        userId: user.id,
        sourceFileUrl: sources?.[0]?.file_url || '',
        sourceFileName,
        reportName: report.name,
        pdfBase64: pdfBase64 || undefined,
        pdfTextContent: pdfTextContent || '',
        currentVersion,
        sourceId,
      }),
    }).catch(err => {
      console.error('[process] Failed to dispatch pipeline:', err)
    })

    // Return immediately — editor will poll for results
    return NextResponse.json({
      status: 'processing',
      reportId,
    })

  } catch (error) {
    console.error('[process] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
