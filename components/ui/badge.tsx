import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-saas-accent/20 text-saas-accent border border-saas-accent/30",
        secondary: "bg-[var(--dashboard-surface-elevated)] text-saas-muted border border-[var(--dashboard-border)]",
        success: "bg-saas-success/20 text-saas-success border border-saas-success/30",
        warning: "bg-saas-warning/20 text-saas-warning border border-saas-warning/30",
        danger: "bg-saas-danger/20 text-saas-danger border border-saas-danger/30",
        outline: "border border-saas-accent text-saas-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
