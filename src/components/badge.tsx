import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-accent text-text-main border-transparent hover:opacity-90",
        secondary:
          "bg-bg-card text-text-secondary border-border hover:bg-bg-card-hover",
        success:
          "bg-win-bg text-win-text border-transparent hover:bg-win-bg/90",
        destructive:
          "bg-loss-bg text-loss-text border-transparent hover:bg-loss-bg/90",
        outline:
          "bg-bg-card text-text-main border-border hover:bg-bg-card-hover",
        premium:
          "bg-gradient-to-r from-amber-500 to-yellow-500 text-text-main border-transparent hover:opacity-90",
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
