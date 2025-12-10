import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, Inbox, Search, FileX, AlertCircle } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "secondary" | "outline"
  }
  variant?: "default" | "search" | "error" | "minimal"
  className?: string
}

const variantIcons: Record<string, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  minimal: FileX
}

const variantStyles = {
  default: "border-2 border-dashed border-muted rounded-lg",
  search: "border-2 border-dashed border-muted rounded-lg",
  error: "border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5",
  minimal: ""
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      variantStyles[variant],
      className
    )}>
      <div className={cn(
        "p-3 rounded-full mb-4",
        variant === "error" ? "bg-destructive/10" : "bg-muted"
      )}>
        <Icon className={cn(
          "h-8 w-8",
          variant === "error" ? "text-destructive" : "text-muted-foreground"
        )} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Inline loading skeleton for tables/lists
interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 animate-pulse", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-4 w-4 bg-muted rounded" />
      </div>
      <div className="h-8 bg-muted rounded w-1/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  )
}

// Stats grid skeleton
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
