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
        const statsData = await statsResponse.json() as { [key: string]: { winRate: number; pickRate: number; banRate: number; matches: number; roles: any } }
        const championId = params.id as string
        const championStats = statsData[championId] || {}

        // Combine all data into the format our components expect
        const combinedData: ChampionData = {
          id: detailsData.id,
          name: detailsData.name,
          title: detailsData.title,
          description: detailsData.blurb,
          lore: detailsData.lore,
          abilities: detailsData.spells.map((spell: any, index: number) => ({
            id: spell.id,
            name: spell.name,
            description: spell.description,
            iconUrl: detailsData.imageURLs.spells[index],
            keyBinding: ['Q', 'W', 'E', 'R'][index],
            cost: spell.costBurn
          })),
          stats: {
            winRate: championStats.winRate || 50,
            pickRate: championStats.pickRate || 10,
            banRate: championStats.banRate || 5,
            matches: championStats.matches || 1000
          },
          imageURLs: detailsData.imageURLs,
          particleType: detailsData.tags[0]?.toLowerCase() || "cosmic",
          themeColorPrimary: getChampionThemeColor(detailsData.tags[0]),
          themeColorSecondary: getChampionSecondaryColor(detailsData.tags[0]),
          tags: detailsData.tags,
          roles: championStats.roles || {},
          difficulty: {
            mechanical: detailsData.info.difficulty,
            teamfight: Math.round((detailsData.info.attack + detailsData.info.magic + detailsData.info.defense) / 3)
          },
          matchups: metaData?.roleSpecificData?.counters?.map((counter: any) => ({
            championId: counter.name,
            championName: counter.name,
            championIconUrl: counter.image,
            difficulty: getDifficultyFromWinRate(parseFloat(counter.winRate)),
            tips: detailsData.enemytips
          })) || [],
          counters: metaData?.roleSpecificData?.counters?.map((counter: any) => ({
            championId: counter.name,
            championName: counter.name,
            championIconUrl: counter.image,
            type: parseFloat(counter.winRate) > 50 ? "strong" : "weak"
          })) || [],
          recommendedBuilds: [{
            name: "Recommended Build",
            starterItems: metaData?.roleSpecificData?.build?.starter?.map((item: any) => ({
              id: item.name,
              name: item.name,
              iconUrl: item.image,
              cost: item.cost,
              stats: [],
              type: "Starter"
            })) || [],
            boots: metaData?.roleSpecificData?.build?.boots?.[0] ? {
              id: metaData.roleSpecificData.build.boots[0].name,
              name: metaData.roleSpecificData.build.boots[0].name,
              iconUrl: metaData.roleSpecificData.build.boots[0].image,
              cost: metaData.roleSpecificData.build.boots[0].cost,
              stats: [],
              type: "Boots"
            } : {
              id: "boots",
              name: "Boots of Speed",
              iconUrl: "/items/boots.png",
              cost: 300,
              stats: ["Movement Speed"],
              type: "Boots"
            },
            coreItems: metaData?.roleSpecificData?.build?.core?.map((item: any) => ({
              id: item.name,
              name: item.name,
              iconUrl: item.image,
              cost: item.cost,
              stats: [],
              type: item.order === 1 ? "Mythic" : "Legendary"
            })) || [],
            situationalItems: metaData?.roleSpecificData?.build?.situational?.map((item: any) => ({
              item: {
                id: item.name,
                name: item.name,
                iconUrl: item.image,
                cost: item.cost,
                stats: [],
                type: "Situational"
              },
              context: item.condition
            })) || []
          }]
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