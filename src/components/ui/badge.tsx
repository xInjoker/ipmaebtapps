import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-error text-white hover:bg-error/80",
        outline: "text-foreground",
        green:
          "border-transparent bg-green-500 text-primary-foreground hover:bg-green-500/80",
        yellow:
          "border-transparent bg-yellow-400 text-yellow-950 hover:bg-yellow-400/80",
        orange:
          "border-transparent bg-orange-500 text-primary-foreground hover:bg-orange-500/80",
        blue:
          "border-transparent bg-blue-500 text-primary-foreground hover:bg-blue-500/80",
        purple:
          "border-transparent bg-purple-500 text-primary-foreground hover:bg-purple-500/80",
        success: "border-transparent bg-success text-white",
        warning: "border-transparent bg-warning text-dark",
        info: "border-transparent bg-info text-white",
        indigo: "border-transparent bg-indigo text-white",
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
