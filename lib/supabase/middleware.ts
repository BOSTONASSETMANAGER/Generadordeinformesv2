import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a Supabase client that can read/write cookies inside Next.js middleware.
 * Returns both the client and the (possibly mutated) response so the caller
 * can forward refreshed session cookies to the browser.
 */
export async function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Mirror on the request so downstream Server Components see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. Re-create the response so it carries the updated request cookies
          supabaseResponse = NextResponse.next({ request })
          // 3. Set cookies on the outgoing response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user, supabaseResponse }
}
