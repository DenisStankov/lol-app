"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2 } from "lucide-react"
import { Card } from "@/components/card"
import Image from 'next/image'
import axios from "axios"

interface ChampionTier {
  id: string
  name: string
  winRate: number
  pickRate: number
  banRate: number
  image: string
  role: string
}

// Define interface for champion data from Riot's API
interface RiotChampionData {
  id: string;
  name: string;
  key: string;
  [key: string]: unknown;
}

export default function TierList() {
  const [champions, setChampions] = useState<ChampionTier[]>([])
  const [filteredChampions, setFilteredChampions] = useState<ChampionTier[]>([])
  const [selectedRole, setSelectedRole] = useState("all")
  const [sortBy, setSortBy] = useState("winRate")
  const [sortOrder, setSortOrder] = useState("desc")
  const [patchVersion, setPatchVersion] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "top", label: "Top" },
    { value: "jungle", label: "Jungle" },
    { value: "mid", label: "Mid" },
    { value: "bot", label: "Bot" },
    { value: "support", label: "Support" },
  ]

  const sortOptions = [
    { value: "winRate", label: "Win Rate" },
    { value: "pickRate", label: "Pick Rate" },
    { value: "banRate", label: "Ban Rate" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current patch version
        const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = patchResponse.data[0]
        setPatchVersion(currentPatch)
        
        // Fetch champion data
        const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
        const champData = response.data.data
        
        // Get champion win rates from your backend API
        const statsResponse = await axios.get('/api/champion-stats')
        const champStats = statsResponse.data || {}
        
        // Transform the data into the format we need
        const allChampions = (Object.values(champData) as RiotChampionData[]).map((champ: RiotChampionData) => {
          const stats = champStats[champ.key] || {
            winRate: 50,
            pickRate: 10,
            banRate: 5,
            roles: {}
          }

          const roles = stats.roles || {};
          const roleKeys = Object.keys(roles);
          const primaryRole = roleKeys.length > 0
            ? roleKeys.reduce((a: string, b: string) => (roles[a]?.games || 0) > (roles[b]?.games || 0) ? a : b, roleKeys[0])
            : 'mid';
          
          return {
            id: champ.id,
            name: champ.name,
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
            role: primaryRole
          }
        })

        setChampions(allChampions)
        setFilteredChampions(allChampions)
      } catch (err) {
        console.error("Error fetching tier list data:", err)
        setError("Failed to load tier list")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
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
      const aValue = a[sortBy as keyof ChampionTier] as number
      const bValue = b[sortBy as keyof ChampionTier] as number
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    setFilteredChampions(filtered)
  }, [champions, selectedRole, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="p-6 rounded-xl min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="mt-4 text-zinc-400">Loading tier list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Champion Tier List</h2>
          <p className="text-zinc-400 text-sm mt-1">Current meta rankings by tier</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-sm">
          <Trophy className="w-4 h-4" />
          <span>Patch {patchVersion}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-xs text-zinc-400">Role</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full p-2 bg-purple-500/5 text-white rounded-lg border border-purple-500/15">
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-zinc-400">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 bg-purple-500/5 text-white rounded-lg border border-purple-500/15">
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 bg-purple-500/5 text-white rounded-lg border border-purple-500/15 hover:bg-purple-500/10 transition-colors">
            {sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>
      </div>

      {/* Champions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChampions.map(champion => (
          <Card key={champion.id} className="bg-purple-500/5 border-purple-500/10 p-4 rounded-lg hover:bg-purple-500/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-500/20">
                <Image
                  src={champion.image.replace('splash', 'champion').replace('_0.jpg', '.png') || "/placeholder.svg"}
                  alt={champion.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{champion.name}</h4>
                <div className="flex gap-3 text-sm text-zinc-400">
                  <span>{champion.winRate}% WR</span>
                  <span>{champion.pickRate}% PR</span>
                  <span>{champion.banRate}% BR</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

