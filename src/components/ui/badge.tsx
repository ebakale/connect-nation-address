import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: 
          "border border-border text-foreground",
        
        // Status variants - Consistent across the platform
        pending:
          "bg-warning-light text-warning-foreground border border-warning/20",
        approved:
          "bg-success-light text-success border border-success/20",
        verified:
          "bg-success-light text-success border border-success/20",
        rejected:
          "bg-destructive-light text-destructive border border-destructive/20",
        inprogress:
          "bg-info-light text-info border border-info/20",
        
        // Semantic variants
        success:
          "bg-success-light text-success border border-success/20",
        warning:
          "bg-warning-light text-warning-foreground border border-warning/20",
        info:
          "bg-info-light text-info border border-info/20",
        error:
          "bg-destructive-light text-destructive border border-destructive/20",
        
        // Muted variant for less prominent badges
        muted:
          "bg-muted text-muted-foreground border border-border",
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
