import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent to-accent-secondary text-accent-foreground shadow-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]",
        secondary:
          "bg-transparent border border-border text-foreground hover:bg-muted/50 hover:border-accent/30 hover:shadow-sm active:scale-[0.98]",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-5 py-2",
        sm: "h-10 px-4",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
