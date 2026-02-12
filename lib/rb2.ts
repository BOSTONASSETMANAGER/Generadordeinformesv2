import { createServerClient } from "@/lib/supabase/server"
import { createBrowserClient } from "@/lib/supabase/browser"

/**
 * Data Access Layer for rb2 schema
 * Use rb2Server() in Server Components and API routes
 * Use rb2Browser() in Client Components
 * 
 * Note: Using 'any' cast because Supabase client types don't include
 * custom schemas by default. The .schema() method exists at runtime.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rb2Server(): any {
  const supabase = createServerClient()
  return (supabase as any).schema("rb2")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rb2Browser(): any {
  const supabase = createBrowserClient()
  return (supabase as any).schema("rb2")
}

// Type definitions for rb2 schema tables
export interface RB2Report {
  id: string
  user_id: string
  category: 'opciones_premium' | 'resumen_semanal' | 'analisis_diario'
  ticker?: string
  name: string
  status: 'processing' | 'ready' | 'error' | 'draft' | 'published'
  current_version?: number
  created_at: string
  updated_at: string
}

export interface RB2ReportSource {
  id: string
  report_id: string
  user_id: string
  file_name: string
  file_type: 'pdf' | 'image'
  file_url: string
  file_size: number
  storage_path: string
  status: 'uploading' | 'ready' | 'processing' | 'error'
  created_at: string
}

export interface RB2Extraction {
  id: string
  report_id: string
  source_id: string
  user_id: string
  extracted_json: Record<string, unknown>
  issues: ExtractionIssue[]
  needs_review: boolean
  validation_issues?: string[]
  created_at: string
}

export interface ExtractionIssue {
  type: 'ambiguity' | 'missing_data' | 'format_error'
  message: string
  location?: string
}

export interface RB2Template {
  id: string
  name: string
  category: string
  html_template: string
  is_active: boolean
  created_at: string
}

export interface RB2ReportVersion {
  id: string
  report_id: string
  user_id: string
  version_number: number
  template_id?: string
  html_content: string
  report_data?: Record<string, unknown>
  warnings: string[]
  meta?: Record<string, unknown>
  created_at: string
}

export interface RB2KnowledgeItem {
  id: string
  user_id?: string
  category: string
  key: string
  value: Record<string, unknown>
  created_at: string
}
