"use client"

import { useState, useMemo, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import axios from "axios"

// Champion data type
interface Champion {
  id: string
  name: string
  icon: string
  primaryRole: string
  roles: {
    [key: string]: {
      games: number
      wins: number
      tier: string
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
}

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

const tierColors = {
  "S+": "text-[#FF4E50] bg-gradient-to-r from-[#FF4E50]/20 to-[#FF4E50]/5",
  S: "text-[#FF9800] bg-gradient-to-r from-[#FF9800]/20 to-[#FF9800]/5",
  A: "text-[#4CAF50] bg-gradient-to-r from-[#4CAF50]/20 to-[#4CAF50]/5",
  B: "text-[#2196F3] bg-gradient-to-r from-[#2196F3]/20 to-[#2196F3]/5",
  C: "text-[#9C27B0] bg-gradient-to-r from-[#9C27B0]/20 to-[#9C27B0]/5",
  D: "text-[#607D8B] bg-gradient-to-r from-[#607D8B]/20 to-[#607D8B]/5",
}

export default function TierListPage() {
  const [selectedRole, setSelectedRole] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("tier")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [latestVersion, setLatestVersion] = useState("13.24.1")
  const [champions, setChampions] = useState<Champion[]>([])
  const [featured, setFeatured] = useState<Champion | null>(null)

  // Fetch current patch version and champion data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Get latest version
        const versionResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const fetchedVersion = versionResponse.data[0]
        setLatestVersion(fetchedVersion)
        
        // Fetch champions data
        const response = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${fetchedVersion}/data/en_US/champion.json`
        )
        
        // Convert object of champions to array
        const championsArray = Object.values(response.data.data) as any[]
        
        // Fetch champion stats from our API
        const statsResponse = await axios.get('/api/champion-stats')
        const statsData = statsResponse.data || {}
        
        // Combine champion data with stats
        const championsWithStats: Champion[] = championsArray.map((champ: any) => {
          const stats = statsData[champ.key] || {}
          const winRate = stats.winRate || 50
          const pickRate = stats.pickRate || 5
          const banRate = stats.banRate || 5

          // Calculate tier based on win rate and pick rate
          let tier = "C"
          if (winRate >= 53 && pickRate >= 10) tier = "S+"
          else if (winRate >= 52 && pickRate >= 8) tier = "S"
          else if (winRate >= 51 && pickRate >= 5) tier = "A"
          else if (winRate >= 50 && pickRate >= 3) tier = "B"
          else if (winRate >= 48) tier = "C"
          else tier = "D"

          // Build roles object with the computed tier
          const computedRoles = stats.roles || {}
          // Ensure each role entry has a tier
          for (const roleKey of Object.keys(computedRoles)) {
            if (!computedRoles[roleKey].tier) {
              computedRoles[roleKey].tier = tier
            }
          }
          // If no roles exist, create a default one based on champion class
          if (Object.keys(computedRoles).length === 0) {
            const defaultRoleKey = champ.tags?.[0]?.toUpperCase() || "MIDDLE"
            computedRoles[defaultRoleKey] = {
              games: 0,
              wins: 0,
              kda: { kills: 0, deaths: 0, assists: 0 },
              winRate,
              pickRate,
              banRate,
              tier,
            }
          }

          return {
            id: champ.id,
            name: champ.name,
            icon: `https://ddragon.leagueoflegends.com/cdn/${fetchedVersion}/img/champion/${champ.id}.png`,
            primaryRole: champ.tags?.[0] || "Fighter",
            roles: computedRoles,
            difficulty: getDifficultyLabel(champ.info?.difficulty || 3),
            damageType: getDamageType(champ),
            range: champ.stats?.attackrange > 300 ? "Ranged" : "Melee"
          }
        })
        
        setChampions(championsWithStats)
        
        // Set a random featured champion
        const randomIndex = Math.floor(Math.random() * championsWithStats.length)
        setFeatured(championsWithStats[randomIndex])
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching champions:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper functions
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return "Easy"
    if (difficulty <= 4) return "Medium"
    return "Hard"
  }

  const getDamageType = (champ: any) => {
    const tags = champ.tags || []
    if (tags.includes("Mage")) return "Magic"
    if (tags.includes("Marksman") || tags.includes("Fighter")) return "Physical"
    return "Mixed"
  }

  // Map UI role IDs to Riot API role keys
  const roleIdToKey: Record<string, string> = {
    top: "TOP",
    jungle: "JUNGLE",
    mid: "MIDDLE",
    adc: "BOTTOM",
    support: "UTILITY",
  }

  const filteredData = useMemo(() => {
    const filtered = champions.filter((champion) => {
      const matchesRole = selectedRole === "all" ||
        !!champion.roles[roleIdToKey[selectedRole] || selectedRole.toUpperCase()]
      const matchesSearch = champion.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesRole && matchesSearch
    })

    // Sort by tier first, then by other columns
    filtered.sort((a, b) => {
      const tierOrder = { "S+": 1, S: 2, A: 3, B: 4, C: 5, D: 6 }

      if (sortColumn === "tier") {
        const aStats = getChampionStats(a)
        const bStats = getChampionStats(b)
        const aTier = tierOrder[(aStats.tier || "C") as keyof typeof tierOrder] || 5
        const bTier = tierOrder[(bStats.tier || "C") as keyof typeof tierOrder] || 5
        return sortDirection === "asc" ? aTier - bTier : bTier - aTier
      }

      // Get the primary role stats for comparison
      const aRoleKey = selectedRole !== "all" ? selectedRole.toUpperCase() : Object.keys(a.roles)[0]
      const bRoleKey = selectedRole !== "all" ? selectedRole.toUpperCase() : Object.keys(b.roles)[0]
      
      const aStats = a.roles[aRoleKey] || { winRate: 50, pickRate: 5, banRate: 5, games: 0 }
      const bStats = b.roles[bRoleKey] || { winRate: 50, pickRate: 5, banRate: 5, games: 0 }

      let aValue: any, bValue: any

      switch (sortColumn) {
        case "winrate":
          aValue = aStats.winRate
          bValue = bStats.winRate
          break
        case "pickrate":
          aValue = aStats.pickRate
          bValue = bStats.pickRate
          break
        case "banrate":
          aValue = aStats.banRate
          bValue = bStats.banRate
          break
        case "games":
          aValue = aStats.games
          bValue = bStats.games
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [champions, selectedRole, searchQuery, sortColumn, sortDirection])

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
      <span className={`inline-block px-4 py-1.5 rounded-full font-bold shadow-sm ${tierColors[tier as keyof typeof tierColors] || tierColors.C}`}>
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

  // Get champion stats for display
  const getChampionStats = (champion: Champion) => {
    const roleKeys = Object.keys(champion.roles)
    const roleKey = selectedRole !== "all" ? selectedRole.toUpperCase() : (roleKeys[0] || "MIDDLE")
    return champion.roles[roleKey] || champion.roles[roleKeys[0]] || { winRate: 50, pickRate: 5, banRate: 5, games: 0, winRateDelta: 0, tier: "C" }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navigation />
      
      {/* Version badge for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-mono z-50 border border-purple-500/20 shadow-lg">
          Data Dragon v{latestVersion}
        </div>
      )}
      
      {/* Featured Champion Header */}
      {featured && !isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div 
            className="h-80 w-full bg-center bg-cover" 
            style={{ 
              backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${featured.id}_0.jpg)`,
              backgroundPosition: "center 20%"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10"></div>
          
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1 block">Featured Champion</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white">{featured.name}</h1>
            <p className="text-lg text-white/70 max-w-md mt-2">
              {featured.name} dominates the current meta with exceptional performance and game-changing presence.
            </p>
            <Link 
              href={`/champion/${featured.id}`}
              className="mt-4 inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded shadow transition-all duration-300"
            >
              View Champion Details
            </Link>
          </div>
        </div>
      )}
      
      {/* Main Content Header */}
      <div className="border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Champion Tier List</h1>
          <p className="mt-2 text-zinc-400">Discover the strongest champions in the current meta, ranked by performance and impact.</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-auto relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-10 bg-purple-500/5 border-purple-500/15 focus:border-purple-400 text-white"
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
                className={`px-2 py-1 ${sortColumn === "tier" ? "text-purple-400" : "text-zinc-400"}`}
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
                className={`px-2 py-1 ${sortColumn === "winrate" ? "text-purple-400" : "text-zinc-400"}`}
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
                className={`px-2 py-1 ${sortColumn === "pickrate" ? "text-purple-400" : "text-zinc-400"}`}
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
                    selectedRole === role.id
                      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : "bg-purple-500/5 text-zinc-400 border-purple-500/10 hover:bg-purple-500/10"
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
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 mb-6">
              Showing {filteredData.length} champions {selectedRole !== "all" ? `in ${selectedRole} role` : ""}
            </p>
            
            <div className="bg-purple-500/5 border border-purple-500/10 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/50 border-b border-purple-500/10">
                    <tr>
                      <th className="text-left px-6 py-4 text-white font-semibold">Rank</th>
                      <th className="text-left px-6 py-4 text-white font-semibold">Champion</th>
                      <th className="text-left px-6 py-4 text-white font-semibold">Role</th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort("tier")}
                      >
                        Tier
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort("winrate")}
                      >
                        Win Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort("pickrate")}
                      >
                        Pick Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort("banrate")}
                      >
                        Ban Rate
                      </th>
                      <th
                        className="text-left px-6 py-4 text-white font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort("games")}
                      >
                        Games
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((champion, index) => {
                      const stats = getChampionStats(champion)
                      return (
                        <tr
                          key={champion.id}
                          className="border-b border-purple-500/5 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer"
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
                              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-violet-500 p-0.5">
                                <div
                                  className="w-full h-full rounded-full aspect-square overflow-hidden bg-cover bg-center"
                                  style={{ backgroundImage: `url(${champion.icon})` }}
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-white">{champion.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${getRoleColor(champion.primaryRole)}`}>{champion.primaryRole}</span>
                          </td>
                          <td className="px-6 py-4">{getTierBadge(stats.tier || "C")}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${getWinrateColor(stats.winRate)}`}>
                                {stats.winRate?.toFixed(1) || "50.0"}%
                              </span>
                              {stats.winRateDelta !== undefined && (
                                <div className="flex items-center gap-1">
                                  {getDeltaIcon(stats.winRateDelta)}
                                  <span
                                    className={`text-sm ${
                                      stats.winRateDelta > 0
                                        ? "text-green-400"
                                        : stats.winRateDelta < 0
                                          ? "text-red-400"
                                          : "text-zinc-400"
                                    }`}
                                  >
                                    {stats.winRateDelta > 0 ? "+" : ""}
                                    {stats.winRateDelta.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">{stats.pickRate?.toFixed(1) || "5.0"}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">{stats.banRate?.toFixed(1) || "5.0"}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">{stats.games?.toLocaleString() || "0"}</span>
                          </td>
                        </tr>
                      )
                    })}
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
                setSearchQuery("")
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-purple-500/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 text-sm">
            LoLytics isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
          </p>
        </div>
      </footer>
    </div>
  )
}
