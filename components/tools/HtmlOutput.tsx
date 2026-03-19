"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, Copy, Code, Eye } from "lucide-react"

interface HtmlBlock {
  label: string
  html: string
}

interface HtmlOutputProps {
  blocks: HtmlBlock[]
}

export function HtmlOutput({ blocks }: HtmlOutputProps) {
  if (blocks.length === 0 || blocks.every(b => !b.html)) return null

  return (
    <div className="space-y-6">
      {blocks.filter(b => b.html).map((block, idx) => (
        <HtmlBlockView key={idx} block={block} />
      ))}
    </div>
  )
}

function HtmlBlockView({ block }: { block: HtmlBlock }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const adjustIframeHeight = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc?.body) {
        const height = doc.body.scrollHeight
        iframe.style.height = `${Math.max(height + 40, 200)}px`
      }
    } catch {
      // cross-origin guard
    }
  }, [])

  useEffect(() => {
    if (tab !== 'preview' || !block.html) return
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#fff;}</style></head><body>${block.html}</body></html>`)
    doc.close()

    const timer = setTimeout(adjustIframeHeight, 200)
    return () => clearTimeout(timer)
  }, [tab, block.html, adjustIframeHeight])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = block.html
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface-elevated)]">
        <span className="text-sm font-semibold text-[var(--saas-light)]">{block.label}</span>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--dashboard-border)]">
            <button
              onClick={() => setTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === 'preview'
                  ? 'bg-[var(--saas-accent)] text-white'
                  : 'bg-[var(--dashboard-surface)] text-[var(--saas-muted)] hover:text-[var(--saas-light)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Vista Previa
            </button>
            <button
              onClick={() => setTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === 'code'
                  ? 'bg-[var(--saas-accent)] text-white'
                  : 'bg-[var(--dashboard-surface)] text-[var(--saas-muted)] hover:text-[var(--saas-light)]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Código HTML
            </button>
          </div>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-[var(--saas-success)] text-white'
                : 'bg-[var(--saas-accent)] text-white hover:opacity-90'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar HTML'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-0">
        {tab === 'preview' ? (
          <iframe
            ref={iframeRef}
            className="w-full border-0 bg-white rounded-b-xl"
            style={{ minHeight: '200px' }}
            title={block.label}
          />
        ) : (
          <pre className="p-4 text-xs text-green-400 bg-[#0d1117] overflow-auto max-h-[600px] font-mono leading-relaxed">
            <code>{block.html}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
