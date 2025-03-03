"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Trophy, Swords, Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "../../components/button"

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
  primaryRole?: string
}

interface RoleStats {
  pickRate: number
  winRate: number
  banRate: number
  totalGames: number
  tier: string
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
  const [patchVersion, setPatchVersion] = useState("13.23.1")
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    S: true,
    A: true,
    B: false,
    C: false,
    D: false,
  })
  
  // Filters
  const [selectedRole, setSelectedRole] = useState("")
  const [sortBy, setSortBy] = useState("tier") // tier, winRate, pickRate, banRate
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc") // asc, desc
  
  // New filters
  const [difficulty, setDifficulty] = useState("")
  const [damageType, setDamageType] = useState("")
  const [range, setRange] = useState("")
  
  const roles = [
    { value: "", label: "All Roles" },
    { value: "top", label: "Top" },
    { value: "jungle", label: "Jungle" },
    { value: "mid", label: "Mid" },
    { value: "bot", label: "Bot" },
    { value: "support", label: "Support" },
  ]
  
  const difficulties = [
    { value: "", label: "All Difficulties" },
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
  ]

  const damageTypes = [
    { value: "", label: "All Types" },
    { value: "AP", label: "AP" },
    { value: "AD", label: "AD" },
    { value: "Hybrid", label: "Hybrid" },
  ]

  const ranges = [
    { value: "", label: "All Ranges" },
    { value: "Melee", label: "Melee" },
    { value: "Ranged", label: "Ranged" },
  ]

  const sortOptions = [
    { value: "tier", label: "Tier" },
    { value: "winRate", label: "Win Rate" },
    { value: "pickRate", label: "Pick Rate" },
    { value: "name", label: "Name" },
  ]

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }))
  }

  const fetchChampions = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/champion-stats?patch=${patchVersion}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform the data to match our Champion interface
      const transformedChampions: Champion[] = Object.values(data).map((champion: any) => {
        // Find the primary role (highest pick rate)
        const roles = champion.roles || {}
        let primaryRole = ""
        let highestPickRate = 0
        let tier = "C" // Default tier
        let winRate = 0
        let pickRate = 0
        let banRate = 0
        let totalGames = 0
        
        Object.entries(roles).forEach(([role, stats]: [string, any]) => {
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
  }

  useEffect(() => {
    fetchChampions()
  }, [patchVersion])
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...champions]
    
    // Filter by role
    if (selectedRole !== '') {
      filtered = filtered.filter(champ => 
        champ.roles[selectedRole] && 
        champ.roles[selectedRole].pickRate >= 1 // Only show champions with at least 1% pick rate in the role
      )
      
      // Update stats based on selected role
      filtered = filtered.map(champ => ({
        ...champ,
        winRate: Number(champ.roles[selectedRole].winRate.toFixed(1)),
        pickRate: Number(champ.roles[selectedRole].pickRate.toFixed(1)),
        banRate: Number(champ.roles[selectedRole].banRate.toFixed(1)),
        totalGames: champ.roles[selectedRole].totalGames,
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
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">League of Legends Champion Tier List</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Filters</h2>
        <div className="space-y-4">
          {/* Role filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Role</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Top', 'Jungle', 'Mid', 'Bot', 'Support'].map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role.toLowerCase() ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setSelectedRole(role === 'All' ? '' : role.toLowerCase())}
                >
                  {role === 'All' ? 'All Roles' : role}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Difficulty filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Easy', 'Medium', 'Hard'].map((difficultyOption) => (
                <Button
                  key={difficultyOption}
                  variant={difficulty === (difficultyOption === 'All' ? '' : difficultyOption) ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setDifficulty(difficultyOption === 'All' ? '' : difficultyOption)}
                >
                  {difficultyOption === 'All' ? 'All Difficulties' : difficultyOption}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Damage Type filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Damage Type</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'AP', 'AD', 'Hybrid'].map((typeOption) => (
                <Button
                  key={typeOption}
                  variant={damageType === (typeOption === 'All' ? '' : typeOption) ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setDamageType(typeOption === 'All' ? '' : typeOption)}
                >
                  {typeOption === 'All' ? 'All Types' : typeOption}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Range filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Range</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Melee', 'Ranged'].map((rangeOption) => (
                <Button
                  key={rangeOption}
                  variant={range === (rangeOption === 'All' ? '' : rangeOption) ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setRange(rangeOption === 'All' ? '' : rangeOption)}
                >
                  {rangeOption === 'All' ? 'All Ranges' : rangeOption}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Sort options */}
          <div>
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'tier', label: 'Tier' },
                { value: 'name', label: 'Name' },
                { value: 'winRate', label: 'Win Rate' },
                { value: 'pickRate', label: 'Pick Rate' }
              ].map((sort) => (
                <Button
                  key={sort.value}
                  variant={sortBy === sort.value ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setSortBy(sort.value)}
                >
                  {sort.label}
                  {sortBy === sort.value && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                className="py-1 px-3 h-8"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading champions...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Champions {selectedRole && `- ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              {filteredChampions.length > 0 && <span className="text-gray-400 ml-2">({filteredChampions.length})</span>}
            </h2>
          </div>
          
          {/* All Champions Grid - Now we display all champions in a single grid with their tier badges */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
            {filteredChampions.map((champion) => (
              <ChampionCard key={champion.id} champion={champion} />
            ))}
          </div>
          
          {filteredChampions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-400">No champions found matching your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const ChampionCard = ({ champion }: { champion: Champion }) => {
  return (
    <div className="relative flex flex-col items-center p-1 bg-gray-800 rounded-md overflow-hidden">
      {/* Tier Badge */}
      <div className={`absolute top-0 left-0 w-6 h-6 flex items-center justify-center rounded-br-md text-xs font-bold ${
        champion.tier === 'S+' ? 'bg-purple-600' :
        champion.tier === 'S' ? 'bg-red-600' :
        champion.tier === 'A' ? 'bg-orange-500' :
        champion.tier === 'B' ? 'bg-yellow-500' :
        champion.tier === 'C' ? 'bg-green-500' : 'bg-blue-500'
      }`}>
        {champion.tier}
      </div>
      
      {/* Champion Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        <Image 
          src={champion.image} 
          alt={champion.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      
      {/* Role Icon (small icon on bottom right) */}
      {champion.primaryRole && (
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
          <Image 
            src={`/roles/${champion.primaryRole.toLowerCase()}.svg`} 
            alt={champion.primaryRole}
            width={14}
            height={14}
          />
        </div>
      )}
      
      {/* Champion Name */}
      <div className="mt-1 text-xs font-medium text-center w-full truncate px-1">
        {champion.name}
      </div>
    </div>
  );
}; 