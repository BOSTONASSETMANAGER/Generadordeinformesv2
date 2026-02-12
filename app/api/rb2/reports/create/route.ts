import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const rb2 = supabase.schema('rb2')
    
    const body = await request.json()
    const { category, name, files } = body

    // Get current user (for RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create report
    const { data: report, error: reportError } = await rb2
      .from('reports')
      .insert({
        user_id: user.id,
        category,
        name: name || `Nuevo Informe - ${new Date().toLocaleDateString()}`,
        status: 'processing',
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      return NextResponse.json(
        { error: 'Failed to create report', details: reportError.message },
        { status: 500 }
      )
    }

    // Process uploaded files
    const sources = []
    for (const file of files || []) {
      const { fileName, fileType, fileSize, storagePath, fileUrl } = file

      const { data: source, error: sourceError } = await rb2
        .from('report_sources')
        .insert({
          report_id: report.id,
          user_id: user.id,
          file_name: fileName,
          file_type: fileType,
          file_url: fileUrl,
          file_size: fileSize,
          storage_path: storagePath,
          status: 'ready',
        })
        .select()
        .single()

      if (sourceError) {
        console.error('Error creating source:', sourceError)
        continue
      }

      sources.push(source)
    }

    return NextResponse.json({
      success: true,
      report,
      sources,
    })
  } catch (error) {
    console.error('Error in create report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
