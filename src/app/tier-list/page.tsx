"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trophy, Swords, Users, ArrowUpDown, Loader2 } from "lucide-react"
import { Card } from "@/components/card"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
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
  
  // Filters
  const [selectedRole, setSelectedRole] = useState("all")
  const [sortBy, setSortBy] = useState("tier") // tier, winRate, pickRate, banRate
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  
  const roles = [
    { value: "all", label: "All Roles" },
    { value: "top", label: "Top" },
    { value: "jungle", label: "Jungle" },
    { value: "mid", label: "Mid" },
    { value: "bot", label: "Bot" },
    { value: "support", label: "Support" },
  ]
  
  const sortOptions = [
    { value: "tier", label: "Tier" },
    { value: "winRate", label: "Win Rate" },
    { value: "pickRate", label: "Pick Rate" },
    { value: "banRate", label: "Ban Rate" },
  ]

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        
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
          // Cast the individual champion object to the correct type
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
          
          // Determine primary role (most games played)
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
          
          return {
            id: championData.id,
            name: championData.name,
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            totalGames: Object.values(stats.roles || {}).reduce((sum: number, role: RoleData) => sum + role.games, 0),
            role: primaryRole,
            tier,
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championData.id}_0.jpg`
          }
        })
        
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
  }, [])
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...champions]
    
    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(champ => champ.role === selectedRole)
    }
    
    // Sort champions
    filtered.sort((a, b) => {
      const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 }
      
      if (sortBy === 'tier') {
        // For tier, we need special handling
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
          
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800/50">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-zinc-500">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-xs text-zinc-500">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="default" 
                onClick={toggleSortOrder}
                className="border-zinc-700 text-zinc-300 hover:text-white"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              </Button>
            </div>
          </div>
          
          {/* Tier Groups */}
          <div className="space-y-8">
            {['S', 'A', 'B', 'C', 'D'].map(tier => {
              const tierChampions = filteredChampions.filter(champ => champ.tier === tier)
              
              if (tierChampions.length === 0) return null
              
              return (
                <div key={tier} className="space-y-4">
                  {/* Tier Header */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-2xl"
                      style={{ 
                        backgroundColor: `${tierColors[tier as keyof typeof tierColors]}20`,
                        color: tierColors[tier as keyof typeof tierColors]
                      }}
                    >
                      {tier}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-100">Tier {tier}</h2>
                      <p className="text-sm text-zinc-400">
                        {tier === 'S' && 'Overpowered - First pick or ban material'}
                        {tier === 'A' && 'Strong - Consistently powerful picks'}
                        {tier === 'B' && 'Balanced - Solid picks in most situations'}
                        {tier === 'C' && 'Situational - Requires specific team comps'}
                        {tier === 'D' && 'Weak - Currently underperforming'}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-zinc-400">
                      {tierChampions.length} champion{tierChampions.length !== 1 && 's'}
                    </div>
                  </div>
                  
                  {/* Champions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tierChampions.map(champion => (
                      <Card key={champion.id} className="overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                        <div className="p-4">
                          {/* Champion Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 relative rounded-md overflow-hidden">
                              <Image
                                src={champion.image}
                                alt={champion.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-zinc-100">{champion.name}</h3>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="uppercase text-zinc-500">{champion.role}</span>
                                <span className="text-zinc-700">•</span>
                                <span className="text-zinc-500">{(champion.totalGames).toLocaleString()} games</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="bg-zinc-800/50 p-2 rounded flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                <Trophy className="w-3 h-3 text-[#C89B3C]" />
                                <span className="text-xs text-zinc-400">Win Rate</span>
                              </div>
                              <span className="font-bold text-sm">{champion.winRate}%</span>
                            </div>
                            
                            <div className="bg-zinc-800/50 p-2 rounded flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-zinc-400">Pick Rate</span>
                              </div>
                              <span className="font-bold text-sm">{champion.pickRate}%</span>
                            </div>
                            
                            <div className="bg-zinc-800/50 p-2 rounded flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                <Swords className="w-3 h-3 text-red-400" />
                                <span className="text-xs text-zinc-400">Ban Rate</span>
                              </div>
                              <span className="font-bold text-sm">{champion.banRate}%</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
} 