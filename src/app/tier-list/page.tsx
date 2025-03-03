"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Filter, Info } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"

interface Champion {
  id: string
  name: string
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  role: string
  tier: string
  image: string
  difficulty: string
  damageType: string
  range: string
  roles: {
    [key: string]: {
      winRate: number
      pickRate: number
      banRate: number
      totalGames: number
      tier?: string
    }
  }
}

// Only keep interface definitions that are actually used
interface ChampionStatsResponse {
  [key: string]: {
    id: string;
    name: string;
    image: {
      full: string;
    };
    roles: Record<string, RoleStatsResponse>;
    difficulty: string;
    damageType: string;
    range: string;
  };
}

interface RoleStatsResponse {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: string;
}

// Tier colors
const tierColors = {
  'S+': "#F1C40F", // Gold
  'S': "#D4AC0D", // Dark Gold
  'A': "#45D1B0", // Teal
  'B': "#3B82F6", // Blue
  'C': "#A855F7", // Purple
  'D': "#EF4444", // Red
}

// Role icons mapping
const roleIcons: Record<string, string> = {
  top: "⚔️",
  jungle: "🌿",
  mid: "✨",
  bot: "🏹",
  support: "🛡️",
}

export default function TierList() {
  // State variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [patchVersion] = useState("13.23.1")
  
  // Filters
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRank, setSelectedRank] = useState("ALL")
  const [sortBy, setSortBy] = useState("tier") 
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter options
  const ranks = [
    { value: "ALL", label: "ALL" },
    { value: "IRON+", label: "IRON+" },
    { value: "BRONZE+", label: "BRONZE+" },
    { value: "SILVER+", label: "SILVER+" },
    { value: "GOLD+", label: "GOLD+" },
    { value: "PLATINUM+", label: "PLATINUM+" },
    { value: "EMERALD+", label: "EMERALD+" },
    { value: "DIAMOND+", label: "DIAMOND+" },
  ]

  const roles = [
    { value: "", label: "ALL" },
    { value: "top", label: "TOP" },
    { value: "jungle", label: "JUNGLE" },
    { value: "mid", label: "MID" },
    { value: "bot", label: "BOT" },
    { value: "support", label: "SUPPORT" },
  ]

  // Use useCallback to memoize the fetchChampions function
  const fetchChampions = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/champion-stats?patch=${patchVersion}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json() as ChampionStatsResponse
      
      // Transform the data to match our Champion interface
      const transformedChampions: Champion[] = Object.values(data).map((champion) => {
        // Find the primary role (highest pick rate)
        const roles = champion.roles || {}
        let primaryRole = ""
        let highestPickRate = 0
        let tier = "C" // Default tier
        let winRate = 0
        let pickRate = 0
        let banRate = 0
        let totalGames = 0
        
        Object.entries(roles).forEach(([role, stats]) => {
          if (stats.pickRate > highestPickRate) {
            highestPickRate = stats.pickRate
            primaryRole = role
            tier = stats.tier || "C"
            winRate = stats.winRate || 0
            pickRate = stats.pickRate || 0
            banRate = stats.banRate || 0
            totalGames = stats.totalGames || 0
          }
        })
        
        return {
          id: champion.id,
          name: champion.name,
          image: `http://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion.image.full}`,
          winRate,
          pickRate,
          banRate,
          totalGames,
          role: primaryRole,
          tier,
          roles,
          difficulty: champion.difficulty || "Medium",
          damageType: champion.damageType || "AD",
          range: champion.range || "Melee",
        }
      })
      
      setChampions(transformedChampions)
      setFilteredChampions(transformedChampions) // Initially show all champions
      setLoading(false)
    } catch (error) {
      console.error("Error fetching champions:", error)
      setError(`Failed to fetch champion data: ${(error as Error).message}`)
      setLoading(false)
    }
  }, [patchVersion]);

  useEffect(() => {
    fetchChampions()
  }, [fetchChampions])

  // Filter and sort champions
  useEffect(() => {
    let filtered = [...champions]

    // Apply filters
    if (selectedRole !== '') {
      filtered = filtered.filter(champ => 
        champ.roles[selectedRole] && 
        champ.roles[selectedRole].pickRate >= 1 // Only show champions with at least 1% pick rate in role
      )
      
      // Update stats based on selected role
      filtered = filtered.map(champ => ({
        ...champ,
        winRate: champ.roles[selectedRole].winRate,
        pickRate: champ.roles[selectedRole].pickRate,
        banRate: champ.roles[selectedRole].banRate,
        totalGames: champ.roles[selectedRole].totalGames,
        tier: champ.roles[selectedRole].tier || champ.tier,
        role: selectedRole
      }))
    }
    
    // Filter by tier
    if (selectedTier !== '') {
      filtered = filtered.filter(champ => champ.tier === selectedTier)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const tierValues: Record<string, number> = {
        'S+': 0, 'S': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5
      }

      if (sortBy === 'tier') {
        return sortOrder === 'asc' 
          ? tierValues[a.tier as keyof typeof tierValues] - tierValues[b.tier as keyof typeof tierValues]
          : tierValues[b.tier as keyof typeof tierValues] - tierValues[a.tier as keyof typeof tierValues]
      }
      
      // For numeric properties
      const aValue = a[sortBy as keyof Champion] as number
      const bValue = b[sortBy as keyof Champion] as number
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    setFilteredChampions(filtered)
  }, [champions, selectedRole, selectedTier, sortBy, sortOrder])

  const handleHeaderClick = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-[#F1C40F] rounded-full animate-spin"></div>
            <p className="text-zinc-400">Loading champion data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-zinc-950 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 text-red-400">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navigation />

      <main className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Champion Tier List</h1>
            <p className="text-zinc-400">Patch {patchVersion}</p>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-zinc-400" />
              <span className="text-zinc-300 text-sm font-medium">Filters:</span>
            </div>
            
            {/* Rank Filter */}
            <div className="flex items-center bg-zinc-900 rounded border border-zinc-800 min-w-[120px]">
              <select 
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="bg-transparent py-2 px-3 text-sm text-white appearance-none w-full focus:outline-none"
              >
                {ranks.map(rank => (
                  <option key={rank.value} value={rank.value}>{rank.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 mr-2 pointer-events-none" />
            </div>
            
            {/* Role Filter */}
            <div className="flex items-center bg-zinc-900 rounded border border-zinc-800 min-w-[120px]">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent py-2 px-3 text-sm text-white appearance-none w-full focus:outline-none"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 mr-2 pointer-events-none" />
            </div>
            
            {/* Version */}
            <div className="flex items-center bg-zinc-900 rounded border border-zinc-800 px-3 py-2 text-sm min-w-[100px]">
              <span className="mr-2 text-zinc-300">{patchVersion}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </div>
          </div>

          {/* Champion Table */}
          <div className="rounded-lg overflow-hidden border border-zinc-800">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-zinc-900">
              <div 
                className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium"
                onClick={() => handleHeaderClick('ranking')}
              >
                Rank
              </div>
              <div className="col-span-3 py-4 px-4 text-zinc-300 text-sm font-medium">
                Champion
              </div>
              <div 
                className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium"
                onClick={() => handleHeaderClick('role')}
              >
                Lane
              </div>
              <div 
                className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium flex items-center"
                onClick={() => handleHeaderClick('tier')}
              >
                Tier 
                <Info className="w-4 h-4 ml-1 text-zinc-500" />
              </div>
              <div 
                className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium text-right"
                onClick={() => handleHeaderClick('winRate')}
              >
                Winrate
              </div>
              <div 
                className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium text-right"
                onClick={() => handleHeaderClick('pickRate')}
              >
                Pickrate
              </div>
              <div 
                className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium text-right"
                onClick={() => handleHeaderClick('totalGames')}
              >
                Games
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-800">
              {filteredChampions.map((champion, index) => (
                <div 
                  key={champion.id} 
                  className="grid grid-cols-12 items-center bg-zinc-950 hover:bg-zinc-900/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="col-span-1 py-3 px-4 text-center">
                    <span className="text-zinc-300">{index + 1}</span>
                  </div>
                  
                  {/* Champion */}
                  <div className="col-span-3 py-3 px-4 flex items-center">
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <Image 
                        src={champion.image} 
                        alt={champion.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="ml-3 font-medium text-white">{champion.name}</span>
                  </div>
                  
                  {/* Lane */}
                  <div className="col-span-2 py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {roleIcons[champion.role] || '❓'}
                      </span>
                      <div className="text-zinc-400 text-sm">
                        {champion.pickRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Tier */}
                  <div className="col-span-2 py-3 px-4">
                    <span 
                      className="font-semibold"
                      style={{ color: tierColors[champion.tier as keyof typeof tierColors] || '#FFFFFF' }}
                    >
                      {champion.tier}
                    </span>
                  </div>
                  
                  {/* Win Rate */}
                  <div className="col-span-1 py-3 px-4 text-right">
                    <div>
                      <div className="text-white">{champion.winRate.toFixed(1)}%</div>
                      <div className="text-xs text-green-500">+0.2%</div>
                    </div>
                  </div>
                  
                  {/* Pick Rate */}
                  <div className="col-span-1 py-3 px-4 text-right">
                    <div className="text-white">{champion.pickRate.toFixed(1)}%</div>
                  </div>
                  
                  {/* Games */}
                  <div className="col-span-2 py-3 px-4 text-right">
                    <div className="text-white">
                      {champion.totalGames.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredChampions.length === 0 && (
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-center">
              <p className="text-zinc-400">No champions found matching your filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 