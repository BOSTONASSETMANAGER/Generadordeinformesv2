'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/app/reports/new'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createBrowserClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Hard navigate so the middleware sees the new cookie session
    window.location.href = redirectTo
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMagicSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md mx-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Report Builder</h1>
          <p className="text-slate-400 mt-1 text-sm">Ingresá para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-xl">
          {magicSent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600/20 mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Revisá tu email</h2>
              <p className="text-slate-400 text-sm">
                Enviamos un link de acceso a <span className="text-white font-medium">{email}</span>
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail('') }}
                className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Usar otro email
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex rounded-lg bg-slate-900/50 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('password'); setError(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'password'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('magic'); setError(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'magic'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password (only in password mode) */}
                {mode === 'password' && (
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {mode === 'password' ? 'Ingresando...' : 'Enviando...'}
                    </>
                  ) : (
                    mode === 'password' ? 'Ingresar' : 'Enviar Magic Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Report Builder &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
