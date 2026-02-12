import { NextResponse } from 'next/server'
import { createServerClient } from './server'

/**
 * Checks the current user session from cookies.
 * Returns the user + supabase client, or a 401/403 NextResponse.
 */
export async function requireAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      supabase: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return { user, supabase, errorResponse: null }
}

/**
 * Returns a 403 response for RLS failures.
 */
export function forbiddenResponse(message?: string) {
  return NextResponse.json(
    { error: message || 'Forbidden — insufficient permissions' },
    { status: 403 }
  )
}
