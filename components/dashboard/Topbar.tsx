"use client"

import { CheckCircle, CheckCircle2, Copy, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs"

interface TopbarProps {
  breadcrumbs: BreadcrumbItem[]
  status: 'draft' | 'pending_review' | 'published'
  pendingIssues: number
  onApprove: () => void
  onCopyHtml: () => void
  isApproving?: boolean
  isCopied?: boolean
  hasHtml?: boolean
}

export function Topbar({
  breadcrumbs,
  status,
  pendingIssues,
  onApprove,
  onCopyHtml,
  isApproving,
  isCopied,
  hasHtml,
}: TopbarProps) {
  const statusConfig = {
    draft: { label: 'Draft Mode', variant: 'warning' as const },
    pending_review: { label: 'Pending Review', variant: 'default' as const },
    published: { label: 'Published', variant: 'success' as const },
  }

  const currentStatus = statusConfig[status]
  const validationProgress = pendingIssues > 0 ? Math.max(0, 100 - pendingIssues * 20) : 100

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--dashboard-surface)] border-b border-[var(--dashboard-border)] backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Center: Status indicators */}
        <div className="flex items-center gap-4">
          <Badge variant={currentStatus.variant}>
            {currentStatus.label}
          </Badge>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Validation Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-saas-muted">Validation Status</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[var(--dashboard-surface-elevated)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-saas-gradient rounded-full transition-all duration-300"
                  style={{ width: `${validationProgress}%` }}
                />
              </div>
              {pendingIssues > 0 ? (
                <div className="flex items-center gap-1 text-saas-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{pendingIssues} Pending Issues</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-saas-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">All Clear</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {status !== 'published' && hasHtml && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onApprove}
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isApproving ? 'Aprobando...' : 'Aprobar y guardar'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={onCopyHtml}
            disabled={!hasHtml}
          >
            {isCopied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {isCopied ? 'Copiado!' : 'Publicar'}
          </Button>
        </div>
      </div>
    </header>
  )
}
