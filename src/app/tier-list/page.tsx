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

// Inline SVGs for role icons (from championList.tsx)
const ROLE_ICONS: Record<string, JSX.Element> = {
  TOP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
    </svg>
  ),
  JUNGLE: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M5 2c1.58 1.21 5.58 5.02 6.98 9.95 1.4 4.93 0 10.05 0 10.05-2.75-3.16-5.9-5.2-6.18-5.38C5.45 13.81 3 8.79 3 8.79c3.54.87 4.93 4.28 4.93 4.28C7.56 8.7 5 2 5 2zm15 5.91s-1.24 2.47-1.81 4.6c-.24.88-.29 2.2-.29 3.06v.28c0 .35.01.57.01.57s-1.74 2.4-3.38 3.68c.09-1.6.06-3.44-.21-5.33.93-2.02 2.85-5.45 5.68-6.86zm-2.12-5.33s-2.33 3.05-2.84 6.03c-.11.64-.2 1.2-.28 1.7-.38.58-.73 1.16-1.05 1.73-.03-.13-.06-.25-.1-.38-.3-1.07-.7-2.1-1.16-3.08.05-.15.1-.29.17-.44 0 0 1.81-3.78 5.26-5.56z" />
    </svg>
  ),
  MIDDLE: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.8536 3.14645C17.9473 3.05268 18.0745 3 18.2071 3H20.5C20.7761 3 21 3.22386 21 3.5V5.79289C21 5.9255 20.9473 6.05268 20.8536 6.14645L6.14645 20.8536C6.05268 20.9473 5.9255 21 5.79289 21H3.5C3.22386 21 3 20.7761 3 20.5V18.2071C3 18.0745 3.05268 17.9473 3.14645 17.8536L17.8536 3.14645Z"></path>
    </svg>
  ),
  BOTTOM: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
    </svg>
  ),
  UTILITY: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.4622 10.2574C12.7023 10.2574 12.9114 10.4209 12.9694 10.6538L14.5978 17.1957C14.6081 17.237 14.6133 17.2794 14.6133 17.322V17.8818C14.6133 18.0204 14.5582 18.1534 14.4601 18.2514L13.0238 19.6869C12.9258 19.7848 12.7929 19.8398 12.6543 19.8398H11.3457C11.2071 19.8398 11.0742 19.7848 10.9762 19.6868L9.53979 18.2504C9.44177 18.1524 9.38671 18.0194 9.38671 17.8808V17.3209C9.38671 17.2784 9.39191 17.236 9.40219 17.1947L11.0306 10.6538C11.0886 10.4209 11.2977 10.2574 11.5377 10.2574H12.4622ZM6.55692 6.77339C6.69554 6.77339 6.82848 6.82845 6.9265 6.92647L9.143 9.14297C9.29085 9.29082 9.33635 9.51255 9.25869 9.70668L7.93856 13.0066C7.79919 13.355 7.34903 13.4474 7.08372 13.1821L5.29732 11.3957C5.13821 11.2366 5.09879 10.9935 5.19947 10.7922L5.52419 10.1432C5.69805 9.79566 5.44535 9.38668 5.05676 9.38668H3.56906C3.39433 9.38668 3.23115 9.29936 3.13421 9.15398L2.08869 7.586C1.85709 7.23867 2.10607 6.77339 2.52354 6.77339H6.55692ZM21.4765 6.77339C21.8939 6.77339 22.1429 7.23867 21.9113 7.586L20.8658 9.15398C20.7688 9.29936 20.6057 9.38668 20.4309 9.38668H18.9432C18.5546 9.38668 18.3019 9.79567 18.4758 10.1432L18.8005 10.7922C18.9012 10.9935 18.8618 11.2366 18.7027 11.3957L16.9163 13.1821C16.651 13.4474 16.2008 13.355 16.0614 13.0066L14.7413 9.70668C14.6636 9.51255 14.7092 9.29082 14.857 9.14297L17.0735 6.92647C17.1715 6.82845 17.3045 6.77339 17.4431 6.77339H21.4765Z"></path>
    </svg>
  ),
};

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
  const [searchQuery, setSearchQuery] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch champion data
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/champion-stats')
        if (!response.ok) throw new Error('Failed to fetch champion data')
        const data = await response.json()
        // Transform the data to match our table format
        let transformedChampions = Object.entries(data).map(([id, champ]: [string, any]) => {
          // Find the main role (highest games or winrate, or use champ.role)
          const mainRole = champ.role || Object.keys(champ.roles)[0]
          const roleStats = champ.roles[mainRole]
          return {
            id: String(id),
            name: String(champ.name),
            image: {
              icon: String(champ.image.icon),
              splash: String(champ.image.splash),
              loading: String(champ.image.loading),
              full: String(champ.image.full),
              sprite: String(champ.image.sprite)
            },
            role: mainRole,
            roles: champ.roles,
            difficulty: String(champ.difficulty),
            damageType: String(champ.damageType),
            range: String(champ.range),
            tier: String(roleStats?.tier || 'C'),
            winRate: Number(roleStats?.winRate || 0),
            winRateDelta: Number(roleStats?.winRateDelta || 0),
            pickRate: Number(roleStats?.pickRate || 0),
            games: Number(roleStats?.totalGames || 0),
            rolePercentage: Number(roleStats?.rolePercentage || 100),
          }
        })
        // Sort by tier, then winrate, then games
        const tierOrder = ["S+", "S", "A", "B", "C", "D"]
        transformedChampions = transformedChampions
          .sort((a, b) => {
            const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
            if (tierDiff !== 0) return tierDiff
            if (b.winRate !== a.winRate) return b.winRate - a.winRate
            return b.games - a.games
          })
          .map((champ, idx) => ({ ...champ, rank: idx + 1 }))
        setChampions(transformedChampions)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchChampions()
  }, [])

  // Filter champions based on selected role and search
  const filteredChampions = champions.filter(
    (champion) =>
      (!selectedRole || champion.role === selectedRole) &&
      (!searchQuery || champion.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
    <div className="min-h-screen bg-[#0E1015] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative inline-block">
            <span className="relative z-10">Champion Tier List</span>
            <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/80 to-[#C89B3C]/0 transform -skew-x-12 z-0"></span>
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          {/* Role Filter */}
          <div className="flex gap-2">
            {Object.entries(ROLE_ICONS).map(([role, icon]) => (
              <button
                key={role}
                onClick={() => setSelectedRole(selectedRole === role ? "" : role)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  selectedRole === role
                    ? "bg-[#C89B3C]/20 border-2 border-[#C89B3C]"
                    : "bg-[#242731] border border-[#2F323D] hover:bg-[#2F323D]"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search champion..."
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-[#242731] border border-[#2F323D] focus:outline-none focus:border-[#C89B3C] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#242731] sticky top-0 z-10">
              <tr className="border-b border-[#2F323D]">
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-16">RANK</th>
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm">CHAMPION</th>
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-20">LANE</th>
                <th className="py-4 px-4 text-left font-medium text-zinc-400 text-sm w-20">TIER</th>
                <th className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24">WINRATE</th>
                <th className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24">PICKRATE</th>
                <th className="py-4 px-4 text-right font-medium text-zinc-400 text-sm w-24">GAMES</th>
              </tr>
            </thead>
            <tbody>
              {filteredChampions.map((champion) => (
                <tr
                  key={champion.id}
                  className="border-b border-[#2F323D] hover:bg-[#242731] transition-colors cursor-pointer"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-left font-medium text-zinc-400">{champion.rank}</td>
                  {/* Champion */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#242731] flex-shrink-0">
                        <Image
                          src={champion.image.icon || "/images/champions/fallback.png"}
                          alt={champion.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold">{champion.name}</span>
                    </div>
                  </td>
                  {/* Lane */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#242731] flex items-center justify-center">
                        {ROLE_ICONS[champion.role] || null}
                      </div>
                      <span className="text-xs text-zinc-500 mt-1">{champion.rolePercentage ? `${champion.rolePercentage}%` : ""}</span>
                    </div>
                  </td>
                  {/* Tier */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-lg" style={{ color: tierColors[champion.tier] }}>
                      {champion.tier}
                    </span>
                  </td>
                  {/* Winrate */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold">{champion.winRate?.toFixed(1)}%</span>
                      {champion.winRateDelta !== undefined && (
                        <span className={`text-xs ${champion.winRateDelta > 0 ? "text-green-500" : champion.winRateDelta < 0 ? "text-red-500" : "text-zinc-400"}`}>
                          {champion.winRateDelta > 0 ? `+${champion.winRateDelta.toFixed(1)}%` : champion.winRateDelta < 0 ? `${champion.winRateDelta.toFixed(1)}%` : "0.0%"}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Pickrate */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold">{champion.pickRate?.toFixed(1)}%</span>
                  </td>
                  {/* Games */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-zinc-500">{formatNumber(champion.games)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredChampions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#242731] border border-[#2F323D] mt-8">
            <Search size={32} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-zinc-300 mb-2">No champions found</h3>
            <p className="text-zinc-500 text-center max-w-md">
              No champions match your current filters. Try selecting a different role or clearing filters.
            </p>
            <button
              onClick={() => setSelectedRole("")}
              className="mt-4 px-4 py-2 bg-[#C89B3C] text-zinc-900 font-medium hover:bg-[#D5B45C] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

