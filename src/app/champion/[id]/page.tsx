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

// Define our champion data interface based on the Riot API
interface ChampionData {
  id: string
  key: string
  name: string
  title: string
  lore: string
  blurb: string
  allytips: string[]
  enemytips: string[]
  tags: string[]
  partype: string
  info: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
  stats: {
    hp: number
    hpperlevel: number
    mp: number
    mpperlevel: number
    movespeed: number
    armor: number
    armorperlevel: number
    spellblock: number
    spellblockperlevel: number
    attackrange: number
    hpregen: number
    hpregenperlevel: number
    mpregen: number
    mpregenperlevel: number
    crit: number
    critperlevel: number
    attackdamage: number
    attackdamageperlevel: number
    attackspeedperlevel: number
    attackspeed: number
  }
  spells: Array<{
    id: string
    name: string
    description: string
    tooltip: string
    maxrank: number
    cooldown: number[]
    cooldownBurn: string
    cost: number[]
    costBurn: string
    range: number[]
    rangeBurn: string
    tags: string[]
    image: {
      full: string
    }
  }>
  passive: {
    name: string
    description: string
    image: {
      full: string
    }
  }
  imageURLs: {
    splash: string
    loading: string
    square: string
    passive: string
    spells: string[]
  }
  version: string
}

// Define interfaces for meta data
interface ChampionMetaData {
  championId: string
  winRate: string
  pickRate: string
  banRate: string
  roleSpecificData: RoleSpecificData
}

interface RoleSpecificData {
  runes: RuneData
  build: BuildData
  counters: CounterData[]
  skillOrder: SkillOrderData
  skills: {
    winRate: string
    games?: number
  }
}

interface RuneData {
  primary: {
    name: string
    keystone: string
    row1: string
    row2: string
    row3: string
  }
  secondary: {
    name: string
    row1: string
    row2: string
  }
  shards: string[]
  winRate?: string
}

interface BuildData {
  starter: ItemData[]
  core: ItemData[]
  situational: ItemData[]
  boots: BootData[]
  winRate?: string
}

interface ItemData {
  name: string
  image: string
  cost?: number
  condition?: string
  order?: number
}

interface BootData {
  name: string
  image: string
  pickRate: string
}

interface CounterData {
  name: string
  winRate: string
  image: string
}

interface SkillOrderData {
  maxPriority: string[]
  order: { level: number; skill: string }[]
}

// Helper function to format ability descriptions
const formatDescription = (description: string) => {
  return description
    .replace(/<br>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\.(?! )/g, ". ")
}

// Mock champion data for preview
const mockChampionData: ChampionData = {
  id: "Yasuo",
  key: "157",
  name: "Yasuo",
  title: "the Unforgiven",
  lore: "An Ionian of deep resolve, Yasuo is an agile swordsman who wields the air itself against his enemies.",
  blurb: "Yasuo is a resolute Ionian warrior.",
  allytips: ["Use Yasuo's mobility to your advantage"],
  enemytips: ["Yasuo is vulnerable when his shield is down"],
  tags: ["Fighter", "Assassin"],
  partype: "Flow",
  info: {
    attack: 10,
    defense: 4,
    magic: 4,
    difficulty: 10,
  },
  stats: {
    hp: 490,
    hpperlevel: 87,
    mp: 100,
    mpperlevel: 0,
    movespeed: 345,
    armor: 30,
    armorperlevel: 3.4,
    spellblock: 32,
    spellblockperlevel: 1.25,
    attackrange: 175,
    hpregen: 6.5,
    hpregenperlevel: 0.9,
    mpregen: 0,
    mpregenperlevel: 0,
    crit: 0,
    critperlevel: 0,
    attackdamage: 60,
    attackdamageperlevel: 3.2,
    attackspeedperlevel: 2.5,
    attackspeed: 0.67,
  },
  spells: [
    {
      id: "YasuoQW",
      name: "Steel Tempest",
      description:
        "Thrusts forward, dealing physical damage. On hit, grants a stack of Gathering Storm for a few seconds.",
      tooltip: "Steel Tempest",
      maxrank: 5,
      cooldown: [4, 4, 4, 4, 4],
      cooldownBurn: "4",
      cost: [0],
      costBurn: "0",
      range: [475],
      rangeBurn: "475",
      tags: ["Physical Damage"],
      image: { full: "YasuoQW.png" },
    },
    {
      id: "YasuoWMovingWall",
      name: "Wind Wall",
      description: "Creates a moving wall that blocks all enemy projectiles for 4 seconds.",
      tooltip: "Wind Wall",
      maxrank: 5,
      cooldown: [30, 27, 24, 21, 18],
      cooldownBurn: "30/27/24/21/18",
      cost: [0],
      costBurn: "0",
      range: [400],
      rangeBurn: "400",
      tags: ["Utility"],
      image: { full: "YasuoWMovingWall.png" },
    },
    {
      id: "YasuoDashWrapper",
      name: "Sweeping Blade",
      description: "Dashes through target enemy, dealing magic damage.",
      tooltip: "Sweeping Blade",
      maxrank: 5,
      cooldown: [0.5, 0.4, 0.3, 0.2, 0.1],
      cooldownBurn: "0.5/0.4/0.3/0.2/0.1",
      cost: [0],
      costBurn: "0",
      range: [475],
      rangeBurn: "475",
      tags: ["Magic Damage", "Dash"],
      image: { full: "YasuoDashWrapper.png" },
    },
    {
      id: "YasuoRKnockUpComboW",
      name: "Last Breath",
      description:
        "Teleports to an airborne enemy champion, dealing physical damage and holding all airborne enemies in the area in the air for an additional 1 second.",
      tooltip: "Last Breath",
      maxrank: 3,
      cooldown: [80, 55, 30],
      cooldownBurn: "80/55/30",
      cost: [0],
      costBurn: "0",
      range: [1200],
      rangeBurn: "1200",
      tags: ["Physical Damage"],
      image: { full: "YasuoRKnockUpComboW.png" },
    },
  ],
  passive: {
    name: "Way of the Wanderer",
    description: "Yasuo's Critical Strike Chance is doubled, but his Critical Strikes deal 10% less damage.",
    image: { full: "Yasuo_Passive.png" },
  },
  imageURLs: {
    splash: "/placeholder.svg?height=400&width=1200",
    loading: "/placeholder.svg?height=308&width=560",
    square: "/placeholder.svg?height=120&width=120",
    passive: "/placeholder.svg?height=64&width=64",
    spells: [
      "/placeholder.svg?height=64&width=64",
      "/placeholder.svg?height=64&width=64",
      "/placeholder.svg?height=64&width=64",
      "/placeholder.svg?height=64&width=64",
    ],
  },
  version: "14.14.1",
}

// Mock meta data
const mockMetaData: ChampionMetaData = {
  championId: "Yasuo",
  winRate: "51.2%",
  pickRate: "8.7%",
  banRate: "15.4%",
  roleSpecificData: {
    runes: {
      primary: {
        name: "Precision",
        keystone: "Lethal Tempo",
        row1: "Triumph",
        row2: "Legend: Alacrity",
        row3: "Last Stand",
      },
      secondary: {
        name: "Resolve",
        row1: "Bone Plating",
        row2: "Unflinching",
      },
      shards: ["Attack Speed", "Adaptive Force", "Armor"],
      winRate: "53.7%",
    },
    build: {
      starter: [
        { name: "Doran's Blade", image: "/placeholder.svg?height=64&width=64", cost: 450 },
        { name: "Health Potion", image: "/placeholder.svg?height=64&width=64", cost: 50 },
      ],
      core: [
        { name: "Immortal Shieldbow", image: "/placeholder.svg?height=64&width=64", cost: 3400, order: 1 },
        { name: "Infinity Edge", image: "/placeholder.svg?height=64&width=64", cost: 3400, order: 2 },
        { name: "Bloodthirster", image: "/placeholder.svg?height=64&width=64", cost: 3400, order: 3 },
      ],
      situational: [
        { name: "Guardian Angel", image: "/placeholder.svg?height=64&width=64", condition: "Safety", cost: 2800 },
        { name: "Death's Dance", image: "/placeholder.svg?height=64&width=64", condition: "vs AD", cost: 3300 },
        { name: "Spirit Visage", image: "/placeholder.svg?height=64&width=64", condition: "vs AP", cost: 2900 },
      ],
      boots: [
        { name: "Berserker's Greaves", image: "/placeholder.svg?height=64&width=64", pickRate: "85.2%" },
        { name: "Mercury's Treads", image: "/placeholder.svg?height=64&width=64", pickRate: "14.8%" },
      ],
      winRate: "54.7%",
    },
    counters: [
      { name: "Malphite", winRate: "58.2%", image: "/placeholder.svg?height=120&width=120" },
      { name: "Pantheon", winRate: "56.9%", image: "/placeholder.svg?height=120&width=120" },
      { name: "Renekton", winRate: "55.3%", image: "/placeholder.svg?height=120&width=120" },
    ],
    skillOrder: {
      maxPriority: ["Q", "E", "W"],
      order: [
        { level: 1, skill: "Q" },
        { level: 2, skill: "E" },
        { level: 3, skill: "W" },
        { level: 4, skill: "Q" },
        { level: 5, skill: "Q" },
        { level: 6, skill: "R" },
        { level: 7, skill: "Q" },
        { level: 8, skill: "E" },
        { level: 9, skill: "Q" },
        { level: 10, skill: "E" },
        { level: 11, skill: "R" },
        { level: 12, skill: "E" },
        { level: 13, skill: "E" },
        { level: 14, skill: "W" },
        { level: 15, skill: "W" },
        { level: 16, skill: "R" },
        { level: 17, skill: "W" },
        { level: 18, skill: "W" },
      ],
    },
    skills: {
      winRate: "53.2%",
      games: 15420,
    },
  },
}

export default function ChampionDetailsPage() {
  const params = useParams()
  const champId = params?.id as string
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  const [metaData, setMetaData] = useState<ChampionMetaData | null>(null)
  const [selectedAbility, setSelectedAbility] = useState<string>("passive")
  const [selectedTab, setSelectedTab] = useState("build")

  // Use mock data for preview
  useEffect(() => {
    setLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setChampionData(mockChampionData)
      setMetaData(mockMetaData)
      setLoading(false)
    }, 1000)
  }, [champId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
        {/* Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)] relative z-10">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-purple-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Loading Champion Data
            </h2>
            <p className="text-slate-400">Fetching the latest information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !championData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card className="bg-red-900/20 border-red-800/50 max-w-xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">Error Loading Champion</h2>
              <p className="text-slate-300 mb-6">{error || "Failed to load champion data"}</p>
              <Link
                href="/champions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                <ArrowLeft size={16} />
                Back to Champions
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow"></div>
        {/* Particle Effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <Navigation />

      {/* Hero Section - Champion Banner */}
      <div
        className="relative min-h-[500px] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${championData.imageURLs.splash})`,
          backgroundPosition: "50% 20%",
        }}
      >
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="absolute inset-0 flex items-end relative z-10">
          <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
            <div className="mb-8">
              <Link
                href="/tier-list"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
              >
                <ArrowLeft size={16} />
                Back to Tier List
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row items-end gap-8">
              {/* Champion Portrait */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border-2 border-blue-400/50 shadow-2xl shadow-black/50 transform translate-y-6 group-hover:scale-105 transition-all duration-500">
                  <SafeImage
                    src={championData.imageURLs.square}
                    alt={championData.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Level 18</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Champion Info */}
              <div className="flex-1 z-10 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div>
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/30 mb-3">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {championData.title}
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white animate-shimmer">
                      {championData.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                      {championData.tags.map((tag, index) => (
                        <Badge
                          key={tag}
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
                        >
                          {index === 0 && <Sword className="h-3 w-3 mr-1" />}
                          {index === 1 && <Zap className="h-3 w-3 mr-1" />}
                          {tag}
                        </Badge>
                      ))}
                      <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-400/30">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {metaData?.winRate || "53.2%"} WR
                      </Badge>
                      <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-400/30">
                        <Eye className="h-3 w-3 mr-1" />
                        {metaData?.pickRate || "8.7%"} PR
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-4">
                    {/* Difficulty Rating */}
                    <div className="flex flex-col items-center lg:items-end">
                      <div className="text-sm text-slate-400 mb-2">Difficulty</div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-8 rounded-full transition-all duration-300",
                              i < Math.floor(championData.info.difficulty / 2)
                                ? "bg-gradient-to-t from-red-500 to-orange-400 shadow-lg shadow-red-500/30"
                                : "bg-white/10",
                            )}
                          />
                        ))}
                      </div>
                      <Badge
                        className={cn(
                          "text-sm font-medium",
                          championData.info.difficulty <= 3
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : championData.info.difficulty <= 6
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                              : "bg-red-500/20 text-red-300 border-red-400/30",
                        )}
                      >
                        {championData.info.difficulty <= 3
                          ? "Easy"
                          : championData.info.difficulty <= 6
                            ? "Moderate"
                            : "Hard"}{" "}
                        to Master
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Champion Stats Summary */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 border-t border-b border-white/10 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-400/20 hover:border-red-400/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Health</div>
                    <div className="text-lg font-bold text-white">{championData.stats.hp}</div>
                    <div className="text-xs text-slate-500">+{championData.stats.hpperlevel}/lvl</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Droplet className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">{championData.partype}</div>
                    <div className="text-lg font-bold text-white">{championData.stats.mp}</div>
                    <div className="text-xs text-slate-500">+{championData.stats.mpperlevel}/lvl</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-400/20 hover:border-amber-400/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sword className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Attack</div>
                    <div className="text-lg font-bold text-white">{championData.stats.attackdamage}</div>
                    <div className="text-xs text-slate-500">+{championData.stats.attackdamageperlevel}/lvl</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-400/20 hover:border-green-400/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Speed</div>
                    <div className="text-lg font-bold text-white">{championData.stats.movespeed}</div>
                    <div className="text-xs text-slate-500">Base value</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500/10 to-slate-500/5 border-gray-400/20 hover:border-gray-400/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Armor</div>
                    <div className="text-lg font-bold text-white">{championData.stats.armor}</div>
                    <div className="text-xs text-slate-500">+{championData.stats.armorperlevel}/lvl</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Build & Runes */}
          <div className="xl:col-span-2 space-y-8">
            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Trophy className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-emerald-400">{metaData?.winRate}</div>
                      <div className="text-xs text-slate-500">Current patch</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Eye className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Pick Rate</div>
                      <div className="text-2xl font-bold text-blue-400">{metaData?.pickRate}</div>
                      <div className="text-xs text-slate-500">Popularity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-400/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Ban Rate</div>
                      <div className="text-2xl font-bold text-red-400">{metaData?.banRate}</div>
                      <div className="text-xs text-slate-500">Threat level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Build Selection Tabs */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
                <div className="flex">
                  <button
                    onClick={() => setSelectedTab("build")}
                    className={cn(
                      "flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative group",
                      selectedTab === "build"
                        ? "text-blue-400 bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sword className="h-4 w-4" />
                      Recommended Build
                    </div>
                    {selectedTab === "build" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedTab("runes")}
                    className={cn(
                      "flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative group",
                      selectedTab === "runes"
                        ? "text-blue-400 bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Runes
                    </div>
                    {selectedTab === "runes" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedTab("counters")}
                    className={cn(
                      "flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative group",
                      selectedTab === "counters"
                        ? "text-blue-400 bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Target className="h-4 w-4" />
                      Counters
                    </div>
                    {selectedTab === "counters" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Build Tab Content */}
              {selectedTab === "build" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Sword className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Optimal Build Path</h3>
                        <p className="text-sm text-slate-400">Highest win rate build</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-400/30">
                      <Trophy className="h-3 w-3 mr-1" />
                      {metaData?.roleSpecificData?.build?.winRate || "54.7%"} WR
                    </Badge>
                  </div>

                  {/* Starter Items */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        Starter Items
                      </h4>
                      <Badge className="bg-white/10 text-slate-300 border-white/20">Early Game</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {metaData?.roleSpecificData?.build?.starter?.map((item, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/10 to-white/5 group-hover:border-blue-400/50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            <SafeImage src={item.image} alt={item.name} fill className="object-cover p-2" />
                            {item.cost && (
                              <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-black/80 to-transparent px-1.5 py-0.5 text-xs text-yellow-400 font-medium">
                                {item.cost}g
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-3 text-sm pointer-events-none transition-all duration-300">
                            <div className="font-semibold text-white mb-1">{item.name}</div>
                            {item.condition && <div className="text-xs text-slate-400">{item.condition}</div>}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Items */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        Core Build
                      </h4>
                      <Badge className="bg-white/10 text-slate-300 border-white/20">Build Order</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {metaData?.roleSpecificData?.build?.core?.map((item, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/10 to-white/5 group-hover:border-purple-400/50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                            <SafeImage src={item.image} alt={item.name} fill className="object-cover p-2" />
                            {item.cost && (
                              <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-black/80 to-transparent px-1.5 py-0.5 text-xs text-yellow-400 font-medium">
                                {item.cost}g
                              </div>
                            )}
                            {item.order && (
                              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white/20">
                                {item.order}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-3 text-sm pointer-events-none transition-all duration-300">
                            <div className="font-semibold text-white mb-1">{item.name}</div>
                            {item.condition && <div className="text-xs text-slate-400">{item.condition}</div>}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Boots and Situational in Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Boots Options */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          Boots Options
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {metaData?.roleSpecificData?.build?.boots?.map((boot, index) => (
                          <div key={index} className="relative group cursor-pointer">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/10 to-white/5 group-hover:border-green-400/50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                              <SafeImage src={boot.image} alt={boot.name} fill className="object-cover p-2" />
                              <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-green-500/80 to-transparent px-1.5 py-0.5 text-xs text-green-300 font-medium">
                                {boot.pickRate}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-3 text-sm pointer-events-none transition-all duration-300">
                              <div className="font-semibold text-white mb-1">{boot.name}</div>
                              <div className="text-xs text-green-400">Pick Rate: {boot.pickRate}</div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Situational Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          Situational
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {metaData?.roleSpecificData?.build?.situational?.map((item, index) => (
                          <div key={index} className="relative group cursor-pointer">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/10 to-white/5 group-hover:border-orange-400/50 group-hover:scale-105 transition-all duration-300 shadow-lg">
                              <SafeImage src={item.image} alt={item.name} fill className="object-cover p-2" />
                              {item.cost && (
                                <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-black/80 to-transparent px-1.5 py-0.5 text-xs text-yellow-400 font-medium">
                                  {item.cost}g
                                </div>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-3 text-sm pointer-events-none transition-all duration-300">
                              <div className="font-semibold text-white mb-1">{item.name}</div>
                              {item.condition && <div className="text-xs text-slate-400">{item.condition}</div>}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Runes Tab Content */}
              {selectedTab === "runes" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Optimal Rune Setup</h3>
                        <p className="text-sm text-slate-400">Most successful configuration</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30">
                      <Star className="h-3 w-3 mr-1" />
                      {metaData?.roleSpecificData?.runes?.winRate || "55.2%"} WR
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Rune Path */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-400/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400 border border-purple-400/30">
                            P
                          </div>
                          <h4 className="text-lg font-semibold text-white">
                            {metaData?.roleSpecificData?.runes?.primary?.name || "Precision"}
                          </h4>
                        </div>

                        {/* Keystone */}
                        <div className="mb-6">
                          <div className="text-sm text-slate-400 mb-3">Keystone</div>
                          <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-purple-400/50 shadow-lg">
                              <SafeImage
                                src="/placeholder.svg?height=48&width=48"
                                alt="Keystone"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {metaData?.roleSpecificData?.runes?.primary?.keystone || "Lethal Tempo"}
                              </div>
                              <div className="text-xs text-slate-400">Primary keystone</div>
                            </div>
                          </div>
                        </div>

                        {/* Rune Rows */}
                        <div className="space-y-4">
                          {[
                            metaData?.roleSpecificData?.runes?.primary?.row1 || "Triumph",
                            metaData?.roleSpecificData?.runes?.primary?.row2 || "Legend: Alacrity",
                            metaData?.roleSpecificData?.runes?.primary?.row3 || "Last Stand",
                          ].map((rune, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20">
                                <SafeImage
                                  src={`/placeholder.svg?height=40&width=40&query=${rune.toLowerCase().replace(/[^a-z0-9]/g, "+")}`}
                                  alt={rune}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-sm text-slate-200">{rune}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Secondary Rune Path */}
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-400/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 border border-blue-400/30">
                            S
                          </div>
                          <h4 className="text-lg font-semibold text-white">
                            {metaData?.roleSpecificData?.runes?.secondary?.name || "Resolve"}
                          </h4>
                        </div>

                        {/* Secondary Runes */}
                        <div className="space-y-4 mb-8">
                          {[
                            metaData?.roleSpecificData?.runes?.secondary?.row1 || "Bone Plating",
                            metaData?.roleSpecificData?.runes?.secondary?.row2 || "Unflinching",
                          ].map((rune, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20">
                                <SafeImage
                                  src={`/placeholder.svg?height=40&width=40&query=${rune.toLowerCase().replace(/[^a-z0-9]/g, "+")}`}
                                  alt={rune}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-sm text-slate-200">{rune}</div>
                            </div>
                          ))}
                        </div>

                        {/* Stat Shards */}
                        <div>
                          <div className="text-sm text-slate-400 mb-3">Stat Shards</div>
                          <div className="flex flex-wrap gap-2">
                            {(
                              metaData?.roleSpecificData?.runes?.shards || ["Attack Speed", "Adaptive Force", "Armor"]
                            ).map((shard, index) => (
                              <Badge key={index} className="bg-white/10 text-slate-200 border-white/20">
                                {shard}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Enhanced Counters Tab Content */}
              {selectedTab === "counters" && (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Champion Counters</h3>
                      <p className="text-sm text-slate-400">Champions that perform well against {championData.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metaData?.roleSpecificData?.counters?.map((counter, index) => (
                      <Card
                        key={index}
                        className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-400/20 hover:border-red-400/40 transition-all duration-300 group cursor-pointer overflow-hidden"
                      >
                        <div className="relative h-32 bg-cover bg-center">
                          <SafeImage
                            src={counter.image || "/placeholder.svg"}
                            alt={counter.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="font-semibold text-white">{counter.name}</div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-400">Win Rate vs {championData.name}</div>
                            <Badge className="bg-red-500/20 text-red-300 border-red-400/30">{counter.winRate}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Champion Abilities */}
          <div className="space-y-8">
            {/* Enhanced Abilities Card */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Champion Abilities</h3>
                    <p className="text-sm text-slate-400">Passive and active abilities</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {/* Enhanced Ability Navigation */}
                <div className="flex mb-6 p-1 bg-white/5 rounded-lg border border-white/10">
                  <button
                    onClick={() => setSelectedAbility("passive")}
                    className={cn(
                      "flex-1 flex flex-col items-center p-3 rounded-md transition-all duration-300",
                      selectedAbility === "passive"
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg"
                        : "hover:bg-white/5",
                    )}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white/10 mb-2 group-hover:scale-105 transition-transform duration-300">
                      <SafeImage src={championData.imageURLs.passive} alt="Passive" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <div className="text-xs font-medium text-slate-300">Passive</div>
                  </button>
                  {championData.spells.map((spell, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAbility(["q", "w", "e", "r"][index])}
                      className={cn(
                        "flex-1 flex flex-col items-center p-3 rounded-md transition-all duration-300",
                        selectedAbility === ["q", "w", "e", "r"][index]
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg"
                          : "hover:bg-white/5",
                      )}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white/10 mb-2 group-hover:scale-105 transition-transform duration-300">
                        <SafeImage
                          src={championData.imageURLs.spells[index]}
                          alt={spell.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>
                      <div className="text-xs font-medium text-slate-300">{["Q", "W", "E", "R"][index]}</div>
                    </button>
                  ))}
                </div>

                {/* Enhanced Ability Details */}
                <div className="min-h-[300px]">
                  {selectedAbility === "passive" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-400/20">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-400/50 shadow-lg flex-shrink-0">
                          <SafeImage
                            src={championData.imageURLs.passive}
                            alt={championData.passive.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-blue-400">{championData.passive.name}</h4>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Passive</Badge>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {formatDescription(championData.passive.description)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {["q", "w", "e", "r"].includes(selectedAbility) && championData.spells && (
                    <div className="space-y-4">
                      {championData.spells.map((spell, index) => {
                        const spellKey = ["q", "w", "e", "r"][index]
                        if (spellKey !== selectedAbility) return null

                        return (
                          <div key={spell.id} className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-400/20">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-400/50 shadow-lg flex-shrink-0">
                                <SafeImage
                                  src={championData.imageURLs.spells[index]}
                                  alt={spell.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-lg font-bold text-purple-400">{spell.name}</h4>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                                    {selectedAbility.toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Ability Stats */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {spell.cooldownBurn && (
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {spell.cooldownBurn}s
                                    </Badge>
                                  )}
                                  {spell.costBurn && spell.costBurn !== "0" && (
                                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                                      <Droplet className="h-3 w-3 mr-1" />
                                      {spell.costBurn}
                                    </Badge>
                                  )}
                                  {spell.rangeBurn && spell.rangeBurn !== "0" && (
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                                      <Target className="h-3 w-3 mr-1" />
                                      {spell.rangeBurn}
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm text-slate-300 leading-relaxed">
                                  {formatDescription(spell.description)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Skill Order Card */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Skill Order</h3>
                    <p className="text-sm text-slate-400">Optimal leveling sequence</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {/* Max Priority */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Max Priority</h4>
                    {metaData?.roleSpecificData?.skills?.winRate && (
                      <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-400/30">
                        <Trophy className="h-3 w-3 mr-1" />
                        {metaData.roleSpecificData.skills.winRate} WR
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-4 justify-center">
                    {(metaData?.roleSpecificData?.skillOrder?.maxPriority || ["Q", "E", "W"]).map((ability, index) => (
                      <div key={ability} className="relative group">
                        <div
                          className={cn(
                            "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 group-hover:scale-105",
                            index === 0
                              ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 shadow-lg shadow-yellow-500/20"
                              : index === 1
                                ? "border-silver-400/50 bg-gradient-to-br from-slate-400/20 to-gray-500/20"
                                : "border-amber-600/50 bg-gradient-to-br from-amber-700/20 to-orange-700/20",
                          )}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className={cn(
                                "text-2xl font-bold",
                                index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : "text-amber-600",
                              )}
                            >
                              {ability}
                            </span>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Sequence */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Level Sequence</h4>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr>
                          <th className="text-left text-sm text-slate-400 pb-3 pr-4">Ability</th>
                          {[...Array(18)].map((_, i) => (
                            <th key={i} className="w-8 text-center text-xs text-slate-400 pb-3">
                              {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["Q", "W", "E", "R"].map((ability) => {
                          const pattern = Array(18).fill(0)

                          if (metaData?.roleSpecificData?.skillOrder?.order) {
                            metaData.roleSpecificData.skillOrder.order.forEach((point) => {
                              if (point.skill === ability && point.level >= 1 && point.level <= 18) {
                                pattern[point.level - 1] = 1
                              }
                            })
                          }

                          return (
                            <tr key={ability} className="border-t border-white/5">
                              <td className="py-3 pr-4">
                                <Badge
                                  className={cn(
                                    "font-semibold",
                                    ability === "Q"
                                      ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                                      : ability === "W"
                                        ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                        : ability === "E"
                                          ? "bg-green-500/20 text-green-300 border-green-400/30"
                                          : "bg-red-500/20 text-red-300 border-red-400/30",
                                  )}
                                >
                                  {ability}
                                </Badge>
                              </td>
                              {pattern.map((point, i) => (
                                <td key={i} className="text-center py-3">
                                  {point ? (
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto shadow-lg",
                                        ability === "Q"
                                          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white border border-purple-400"
                                          : ability === "W"
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border border-blue-400"
                                            : ability === "E"
                                              ? "bg-gradient-to-br from-green-500 to-green-600 text-white border border-green-400"
                                              : "bg-gradient-to-br from-red-500 to-red-600 text-white border border-red-400",
                                      )}
                                    >
                                      •
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-white/10 mx-auto"></div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {metaData?.roleSpecificData?.skills?.games && (
                    <div className="mt-4 text-center">
                      <Badge className="bg-white/10 text-slate-300 border-white/20">
                        <Users className="h-3 w-3 mr-1" />
                        {metaData.roleSpecificData.skills.games.toLocaleString()} games analyzed
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 mt-16 bg-gradient-to-r from-black/40 to-black/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                LoLytics isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games
                or anyone officially involved in producing or managing League of Legends.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-shimmer { 
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-reverse { animation-direction: reverse; }
      `}</style>
    </div>
  )
} 