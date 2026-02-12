export interface Report {
  id: string
  ticker: string
  name: string
  status: 'draft' | 'pending_review' | 'published'
  marketStatus: 'open' | 'closed' | 'pre_market' | 'after_hours'
  createdAt: string
  updatedAt: string
  version: number
}

export interface KPI {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  suffix?: string
}

export interface Strategy {
  title: string
  description: string
  actions: StrategyAction[]
}

export interface StrategyAction {
  type: 'buy' | 'sell' | 'ratio'
  label: string
  value: string
}

export interface OptionChainItem {
  id: string
  strike: number
  bid: number
  ask: number
  volume: number
  openInterest: number
  iv: number
  delta: number
  selected?: boolean
}

export interface OptionsChain {
  calls: OptionChainItem[]
  puts: OptionChainItem[]
  expiration: string
}

export interface ValidationIssue {
  id: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ReportEditorState {
  report: Report
  kpis: KPI[]
  strategy: Strategy
  optionsChain: OptionsChain
  validationIssues: ValidationIssue[]
  isDirty: boolean
}
