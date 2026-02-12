import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ReportCategory = 'opciones_premium' | 'resumen_semanal' | 'analisis_diario'

export interface ReportSource {
  id: string
  report_id: string
  file_name: string
  file_type: 'pdf' | 'image'
  file_url: string
  file_size: number
  status: 'uploading' | 'ready' | 'processing' | 'error'
  created_at: string
}

export interface Report {
  id: string
  category: ReportCategory
  ticker?: string
  name: string
  status: 'draft' | 'processing' | 'pending_review' | 'published'
  created_at: string
  updated_at: string
}
