"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Swords, Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
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
  'S+': "#C89B3C", // Gold
  'S': "#C89B3C", // Gold
  'A': "#45D1B0", // Teal
  'B': "#3B82F6", // Blue
  'C': "#A855F7", // Purple
  'D': "#EF4444", // Red
}

export default function TierList() {
  // State variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [patchVersion] = useState("13.23.1")
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    'S+': true,
    'S': true,
    'A': true,
    'B': false,
    'C': false,
    'D': false,
  })
  
  // Filters
  const [selectedRole, setSelectedRole] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [damageType, setDamageType] = useState("")
  const [range, setRange] = useState("")
  const [sortBy, setSortBy] = useState("tier") 
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter options
  const roles = [
    { value: "", label: "All Roles" },
    { value: "top", label: "Top" },
    { value: "jungle", label: "Jungle" },
    { value: "mid", label: "Mid" },
    { value: "bot", label: "Bot" },
    { value: "support", label: "Support" },
  ]

  const difficulties = [
    { value: "", label: "All" },
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
  ]

  const damageTypes = [
    { value: "", label: "All" },
    { value: "AP", label: "AP" },
    { value: "AD", label: "AD" },
    { value: "Hybrid", label: "Hybrid" },
  ]

  const ranges = [
    { value: "", label: "All" },
    { value: "Melee", label: "Melee" },
    { value: "Ranged", label: "Ranged" },
  ]

  const sortOptions = [
    { value: "tier", label: "Tier" },
    { value: "winRate", label: "Win Rate" },
    { value: "pickRate", label: "Pick Rate" },
    { value: "banRate", label: "Ban Rate" },
  ]

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }))
  }

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
    
    // Filter by difficulty
    if (difficulty !== '') {
      filtered = filtered.filter(champ => champ.difficulty === difficulty)
    }
    
    // Filter by damage type
    if (damageType !== '') {
      filtered = filtered.filter(champ => champ.damageType === damageType)
    }
    
    // Filter by range
    if (range !== '') {
      filtered = filtered.filter(champ => champ.range === range)
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
  }, [champions, selectedRole, difficulty, damageType, range, sortBy, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#C89B3C] animate-spin" />
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#C89B3C]">Champion Tier List</h1>
                <p className="text-zinc-400">Patch {patchVersion} • Updated rankings based on performance data</p>
              </div>
              <div className="px-4 py-2 bg-[#C89B3C]/10 rounded-lg border border-[#C89B3C]/20 text-[#C89B3C]">
                <div className="text-sm font-medium">Patch {patchVersion}</div>
              </div>
            </div>
          </div>

          {/* Filters UI */}
          <div className="mb-8">
            <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 p-4">
              <div className="flex flex-wrap gap-4">
                {/* Role Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Role</label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Difficulty</label>
                  <div className="relative">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff.value} value={diff.value}>
                          {diff.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Damage Type Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Damage Type</label>
                  <div className="relative">
                    <select
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {damageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Range Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Range</label>
                  <div className="relative">
                    <select
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {ranges.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Sort By</label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value)
                          setSortOrder("desc")
                        }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-l-md py-2 pl-3 pr-10 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={toggleSortOrder}
                      className="bg-zinc-800 border border-l-0 border-zinc-700 rounded-r-md px-3 text-zinc-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-[#C89B3C] focus:border-[#C89B3C]"
                    >
                      {sortOrder === "asc" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Groups */}
          <div className="space-y-6">
            {["S+", "S", "A", "B", "C", "D"].map((tier) => {
              const tierChampions = filteredChampions.filter((champ) => champ.tier === tier)

              if (tierChampions.length === 0) return null

              const tierColor = tierColors[tier as keyof typeof tierColors]

              return (
                <div key={tier} className="bg-zinc-900/70 rounded-lg border border-zinc-800 overflow-hidden">
                  {/* Tier Header */}
                  <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleTier(tier)}>
                    <div
                      className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-2xl mr-4"
                      style={{
                        backgroundColor: `${tierColor}20`,
                        color: tierColor,
                      }}
                    >
                      {tier}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-zinc-100">Tier {tier}</h2>
                        <span className="text-sm text-zinc-400">({tierChampions.length} champions)</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {tier === "S+" && "Overpowered - First pick or ban material"}
                        {tier === "S" && "Very Strong - Top-tier champions"}
                        {tier === "A" && "Strong - Consistently powerful picks"}
                        {tier === "B" && "Balanced - Solid picks in most situations"}
                        {tier === "C" && "Situational - Requires specific team comps"}
                        {tier === "D" && "Weak - Currently underperforming"}
                      </p>
                    </div>
                    {expandedTiers[tier] ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>

                  {/* Champions List */}
                  {expandedTiers[tier] && (
                    <div className="border-t border-zinc-800 p-4">
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                          {tierChampions.map((champion) => (
                            <div
                              key={champion.id}
                              className="flex flex-col bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-800 transition-colors w-[180px]"
                            >
                              {/* Champion Image */}
                              <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3">
                                <Image
                                  src={champion.image || "/placeholder.svg"}
                                  alt={champion.name}
                                  fill
                                  className="object-cover"
                                />
                                <div
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    backgroundColor: tierColor,
                                    color: "#000",
                                  }}
                                >
                                  {tier}
                                </div>
                              </div>

                              {/* Champion Info */}
                              <h4 className="font-bold text-zinc-100 truncate">{champion.name}</h4>
                              <div className="text-xs uppercase text-zinc-500 mb-2">{champion.role}</div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-2 mt-auto">
                                {/* Win Rate */}
                                <div className="flex flex-col items-center">
                                  <Trophy className="w-4 h-4 mb-1" style={{ color: tierColor }} />
                                  <span className="text-xs text-zinc-200">{champion.winRate.toFixed(1)}%</span>
                                </div>

                                {/* Pick Rate */}
                                <div className="flex flex-col items-center">
                                  <Users className="w-4 h-4 mb-1" style={{ color: tierColor }} />
                                  <span className="text-xs text-zinc-200">{champion.pickRate.toFixed(1)}%</span>
                                </div>

                                {/* Ban Rate */}
                                <div className="flex flex-col items-center">
                                  <Swords className="w-4 h-4 mb-1" style={{ color: tierColor }} />
                                  <span className="text-xs text-zinc-200">{champion.banRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
} 