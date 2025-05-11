"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Search, X, Info } from "lucide-react"
import Navigation from "@/components/navigation"

// Define strict types for our data
interface ChampionRole {
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  tier: string
}

interface Champion {
  id: string
  name: string
  image: {
    icon: string
    splash: string
    loading: string
    full: string
    sprite: string
  }
  role: string
  roles: Record<string, ChampionRole>
  difficulty: string
  damageType: string
  range: string
  tier: string
}

// Role data with proper typing
const roleData = {
  "": { 
    label: "ALL", 
    color: "#FFFFFF",
    icon: "ALL"
  },
  "TOP": { 
    label: "TOP", 
    color: "#FF9500",
    icon: "TOP"
  },
  "JUNGLE": { 
    label: "JNG", 
    color: "#19B326",
    icon: "JNG"
  },
  "MIDDLE": { 
    label: "MID", 
    color: "#4F8EFF",
    icon: "MID"
  },
  "BOTTOM": { 
    label: "BOT", 
    color: "#FF4E50",
    icon: "BOT"
  },
  "UTILITY": { 
    label: "SUP", 
    color: "#CC66FF",
    icon: "SUP"
  }
}

// Tier colors
const tierColors: Record<string, string> = {
  "S+": "#FF2D55",
  "S": "#FF9500",
  "A": "#FFCC00",
  "B": "#34C759",
  "C": "#5AC8FA",
  "D": "#AF52DE",
}

// ChampionCard component
function ChampionCard({ champion, onNavigate }: { champion: Champion, onNavigate: (id: string) => void }) {
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = () => {
    setImageError(true)
  }
  
  const roleInfo = roleData[champion.role] || { label: champion.role, color: "#FFFFFF", icon: champion.role }
  
  return (
    <div 
      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 border border-zinc-800 hover:border-[#C89B3C]/60 shadow-md hover:shadow-lg hover:shadow-[#C89B3C]/10 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onNavigate(champion.id)}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: `url(${champion.image.splash})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/70 to-zinc-900"></div>
        
        <div className="relative p-4 flex items-center gap-4 z-10">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            {!imageError ? (
              <Image
                src={champion.image.icon}
                alt={champion.name}
                width={56}
                height={56}
                className="object-cover"
                onError={handleImageError}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-xs font-bold text-white">
                  {champion.name.substring(0, 4)}
                </span>
              </div>
            )}
            
            <div 
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md text-black"
              style={{ backgroundColor: tierColors[champion.tier] || '#5AC8FA' }}
            >
              {champion.tier}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold truncate text-lg">
                {champion.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-black font-medium shadow-sm"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
            
            <div className="flex gap-2 items-center text-xs text-zinc-400">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.difficulty}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.damageType}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.range}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-3 gap-1 bg-zinc-800/50 border-t border-zinc-700/30">
        <div className="text-center py-1 px-2 rounded-md bg-green-900/20 border border-green-900/30">
          <div className="text-green-400 font-bold text-sm">{champion.roles[champion.role]?.winRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Win Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-blue-900/20 border border-blue-900/30">
          <div className="text-blue-400 font-bold text-sm">{champion.roles[champion.role]?.pickRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Pick Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-red-900/20 border border-red-900/30">
          <div className="text-red-400 font-bold text-sm">{champion.roles[champion.role]?.banRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Ban Rate</div>
        </div>
      </div>
      
      <div className="px-3 py-2 text-xs text-center text-[#C89B3C] border-t border-zinc-800 bg-zinc-900/80 font-medium">
        View Champion Details
      </div>
    </div>
  )
}

export default function TierList() {
  const [selectedRole, setSelectedRole] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("tier")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedDivision, setSelectedDivision] = useState("Emerald+")
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false)

  const divisionOptions = [
    "Iron+", "Bronze+", "Silver+", "Gold+", "Platinum+", "Emerald+", "Diamond+", "Master+", "Grandmaster+", "Challenger+"
  ]

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/champion-stats?rank=${encodeURIComponent(selectedDivision)}`)
        if (!response.ok) throw new Error('Failed to fetch champion data')
        const data = await response.json()
        // Transform the data to match our table format
        let transformedChampions = Object.entries(data).map(([id, champ]: [string, any]) => {
          // Find the main role (highest games or winrate, or use champ.role)
          const mainRole = champ.role || Object.keys(champ.roles)[0]
          const roleStats = champ.roles[mainRole]
          return {
            id: String(id),
            name: String(champ.name),
            image: {
              icon: String(champ.image.icon),
              splash: String(champ.image.splash),
              loading: String(champ.image.loading),
              full: String(champ.image.full),
              sprite: String(champ.image.sprite)
            },
            role: mainRole,
            roles: champ.roles,
            difficulty: String(champ.difficulty),
            damageType: String(champ.damageType),
            range: String(champ.range),
            tier: String(roleStats?.tier || 'C'),
            winRate: Number(roleStats?.winRate || 0),
            winRateDelta: Number(roleStats?.winRateDelta || 0),
            pickRate: Number(roleStats?.pickRate || 0),
            games: Number(roleStats?.totalGames || 0),
            rolePercentage: Number(roleStats?.rolePercentage || 100),
          }
        })
        // Sort by tier, then winrate, then games
        const tierOrder = ["S+", "S", "A", "B", "C", "D"]
        transformedChampions = transformedChampions
          .sort((a, b) => {
            const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
            if (tierDiff !== 0) return tierDiff
            if (b.winRate !== a.winRate) return b.winRate - a.winRate
            return b.games - a.games
          })
          .map((champ, idx) => ({ ...champ, rank: idx + 1 }))
        setChampions(transformedChampions)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchChampions()
  }, [selectedDivision])

  // Sorting logic
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  // Filter and sort champions
  let filteredChampions = champions.filter(
    (champion) =>
      (!selectedRole || champion.role === selectedRole) &&
      (!searchQuery || champion.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  filteredChampions = [...filteredChampions].sort((a, b) => {
    let result = 0
    if (sortBy === "tier") {
      const tierOrder = ["S+", "S", "A", "B", "C", "D"]
      result = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    } else if (sortBy === "winRate") {
      result = b.winRate - a.winRate
    } else if (sortBy === "pickRate") {
      result = b.pickRate - a.pickRate
    }
    return sortDirection === "asc" ? result : -result
  })
  filteredChampions = filteredChampions.map((champ, idx) => ({ ...champ, rank: idx + 1 }))

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C89B3C]"></div>
          <p className="text-xl text-white">Loading champion data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1015] p-8">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E1015] text-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative inline-block">
            <span className="relative z-10">Champion Tier List</span>
            <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/80 to-[#C89B3C]/0 transform -skew-x-12 z-0"></span>
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          {/* Role Filter */}
          <div className="flex gap-2">
            {Object.entries(roleData).map(([role, info]) => (
              <button
                key={role}
                onClick={() => setSelectedRole(selectedRole === role ? "" : role)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  selectedRole === role
                    ? "bg-[#C89B3C]/20 border-2 border-[#C89B3C]"
                    : "bg-[#242731] border border-[#2F323D] hover:bg-[#2F323D]"
                }`}
              >
                <img src={`/images/roles/${role}.png`} alt={role} className="w-4 h-4" />
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search champion..."
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-[#242731] border border-[#2F323D] focus:outline-none focus:border-[#C89B3C] transition-colors"
            />
          </div>
        </div>

        {/* Division Filter */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#242731] border border-[#2F323D] hover:bg-[#2F323D] transition-colors"
          >
            <span>Rank: {selectedDivision}</span>
            <ChevronDown size={16} />
          </button>
          {showDivisionDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#242731] border border-[#2F323D] shadow-lg z-10">
              {divisionOptions.map((division) => (
                <button
                  key={division}
                  onClick={() => {
                    setSelectedDivision(division)
                    setShowDivisionDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#2F323D] transition-colors ${selectedDivision === division ? "text-[#C89B3C]" : "text-white"}`}
                >
                  {division}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#242731] sticky top-0 z-10">
              <tr className="border-b border-[#2F323D]">
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-16">RANK</th>
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm">CHAMPION</th>
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-20">LANE</th>
                <th
                  className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-20 cursor-pointer select-none"
                  onClick={() => handleSort("tier")}
                >
                  TIER {sortBy === "tier" && (sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                </th>
                <th
                  className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24 cursor-pointer select-none"
                  onClick={() => handleSort("winRate")}
                >
                  WINRATE {sortBy === "winRate" && (sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                </th>
                <th
                  className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24 cursor-pointer select-none"
                  onClick={() => handleSort("pickRate")}
                >
                  PICKRATE {sortBy === "pickRate" && (sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                </th>
                <th className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24">GAMES</th>
              </tr>
            </thead>
            <tbody>
              {filteredChampions.map((champion) => (
                <tr
                  key={champion.id}
                  className="border-b border-[#2F323D] hover:bg-[#242731] transition-colors cursor-pointer"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-left font-medium text-zinc-400">{champion.rank}</td>
                  {/* Champion */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#242731] flex-shrink-0">
                        <Image
                          src={champion.image.icon || "/images/champions/fallback.png"}
                          alt={champion.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold">{champion.name}</span>
                    </div>
                  </td>
                  {/* Lane */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#242731] flex items-center justify-center">
                        <img src={`/images/roles/${champion.role}.png`} alt={champion.role} className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-zinc-500 mt-1">{champion.rolePercentage ? `${champion.rolePercentage}%` : ""}</span>
                    </div>
                  </td>
                  {/* Tier */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-lg" style={{ color: tierColors[champion.tier] }}>
                      {champion.tier}
                    </span>
                  </td>
                  {/* Winrate */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold">{champion.winRate?.toFixed(1)}%</span>
                      {champion.winRateDelta !== undefined && (
                        <span className={`text-xs ${champion.winRateDelta > 0 ? "text-green-500" : champion.winRateDelta < 0 ? "text-red-500" : "text-zinc-400"}`}>
                          {champion.winRateDelta > 0 ? `+${champion.winRateDelta.toFixed(1)}%` : champion.winRateDelta < 0 ? `${champion.winRateDelta.toFixed(1)}%` : "0.0%"}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Pickrate */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold">{champion.pickRate?.toFixed(1)}%</span>
                  </td>
                  {/* Games */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-zinc-500">{formatNumber(champion.games)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredChampions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#242731] border border-[#2F323D] mt-8">
            <Search size={32} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-zinc-300 mb-2">No champions found</h3>
            <p className="text-zinc-500 text-center max-w-md">
              No champions match your current filters. Try selecting a different role or clearing filters.
            </p>
            <button
              onClick={() => setSelectedRole("")}
              className="mt-4 px-4 py-2 bg-[#C89B3C] text-zinc-900 font-medium hover:bg-[#D5B45C] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

