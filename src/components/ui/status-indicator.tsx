import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

type StatusType = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "active" 
  | "inactive" 
  | "reported"
  | "dispatched"
  | "responding"
  | "on_scene"
  | "resolved"
  | "closed"
  | "verified"
  | "unverified"
  | "published"
  | "unpublished"

interface StatusIndicatorProps {
  status: StatusType | string
  size?: "sm" | "default" | "lg"
  showDot?: boolean
  className?: string
  label?: string
}

const statusConfig: Record<string, { variant: any; label: string; dotColor: string }> = {
  // General statuses
  pending: { variant: "pending", label: "Pending", dotColor: "bg-amber-500" },
  approved: { variant: "approved", label: "Approved", dotColor: "bg-emerald-500" },
  rejected: { variant: "rejected", label: "Rejected", dotColor: "bg-red-500" },
  active: { variant: "success", label: "Active", dotColor: "bg-emerald-500" },
  inactive: { variant: "secondary", label: "Inactive", dotColor: "bg-gray-400" },
  
  // Emergency statuses
  reported: { variant: "destructive", label: "Reported", dotColor: "bg-red-500 animate-pulse" },
  dispatched: { variant: "warning", label: "Dispatched", dotColor: "bg-amber-500" },
  responding: { variant: "info", label: "Responding", dotColor: "bg-blue-500 animate-pulse" },
  on_scene: { variant: "info", label: "On Scene", dotColor: "bg-blue-600" },
  resolved: { variant: "success", label: "Resolved", dotColor: "bg-emerald-500" },
  closed: { variant: "secondary", label: "Closed", dotColor: "bg-gray-500" },
  
  // Address statuses
  verified: { variant: "approved", label: "Verified", dotColor: "bg-emerald-500" },
  unverified: { variant: "pending", label: "Unverified", dotColor: "bg-amber-500" },
  published: { variant: "success", label: "Published", dotColor: "bg-emerald-500" },
  unpublished: { variant: "secondary", label: "Unpublished", dotColor: "bg-gray-400" },
}

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0",
  default: "text-xs",
  lg: "text-sm px-3 py-1"
}

export function StatusIndicator({
  status,
  size = "default",
  showDot = false,
  className,
  label
}: StatusIndicatorProps) {
  const config = statusConfig[status.toLowerCase()] || {
    variant: "secondary",
    label: status,
    dotColor: "bg-gray-400"
  }

  const displayLabel = label || config.label

  return (
    <Badge 
      variant={config.variant} 
      className={cn(sizeStyles[size], className)}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dotColor)} />
      )}
      {displayLabel}
    </Badge>
  )
}

// Priority indicator for emergency incidents
interface PriorityIndicatorProps {
  level: number // 1-5, 1 being highest
  showLabel?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

const priorityConfig: Record<number, { variant: any; label: string; color: string }> = {
  1: { variant: "destructive", label: "Critical", color: "text-red-600" },
  2: { variant: "destructive", label: "High", color: "text-red-500" },
  3: { variant: "warning", label: "Medium", color: "text-amber-600" },
  4: { variant: "info", label: "Low", color: "text-blue-600" },
  5: { variant: "secondary", label: "Routine", color: "text-muted-foreground" }
}

export function PriorityIndicator({
  level,
  showLabel = true,
  size = "default",
  className
}: PriorityIndicatorProps) {
  const config = priorityConfig[level] || priorityConfig[3]

  return (
    <Badge 
      variant={config.variant}
      className={cn(sizeStyles[size], className)}
    >
      {showLabel ? config.label : `P${level}`}
    </Badge>
  )
}
