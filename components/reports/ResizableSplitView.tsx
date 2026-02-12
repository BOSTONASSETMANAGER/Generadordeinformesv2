"use client"

import { useState, useCallback, useEffect, useRef } from "react"

const STORAGE_KEY = "report_split_ratio"
const DEFAULT_RATIO = 50
const MIN_RATIO = 25
const MAX_RATIO = 75

interface ResizableSplitViewProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function ResizableSplitView({ left, right }: ResizableSplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const [splitRatio, setSplitRatio] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_RATIO
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = parseFloat(stored)
      if (!isNaN(parsed) && parsed >= MIN_RATIO && parsed <= MAX_RATIO) {
        return parsed
      }
    }
    return DEFAULT_RATIO
  })

  const [isDraggingState, setIsDraggingState] = useState(false)

  // Persist ratio to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(splitRatio))
  }, [splitRatio])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    setIsDraggingState(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = (x / rect.width) * 100

    const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio))
    setSplitRatio(clamped)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    setIsDraggingState(false)
  }, [])

  // Keyboard support for the divider
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 2
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      setSplitRatio(prev => Math.max(MIN_RATIO, prev - step))
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      setSplitRatio(prev => Math.min(MAX_RATIO, prev + step))
    }
  }, [])

  // Attach global mouse listeners while dragging
  useEffect(() => {
    if (isDraggingState) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingState, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full relative"
      style={{ userSelect: isDraggingState ? "none" : "auto" }}
    >
      {/* Left Panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${splitRatio}%` }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar paneles"
        aria-valuenow={Math.round(splitRatio)}
        aria-valuemin={MIN_RATIO}
        aria-valuemax={MAX_RATIO}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        className={`
          relative flex-shrink-0 w-[6px] cursor-col-resize
          bg-[var(--dashboard-border)] hover:bg-saas-accent/40
          transition-colors duration-150 group z-10
          ${isDraggingState ? "bg-saas-accent/50" : ""}
        `}
      >
        {/* Visual grip indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[3px] opacity-50 group-hover:opacity-100 transition-opacity">
          <span className="block w-[3px] h-[3px] rounded-full bg-saas-muted" />
          <span className="block w-[3px] h-[3px] rounded-full bg-saas-muted" />
          <span className="block w-[3px] h-[3px] rounded-full bg-saas-muted" />
          <span className="block w-[3px] h-[3px] rounded-full bg-saas-muted" />
          <span className="block w-[3px] h-[3px] rounded-full bg-saas-muted" />
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="h-full overflow-hidden flex-1"
      >
        {right}
      </div>

      {/* Overlay to prevent iframes from capturing mouse events while dragging */}
      {isDraggingState && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  )
}
