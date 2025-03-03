"use client"

import { useState, useEffect } from "react"
import axios from "axios"
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
}

interface RoleData {
  games: number
  winRate: number
}

interface ChampionStats {
  winRate: number
  pickRate: number
  banRate: number
  roles: Record<string, RoleData>
}

interface RiotChampionData {
  id: string
  name: string
  key: string
  [key: string]: unknown
}

// Tier colors
const tierColors = {
  S: "#C89B3C", // Gold
  A: "#45D1B0", // Teal
  B: "#3B82F6", // Blue
  C: "#A855F7", // Purple
  D: "#EF4444", // Red
}

export default function TierListPage() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patchVersion, setPatchVersion] = useState("")
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    S: true,
    A: true,
    B: true,
    C: true,
    D: true
  })
  
  // Filters
  const [selectedRole, setSelectedRole] = useState("all")
  const [sortBy, setSortBy] = useState("tier") // tier, winRate, pickRate, banRate
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  
  // New filters
  const [difficulty, setDifficulty] = useState("all")
  const [damageType, setDamageType] = useState("all")
  const [range, setRange] = useState("all")
  
  const roles = [
    { value: "all", label: "All Roles" },
    { value: "top", label: "Top" },
    { value: "jungle", label: "Jungle" },
    { value: "mid", label: "Mid" },
    { value: "bot", label: "Bot" },
    { value: "support", label: "Support" },
  ]
  
  const difficulties = [
    { value: "all", label: "All" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ]

  const damageTypes = [
    { value: "all", label: "All" },
    { value: "ap", label: "AP" },
    { value: "ad", label: "AD" },
    { value: "hybrid", label: "Hybrid" },
  ]

  const ranges = [
    { value: "all", label: "All" },
    { value: "melee", label: "Melee" },
    { value: "ranged", label: "Ranged" },
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

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        
        // Check local storage for cached data
        const cachedData = localStorage.getItem('championData');
        const cachedPatch = localStorage.getItem('patchVersion');
        if (cachedData && cachedPatch === patchVersion) {
          const parsedData = JSON.parse(cachedData);
          setChampions(parsedData);
          setFilteredChampions(parsedData);
          setLoading(false);
          return;
        }
        
        // Fetch current patch version
        const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = patchResponse.data[0]
        setPatchVersion(currentPatch)
        
        // Fetch champion data
        const champResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
        const champData = champResponse.data.data
        
        // Get champion stats from your backend API
        let champStats: Record<string, ChampionStats> = {}
        
        try {
          const statsResponse = await axios.get('/api/champion-stats')
          champStats = statsResponse.data || {}
        } catch {
          console.warn('Could not fetch champion stats, using mock data')
        }
        
        // Transform the data
        const champValues = Object.values(champData);
        const champList = champValues.map((champ) => {
          const championData = champ as RiotChampionData;
          
          const stats = champStats[championData.key] || {
            winRate: 45 + Math.random() * 10,
            pickRate: 2 + Math.random() * 18,
            banRate: 1 + Math.random() * 15,
            roles: {
              top: { games: Math.floor(Math.random() * 10000), winRate: 45 + Math.random() * 10 },
              jungle: { games: Math.floor(Math.random() * 10000), winRate: 45 + Math.random() * 10 },
              mid: { games: Math.floor(Math.random() * 10000), winRate: 45 + Math.random() * 10 },
              bot: { games: Math.floor(Math.random() * 10000), winRate: 45 + Math.random() * 10 },
              support: { games: Math.floor(Math.random() * 10000), winRate: 45 + Math.random() * 10 },
            }
          }
          
          // Determine primary role
          let primaryRole = 'mid'
          let maxGames = 0
          
          Object.entries(stats.roles || {}).forEach(([role, data]) => {
            if (data.games > maxGames) {
              maxGames = data.games
              primaryRole = role
            }
          })
          
          // Determine tier based on win rate
          let tier = 'C'
          if (stats.winRate >= 53) tier = 'S'
          else if (stats.winRate >= 51) tier = 'A'
          else if (stats.winRate >= 49) tier = 'B'
          else if (stats.winRate >= 47) tier = 'C'
          else tier = 'D'

          // Mock data for new properties (you should replace this with actual data)
          const mockData = {
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
            damageType: ['ap', 'ad', 'hybrid'][Math.floor(Math.random() * 3)],
            range: ['melee', 'ranged'][Math.floor(Math.random() * 2)]
          }
          
          return {
            id: championData.id,
            name: championData.name,
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            totalGames: Object.values(stats.roles || {}).reduce((sum: number, role: RoleData) => sum + role.games, 0),
            role: primaryRole,
            tier,
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championData.id}_0.jpg`,
            ...mockData
          }
        })
        
        // Save to local storage
        localStorage.setItem('championData', JSON.stringify(champList));
        localStorage.setItem('patchVersion', currentPatch);
        
        setChampions(champList)
        setFilteredChampions(champList)
      } catch (err) {
        console.error("Error fetching champion data:", err)
        setError("Failed to load champion data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchChampions()
  }, [patchVersion])
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...champions]
    
    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(champ => champ.role === selectedRole)
    }
    
    // Filter by difficulty
    if (difficulty !== 'all') {
      filtered = filtered.filter(champ => champ.difficulty === difficulty)
    }
    
    // Filter by damage type
    if (damageType !== 'all') {
      filtered = filtered.filter(champ => champ.damageType === damageType)
    }
    
    // Filter by range
    if (range !== 'all') {
      filtered = filtered.filter(champ => champ.range === range)
    }
    
    // Sort champions
    filtered.sort((a, b) => {
      const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 }
      
      if (sortBy === 'tier') {
        return sortOrder === 'asc' 
          ? tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder]
          : tierOrder[b.tier as keyof typeof tierOrder] - tierOrder[a.tier as keyof typeof tierOrder]
      }
      
      // For numeric properties
      const aValue = a[sortBy as keyof Champion] as number
      const bValue = b[sortBy as keyof Champion] as number
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    setFilteredChampions(filtered)
  }, [champions, selectedRole, sortBy, sortOrder])
  
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
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
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
            {["S", "A", "B", "C", "D"].map((tier) => {
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
                        {tier === "S" && "Overpowered - First pick or ban material"}
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
                                  <span className="text-xs text-zinc-200">{champion.winRate}%</span>
                                </div>

                                {/* Pick Rate */}
                                <div className="flex flex-col items-center">
                                  <Users className="w-4 h-4 mb-1" style={{ color: tierColor }} />
                                  <span className="text-xs text-zinc-200">{champion.pickRate}%</span>
                                </div>

                                {/* Ban Rate */}
                                <div className="flex flex-col items-center">
                                  <Swords className="w-4 h-4 mb-1" style={{ color: tierColor }} />
                                  <span className="text-xs text-zinc-200">{champion.banRate}%</span>
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