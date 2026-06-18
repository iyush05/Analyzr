import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-3 rounded-full border px-5 py-2 transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background hover:bg-foreground/80",
        secondary:
          "border-transparent bg-muted text-foreground hover:bg-muted/80",
        accent:
          "border-accent/30 bg-accent/5 text-accent font-mono text-xs uppercase tracking-[0.15em]",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, dot = false, pulsing = false, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span 
          className={cn(
            "h-2 w-2 rounded-full",
            variant === 'accent' ? "bg-accent" : "bg-current",
            pulsing && "animate-[pulse_2s_ease-in-out_infinite]"
          )} 
        />
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
