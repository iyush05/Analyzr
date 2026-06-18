import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, featured = false, ...props }, ref) => {
  if (featured) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-accent via-accent-secondary to-accent p-[2px] shadow-accent-lg transition-all duration-300 hover:-translate-y-1">
        <div 
          ref={ref}
          className={cn(
            "h-full w-full rounded-[calc(12px-2px)] bg-card text-foreground",
            className
          )}
          {...props}
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card text-foreground shadow-md transition-all duration-300 hover:shadow-xl group relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Subtle hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {props.children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 md:p-8 pb-3", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 md:p-8 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 md:p-8 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
