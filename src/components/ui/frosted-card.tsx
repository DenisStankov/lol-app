import type React from "react"
import { cn } from "@/lib/utils"

interface FrostedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function FrostedCard({ className, children, ...props }: FrostedCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-lol-border/50 bg-lol-overlay shadow-xl",
        "backdrop-blur-md", // Ensure backdrop-filter utilities are enabled in your Tailwind config
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
} 