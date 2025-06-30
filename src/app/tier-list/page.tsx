"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ArrowUp, ArrowDown, Trophy, Filter, Star, Sparkles, Shield, Swords, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/badge"
import { Card, CardContent } from "@/components/card"
import Image from "next/image"
import { createPortal } from "react-dom"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Role types
type Role = "top" | "jungle" | "mid" | "adc" | "support" | "all"

// Division types
type Division =
  | "iron+"
  | "bronze+"
  | "silver+"
  | "gold+"
  | "platinum+"
  | "emerald+"
  | "diamond+"
  | "master+"
  | "grandmaster+"
  | "challenger+"

// Tier types
type Tier = "S+" | "S" | "A" | "B" | "C" | "D"

// Sort types
type SortField = "tier" | "winrate" | "pickrate" | null
type SortDirection = "asc" | "desc"

// Champion data type
interface Champion {
  id: string
  name: string
  icon: string
  primaryRole: Role
  secondaryRole?: Role
  roles: {
    [key: string]: {
      games: number
      wins: number
      tier: Tier
      winRate: number
      pickRate: number
      banRate: number
      winRateDelta?: number
      kda: {
        kills: number
        deaths: number
        assists: number
      }
    }
  }
  difficulty: string
  damageType: string
  range: string
  confidence: number
  sourcesUsed: string[]
}

// Define rank map for use in multiple places
const rankMap: Record<Division, string> = {
  "iron+": "Iron",
  "bronze+": "Bronze",
  "silver+": "Silver",
  "gold+": "Gold",
  "platinum+": "Platinum",
  "emerald+": "Emerald",
  "diamond+": "Diamond",
  "master+": "Master",
  "grandmaster+": "Grandmaster",
  "challenger+": "Challenger",
}

// Add a mapping for role labels
const roleLabels: Record<Role, string> = {
  all: "All",
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  adc: "ADC",
  support: "Support",
};

// Define supported divisions for real data
const supportedDivisions: Division[] = ["challenger+", "grandmaster+", "master+"];

const regionMap: Record<string, string> = {
  na: "NA",
  euw: "EUW",
  eune: "EUNE",
  kr: "KR",
  br: "BR",
  jp: "JP",
  lan: "LAN",
  las: "LAS",
  oce: "OCE",
  tr: "TR",
  ru: "RU",
};

// Mock tier list data
const tierListData = [
  {
    id: 1,
    name: "Jinx",
    role: "ADC",
    tier: "S+",
    winrate: 54.2,
    pickrate: 12.8,
    banrate: 8.5,
    games: 125420,
    delta: 2.1,
    image: "/placeholder.svg?height=64&width=64&text=Jinx",
  },
  {
    id: 2,
    name: "Graves",
    role: "Jungle",
    tier: "S+",
    winrate: 53.8,
    pickrate: 15.2,
    banrate: 12.3,
    games: 98750,
    delta: 1.8,
    image: "/placeholder.svg?height=64&width=64&text=Graves",
  },
  {
    id: 3,
    name: "Katarina",
    role: "Mid",
    tier: "S",
    winrate: 52.9,
    pickrate: 8.7,
    banrate: 15.2,
    games: 87650,
    delta: -0.5,
    image: "/placeholder.svg?height=64&width=64&text=Katarina",
  },
  {
    id: 4,
    name: "Thresh",
    role: "Support",
    tier: "S",
    winrate: 51.8,
    pickrate: 18.5,
    banrate: 6.8,
    games: 156780,
    delta: 1.2,
    image: "/placeholder.svg?height=64&width=64&text=Thresh",
  },
  {
    id: 5,
    name: "Darius",
    role: "Top",
    tier: "A",
    winrate: 51.2,
    pickrate: 9.8,
    banrate: 11.5,
    games: 76540,
    delta: -1.1,
    image: "/placeholder.svg?height=64&width=64&text=Darius",
  },
  {
    id: 6,
    name: "Lux",
    role: "Support",
    tier: "A",
    winrate: 50.8,
    pickrate: 14.2,
    banrate: 4.2,
    games: 134560,
    delta: 0.8,
    image: "/placeholder.svg?height=64&width=64&text=Lux",
  },
  {
    id: 7,
    name: "Yasuo",
    role: "Mid",
    tier: "B",
    winrate: 49.5,
    pickrate: 16.8,
    banrate: 22.1,
    games: 198760,
    delta: -2.3,
    image: "/placeholder.svg?height=64&width=64&text=Yasuo",
  },
  {
    id: 8,
    name: "Garen",
    role: "Top",
    tier: "B",
    winrate: 49.2,
    pickrate: 7.5,
    banrate: 3.1,
    games: 65430,
    delta: 0.2,
    image: "/placeholder.svg?height=64&width=64&text=Garen",
  },
  {
    id: 9,
    name: "Azir",
    role: "Mid",
    tier: "C",
    winrate: 47.8,
    pickrate: 3.2,
    banrate: 1.8,
    games: 28750,
    delta: -1.8,
    image: "/placeholder.svg?height=64&width=64&text=Azir",
  },
  {
    id: 10,
    name: "Kalista",
    role: "ADC",
    tier: "D",
    winrate: 45.2,
    pickrate: 1.8,
    banrate: 0.5,
    games: 15420,
    delta: -3.2,
    image: "/placeholder.svg?height=64&width=64&text=Kalista",
  },
]

// Role color mapping for better visual differentiation
const roleColors: Record<string, string> = {
  "Assassin": "#E84057",
  "Fighter": "#D75A37",
  "Mage": "#0AC8B9",
  "Marksman": "#FEA526", 
  "Support": "#AA5DC9",
  "Tank": "#5383E8"
};

const roles = [
  { id: "all", name: "All", color: "text-white" },
  { id: "top", name: "Top", color: "text-red-400" },
  { id: "jungle", name: "Jungle", color: "text-green-400" },
  { id: "mid", name: "Mid", color: "text-blue-400" },
  { id: "adc", name: "ADC", color: "text-yellow-400" },
  { id: "support", name: "Support", color: "text-cyan-400" },
]

const ranks = [
  { id: "all", name: "All Ranks" },
  { id: "iron", name: "Iron" },
  { id: "bronze", name: "Bronze" },
  { id: "silver", name: "Silver" },
  { id: "gold", name: "Gold" },
  { id: "platinum", name: "Platinum" },
  { id: "diamond", name: "Diamond" },
  { id: "master", name: "Master+" },
]

const tierColors = {
  "S+": "text-[#FF4E50] bg-gradient-to-r from-[#FF4E50]/20 to-[#FF4E50]/5",
  S: "text-[#FF9800] bg-gradient-to-r from-[#FF9800]/20 to-[#FF9800]/5",
  A: "text-[#4CAF50] bg-gradient-to-r from-[#4CAF50]/20 to-[#4CAF50]/5",
  B: "text-[#2196F3] bg-gradient-to-r from-[#2196F3]/20 to-[#2196F3]/5",
  C: "text-[#9C27B0] bg-gradient-to-r from-[#9C27B0]/20 to-[#9C27B0]/5",
  D: "text-[#607D8B] bg-gradient-to-r from-[#607D8B]/20 to-[#607D8B]/5",
}

export default function TierList() {
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedRank, setSelectedRank] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("tier")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(false)
  const [latestVersion, setLatestVersion] = useState("13.24.1")

  const router = useRouter()

  // Fetch current patch version
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
        const data = await response.json()
        setLatestVersion(data[0])
      } catch (error) {
        console.error("Error fetching version:", error)
      }
    }
    fetchVersion()
  }, [])

  const filteredData = useMemo(() => {
    const filtered = tierListData.filter((champion) => {
      const matchesRole = selectedRole === "all" || champion.role.toLowerCase() === selectedRole
      const matchesSearch = champion.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRole && matchesSearch
    })

    // Sort by tier first, then by other columns
    filtered.sort((a, b) => {
      const tierOrder = { "S+": 1, S: 2, A: 3, B: 4, C: 5, D: 6 }

      if (sortColumn === "tier") {
        const aTier = tierOrder[a.tier as keyof typeof tierOrder]
        const bTier = tierOrder[b.tier as keyof typeof tierOrder]
        return sortDirection === "asc" ? aTier - bTier : bTier - aTier
      }

      let aValue = a[sortColumn as keyof typeof a]
      let bValue = b[sortColumn as keyof typeof b]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [selectedRole, searchQuery, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection(column === "tier" ? "asc" : "desc")
    }
  }

  const getTierBadge = (tier: string) => {
    return (
      <span className={`inline-block px-4 py-1.5 rounded-full font-bold shadow-sm ${tierColors[tier as keyof typeof tierColors]}`}>
        {tier}
      </span>
    )
  }

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 52) return "text-green-400"
    if (winrate >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-zinc-400" />
  }

  const getRoleColor = (role: string) => {
    const roleData = roles.find((r) => r.id === role.toLowerCase())
    return roleData?.color || "text-white"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <Navigation />
      
      {/* Version badge for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white/5 text-blue-400 px-3 py-1 rounded-full text-xs font-mono z-50 border border-white/10 shadow-lg">
          Data Dragon v{latestVersion}
        </div>
      )}
      
      {/* Featured Champion Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div 
          className="h-80 w-full bg-center bg-cover" 
          style={{ 
            backgroundImage: "url('/placeholder.svg?height=400&width=1200&text=Featured+Champion+Jinx')",
            backgroundPosition: "center 20%"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
        
        <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-1 block">Featured Champion</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white text-shadow-lg">Jinx</h1>
          <p className="text-lg text-white/70 max-w-md mt-2">
            The Loose Cannon dominates the current meta with exceptional carry potential and game-changing teamfight presence.
          </p>
          <Link 
            href="/champion/jinx"
            className="mt-4 inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded shadow transition-all duration-300"
          >
            View Champion Details
          </Link>
        </div>
      </div>
      
      {/* Main Content Header */}
      <div className="bg-gradient-to-r from-slate-950/90 to-purple-950/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Champion Tier List</h1>
          <p className="mt-2 text-slate-400">Discover the strongest champions in the current meta, ranked by performance and impact.</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-auto relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-400 text-white"
                placeholder="Search champions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort options */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Sort by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("tier")}
                className={`px-2 py-1 ${sortColumn === "tier" ? "text-blue-400" : "text-slate-400"}`}
              >
                Tier
                {sortColumn === "tier" && (
                  <ArrowUpDown size={14} className="ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("winrate")}
                className={`px-2 py-1 ${sortColumn === "winrate" ? "text-blue-400" : "text-slate-400"}`}
              >
                Win Rate
                {sortColumn === "winrate" && (
                  <ArrowUpDown size={14} className="ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("pickrate")}
                className={`px-2 py-1 ${sortColumn === "pickrate" ? "text-blue-400" : "text-slate-400"}`}
              >
                Pick Rate
                {sortColumn === "pickrate" && (
                  <ArrowUpDown size={14} className="ml-1" />
                )}
              </Button>
            </div>
            
            {/* Role filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {roles.map(role => (
                <Button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  variant="outline"
                  className={`px-3 py-1 text-sm ${
                    (role.id === "all" && selectedRole === "all") || selectedRole === role.id
                      ? role.id === "all" 
                        ? "bg-white/10 text-blue-400 border-white/20"
                        : `bg-${role.color}/10 text-${role.color} border-${role.color}/20`
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {role.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Champions Table */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#C89B3C]/30 border-t-[#C89B3C] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 mb-6">
              Showing {filteredData.length} champions {selectedRole !== "all" ? `in ${selectedRole} role` : ""}
            </p>
            
            <div className="bg-white/5 border-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-purple-950/90 border-b border-white/10">
                    <tr>
                      <th className="text-left px-6 py-4 text-white font-semibold">Rank</th>
                      <th className="text-left px-6 py-4 text-white font-semibold">Champion</th>
                      <th className="text-left px-6 py-4 text-white font-semibold">Role</th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleSort("tier")}
                      >
                        Tier
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleSort("winrate")}
                      >
                        Win Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleSort("pickrate")}
                      >
                        Pick Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleSort("banrate")}
                      >
                        Ban Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleSort("games")}
                      >
                        Games
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((champion, index) => (
                      <tr
                        key={champion.id}
                        className="border-b border-white/5 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent transition-all duration-300 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index < 3
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                              <div
                                className="w-full h-full rounded-full aspect-square overflow-hidden bg-cover bg-center"
                                style={{ backgroundImage: `url(${champion.image})` }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{champion.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${getRoleColor(champion.role)}`}>{champion.role}</span>
                        </td>
                        <td className="px-6 py-4">{getTierBadge(champion.tier)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getWinrateColor(champion.winrate)}`}>
                              {champion.winrate}%
                            </span>
                            <div className="flex items-center gap-1">
                              {getDeltaIcon(champion.delta)}
                              <span
                                className={`text-sm ${
                                  champion.delta > 0
                                    ? "text-green-400"
                                    : champion.delta < 0
                                      ? "text-red-400"
                                      : "text-zinc-400"
                                }`}
                              >
                                {champion.delta > 0 ? "+" : ""}
                                {champion.delta}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{champion.pickrate}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{champion.banrate}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{champion.games.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {filteredData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg mb-4">No champions found matching your criteria.</p>
            <Button
              onClick={() => {
                setSelectedRole("all")
                setSelectedRank("all")
                setSearchQuery("")
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-500 text-sm">
            LoLytics isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
          </p>
        </div>
      </footer>
    </div>
  )
}
