import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

const sizeStyles = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8"
}

export function LoadingSpinner({ size = "default", className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn("animate-spin text-muted-foreground", sizeStyles[size], className)} />
  )
}

// Full page loading state
interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({ message, className }: PageLoadingProps) {
  return (
    <div className={cn(
      "min-h-[400px] flex flex-col items-center justify-center",
      className
    )}>
      <LoadingSpinner size="lg" className="mb-4" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

// Inline loading for buttons
interface ButtonLoadingProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function ButtonLoading({ loading, children, loadingText }: ButtonLoadingProps) {
  if (loading) {
    return (
      <>
        <LoadingSpinner size="sm" className="mr-2" />
        {loadingText || children}
      </>
    )
  }
  return <>{children}</>
}

// Overlay loading for cards/sections
interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({ loading, children, message, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
          <LoadingSpinner size="lg" />
          {message && (
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
          )}
        </div>
      )}
    </div>
  )
}
