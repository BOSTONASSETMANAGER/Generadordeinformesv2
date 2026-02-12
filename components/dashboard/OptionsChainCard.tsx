"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OptionsChain, OptionChainItem } from "@/lib/types"

interface OptionsChainCardProps {
  optionsChain: OptionsChain
  onSelectionChange?: (type: 'calls' | 'puts', id: string, selected: boolean) => void
}

export function OptionsChainCard({ optionsChain, onSelectionChange }: OptionsChainCardProps) {
  const [activeTab, setActiveTab] = useState<'calls' | 'puts'>('calls')

  const handleRowClick = (item: OptionChainItem) => {
    onSelectionChange?.(activeTab, item.id, !item.selected)
  }

  const renderTable = (items: OptionChainItem[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--dashboard-border)]">
            <th className="text-left py-2 px-2 text-saas-muted font-medium text-xs">Strike</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">Bid</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">Ask</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">Vol</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">OI</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">IV</th>
            <th className="text-right py-2 px-2 text-saas-muted font-medium text-xs">Delta</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr 
              key={item.id}
              onClick={() => handleRowClick(item)}
              className={`
                border-b border-[var(--dashboard-border)] cursor-pointer transition-colors
                ${item.selected 
                  ? 'bg-saas-accent/20 border-l-2 border-l-saas-accent' 
                  : 'hover:bg-[var(--dashboard-surface-elevated)]'
                }
              `}
            >
              <td className="py-2 px-2 font-medium text-saas-light">{item.strike}</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.bid.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.ask.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.volume.toLocaleString()}</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.openInterest.toLocaleString()}</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.iv.toFixed(1)}%</td>
              <td className="py-2 px-2 text-right text-saas-muted">{item.delta.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-container">
              <Link2 className="w-5 h-5 text-saas-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Cadena de Opciones</CardTitle>
              <p className="text-xs text-saas-muted mt-0.5">
                Vencimiento: {new Date(optionsChain.expiration).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'calls' | 'puts')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="calls" className="flex-1">
              Calls
              <span className="ml-2 text-xs bg-saas-success/20 text-saas-success px-1.5 py-0.5 rounded">
                {optionsChain.calls.filter(c => c.selected).length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="puts" className="flex-1">
              Puts
              <span className="ml-2 text-xs bg-saas-danger/20 text-saas-danger px-1.5 py-0.5 rounded">
                {optionsChain.puts.filter(p => p.selected).length}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calls">
            {renderTable(optionsChain.calls)}
          </TabsContent>
          <TabsContent value="puts">
            {renderTable(optionsChain.puts)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
