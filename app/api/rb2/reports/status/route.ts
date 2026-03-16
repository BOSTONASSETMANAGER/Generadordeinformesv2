import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const rb2 = supabase.schema('rb2')
    
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { error: 'id parameter is required' },
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

    // Get report
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

    // Get latest version (maybeSingle: returns null if no versions exist instead of erroring)
    const { data: latestVersion, error: versionError } = await rb2
      .from('report_versions')
      .select('*')
      .eq('report_id', reportId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (versionError) {
      console.warn('[status] Error fetching latest version:', versionError)
    }

    // Get sources
    const { data: sources, error: sourcesError } = await rb2
      .from('report_sources')
      .select('*')
      .eq('report_id', reportId)

    if (sourcesError) {
      console.warn('[status] Error fetching sources:', sourcesError)
    }

    // Only log source details on first load (not during polling)
    const isPolling = report.status === 'processing'
    if (!isPolling) {
      if (sources && sources.length > 0) {
        const s = sources[0]
        console.log(`[status] Source found: file_name=${s.file_name}, has_pdf_base64=${!!s.pdf_base64}, has_file_url=${!!s.file_url}`)
      } else {
        console.log('[status] No sources found for report', reportId)
      }
    }

    return NextResponse.json({
      report,
      latestVersion: latestVersion || null,
      sources: sources || [],
      status: report.status,
    })
  } catch (error) {
    console.error('Error in get status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
