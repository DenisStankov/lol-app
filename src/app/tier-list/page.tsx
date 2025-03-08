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
  TooltipTrigger
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
          image: `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/img/champion/${champion.image.full}`,
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
      filtered = filtered.filter(
        (champ) => champ.roles[selectedRole] && champ.roles[selectedRole].pickRate > 0, // Allow any pick rate
      )

      // Update stats based on selected role
      filtered = filtered.map((champ) => ({
        ...champ,
        winRate: champ.roles[selectedRole].winRate,
        pickRate: champ.roles[selectedRole].pickRate,
        banRate: champ.roles[selectedRole].banRate,
        totalGames: champ.roles[selectedRole].totalGames,
        tier: champ.roles[selectedRole].tier || champ.tier,
        role: selectedRole,
      }))
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">League of Legends Champion Tier List</h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-300">Patch {patchVersion || "14.11.1"}</span>
          <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white">Global Data</span>
        </div>
      </div>

      {/* Filter Bar - Made smaller with better spacing */}
      <div className="bg-zinc-900 rounded-lg p-3 mb-6 flex flex-col gap-4">
        {/* Role and search filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Role icons - made smaller */}
          <button
            onClick={() => setSelectedRole("")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="All Roles"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-lg">*</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedRole("TOP")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "TOP" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="Top"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/images/roles/top.svg" alt="Top" width={20} height={20} className="object-contain" />
            </div>
          </button>
          <button
            onClick={() => setSelectedRole("JUNGLE")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "JUNGLE" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="Jungle"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/images/roles/jungle.svg" alt="Jungle" width={20} height={20} className="object-contain" />
            </div>
          </button>
          <button
            onClick={() => setSelectedRole("MIDDLE")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "MIDDLE" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="Mid"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/images/roles/mid.svg" alt="Mid" width={20} height={20} className="object-contain" />
            </div>
          </button>
          <button
            onClick={() => setSelectedRole("BOTTOM")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "BOTTOM" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="Bot"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/images/roles/bot.svg" alt="Bot" width={20} height={20} className="object-contain" />
            </div>
          </button>
          <button
            onClick={() => setSelectedRole("UTILITY")}
            className={`p-1.5 rounded-md transition-colors ${selectedRole === "UTILITY" ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
            title="Support"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/images/roles/support.svg" alt="Support" width={20} height={20} className="object-contain" />
            </div>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-zinc-700 mx-1"></div>

          {/* Rank Dropdown - Improved with proper icons */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
                >
                  {selectedRank === "ALL" ? (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 opacity-70">
                        <Image 
                          src="/images/ranks/all.png" 
                          alt="All Ranks" 
                          width={20} 
                          height={20} 
                          className="object-contain"
                        />
                      </div>
                      <span>ALL</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5">
                        <Image 
                          src={`/images/ranks/${selectedRank.toLowerCase()}.png`} 
                          alt={selectedRank} 
                          width={20} 
                          height={20} 
                          className="object-contain"
                        />
                      </div>
                      <span>{selectedRank}</span>
                    </div>
                  )}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-zinc-800 border-zinc-700 p-2 w-[300px]">
                <div className="grid grid-cols-3 gap-2">
                  {["CHALLENGER", "GRANDMASTER", "MASTER+", "MASTER", "DIAMOND+", "DIAMOND", "EMERALD+", "EMERALD", "PLATINUM+", "PLATINUM", "GOLD+", "GOLD", "SILVER", "BRONZE", "IRON", "ALL"].map((rank) => (
                    <button
                      key={rank}
                      onClick={() => {
                        setSelectedRank(rank);
                        document.body.click(); // Close popover
                      }}
                      className={`p-2 flex flex-col items-center justify-center rounded-md text-xs ${
                        selectedRank === rank ? "bg-zinc-700" : "hover:bg-zinc-700"
                      }`}
                    >
                      <div className="w-6 h-6 mb-1">
                        <Image 
                          src={`/images/ranks/${rank.toLowerCase()}.png`} 
                          alt={rank} 
                          width={24} 
                          height={24} 
                          className="object-contain"
                        />
                      </div>
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
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search champions..."
              className="bg-zinc-800 hover:bg-zinc-700 focus:bg-zinc-700 py-1.5 pl-7 pr-7 rounded-md w-[200px] text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <X size={14} className="text-gray-400" />
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
                className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1"
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
                className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1"
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
                className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1"
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
            <tr className="bg-zinc-950 text-center">
              <th className="px-3 py-2 text-sm">Lane</th>
              <th className="px-3 py-2 text-left">Champion</th>
              <th className="px-3 py-2 text-sm">
                <div className="flex items-center justify-center gap-1">
                  Tier
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Champion tiers are calculated based on win rate, pick rate, and ban rate.
                        S: Strongest (55%+ win rate)<br />
                        A: Very Strong (53-55% win rate)<br />
                        B: Strong (51-53% win rate)<br />
                        C: Average (48-51% win rate)<br />
                        D: Weak (below 48% win rate)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </th>
              <th className="px-3 py-2 text-sm">Winrate</th>
              <th className="px-3 py-2 text-sm">Pickrate</th>
              <th className="px-3 py-2 text-sm">Games</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
                    <p>Loading champion data...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-red-400">
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
                <td colSpan={6} className="text-center py-8">
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
                  {/* Lane Cell - Centered Icon */}
                  <td className="py-2">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Image
                          src={`/images/roles/${champion.role.toLowerCase()}.svg`}
                          alt={champion.role}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </td>
                  
                  {/* Champion Cell - Better Alignment */}
                  <td className="py-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center mr-3">
                        <div className="w-9 h-9 overflow-hidden rounded-full">
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
                      <span>{champion.name}</span>
                    </div>
                  </td>
                  
                  {/* Tier Cell - Centered Badge */}
                  <td className="py-2">
                    <div className="flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        champion.tier === "S" ? "bg-yellow-500/40" :
                        champion.tier === "A" ? "bg-green-500/40" :
                        champion.tier === "B" ? "bg-blue-600/40" :
                        champion.tier === "C" ? "bg-blue-800/40" :
                        "bg-red-500/40"
                      }`}>
                        <span>{champion.tier}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Win Rate Cell - Centered Text */}
                  <td className="py-2 text-center">
                    {(champion.winRate * 100).toFixed(1)}%
                  </td>
                  
                  {/* Pick Rate Cell - Centered Text */}
                  <td className="py-2 text-center">
                    {(champion.pickRate * 100).toFixed(1)}%
                  </td>
                  
                  {/* Games Cell - Centered Text */}
                  <td className="py-2 text-center">
                    {champion.totalGames.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

