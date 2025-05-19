import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        secondary:
          "border-transparent bg-white/5 text-slate-400",
        destructive:
          "border-transparent bg-red-500/10 text-red-400",
        outline:
          "border-white/10 bg-white/5 text-slate-400",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-400",
        premium:
          "border-transparent bg-gradient-to-r from-purple-500 to-blue-500 text-white",
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
