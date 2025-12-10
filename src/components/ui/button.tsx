import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Main CTA actions (Save, Submit, Confirm, Proceed)
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-light active:bg-primary-dark",
        
        // Destructive - ONLY for delete, cancel emergency, critical warnings
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
        
        // Outline - Secondary actions (Cancel, Back, Close)
        outline: "border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        
        // Secondary - Less prominent actions
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 active:bg-secondary/80",
        
        // Ghost - Tertiary/minimal actions
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        
        // Link - Text-like buttons
        link: "text-primary underline-offset-4 hover:underline",
        
        // Success - Approve, Verify, Confirm positive actions
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/80",
        
        // Warning - Actions that need attention
        warning: "bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 active:bg-warning/80",
        
        // Info - Informational actions
        info: "bg-info text-info-foreground shadow-sm hover:bg-info/90 active:bg-info/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
