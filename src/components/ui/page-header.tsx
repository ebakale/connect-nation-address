import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface PageHeaderProps {
  title: string
  description?: string
  badges?: Array<{
    label: string
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info" | "pending" | "approved" | "rejected"
  }>
  actions?: React.ReactNode
  icon?: React.ReactNode
  variant?: "default" | "admin" | "emergency" | "citizen"
  className?: string
}

const variantStyles = {
  default: "bg-gradient-to-r from-primary/5 via-background to-secondary/5",
  admin: "bg-gradient-to-r from-admin-accent/10 via-background to-admin-accent/5 border-l-4 border-l-admin-accent",
  emergency: "bg-gradient-to-r from-emergency-bg via-background to-emergency-bg/50 border-l-4 border-l-destructive",
  citizen: "bg-gradient-to-r from-citizen-accent/10 via-background to-citizen-accent/5"
}

export function PageHeader({
  title,
  description,
  badges,
  actions,
  icon,
  variant = "default",
  className
}: PageHeaderProps) {
  return (
    <div className={cn(
      "rounded-lg p-4 md:p-6",
      variantStyles[variant],
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant={badge.variant || "secondary"}
                  className="text-xs"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Section header for dashboard sections
interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
