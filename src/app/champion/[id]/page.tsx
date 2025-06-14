"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Sword,
  Heart,
  Activity,
  Droplet,
  Star,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Clock,
  Eye,
  TrendingUp,
  Crown,
  Users,
} from "lucide-react"
import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/card"
import { Badge } from "@/components/badge"
import { cn } from "@/lib/utils"
import HeroSection from "@/components/champion/hero-section"
import StatsVisualization from "@/components/champion/stats-visualization" 
import AbilitiesShowcase from "@/components/champion/abilities-showcase"
import BuildPathItems from "@/components/champion/build-path-items"
import MatchupsCounters from "@/components/champion/matchups-counters"
import { ParticlesComponent } from "@/components/champion/particles-component"
import ChampionDetailClient from "@/components/champion/champion-detail-client"
import type { ChampionData } from "@/lib/types"
import ChampionHeroSection from "@/components/champion/champion-hero-section"
import AbilitiesSection from "@/components/champion/abilities-section"
import GameplayTabs from "@/components/champion/gameplay-tabs"
import { Separator } from "@/components/ui/separator"

// Add this component at the top of the file after the imports
const SafeImage = ({ src, alt, fill, className, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("/placeholder.svg?height=64&width=64")
    }
  }

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      fill={fill}
      className={className}
      onError={handleError}
      {...props}
    />
  )
}

export default function ChampionDetailsPage() {
  const params = useParams()
  const [champion, setChampion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    
    const fetchData = async () => {
      try {
        // Fetch champion details
        const detailsResponse = await fetch(`/api/champion-details?id=${params.id}`)
        const detailsData = await detailsResponse.json()
        
        if (!detailsResponse.ok) {
          throw new Error(detailsData.error || 'Failed to fetch champion details')
        }

        // Fetch champion meta data
        const metaResponse = await fetch(`/api/champion-meta?id=${params.id}`)
        const metaData = await metaResponse.json()

        // Fetch champion stats
        const statsResponse = await fetch(`/api/champion-stats`)
        const statsData = await statsResponse.json()
        const championId = params.id as string
        const championStats = statsData[championId] || {}

        // Combine all data
        const combinedData = {
          ...detailsData,
          ...metaData.roleSpecificData,
          meta: metaData,
          stats: championStats,
          themeColors: {
            primary: "rgba(15, 23, 42, 0.8)", // slate-900 with alpha
            accent: "text-yellow-300",
            particleColor: "#FFFFFF",
          }
        }

        setChampion(combinedData)
      } catch (error) {
        console.error("Error fetching champion data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-300"></div>
      </div>
    )
  }

  if (!champion) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl text-yellow-300 mb-4">Champion not found</h1>
        <p className="text-slate-400">Unable to load champion data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <Navigation />

      {/* Hero Section with Lore */}
      <ChampionHeroSection champion={champion} />

      {/* Stats Section - Overlapping with Hero */}
      <section className="relative z-10 -mt-32 container mx-auto px-4">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <StatsVisualization champion={champion} />
        </div>
      </section>

      {/* Abilities & Skill Order Section */}
      <section className="container mx-auto px-4 py-16">
        <AbilitiesSection champion={champion} />
      </section>

      <Separator className="container mx-auto bg-slate-800/50" />

      {/* Gameplay Information - Tabbed interface */}
      <section className="container mx-auto px-4 py-16">
        <GameplayTabs champion={champion} />
      </section>
    </div>
  )
}

function getChampionThemeColor(championClass: string = ""): string {
  switch (championClass.toLowerCase()) {
    case "mage":
      return "#8A2BE2" // Blue Violet
    case "assassin":
      return "#FF4444" // Red
    case "fighter":
      return "#FFA500" // Orange
    case "tank":
      return "#4169E1" // Royal Blue
    case "marksman":
      return "#32CD32" // Lime Green
    case "support":
      return "#FFD700" // Gold
    default:
      return "#4B0082" // Indigo
  }
}

function getChampionSecondaryColor(championClass: string = ""): string {
  switch (championClass.toLowerCase()) {
    case "mage":
      return "#4B0082" // Indigo
    case "assassin":
      return "#8B0000" // Dark Red
    case "fighter":
      return "#8B4513" // Saddle Brown
    case "tank":
      return "#191970" // Midnight Blue
    case "marksman":
      return "#006400" // Dark Green
    case "support":
      return "#B8860B" // Dark Goldenrod
    default:
      return "#2F0047" // Dark Purple
  }
}

function getDifficultyFromWinRate(winRate: number): "Easy" | "Medium" | "Even" | "Hard" | "Severe" {
  if (winRate >= 55) return "Severe"
  if (winRate >= 53) return "Hard"
  if (winRate >= 48 && winRate <= 52) return "Even"
  if (winRate >= 45) return "Medium"
  return "Easy"
} 