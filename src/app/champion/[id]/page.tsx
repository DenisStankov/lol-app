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
import ParticlesComponent from "@/components/champion/particles-component"

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
  const [champion, setChampion] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [params.id])

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Parallax */}
      <HeroSection
        name={champion.name}
        title={champion.title}
        splashArt={champion.imageURLs.splash}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Stats and Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <StatsVisualization
            info={champion.info}
            stats={champion.stats}
            tags={champion.tags}
          />
          
          <Card className="col-span-2">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-lol-gold mb-4">Lore</h2>
              <p className="text-gray-200">{champion.lore}</p>
            </CardContent>
          </Card>
        </div>

        {/* Abilities Showcase */}
        <AbilitiesShowcase
          passive={champion.passive}
          spells={champion.spells}
          championName={champion.name}
        />

        {/* Build Paths and Items */}
        <BuildPathItems championId={champion.id} />

        {/* Matchups and Counters */}
        <MatchupsCounters championId={champion.id} />
      </div>

      {/* Background Particles based on champion theme */}
      <ParticlesComponent championTags={champion.tags} />
    </div>
  )
} 