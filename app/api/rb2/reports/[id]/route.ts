import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const rb2 = supabase.schema('rb2')
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: report, error: fetchError } = await rb2
      .from('reports')
      .select('id, name, category, status, form_data, current_version, created_at, updated_at, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
