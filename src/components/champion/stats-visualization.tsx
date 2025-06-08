"use client"

import type React from "react"
import type { ChampionData, ChampionStats } from "@/lib/types"
import { BarChart, TrendingUp, Shield, Zap, Brain, ZapOff, HelpCircle, Swords } from "lucide-react"
import { FrostedCard } from "@/components/ui/frosted-card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart } from "recharts"

interface StatsVisualizationProps {
  champion: ChampionData
}

const statIcons: Record<keyof ChampionStats | string, React.ElementType> = {
  attack: Swords,
  defense: Shield,
  magic: Zap,
  difficulty: Brain,
  mobility: TrendingUp,
  utility: HelpCircle,
  cc: ZapOff, // Placeholder for Crowd Control
}

const statColors: Record<keyof ChampionStats | string, string> = {
  attack: "text-red-400",
  defense: "text-blue-400",
  magic: "text-purple-400",
  difficulty: "text-yellow-400",
  mobility: "text-green-400",
  utility: "text-teal-400",
  cc: "text-orange-400",
}

export default function StatsVisualization({ champion }: StatsVisualizationProps) {
  const chartData = Object.entries(champion.stats).map(([key, value]) => ({
    stat: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
  }))

  const radarChartConfig = {
    value: {
      label: "Value",
      color: champion.themeColorPrimary || "hsl(var(--primary))",
    },
  } satisfies Parameters<typeof RechartsRadarChart>[0]["config"]

  return (
    <section id="stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
        Champion Stats
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <FrostedCard className="p-4 md:p-6 h-[400px] md:h-[500px]">
          <ChartContainer config={radarChartConfig} className="w-full h-full">
            <RechartsRadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelKey="stat" />} />
              <PolarGrid className="fill-lol-grey/10 stroke-lol-grey/30" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(var(--foreground)/0.8)", fontSize: 12 }} />
              <Radar
                dataKey="value"
                fill={`url(#${champion.id}-fill)`} // Use champion-specific gradient
                fillOpacity={0.6}
                stroke={champion.themeColorPrimary || "hsl(var(--primary))"}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id={`${champion.id}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={champion.themeColorPrimary || "hsl(var(--primary))"} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={champion.themeColorSecondary || "hsl(var(--secondary))"}
                    stopOpacity={0.3}
                  />
                </linearGradient>
              </defs>
            </RechartsRadarChart>
          </ChartContainer>
        </FrostedCard>

        <div className="space-y-4">
          {Object.entries(champion.stats).map(([key, value]) => {
            const Icon = statIcons[key] || BarChart
            const colorClass = statColors[key] || "text-lol-gold-light"
            return (
              <FrostedCard key={key} className="p-4 group hover:shadow-lol-gold/20 transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${colorClass} transition-transform group-hover:scale-110`} />
                    <span className="text-lg font-medium text-lol-gold-light/90">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </div>
                  <span className={`text-xl font-semibold ${colorClass}`}>{value} / 100</span>
                </div>
                <div className="mt-2 h-3 bg-lol-grey-dark/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-${statColors[key]?.replace("text-", "")} via-${statColors[key]?.replace("text-", "").replace("-400", "-500")} to-${statColors[key]?.replace("text-", "").replace("-400", "-600")} animate-stat-bar-fill`}
                    style={{ "--stat-bar-width": `${value}%` } as React.CSSProperties}
                  />
                </div>
              </FrostedCard>
            )
          })}
        </div>
      </div>
      <p className="text-center mt-8 text-sm text-lol-grey">
        Comparative stats with other champions in the same role would appear here.
      </p>
    </section>
  )
} 