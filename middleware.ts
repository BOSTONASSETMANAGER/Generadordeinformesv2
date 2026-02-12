import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * Public paths that do NOT require authentication.
 */
const PUBLIC_PATHS = [
  '/login',
  '/auth/callback',
]

const IGNORED_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/public',
]

function isPublicPath(pathname: string): boolean {
  if (IGNORED_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  // Static file extensions
  if (/\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$/.test(pathname)) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public / static paths
  if (isPublicPath(pathname)) {
    // If user is already logged in and visits /login → redirect to /app/reports
    if (pathname === '/login') {
      const { user, supabaseResponse } = await createMiddlewareClient(request)
      if (user) {
        const url = request.nextUrl.clone()
        url.pathname = '/app/reports/new'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }
    return NextResponse.next()
  }

  // ── Protected routes ──────────────────────────────────────────────
  const { user, supabaseResponse } = await createMiddlewareClient(request)

  if (!user) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Page routes → redirect to /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // User is authenticated — forward the (possibly refreshed) response
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
