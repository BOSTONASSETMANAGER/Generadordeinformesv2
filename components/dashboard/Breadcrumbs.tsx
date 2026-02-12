"use client"

import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="icon-container">
        <FileText className="w-5 h-5 text-saas-accent" />
      </div>
      <nav className="flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-4 h-4 text-saas-muted" />}
            {item.href ? (
              <Link 
                href={item.href}
                className="text-saas-muted hover:text-saas-light transition-colors cursor-pointer"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-saas-light font-medium">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}
