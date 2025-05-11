"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, X, Info } from "lucide-react"
import Navigation from "@/components/navigation"

// Define strict types for our data
interface ChampionRole {
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  tier: string
}

interface Champion {
  id: string
  name: string
  image: {
    icon: string
    splash: string
    loading: string
    full: string
    sprite: string
  }
  role: string
  roles: Record<string, ChampionRole>
  difficulty: string
  damageType: string
  range: string
  tier: string
}

// Role data with proper typing
const roleData = {
  "": { 
    label: "ALL", 
    color: "#FFFFFF",
    icon: "ALL"
  },
  "TOP": { 
    label: "TOP", 
    color: "#FF9500",
    icon: "TOP"
  },
  "JUNGLE": { 
    label: "JNG", 
    color: "#19B326",
    icon: "JNG"
  },
  "MIDDLE": { 
    label: "MID", 
    color: "#4F8EFF",
    icon: "MID"
  },
  "BOTTOM": { 
    label: "BOT", 
    color: "#FF4E50",
    icon: "BOT"
  },
  "UTILITY": { 
    label: "SUP", 
    color: "#CC66FF",
    icon: "SUP"
  }
}

// Tier colors
const tierColors: Record<string, string> = {
  "S+": "#FF2D55",
  "S": "#FF9500",
  "A": "#FFCC00",
  "B": "#34C759",
  "C": "#5AC8FA",
  "D": "#AF52DE",
}

// ChampionCard component
function ChampionCard({ champion, onNavigate }: { champion: Champion, onNavigate: (id: string) => void }) {
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = () => {
    setImageError(true)
  }
  
  const roleInfo = roleData[champion.role] || { label: champion.role, color: "#FFFFFF", icon: champion.role }
  
  return (
    <div 
      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 border border-zinc-800 hover:border-[#C89B3C]/60 shadow-md hover:shadow-lg hover:shadow-[#C89B3C]/10 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onNavigate(champion.id)}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: `url(${champion.image.splash})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/70 to-zinc-900"></div>
        
        <div className="relative p-4 flex items-center gap-4 z-10">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            {!imageError ? (
              <Image
                src={champion.image.icon}
                alt={champion.name}
                width={56}
                height={56}
                className="object-cover"
                onError={handleImageError}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-xs font-bold text-white">
                  {champion.name.substring(0, 4)}
                </span>
              </div>
            )}
            
            <div 
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md text-black"
              style={{ backgroundColor: tierColors[champion.tier] || '#5AC8FA' }}
            >
              {champion.tier}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold truncate text-lg">
                {champion.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-black font-medium shadow-sm"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
            
            <div className="flex gap-2 items-center text-xs text-zinc-400">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.difficulty}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.damageType}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.range}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-3 gap-1 bg-zinc-800/50 border-t border-zinc-700/30">
        <div className="text-center py-1 px-2 rounded-md bg-green-900/20 border border-green-900/30">
          <div className="text-green-400 font-bold text-sm">{champion.roles[champion.role]?.winRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Win Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-blue-900/20 border border-blue-900/30">
          <div className="text-blue-400 font-bold text-sm">{champion.roles[champion.role]?.pickRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Pick Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-red-900/20 border border-red-900/30">
          <div className="text-red-400 font-bold text-sm">{champion.roles[champion.role]?.banRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Ban Rate</div>
        </div>
      </div>
      
      <div className="px-3 py-2 text-xs text-center text-[#C89B3C] border-t border-zinc-800 bg-zinc-900/80 font-medium">
        View Champion Details
      </div>
    </div>
  )
}

export default function TierList() {
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  // Fetch champion data
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/champion-stats')
        if (!response.ok) throw new Error('Failed to fetch champion data')
        
        const data = await response.json()
        
        // Transform the data to match our Champion interface
        const transformedChampions = Object.entries(data).map(([id, champ]: [string, any]) => ({
          id: String(id),
          name: String(champ.name),
          image: {
            icon: String(champ.image.icon),
            splash: String(champ.image.splash),
            loading: String(champ.image.loading),
            full: String(champ.image.full),
            sprite: String(champ.image.sprite)
          },
          role: String(champ.role || 'TOP'),
          roles: Object.entries(champ.roles || {}).reduce((acc: Record<string, ChampionRole>, [role, stats]: [string, any]) => {
            acc[String(role)] = {
              winRate: Number(stats.winRate),
              pickRate: Number(stats.pickRate),
              banRate: Number(stats.banRate),
              totalGames: Number(stats.totalGames),
              tier: String(stats.tier)
            }
            return acc
          }, {}),
          difficulty: String(champ.difficulty),
          damageType: String(champ.damageType),
          range: String(champ.range),
          tier: String(champ.roles?.[champ.role]?.tier || 'C')
        }))

        setChampions(transformedChampions)
        setFilteredChampions(transformedChampions)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchChampions()
  }, [])

  // Filter champions
  useEffect(() => {
    let filtered = [...champions]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(champ => champ.name.toLowerCase().includes(query))
    }

    if (selectedRole) {
      filtered = filtered.filter(champ => champ.role === selectedRole)
    }

    if (selectedTier) {
      filtered = filtered.filter(champ => champ.tier === selectedTier)
    }

    setFilteredChampions(filtered)
  }, [champions, searchQuery, selectedRole, selectedTier])

  const navigateToChampion = (championId: string) => {
    router.push(`/champion/${championId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C89B3C]"></div>
          <p className="text-xl text-white">Loading champion data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1015] p-8">
        <Navigation />
        <div className="bg-red-500/20 border border-red-500/50 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E1015]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative inline-block">
            <span className="relative z-10">Champion Tier List</span>
            <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/80 to-[#C89B3C]/0 transform -skew-x-12 z-0"></span>
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Role Filter */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-2">Filter by Role</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleData).map(([role, data]) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(selectedRole === role ? "" : role)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                      selectedRole === role
                        ? "bg-[#C89B3C] text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    <span>{data.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-2">Search Champions</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search champions..."
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Champion Tier List */}
        {filteredChampions.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 animate-fadeIn">
            {Object.entries(tierColors).map(([tier, color]) => {
              const championsInTier = filteredChampions.filter(
                (champ) => champ.tier === tier
              )

              if (championsInTier.length === 0) return null

              return (
                <div key={tier} className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                  <div
                    className="p-4 flex items-center gap-4 border-b border-zinc-800"
                    style={{ backgroundColor: `${color}10` }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {tier}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-medium">
                        Tier {tier} Champions
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {championsInTier.length} champion{championsInTier.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {championsInTier.map((champion) => (
                      <ChampionCard 
                        key={champion.id + champion.role} 
                        champion={champion} 
                        onNavigate={navigateToChampion}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="text-zinc-400 mb-2 text-6xl">😢</div>
            <h3 className="text-white text-xl font-medium mb-2">No Champions Found</h3>
            <p className="text-zinc-400 mb-4">
              No champions match your current filter criteria. Try removing some filters.
            </p>
            <button
              onClick={() => {
                setSelectedRole("")
                setSelectedTier("")
                setSearchQuery("")
              }}
              className="bg-[#C89B3C] text-black px-4 py-2 rounded-md hover:bg-[#C89B3C]/80 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

