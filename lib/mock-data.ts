import { Report, KPI, Strategy, OptionsChain, ValidationIssue, ReportEditorState } from './types'

export const mockReport: Report = {
  id: 'ggal-001',
  ticker: 'GGAL',
  name: 'GGAL Strategy Analysis',
  status: 'draft',
  marketStatus: 'open',
  createdAt: '2026-02-09T10:00:00Z',
  updatedAt: '2026-02-09T12:30:00Z',
  version: 1,
}

export const mockKPIs: KPI[] = [
  {
    id: 'kpi-1',
    label: 'Precio Local',
    value: '1,245.50',
    change: '+2.35%',
    changeType: 'positive',
    suffix: 'ARS',
  },
  {
    id: 'kpi-2',
    label: 'Variación',
    value: '+28.50',
    change: '+2.35%',
    changeType: 'positive',
    suffix: 'ARS',
  },
  {
    id: 'kpi-3',
    label: 'ADR USD',
    value: '12.85',
    change: '+1.82%',
    changeType: 'positive',
    suffix: 'USD',
  },
  {
    id: 'kpi-4',
    label: 'Volatilidad IV',
    value: '45.2',
    change: '-3.1%',
    changeType: 'negative',
    suffix: '%',
  },
]

export const mockStrategy: Strategy = {
  title: 'Bull Call Spread - GGAL Marzo 2026',
  description: 'Estrategia alcista con riesgo limitado aprovechando la volatilidad actual.',
  actions: [
    {
      type: 'buy',
      label: 'Compra Call',
      value: 'Strike 1200 @ 85.00',
    },
    {
      type: 'sell',
      label: 'Venta Call',
      value: 'Strike 1350 @ 32.00',
    },
    {
      type: 'ratio',
      label: 'Ratio',
      value: '1:1 (Costo neto: 53.00)',
    },
  ],
}

export const mockOptionsChain: OptionsChain = {
  expiration: '2026-03-20',
  calls: [
    { id: 'c1', strike: 1100, bid: 158.00, ask: 162.00, volume: 1250, openInterest: 4520, iv: 42.5, delta: 0.72, selected: false },
    { id: 'c2', strike: 1150, bid: 118.00, ask: 122.00, volume: 2100, openInterest: 5840, iv: 43.2, delta: 0.62, selected: false },
    { id: 'c3', strike: 1200, bid: 83.00, ask: 87.00, volume: 3450, openInterest: 8920, iv: 44.1, delta: 0.52, selected: true },
    { id: 'c4', strike: 1250, bid: 55.00, ask: 58.00, volume: 2800, openInterest: 7650, iv: 44.8, delta: 0.42, selected: false },
    { id: 'c5', strike: 1300, bid: 34.00, ask: 37.00, volume: 1950, openInterest: 6120, iv: 45.5, delta: 0.32, selected: false },
    { id: 'c6', strike: 1350, bid: 20.00, ask: 23.00, volume: 1420, openInterest: 4890, iv: 46.2, delta: 0.24, selected: true },
  ],
  puts: [
    { id: 'p1', strike: 1100, bid: 12.00, ask: 15.00, volume: 890, openInterest: 3210, iv: 43.8, delta: -0.18, selected: false },
    { id: 'p2', strike: 1150, bid: 22.00, ask: 25.00, volume: 1150, openInterest: 4120, iv: 44.5, delta: -0.28, selected: false },
    { id: 'p3', strike: 1200, bid: 38.00, ask: 42.00, volume: 1680, openInterest: 5430, iv: 45.2, delta: -0.38, selected: false },
    { id: 'p4', strike: 1250, bid: 62.00, ask: 66.00, volume: 1320, openInterest: 4780, iv: 45.9, delta: -0.48, selected: false },
    { id: 'p5', strike: 1300, bid: 92.00, ask: 96.00, volume: 980, openInterest: 3650, iv: 46.6, delta: -0.58, selected: false },
    { id: 'p6', strike: 1350, bid: 128.00, ask: 132.00, volume: 720, openInterest: 2890, iv: 47.3, delta: -0.68, selected: false },
  ],
}

export const mockValidationIssues: ValidationIssue[] = [
  {
    id: 'v1',
    field: 'strategy.description',
    message: 'La descripción de la estrategia debe tener al menos 50 caracteres',
    severity: 'warning',
  },
  {
    id: 'v2',
    field: 'kpis.volatility',
    message: 'Verificar coherencia: IV alta con estrategia alcista',
    severity: 'warning',
  },
  {
    id: 'v3',
    field: 'optionsChain.selection',
    message: 'Confirmar selección de strikes para el spread',
    severity: 'warning',
  },
]

export const mockEditorState: ReportEditorState = {
  report: mockReport,
  kpis: mockKPIs,
  strategy: mockStrategy,
  optionsChain: mockOptionsChain,
  validationIssues: mockValidationIssues,
  isDirty: false,
}
