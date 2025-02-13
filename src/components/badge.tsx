import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent hover:from-purple-600 hover:to-blue-600",
        secondary:
          "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-transparent hover:from-slate-600 hover:to-slate-700",
        success:
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-transparent hover:from-emerald-600 hover:to-green-600",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white border-transparent hover:from-red-600 hover:to-pink-600",
        outline:
          "bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20",
        premium:
          "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-transparent hover:from-amber-600 hover:to-yellow-600",
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
