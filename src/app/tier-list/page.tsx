"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trophy, Swords, Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"

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
        
        // Check local storage for cached data and verify it's not too old (1 hour max)
        const cachedData = localStorage.getItem('championData')
        const cachedTime = localStorage.getItem('championDataTimestamp')
        const cachedPatch = localStorage.getItem('patchVersion')
        const now = Date.now()
        
        if (
          cachedData && 
          cachedPatch === patchVersion && 
          cachedTime && 
          now - parseInt(cachedTime) < 3600000 // 1 hour
        ) {
          const parsedData = JSON.parse(cachedData)
          setChampions(parsedData)
          setFilteredChampions(parsedData)
          setLoading(false)
          return
        }

        // Fetch current patch version
        const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = patchResponse.data[0]
        setPatchVersion(currentPatch)

        // Fetch champion data from Riot's Data Dragon
        const champResponse = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`
        )
        const champData = champResponse.data.data

        // Fetch champion statistics from u.gg API
        // Note: You'll need to set up a proxy API route to handle this request
        // and manage the API key securely on your backend
        const statsResponse = await axios.get('/api/champion-stats', {
          params: {
            patch: currentPatch.split('.').slice(0, 2).join('.') // Format: '13.10'
          }
        })
        
        const champStats = statsResponse.data || {}

        // Transform the data
        const champValues = Object.values(champData)
        const champList = await Promise.all(champValues.map(async (champ) => {
          const championData = champ as RiotChampionData

          // Get detailed champion data for additional info
          const detailedChampResponse = await axios.get(
            `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion/${championData.id}.json`
          )
          const detailedChampData = detailedChampResponse.data.data[championData.id]

          // Get champion stats from the API response
          const stats = champStats[championData.key] || {}
          
          // Determine primary role based on highest pick rate
          const roles = (stats.roles || {}) as Record<string, RoleStats>
          let primaryRole = 'mid'
          let maxPickRate = 0

          Object.entries(roles).forEach(([role, data]) => {
            if (data.pickRate > maxPickRate) {
              maxPickRate = data.pickRate
              primaryRole = role
            }
          })

          // Get role-specific stats
          const roleStats = roles[primaryRole] || {
            winRate: 0,
            pickRate: 0,
            banRate: 0,
            totalGames: 0
          }

          // Determine tier based on role stats
          let tier = 'C'
          const winRate = roleStats.winRate
          const pickRate = roleStats.pickRate

          // Tier calculation based on win rate and pick rate
          if (winRate >= 52 && pickRate >= 5) tier = 'S'
          else if (winRate >= 51 && pickRate >= 3) tier = 'A'
          else if (winRate >= 49.5) tier = 'B'
          else if (winRate >= 47) tier = 'C'
          else tier = 'D'

          // Determine champion attributes from detailed data
          const difficulty = detailedChampData.info.difficulty <= 3 ? 'easy' 
            : detailedChampData.info.difficulty <= 7 ? 'medium' 
            : 'hard'

          const damageType = detailedChampData.tags.includes('Mage') || detailedChampData.tags.includes('AP') ? 'ap'
            : detailedChampData.tags.includes('Marksman') || detailedChampData.tags.includes('AD') ? 'ad'
            : 'hybrid'

          const range = detailedChampData.stats.attackrange > 300 ? 'ranged' : 'melee'

          return {
            id: championData.id,
            name: championData.name,
            winRate: Number(roleStats.winRate.toFixed(1)),
            pickRate: Number(roleStats.pickRate.toFixed(1)),
            banRate: Number(roleStats.banRate.toFixed(1)),
            totalGames: roleStats.totalGames,
            role: primaryRole,
            tier,
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championData.id}_0.jpg`,
            difficulty,
            damageType,
            range,
            roles
          }
        }))

        // Filter out champions with no valid stats
        const validChamps = champList.filter(champ => champ.winRate > 0)

        // Save to local storage with timestamp
        localStorage.setItem('championData', JSON.stringify(validChamps))
        localStorage.setItem('championDataTimestamp', now.toString())
        localStorage.setItem('patchVersion', currentPatch)

        setChampions(validChamps)
        setFilteredChampions(validChamps)
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
              {['All', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setSelectedDifficulty(difficulty === 'All' ? '' : difficulty)}
                >
                  {difficulty === 'All' ? 'All Difficulties' : difficulty}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Damage Type filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Damage Type</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'AP', 'AD', 'Hybrid'].map((type) => (
                <Button
                  key={type}
                  variant={selectedDamageType === type ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setSelectedDamageType(type === 'All' ? '' : type)}
                >
                  {type === 'All' ? 'All Types' : type}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Range filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Range</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Melee', 'Ranged'].map((range) => (
                <Button
                  key={range}
                  variant={selectedRange === range ? "default" : "outline"}
                  className="py-1 px-3 h-8"
                  onClick={() => setSelectedRange(range === 'All' ? '' : range)}
                >
                  {range === 'All' ? 'All Ranges' : range}
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