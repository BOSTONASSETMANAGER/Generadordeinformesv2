"use client"

import { TrendingUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Report } from "@/lib/types"

interface ReportHeaderHeroProps {
  report: Report
}

export function ReportHeaderHero({ report }: ReportHeaderHeroProps) {
  const marketStatusConfig = {
    open: { label: 'Market Open', variant: 'success' as const, icon: TrendingUp },
    closed: { label: 'Market Closed', variant: 'secondary' as const, icon: Clock },
    pre_market: { label: 'Pre-Market', variant: 'warning' as const, icon: Clock },
    after_hours: { label: 'After Hours', variant: 'warning' as const, icon: Clock },
  }

  const marketStatus = marketStatusConfig[report.marketStatus]
  const StatusIcon = marketStatus.icon

  return (
    <div className="relative overflow-hidden rounded-xl bg-saas-gradient p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-2xl">{report.ticker.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/70 text-sm font-medium">{report.ticker}</span>
                <Badge variant={marketStatus.variant} className="text-xs">
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {marketStatus.label}
                </Badge>
              </div>
              <h1 className="text-white text-xl font-bold">{report.name}</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-white/70 text-sm">
          <span>Version {report.version}</span>
          <span>•</span>
          <span>Last updated: {new Date(report.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
