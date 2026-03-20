"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, Copy, Eye, Zap } from "lucide-react"

interface HtmlBlock {
  label: string
  html: string
}

interface HtmlOutputProps {
  blocks: HtmlBlock[]
  onRegenerate?: () => void
}

export function HtmlOutput({ blocks, onRegenerate }: HtmlOutputProps) {
  if (blocks.length === 0 || blocks.every(b => !b.html)) return null

  return (
    <div className="space-y-6">
      {blocks.filter(b => b.html).map((block, idx) => (
        <HtmlBlockView key={idx} block={block} onRegenerate={onRegenerate} />
      ))}
    </div>
  )
}

function HtmlBlockView({ block, onRegenerate }: { block: HtmlBlock; onRegenerate?: () => void }) {
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
    if (!block.html) return
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#fff;}</style></head><body>${block.html}</body></html>`)
    doc.close()

    const timer = setTimeout(adjustIframeHeight, 200)
    return () => clearTimeout(timer)
  }, [block.html, adjustIframeHeight])

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
        <span />
      </div>

      {/* Content — always preview */}
      <div className="p-0">
        <iframe
          ref={iframeRef}
          className="w-full border-0 bg-white rounded-b-xl"
          style={{ minHeight: '200px' }}
          title={block.label}
        />
      </div>
    </div>
  )
}
