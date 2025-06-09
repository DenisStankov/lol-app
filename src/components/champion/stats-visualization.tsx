"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Shield, Sword, Wand2, Brain, Footprints, HeartHandshake, Target } from "lucide-react"

interface StatConfig {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

interface StatsVisualizationProps {
  champion: any // We'll type this properly later
}

export default function StatsVisualization({ champion }: StatsVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stats: StatConfig[] = [
    { icon: <Sword className="w-6 h-6" />, label: "Attack", value: champion.stats.attack || 0, color: "rgb(239, 68, 68)" },
    { icon: <Shield className="w-6 h-6" />, label: "Defense", value: champion.stats.defense || 0, color: "rgb(59, 130, 246)" },
    { icon: <Wand2 className="w-6 h-6" />, label: "Magic", value: champion.stats.magic || 0, color: "rgb(147, 51, 234)" },
    { icon: <Brain className="w-6 h-6" />, label: "Difficulty", value: champion.stats.difficulty || 0, color: "rgb(234, 179, 8)" },
    { icon: <Footprints className="w-6 h-6" />, label: "Mobility", value: champion.stats.mobility || 0, color: "rgb(34, 197, 94)" },
    { icon: <HeartHandshake className="w-6 h-6" />, label: "Utility", value: champion.stats.utility || 0, color: "rgb(14, 165, 233)" },
    { icon: <Target className="w-6 h-6" />, label: "Range", value: champion.stats.range || 0, color: "rgb(236, 72, 153)" }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const size = canvas.offsetWidth
    canvas.width = size * 2 // For retina displays
    canvas.height = size * 2
    ctx.scale(2, 2)

    // Calculate center and radius
    const center = size / 2
    const radius = (size / 2) * 0.8 // 80% of half width

    // Draw hexagonal grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)" // slate-400 with low opacity
    ctx.lineWidth = 1

    // Draw multiple hexagons for the grid
    for (let i = 1; i <= 5; i++) {
      const currentRadius = (radius / 5) * i
      ctx.beginPath()
      for (let j = 0; j < 6; j++) {
        const angle = (Math.PI / 3) * j
        const x = center + currentRadius * Math.cos(angle)
        const y = center + currentRadius * Math.sin(angle)
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Draw stat lines
    ctx.beginPath()
    stats.forEach((_, i) => {
      const angle = (Math.PI / 3.5) * i - Math.PI / 2
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + radius * Math.cos(angle),
        center + radius * Math.sin(angle)
      )
    })
    ctx.stroke()

  }, [stats])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Hexagonal Chart */}
      <div className="relative aspect-square">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {stats.map((stat, index) => {
              const angle = (360 / stats.length) * index - 90
              const radius = 42 // percentage from center
              return (
                <motion.div
                  key={stat.label}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${50 + radius * Math.cos((angle * Math.PI) / 180)}%`,
                    top: `${50 + radius * Math.sin((angle * Math.PI) / 180)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/90 
                             border border-slate-700/50 text-slate-200 shadow-lg"
                    style={{
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                </motion.div>
              )
            })}
            {/* Stat Value Indicators */}
            {stats.map((stat, index) => {
              const angle = (360 / stats.length) * index - 90
              const normalizedValue = stat.value / 100
              const radius = 35 * normalizedValue // percentage from center
              return (
                <motion.div
                  key={`value-${stat.label}`}
                  className="absolute w-3 h-3"
                  style={{
                    left: `${50 + radius * Math.cos((angle * Math.PI) / 180)}%`,
                    top: `${50 + radius * Math.sin((angle * Math.PI) / 180)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <div 
                    className="w-full h-full rounded-full shadow-lg animate-pulse"
                    style={{ backgroundColor: stat.color }}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-slate-200" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-lg font-medium text-slate-200">
                  {stat.label}
                </span>
              </div>
              <span className="text-xl font-semibold" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <div className="mt-2 h-2 bg-slate-700/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: stat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 