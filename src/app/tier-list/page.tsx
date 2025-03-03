"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trophy, Swords, Users, ArrowUpDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Card } from "@/components/card"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/button"

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
          
          {/* New Filters UI */}
          <div className="mb-8 space-y-6">
            {/* Role Selection */}
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <Button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  className={`
                    px-6 py-2 rounded-full font-medium
                    ${selectedRole === role.value 
                      ? 'bg-[#C89B3C] text-black hover:bg-[#C89B3C]/90' 
                      : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                    }
                  `}
                >
                  {role.label}
                </Button>
              ))}
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Difficulty</label>
                <div className="flex gap-2">
                  {difficulties.map(diff => (
                    <Button
                      key={diff.value}
                      onClick={() => setDifficulty(diff.value)}
                      variant={difficulty === diff.value ? "default" : "outline"}
                      size="sm"
                      className={`
                        flex-1
                        ${difficulty === diff.value 
                          ? 'bg-[#C89B3C] text-black hover:bg-[#C89B3C]/90' 
                          : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        }
                      `}
                    >
                      {diff.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Damage Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Damage Type</label>
                <div className="flex gap-2">
                  {damageTypes.map(type => (
                    <Button
                      key={type.value}
                      onClick={() => setDamageType(type.value)}
                      variant={damageType === type.value ? "default" : "outline"}
                      size="sm"
                      className={`
                        flex-1
                        ${damageType === type.value 
                          ? 'bg-[#C89B3C] text-black hover:bg-[#C89B3C]/90' 
                          : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        }
                      `}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Range</label>
                <div className="flex gap-2">
                  {ranges.map(r => (
                    <Button
                      key={r.value}
                      onClick={() => setRange(r.value)}
                      variant={range === r.value ? "default" : "outline"}
                      size="sm"
                      className={`
                        flex-1
                        ${range === r.value 
                          ? 'bg-[#C89B3C] text-black hover:bg-[#C89B3C]/90' 
                          : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        }
                      `}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-sm font-medium text-zinc-400">Sort by:</span>
              <div className="flex gap-2">
                {sortOptions.map(option => (
                  <Button
                    key={option.value}
                    onClick={() => {
                      if (sortBy === option.value) {
                        toggleSortOrder()
                      } else {
                        setSortBy(option.value)
                        setSortOrder('desc')
                      }
                    }}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    className={`
                      ${sortBy === option.value 
                        ? 'bg-[#C89B3C] text-black hover:bg-[#C89B3C]/90' 
                        : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                      }
                    `}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tier Groups - New design matching dpm.lol */}
          <div className="space-y-4">
            {['S', 'A', 'B', 'C', 'D'].map(tier => {
              const tierChampions = filteredChampions.filter(champ => champ.tier === tier)
              
              if (tierChampions.length === 0) return null
              
              const tierColor = tierColors[tier as keyof typeof tierColors]
              
              return (
                <Card key={tier} className="overflow-hidden border-0 bg-zinc-900/50">
                  {/* Tier Header - Clickable to expand/collapse */}
                  <button 
                    className="w-full flex items-center p-4 text-left transition-colors hover:bg-zinc-800/30"
                    onClick={() => toggleTier(tier)}
                  >
                    <div 
                      className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-2xl mr-4"
                      style={{ 
                        backgroundColor: `${tierColor}20`,
                        color: tierColor
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
                        {tier === 'S' && 'Overpowered - First pick or ban material'}
                        {tier === 'A' && 'Strong - Consistently powerful picks'}
                        {tier === 'B' && 'Balanced - Solid picks in most situations'}
                        {tier === 'C' && 'Situational - Requires specific team comps'}
                        {tier === 'D' && 'Weak - Currently underperforming'}
                      </p>
                    </div>
                    {expandedTiers[tier] ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>
                  
                  {/* Champions List - Horizontal scrollable row like dpm.lol */}
                  {expandedTiers[tier] && (
                    <div className="border-t border-zinc-800">
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tierChampions.map(champion => (
                          <div 
                            key={champion.id} 
                            className="flex items-center bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-800 transition-colors"
                            style={{ "--tier-color": tierColor } as React.CSSProperties}
                          >
                            {/* Champion Image */}
                            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 mr-3">
                              <Image
                                src={champion.image}
                                alt={champion.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            
                            {/* Champion Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-zinc-100 truncate">{champion.name}</h4>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="uppercase text-zinc-500">{champion.role}</span>
                                
                                {/* Win Rate */}
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3" style={{ color: tierColor }} />
                                  <span className="text-zinc-200">{champion.winRate}%</span>
                                </div>
                                
                                {/* Pick Rate */}
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" style={{ color: tierColor }} />
                                  <span className="text-zinc-200">{champion.pickRate}%</span>
                                </div>
                                
                                {/* Ban Rate (only show on larger screens) */}
                                <div className="hidden sm:flex items-center gap-1">
                                  <Swords className="w-3 h-3" style={{ color: tierColor }} />
                                  <span className="text-zinc-200">{champion.banRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
} 