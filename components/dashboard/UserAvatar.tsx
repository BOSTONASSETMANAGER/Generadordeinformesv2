"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/browser"

export function UserAvatar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string } | null } }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--saas-primary)] to-[var(--saas-accent)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--dashboard-border)] hover:ring-[var(--saas-accent)] transition-all cursor-pointer select-none"
        title={email || "Usuario"}
      >
        <User className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface-elevated)] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--dashboard-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--saas-primary)] to-[var(--saas-accent)] flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--saas-light)] truncate">
                  {email || "Usuario"}
                </p>
                <p className="text-xs text-[var(--saas-muted)]">Conectado</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
