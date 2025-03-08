"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronDown, Search, X, Info } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

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
    id: string
    name: string
    image: {
      full: string
    }
    roles: Record<string, RoleStatsResponse>
    difficulty: string
    damageType: string
    range: string
  }
}

interface RoleStatsResponse {
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  tier: string
}

// Define SVG icons for roles
const roleData: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "": { 
    label: "ALL", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <g fillRule="evenodd">
          <g fillRule="nonzero">
            <g>
              <path d="M16.293 17.03c.362.628.147 1.43-.48 1.793-.629.364-1.431.149-1.794-.479l-2.144-3.717-2.144 3.717c-.363.628-1.165.843-1.793.48-.628-.363-.843-1.166-.48-1.793l2.144-3.718h-4.29c-.724 0-1.312-.587-1.312-1.312 0-.727.588-1.314 1.313-1.314h4.289L7.457 6.969c-.362-.627-.147-1.43.48-1.792.629-.364 1.431-.149 1.794.479l2.144 3.717 2.144-3.717c.363-.628 1.165-.843 1.793-.48.628.363.843 1.166.48 1.793l-2.144 3.718h4.29c.725 0 1.312.587 1.312 1.312 0 .727-.587 1.314-1.312 1.314h-4.29l2.145 3.718z" />
            </g>
          </g>
        </g>
      </svg>
    ),  
    color: "#FFFFFF" 
  },
  "TOP": { 
    label: "TOP", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
        <path d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z"></path>
      </svg>
    ), 
    color: "#FF9500" 
  },
  "JUNGLE": { 
    label: "JNG", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <g fillRule="evenodd">
          <g fillRule="nonzero">
            <g>
              <path d="M5.14 2c1.58 1.21 5.58 5.023 6.976 9.953s0 10.047 0 10.047c-2.749-3.164-5.893-5.2-6.18-5.382l-.02-.013C5.45 13.814 3 8.79 3 8.79c3.536.867 4.93 4.279 4.93 4.279C7.558 8.698 5.14 2 5.14 2zm14.976 5.907s-1.243 2.471-1.814 4.604c-.235.878-.285 2.2-.29 3.058v.282c.003.347.01.568.01.568s-1.738 2.397-3.38 3.678c.088-1.601.062-3.435-.208-5.334.928-2.023 2.846-5.454 5.682-6.856zm-2.124-5.331s-2.325 3.052-2.836 6.029c-.11.636-.201 1.194-.284 1.695-.379.584-.73 1.166-1.05 1.733-.033-.125-.06-.25-.095-.375-.302-1.07-.704-2.095-1.16-3.08.053-.146.103-.29.17-.438 0 0 1.814-3.78 5.255-5.564z" />
            </g>
          </g>
        </g>
      </svg>
    ), 
    color: "#19B326" 
  },
  "MIDDLE": { 
    label: "MID", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M13.7929 3C14.2383 3 14.4614 3.53857 14.1464 3.85355L11.1464 6.85355C11.0527 6.94732 10.9255 7 10.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V10.7929C7 10.9255 6.94732 11.0527 6.85355 11.1464L3.85355 14.1464C3.53857 14.4614 3 14.2383 3 13.7929V3.5C3 3.22386 3.22386 3 3.5 3H13.7929Z"></path>
        <path d="M17.8536 3.14645C17.9473 3.05268 18.0745 3 18.2071 3H20.5C20.7761 3 21 3.22386 21 3.5V5.79289C21 5.9255 20.9473 6.05268 20.8536 6.14645L6.14645 20.8536C6.05268 20.9473 5.9255 21 5.79289 21H3.5C3.22386 21 3 20.7761 3 20.5V18.2071C3 18.0745 3.05268 17.9473 3.14645 17.8536L17.8536 3.14645Z"></path>
        <path opacity="0.2" d="M10.2071 21C9.76165 21 9.53857 20.4614 9.85355 20.1464L12.8536 17.1464C12.9473 17.0527 13.0745 17 13.2071 17H16.5C16.7761 17 17 16.7761 17 16.5V13.2071C17 13.0745 17.0527 12.9473 17.1464 12.8536L20.1464 9.85355C20.4614 9.53857 21 9.76165 21 10.2071V20.5C21 20.7761 20.7761 21 20.5 21H10.2071Z"></path>
      </svg>
    ), 
    color: "#4F8EFF" 
  },
  "BOTTOM": { 
    label: "BOT", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
        <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z"></path>
      </svg>
    ), 
    color: "#FF4E50" 
  },
  "UTILITY": { 
    label: "SUP", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.4622 10.2574C12.7023 10.2574 12.9114 10.4209 12.9694 10.6538L14.5978 17.1957C14.6081 17.237 14.6133 17.2794 14.6133 17.322V17.8818C14.6133 18.0204 14.5582 18.1534 14.4601 18.2514L13.0238 19.6869C12.9258 19.7848 12.7929 19.8398 12.6543 19.8398H11.3457C11.2071 19.8398 11.0742 19.7848 10.9762 19.6868L9.53979 18.2504C9.44177 18.1524 9.38671 18.0194 9.38671 17.8808V17.3209C9.38671 17.2784 9.39191 17.236 9.40219 17.1947L11.0306 10.6538C11.0886 10.4209 11.2977 10.2574 11.5377 10.2574H12.4622ZM6.55692 6.77339C6.69554 6.77339 6.82848 6.82845 6.9265 6.92647L9.143 9.14297C9.29085 9.29082 9.33635 9.51255 9.25869 9.70668L7.93856 13.0066C7.79919 13.355 7.34903 13.4474 7.08372 13.1821L5.29732 11.3957C5.13821 11.2366 5.09879 10.9935 5.19947 10.7922L5.52419 10.1432C5.69805 9.79566 5.44535 9.38668 5.05676 9.38668H3.56906C3.39433 9.38668 3.23115 9.29936 3.13421 9.15398L2.08869 7.586C1.85709 7.23867 2.10607 6.77339 2.52354 6.77339H6.55692ZM21.4765 6.77339C21.8939 6.77339 22.1429 7.23867 21.9113 7.586L20.8658 9.15398C20.7688 9.29936 20.6057 9.38668 20.4309 9.38668H18.9432C18.5546 9.38668 18.3019 9.79567 18.4758 10.1432L18.8005 10.7922C18.9012 10.9935 18.8618 11.2366 18.7027 11.3957L16.9163 13.1821C16.651 13.4474 16.2008 13.355 16.0614 13.0066L14.7413 9.70668C14.6636 9.51255 14.7092 9.29082 14.857 9.14297L17.0735 6.92647C17.1715 6.82845 17.3045 6.77339 17.4431 6.77339H21.4765ZM13.5907 4.1601C13.738 4.1601 13.8785 4.22224 13.9775 4.33124L14.4774 4.88134C14.5649 4.97754 14.6133 5.10287 14.6133 5.23285V5.74436C14.6133 5.84757 14.5827 5.94846 14.5255 6.03432L13.0259 8.28323C12.929 8.42861 12.7658 8.51593 12.5911 8.51593H11.4089C11.2342 8.51593 11.071 8.42861 10.9741 8.28323L9.47452 6.03432C9.41726 5.94846 9.38671 5.84757 9.38671 5.74436V5.23285C9.38671 5.10287 9.43515 4.97754 9.52257 4.88134L10.0225 4.33124C10.1215 4.22224 10.262 4.1601 10.4093 4.1601H13.5907Z"></path>
      </svg>
    ), 
    color: "#CC66FF" 
  }
}

// Improved tier color mapping to match dpm.lol
const tierColors: Record<string, string> = {
  "S+": "#FF4E50", // Red
  "S": "#FF9500",  // Orange
  "A": "#FFCC00",  // Yellow
  "B": "#00CC88",  // Teal
  "C": "#4F8EFF",  // Blue
  "D": "#A855F7",  // Purple
}

export default function TierList() {
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRank, setSelectedRank] = useState("ALL")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedDamageType, setSelectedDamageType] = useState<string[]>([])
  const [selectedRange, setSelectedRange] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchVersion, setPatchVersion] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortBy, setSortBy] = useState("tier")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [viewMode] = useState("table")

  // Use useCallback to memoize the fetchChampions function
  const fetchChampions = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch current patch version from Data Dragon API
      try {
        const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        if (response.ok) {
          const versions = await response.json();
          const currentPatch = versions[0]; // Get the latest patch
          setPatchVersion(currentPatch);
        } else {
          // Fallback to static version
          setPatchVersion("14.14.1");
        }
      } catch (error) {
        console.error("Error fetching patch version:", error);
        setPatchVersion("14.14.1"); // Fallback
      }
      
      const currentPatch = patchVersion || "14.14.1";
      
      const response = await fetch(`/api/champion-stats?patch=${currentPatch}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = (await response.json()) as ChampionStatsResponse

      // Transform the data to match our Champion interface
      const transformedChampions: Champion[] = Object.values(data).map((champion) => {
        // Select the primary role based on highest pick rate
        const roles = champion.roles || {}
        let primaryRole = ""
        let highestPickRate = 0
        
        // Find the role with the highest pick rate
        Object.entries(roles).forEach(([role, stats]) => {
          if (stats.pickRate > highestPickRate) {
            highestPickRate = stats.pickRate
            primaryRole = role
          }
        })
        
        // If no primary role found, default to the first role or a placeholder
        if (!primaryRole && Object.keys(roles).length > 0) {
          primaryRole = Object.keys(roles)[0]
        } else if (!primaryRole) {
          primaryRole = "TOP" // Default fallback
        }
        
        // Get the stats for the primary role
        const primaryRoleStats = roles[primaryRole] || {
          winRate: 0,
          pickRate: 0,
          banRate: 0,
          totalGames: 0,
          tier: "C"
        }
        
        // Ensure percentage values are handled correctly
        const normalizedWinRate = primaryRoleStats.winRate > 1 ? primaryRoleStats.winRate / 100 : primaryRoleStats.winRate
        const normalizedPickRate = primaryRoleStats.pickRate > 1 ? primaryRoleStats.pickRate / 100 : primaryRoleStats.pickRate
        const normalizedBanRate = primaryRoleStats.banRate > 1 ? primaryRoleStats.banRate / 100 : primaryRoleStats.banRate
        
        return {
          id: champion.id,
          name: champion.name,
          image: `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/img/champion/${champion.image.full}`,
          winRate: normalizedWinRate,
          pickRate: normalizedPickRate,
          banRate: normalizedBanRate,
          totalGames: primaryRoleStats.totalGames || 0,
          role: primaryRole,
          tier: primaryRoleStats.tier || "C",
          roles: champion.roles,
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
  }, [patchVersion])

  useEffect(() => {
    fetchChampions()
  }, [fetchChampions])

  // Filter and sort champions
  useEffect(() => {
    let filtered = [...champions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((champ) => champ.name.toLowerCase().includes(query))
    }

    // Apply role filter
    if (selectedRole !== "") {
      // Create a new array with champions that have data for the selected role
      filtered = champions.filter(
        (champ) => champ.roles && champ.roles[selectedRole] && champ.roles[selectedRole].pickRate > 0
      ).map(champ => {
        // Clone the champion object but update with role-specific stats
        const roleStats = champ.roles[selectedRole]
        return {
          ...champ,
          winRate: roleStats.winRate,
          pickRate: roleStats.pickRate,
          banRate: roleStats.banRate,
          totalGames: roleStats.totalGames,
          tier: roleStats.tier || champ.tier,
          role: selectedRole,
        }
      })
    }

    // Filter by tier
    if (selectedTier !== "") {
      filtered = filtered.filter((champ) => champ.tier === selectedTier)
    }

    // Filter by difficulty
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter((champ) => selectedDifficulty.includes(champ.difficulty))
    }

    // Filter by damage type
    if (selectedDamageType.length > 0) {
      filtered = filtered.filter((champ) => selectedDamageType.includes(champ.damageType))
    }

    // Filter by range
    if (selectedRange.length > 0) {
      filtered = filtered.filter((champ) => selectedRange.includes(champ.range))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const tierValues: Record<string, number> = {
        "S+": 0,
        S: 1,
        A: 2,
        B: 3,
        C: 4,
        D: 5,
      }

      if (sortBy === "tier") {
        return sortOrder === "asc"
          ? tierValues[a.tier as keyof typeof tierValues] - tierValues[b.tier as keyof typeof tierValues]
          : tierValues[b.tier as keyof typeof tierValues] - tierValues[a.tier as keyof typeof tierValues]
      }

      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }

      // For numeric properties
      const aValue = a[sortBy as keyof Champion] as number
      const bValue = b[sortBy as keyof Champion] as number

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredChampions(filtered)
  }, [
    champions,
    selectedRole,
    selectedTier,
    selectedRank,
    selectedDifficulty,
    selectedDamageType,
    selectedRange,
    sortBy,
    sortOrder,
    searchQuery,
  ])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearAllFilters = () => {
    setSelectedRole("");
    setSelectedTier("");
    setSelectedRank("ALL");
    setSelectedDifficulty([]);
    setSelectedDamageType([]);
    setSelectedRange([]);
    setSearchQuery("");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Role:")) {
      setSelectedRole("");
    } else if (filter.startsWith("Tier:")) {
      setSelectedTier("");
    } else if (filter.startsWith("Difficulty:")) {
      const difficulty = filter.replace("Difficulty: ", "");
      setSelectedDifficulty(prev => {
        const updated = prev.filter(item => item !== difficulty);
        return updated;
      });
    } else if (filter.startsWith("Damage:")) {
      const damageType = filter.replace("Damage: ", "");
      setSelectedDamageType(prev => {
        const updated = prev.filter(item => item !== damageType);
        return updated;
      });
    } else if (filter.startsWith("Range:")) {
      const range = filter.replace("Range: ", "");
      setSelectedRange(prev => {
        const updated = prev.filter(item => item !== range);
        return updated;
      });
    } else if (filter.startsWith("Search:")) {
      setSearchQuery("");
    }
  }

  const toggleDifficultyFilter = (value: string) => {
    setSelectedDifficulty((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }
  
  const toggleDamageTypeFilter = (value: string) => {
    setSelectedDamageType((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }
  
  const toggleRangeFilter = (value: string) => {
    setSelectedRange((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-xl">Loading champion data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 text-red-300 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchChampions}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white">League of Legends Champion Tier List</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-zinc-400">Patch {patchVersion || "14.11.1"}</span>
            <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full text-xs">Global Data</span>
          </div>
        </div>

        {/* Filter Bar - Made smaller with better spacing */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 mb-6 flex flex-col gap-4">
          {/* Role and search filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Role icons - made smaller */}
            {Object.entries(roleData).map(([role, info]) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-1.5 rounded-md transition-colors ${selectedRole === role ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
                title={info.label}
              >
                <div 
                  className="w-6 h-6 flex items-center justify-center"
                  style={{ color: info.color }}
                >
                  {info.icon}
                </div>
              </button>
            ))}

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-700 mx-1"></div>

            {/* Rank Dropdown */}
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span>{selectedRank || "ALL"}</span>
                    <ChevronDown size={14} className="text-zinc-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="bg-zinc-800 border border-zinc-700 p-2 w-[300px] text-zinc-300">
                  <div className="grid grid-cols-3 gap-2">
                    {["CHALLENGER", "GRANDMASTER", "MASTER+", "MASTER", "DIAMOND+", "DIAMOND", "EMERALD+", "EMERALD", "PLATINUM+", "PLATINUM", "GOLD+", "GOLD", "SILVER", "BRONZE", "IRON", "ALL"].map((rank) => (
                      <button
                        key={rank}
                        onClick={() => {
                          setSelectedRank(rank);
                          document.body.click(); // Close popover
                        }}
                        className={`p-2 flex items-center justify-center rounded-md text-xs ${
                          selectedRank === rank ? "bg-zinc-700 text-white" : "hover:bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        <span>{rank}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-700 mx-1"></div>

            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <Search size={14} className="text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search champions..."
                className="bg-zinc-800 hover:bg-zinc-700 focus:bg-zinc-700 py-1.5 pl-7 pr-7 rounded-md w-[200px] text-sm focus:outline-none text-zinc-300 placeholder-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <X size={14} className="text-zinc-400" />
                </button>
              )}
            </div>
          </div>

          {/* Additional filter options - optional display */}
          {(selectedDifficulty.length > 0 || selectedDamageType.length > 0 || selectedRange.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {selectedDifficulty.map((difficulty) => (
                <span
                  key={difficulty}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md flex items-center gap-1 text-zinc-300"
                >
                  Difficulty: {difficulty}
                  <button onClick={() => toggleDifficultyFilter(difficulty)} className="opacity-60 hover:opacity-100">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedDamageType.map((damageType) => (
                <span
                  key={damageType}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md flex items-center gap-1 text-zinc-300"
                >
                  Damage: {damageType}
                  <button onClick={() => toggleDamageTypeFilter(damageType)} className="opacity-60 hover:opacity-100">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedRange.map((range) => (
                <span
                  key={range}
                  className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md flex items-center gap-1 text-zinc-300"
                >
                  Range: {range}
                  <button onClick={() => toggleRangeFilter(range)} className="opacity-60 hover:opacity-100">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Champion Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-300 text-center border-b border-zinc-800">
                <th className="px-3 py-2 text-sm">Lane</th>
                <th className="px-3 py-2 text-left">
                  <button 
                    onClick={() => {
                      setSortBy("name")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    Champion
                    {sortBy === "name" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => {
                        setSortBy("tier")
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }}
                      className="flex items-center hover:text-blue-400 transition-colors"
                    >
                      Tier
                      {sortBy === "tier" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} className="text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border border-zinc-700 text-zinc-300">
                          <p className="w-[200px] text-xs">
                            Champion tiers are calculated based on win rate, pick rate, and ban rate.
                            S+: Overpowered (top tier)<br />
                            S: Very strong<br />
                            A: Strong<br />
                            B: Balanced<br />
                            C: Below average<br />
                            D: Weak
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </th>
                <th className="px-3 py-2 text-sm">
                  <button 
                    onClick={() => {
                      setSortBy("winRate")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                    className="flex items-center justify-center hover:text-blue-400 transition-colors w-full"
                  >
                    Winrate
                    {sortBy === "winRate" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-2 text-sm">
                  <button 
                    onClick={() => {
                      setSortBy("pickRate")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                    className="flex items-center justify-center hover:text-blue-400 transition-colors w-full"
                  >
                    Pickrate
                    {sortBy === "pickRate" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-2 text-sm">
                  <button 
                    onClick={() => {
                      setSortBy("banRate")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                    className="flex items-center justify-center hover:text-blue-400 transition-colors w-full"
                  >
                    Banrate
                    {sortBy === "banRate" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-2 text-sm">
                  <button 
                    onClick={() => {
                      setSortBy("totalGames")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                    className="flex items-center justify-center hover:text-blue-400 transition-colors w-full"
                  >
                    Games
                    {sortBy === "totalGames" && (
                      <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
                      <p>Loading champion data...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-red-400">
                    <p>{error}</p>
                    <button
                      onClick={fetchChampions}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : filteredChampions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <p>No champions found matching your filters.</p>
                    <button
                      onClick={() => {
                        setSelectedRole("")
                        setSelectedTier("")
                        setSelectedRank("ALL")
                        setSelectedDifficulty([])
                        setSelectedDamageType([])
                        setSelectedRange([])
                        setSearchQuery("")
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredChampions.map((champion) => (
                  <tr
                    key={`${champion.id}-${champion.role}`}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    {/* Lane Cell with SVG */}
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <div 
                          className="w-8 h-8 rounded-md flex items-center justify-center bg-zinc-800"
                          style={{ 
                            color: roleData[champion.role]?.color || '#FFFFFF',
                            border: `1px solid ${roleData[champion.role]?.color || '#FFFFFF'}40`,
                          }}
                        >
                          {roleData[champion.role]?.icon || roleData[""].icon}
                        </div>
                      </div>
                    </td>
                    
                    {/* Champion Cell - Better Alignment */}
                    <td className="py-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center mr-3">
                          <div className="w-9 h-9 overflow-hidden rounded-full border border-zinc-700">
                            <Image
                              src={champion.image}
                              alt={champion.name}
                              width={36}
                              height={36}
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                        <span className="font-medium">{champion.name}</span>
                      </div>
                    </td>
                    
                    {/* Tier Cell - Centered Badge with Colored Background */}
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: `${tierColors[champion.tier as keyof typeof tierColors] || '#4F8EFF'}40`,
                            color: tierColors[champion.tier as keyof typeof tierColors] || '#4F8EFF',
                            boxShadow: `0 0 10px ${tierColors[champion.tier as keyof typeof tierColors] || '#4F8EFF'}30`
                          }}
                        >
                          <span>{champion.tier}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Win Rate Cell - Centered Text */}
                    <td className="py-2 text-center font-medium">
                      {(champion.winRate * 100).toFixed(1)}%
                    </td>
                    
                    {/* Pick Rate Cell - Centered Text */}
                    <td className="py-2 text-center font-medium">
                      {(champion.pickRate * 100).toFixed(1)}%
                    </td>
                    
                    {/* Ban Rate Cell - Centered Text */}
                    <td className="py-2 text-center font-medium">
                      {(champion.banRate * 100).toFixed(1)}%
                    </td>
                    
                    {/* Games Cell - Centered Text */}
                    <td className="py-2 text-center text-zinc-500">
                      {champion.totalGames.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

