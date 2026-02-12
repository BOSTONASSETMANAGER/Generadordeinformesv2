import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof _createBrowserClient> | null = null

export function createBrowserClient() {
  if (browserClient) return browserClient
  
  browserClient = _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return browserClient
}
