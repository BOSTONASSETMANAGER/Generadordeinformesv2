import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

/**
 * Cookie-based Supabase client for Server Components / Route Handlers.
 * Uses the ANON key so RLS policies apply and the session comes from cookies.
 */
export function createServerClient() {
  const cookieStore = cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can fail in Server Components (read-only).
            // This is fine — the middleware will refresh the session.
          }
        },
      },
    }
  )
}

/**
 * Service-role client — bypasses RLS. Use only for admin operations.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  )
}
