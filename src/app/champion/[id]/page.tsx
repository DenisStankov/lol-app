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
  const [champion, setChampion] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/champions/${params.id}`)
        const data = await response.json()
        setChampion(data)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-lol-gold"></div>
      </div>
    )
  }

  if (!champion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl text-lol-gold mb-4">Champion not found</h1>
        <Link href="/champions" className="text-lol-blue hover:text-lol-gold transition-colors">
          Return to Champions
              </Link>
      </div>
    )
  }

  return <ChampionDetailClient champion={champion} />
} 