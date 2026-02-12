import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/rb2/reports/list
 * Returns all reports for the authenticated user, ordered by most recent.
 */
export async function GET() {
  try {
    const supabase = createServerClient()
    const rb2 = (supabase as any).schema('rb2')

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: reports, error: reportsError } = await rb2
      .from('reports')
      .select('id, name, category, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (reportsError) {
      console.error('[reports/list] Error fetching reports:', reportsError)
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: reportsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports: reports || [],
      count: reports?.length || 0,
    })
  } catch (err) {
    console.error('[reports/list] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
