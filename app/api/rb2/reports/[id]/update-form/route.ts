import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const rb2 = supabase.schema('rb2')
    const { id } = await params

    const body = await request.json()
    const { form_data, html_content } = body

    // Get current user (for RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the report exists and belongs to the user
    const { data: report, error: fetchError } = await rb2
      .from('reports')
      .select('id, category, user_id, current_version')
      .eq('id', id)
      .single()

    if (fetchError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (report.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only allow updating manual tool reports
    const MANUAL_CATEGORIES = ['opciones_estandar', 'instrumentos_dia', 'valor_razonable']
    if (!MANUAL_CATEGORIES.includes(report.category)) {
      return NextResponse.json(
        { error: 'Only manual tool reports can be updated via this endpoint' },
        { status: 400 }
      )
    }

    // Update form_data on the report
    const { error: updateError } = await rb2
      .from('reports')
      .update({
        form_data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating report:', updateError)
      return NextResponse.json(
        { error: 'Failed to update report', details: updateError.message },
        { status: 500 }
      )
    }

    // Create a new version with the updated HTML
    if (html_content) {
      const newVersion = (report.current_version || 1) + 1

      const { error: versionError } = await rb2
        .from('report_versions')
        .insert({
          report_id: id,
          user_id: user.id,
          version_number: newVersion,
          report_data: form_data || {},
          html_content,
          change_log: { source: 'manual_form', action: 'update' },
        })

      if (versionError) {
        console.error('Error creating report version:', versionError)
      } else {
        // Update current_version on the report
        await rb2
          .from('reports')
          .update({ current_version: newVersion })
          .eq('id', id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update-form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
