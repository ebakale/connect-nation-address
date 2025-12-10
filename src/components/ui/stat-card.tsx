import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted"
  size?: "sm" | "default" | "lg"
  className?: string
}

const variantStyles = {
  default: {
    value: "text-foreground",
    icon: "text-muted-foreground",
    bg: ""
  },
  success: {
    value: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "border-emerald-200 dark:border-emerald-800/50"
  },
  warning: {
    value: "text-amber-600 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-400",
    bg: "border-amber-200 dark:border-amber-800/50"
  },
  danger: {
    value: "text-red-600 dark:text-red-400",
    icon: "text-red-600 dark:text-red-400",
    bg: "border-red-200 dark:border-red-800/50"
  },
  info: {
    value: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
    bg: "border-blue-200 dark:border-blue-800/50"
  },
  muted: {
    value: "text-muted-foreground",
    icon: "text-muted-foreground",
    bg: "bg-muted/30"
  }
}

const sizeStyles = {
  sm: {
    card: "p-3",
    title: "text-xs",
    value: "text-lg",
    icon: "h-3.5 w-3.5",
    description: "text-[10px]"
  },
  default: {
    card: "",
    title: "text-sm",
    value: "text-2xl",
    icon: "h-4 w-4",
    description: "text-xs"
  },
  lg: {
    card: "p-6",
    title: "text-base",
    value: "text-3xl",
    icon: "h-5 w-5",
    description: "text-sm"
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  size = "default",
  className
}: StatCardProps) {
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  return (
    <Card className={cn(variantStyle.bg, sizeStyle.card, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("font-medium", sizeStyle.title)}>
          {title}
        </CardTitle>
        {Icon && <Icon className={cn(sizeStyle.icon, variantStyle.icon)} />}
      </CardHeader>
      <CardContent className={size === "sm" ? "p-0 pt-1" : ""}>
        <div className={cn("font-bold", sizeStyle.value, variantStyle.value)}>
          {value}
        </div>
        {description && (
          <p className={cn("text-muted-foreground mt-0.5", sizeStyle.description)}>
            {description}
          </p>
        )}
        {trend && trendValue && (
          <p className={cn(
            "mt-1 flex items-center gap-1",
            sizeStyle.description,
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Compact stat for emergency dashboards
interface CompactStatProps {
  label: string
  value: string | number
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

export function CompactStat({ label, value, variant = "default", className }: CompactStatProps) {
  const variantStyle = variantStyles[variant]
  
  return (
    <Card className={cn("p-3", variantStyle.bg, className)}>
      <div className="text-center">
        <p className={cn("text-xl font-bold", variantStyle.value)}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
