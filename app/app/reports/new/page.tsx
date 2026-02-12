"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, TrendingUp, Activity, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs"

type ReportCategory = 'opciones_premium' | 'resumen_semanal' | 'analisis_diario'

interface CategoryOption {
  id: ReportCategory
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

const categories: CategoryOption[] = [
  {
    id: 'opciones_premium',
    title: 'Informe de Opciones Premium',
    description: 'Análisis profundo de derivados, incluyendo Griegas, ranking de IV y spreads estratégicos.',
    icon: <BarChart3 className="w-8 h-8" />,
    enabled: true,
  },
  {
    id: 'resumen_semanal',
    title: 'Resumen Semanal de Mercado',
    description: 'Revisión exhaustiva de las últimas 5 sesiones de negociación y próximos catalizadores económicos.',
    icon: <TrendingUp className="w-8 h-8" />,
    enabled: false,
  },
  {
    id: 'analisis_diario',
    title: 'Análisis Diario',
    description: 'Instantánea rápida de precios actuales de mercado, líderes de volumen e indicadores técnicos.',
    icon: <Activity className="w-8 h-8" />,
    enabled: false,
  },
]

export default function NewReportPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>('opciones_premium')

  const handleContinue = () => {
    if (selectedCategory) {
      router.push(`/app/reports/new/upload?category=${selectedCategory}`)
    }
  }

  const handleCancel = () => {
    router.push('/app/reports')
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[
              { label: 'Reports', href: '/app/reports' },
              { label: 'Nuevo Informe' }
            ]} />
            <div className="flex items-center gap-2 text-sm text-saas-muted">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-saas-accent" />
                <span className="w-2 h-2 rounded-full bg-saas-muted/30" />
                <span className="w-2 h-2 rounded-full bg-saas-muted/30" />
              </div>
              <span>Paso 1 de 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-saas-light mb-3">
              Seleccionar Categoría del Informe
            </h1>
            <p className="text-saas-muted">
              Elige el tipo de informe que deseas generar y validar.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {categories.map((category) => (
              <Card
                key={category.id}
                onClick={() => category.enabled && setSelectedCategory(category.id)}
                className={`
                  relative p-6 cursor-pointer transition-all duration-200
                  ${!category.enabled && 'opacity-50 cursor-not-allowed'}
                  ${selectedCategory === category.id 
                    ? 'border-saas-accent bg-saas-accent/10 ring-2 ring-saas-accent' 
                    : 'hover:border-saas-accent/50'
                  }
                `}
              >
                {/* Selection indicator */}
                {selectedCategory === category.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-saas-accent flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className="icon-container w-14 h-14 flex items-center justify-center mb-4">
                  <div className="text-saas-accent">
                    {category.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-saas-light mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-saas-muted leading-relaxed">
                  {category.description}
                </p>

                {/* Disabled badge */}
                {!category.enabled && (
                  <div className="mt-4">
                    <span className="text-xs text-saas-muted bg-[var(--dashboard-surface-elevated)] px-2 py-1 rounded">
                      Próximamente
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--dashboard-border)]">
            <Button variant="ghost" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar y Salir
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedCategory}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] py-3">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-saas-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-saas-success" />
              Sistema Listo
            </span>
            <span>Conectado: Terminal Bloomberg</span>
          </div>
          <span>FinValidate v2.4.0</span>
        </div>
      </footer>
    </div>
  )
}
