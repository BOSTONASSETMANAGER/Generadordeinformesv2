"use client"

import { Target, ArrowUpCircle, ArrowDownCircle, Percent } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Strategy } from "@/lib/types"

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const getActionIcon = (type: 'buy' | 'sell' | 'ratio') => {
    switch (type) {
      case 'buy':
        return <ArrowUpCircle className="w-4 h-4 text-saas-success" />
      case 'sell':
        return <ArrowDownCircle className="w-4 h-4 text-saas-danger" />
      case 'ratio':
        return <Percent className="w-4 h-4 text-saas-accent" />
    }
  }

  const getActionColor = (type: 'buy' | 'sell' | 'ratio') => {
    switch (type) {
      case 'buy':
        return 'border-saas-success/30 bg-saas-success/10'
      case 'sell':
        return 'border-saas-danger/30 bg-saas-danger/10'
      case 'ratio':
        return 'border-saas-accent/30 bg-saas-accent/10'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="icon-container">
            <Target className="w-5 h-5 text-saas-accent" />
          </div>
          <div>
            <CardTitle className="text-base">Estrategia Sugerida</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-saas-accent/10 border border-saas-accent/20">
            <h4 className="font-semibold text-saas-light mb-1">{strategy.title}</h4>
            <p className="text-sm text-saas-muted">{strategy.description}</p>
          </div>
          
          <div className="space-y-2">
            {strategy.actions.map((action, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getActionColor(action.type)}`}
              >
                {getActionIcon(action.type)}
                <div className="flex-1">
                  <span className="text-sm font-medium text-saas-light">{action.label}</span>
                  <span className="text-sm text-saas-muted ml-2">{action.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
