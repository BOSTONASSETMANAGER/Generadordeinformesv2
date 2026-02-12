"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { KPI } from "@/lib/types"

interface KPIStripProps {
  kpis: KPI[]
}

export function KPIStrip({ kpis }: KPIStripProps) {
  const getChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />
      case 'negative':
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return 'text-saas-success'
      case 'negative':
        return 'text-saas-danger'
      default:
        return 'text-saas-muted'
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="p-4 bg-[var(--dashboard-surface-elevated)]">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-saas-muted font-medium uppercase tracking-wide">
              {kpi.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-saas-light">
                {kpi.value}
              </span>
              {kpi.suffix && (
                <span className="text-xs text-saas-muted">{kpi.suffix}</span>
              )}
            </div>
            {kpi.change && (
              <div className={`flex items-center gap-1 ${getChangeColor(kpi.changeType)}`}>
                {getChangeIcon(kpi.changeType)}
                <span className="text-xs font-medium">{kpi.change}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
