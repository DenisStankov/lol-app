"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import type { TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface ChartTooltipContentProps extends TooltipProps<any, any> {
  indicator?: "line" | "bar"
  labelKey?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "line",
  labelKey = "name",
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">{label}</div>
        {payload.map((item: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  indicator === "line" ? "h-1 w-4" : "h-2 w-2"
                )}
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}
              </span>
            </div>
            <div className="text-sm font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartTooltip = ChartTooltipContent 