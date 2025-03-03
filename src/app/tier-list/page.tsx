"use client"

import { useEffect, useState, useCallback } from "react"
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

export default function TierList() {
  // Keep only the state variables that are used
  const [loading, setLoading] = useState(true)
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [selectedRole, setSelectedRole] = useState("")
  const [patchVersion] = useState("13.23.1")
  const [sortBy, setSortBy] = useState("tier") 
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // New filters
  const [difficulty, setDifficulty] = useState("")
  const [damageType, setDamageType] = useState("")
  const [range, setRange] = useState("")

  // Use useCallback to memoize the fetchChampions function
  const fetchChampions = useCallback(async () => {
    try {
      setLoading(true)
      
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
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'tier') {
        // Convert tier to numeric value for sorting
        const tierValues: Record<string, number> = {
          'S+': 6, 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1
        }
        aValue = tierValues[a.tier || 'C'] || 0
        bValue = tierValues[b.tier || 'C'] || 0
      } else if (sortBy === 'name') {
        aValue = a.name
        bValue = b.name
      } else if (sortBy === 'winRate' || sortBy === 'pickRate' || sortBy === 'banRate') {
        aValue = a[sortBy as keyof Champion] as number
        bValue = b[sortBy as keyof Champion] as number
      } else {
        aValue = String(a[sortBy as keyof Champion] || '')
        bValue = String(b[sortBy as keyof Champion] || '')
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredChampions(filtered)
  }, [champions, selectedRole, difficulty, damageType, range, sortBy, sortOrder])

  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      <h1 className="text-3xl font-bold mb-6">League of Legends Champion Tier List</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading champions...</p>
        </div>
      ) : (
        <>
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
  );
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
      {champion.role && (
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
          <Image 
            src={`/roles/${champion.role.toLowerCase()}.svg`} 
            alt={champion.role}
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