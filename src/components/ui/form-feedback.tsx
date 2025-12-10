import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

type FeedbackType = "error" | "success" | "warning" | "info"

interface FormFeedbackProps {
  type: FeedbackType
  message: string
  className?: string
}

const feedbackConfig: Record<FeedbackType, { icon: typeof AlertCircle; styles: string }> = {
  error: {
    icon: AlertCircle,
    styles: "text-destructive bg-destructive/10 border-destructive/20"
  },
  success: {
    icon: CheckCircle,
    styles: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
  },
  warning: {
    icon: AlertTriangle,
    styles: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
  },
  info: {
    icon: Info,
    styles: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
  }
}

export function FormFeedback({ type, message, className }: FormFeedbackProps) {
  const config = feedbackConfig[type]
  const Icon = config.icon

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-md border text-sm",
      config.styles,
      className
    )}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// Inline field error message
interface FieldErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null

  return (
    <p className={cn(
      "text-xs text-destructive mt-1 flex items-center gap-1",
      className
    )}>
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  )
}

// Help text for form fields
interface HelpTextProps {
  children: React.ReactNode
  className?: string
}

export function HelpText({ children, className }: HelpTextProps) {
  return (
    <p className={cn(
      "text-xs text-muted-foreground mt-1",
      className
    )}>
      {children}
    </p>
  )
}

// Success message with check icon
interface SuccessMessageProps {
  message: string
  className?: string
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-emerald-600",
      className
    )}>
      <CheckCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
