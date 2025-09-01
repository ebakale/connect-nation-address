import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, onInput, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement)

    const resize = React.useCallback(() => {
      const el = innerRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [])

    React.useEffect(() => {
      if (autoResize) {
        resize()
      }
    }, [autoResize, props.value, resize])

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      if (autoResize) {
        resize()
      }
      onInput?.(e)
    }

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          autoResize ? "resize-none overflow-hidden" : "",
          className
        )}
        ref={innerRef}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
