# Report Builder Dashboard

A professional Report Builder dashboard with split-view layout for editing financial reports.

## Features

- **Split View Layout**: PDF Viewer (60%) + Editor Panel (40%)
- **Fixed Topbar**: Breadcrumbs, status badges, validation progress, and action buttons
- **Dark Mode**: Modern dark theme using the UI Kit color palette
- **Components**:
  - PDF Viewer with zoom controls
  - Report Header Hero with gradient background
  - KPI Strip with 4 key metrics
  - Strategy Card with buy/sell/ratio actions
  - Options Chain Card with Calls/Puts tabs

## UI Kit Variables

```css
--saas-primary: #1d3969;
--saas-accent: #2563eb;
--saas-light: #f8fafc;
--saas-border: #e2e8f0;
--saas-text: #374151;
--saas-muted: #64748b;
--saas-success: #059669;
--saas-danger: #dc2626;
--saas-warning: #d97706;
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the editor at `/app/reports/ggal-001/editor`.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── globals.css          # UI Kit CSS variables
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Redirect to editor
│   └── app/reports/[id]/editor/
│       └── page.tsx         # Main editor page
├── components/
│   ├── ui/                  # Base UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   └── separator.tsx
│   └── dashboard/           # Dashboard-specific components
│       ├── Topbar.tsx
│       ├── PDFViewer.tsx
│       ├── ReportHeaderHero.tsx
│       ├── KPIStrip.tsx
│       ├── StrategyCard.tsx
│       └── OptionsChainCard.tsx
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── mock-data.ts         # Mock data for MVP
│   └── utils.ts             # Utility functions
└── tailwind.config.ts       # Tailwind with UI Kit colors
```

## Supabase Integration (Prepared)

The mock data structure is ready for Supabase integration:

- `Report`: Maps to `reports` table
- `KPI[]`: Stored as JSON in `report_versions.kpis`
- `Strategy`: Stored as JSON in `report_versions.strategy`
- `OptionsChain`: Stored as JSON in `report_versions.options_chain`
- `ValidationIssue[]`: Generated from validation rules

## Actions

- **Save Draft**: Saves current editor state
- **Validate & Sign Off**: Runs validation checks
- **Publish Report**: Marks report as published

## Typography

Font family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

## License

Private - Internal Use Only
