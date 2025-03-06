"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Filter, Info, Search, ArrowUpDown, X, ChevronUp, Sliders } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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

// Tier colors with updated modern palette
const tierColors = {
  "S+": "#FF9500", // Vibrant Orange
  S: "#FFB700", // Gold
  A: "#00C2A8", // Teal
  B: "#4F8EFF", // Blue
  C: "#A855F7", // Purple
  D: "#FF5757", // Red
}

// Role icons mapping with improved emojis
const roleIcons: Record<string, string> = {
  top: "⚔️",
  jungle: "🌿",
  mid: "✨",
  bot: "🏹",
  support: "🛡️",
}

export default function TierList() {
  // State variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [patchVersion, _setPatchVersion] = useState("13.23.1") // Fixed value for current version
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filters
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRank, setSelectedRank] = useState("ALL")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedDamageType, setSelectedDamageType] = useState<string[]>([])
  const [selectedRange, setSelectedRange] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("tier")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState("table")

  // Filter options
  const ranks = [
    { value: "ALL", label: "ALL" },
    { value: "IRON+", label: "IRON+" },
    { value: "BRONZE+", label: "BRONZE+" },
    { value: "SILVER+", label: "SILVER+" },
    { value: "GOLD+", label: "GOLD+" },
    { value: "PLATINUM+", label: "PLATINUM+" },
    { value: "EMERALD+", label: "EMERALD+" },
    { value: "DIAMOND+", label: "DIAMOND+" },
  ]

  const roles = [
    { value: "", label: "ALL", icon: "🌐" },
    { value: "top", label: "TOP", icon: "⚔️" },
    { value: "jungle", label: "JUNGLE", icon: "🌿" },
    { value: "mid", label: "MID", icon: "✨" },
    { value: "bot", label: "BOT", icon: "🏹" },
    { value: "support", label: "SUPPORT", icon: "🛡️" },
  ]

  const tiers = [
    { value: "", label: "ALL" },
    { value: "S+", label: "S+" },
    { value: "S", label: "S" },
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
  ]

  const difficulties = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
  ]

  const damageTypes = [
    { value: "AD", label: "Attack Damage" },
    { value: "AP", label: "Ability Power" },
    { value: "Hybrid", label: "Hybrid" },
  ]

  const ranges = [
    { value: "Melee", label: "Melee" },
    { value: "Ranged", label: "Ranged" },
  ]

  const sortOptions = [
    { value: "tier", label: "Tier" },
    { value: "winRate", label: "Win Rate" },
    { value: "pickRate", label: "Pick Rate" },
    { value: "banRate", label: "Ban Rate" },
    { value: "totalGames", label: "Total Games" },
    { value: "name", label: "Name" },
  ]

  // Use useCallback to memoize the fetchChampions function
  const fetchChampions = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/champion-stats?patch=${patchVersion}`)
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
  }, [patchVersion])

  useEffect(() => {
    fetchChampions()
  }, [fetchChampions])

  // Update active filters display
  useEffect(() => {
    const filters: string[] = []

    if (selectedRole) {
      filters.push(`Role: ${selectedRole.toUpperCase()}`)
    }

    if (selectedTier) {
      filters.push(`Tier: ${selectedTier}`)
    }

    if (selectedRank !== "ALL") {
      filters.push(`Rank: ${selectedRank}`)
    }

    if (selectedDifficulty.length > 0) {
      filters.push(`Difficulty: ${selectedDifficulty.join(", ")}`)
    }

    if (selectedDamageType.length > 0) {
      filters.push(`Damage: ${selectedDamageType.join(", ")}`)
    }

    if (selectedRange.length > 0) {
      filters.push(`Range: ${selectedRange.join(", ")}`)
    }

    if (searchQuery) {
      filters.push(`Search: ${searchQuery}`)
    }

    setActiveFilters(filters)
  }, [selectedRole, selectedTier, selectedRank, selectedDifficulty, selectedDamageType, selectedRange, searchQuery])

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
        (champ) => champ.roles[selectedRole] && champ.roles[selectedRole].pickRate >= 1, // Only show champions with at least 1% pick rate in role
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

  const handleHeaderClick = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const clearAllFilters = () => {
    setSelectedRole("")
    setSelectedTier("")
    setSelectedRank("ALL")
    setSelectedDifficulty([])
    setSelectedDamageType([])
    setSelectedRange([])
    setSearchQuery("")
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Role:")) {
      setSelectedRole("")
    } else if (filter.startsWith("Tier:")) {
      setSelectedTier("")
    } else if (filter.startsWith("Rank:")) {
      setSelectedRank("ALL")
    } else if (filter.startsWith("Difficulty:")) {
      setSelectedDifficulty([])
    } else if (filter.startsWith("Damage:")) {
      setSelectedDamageType([])
    } else if (filter.startsWith("Range:")) {
      setSelectedRange([])
    } else if (filter.startsWith("Search:")) {
      setSearchQuery("")
    }
  }

  const toggleDifficultyFilter = (value: string) => {
    setSelectedDifficulty((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const toggleDamageTypeFilter = (value: string) => {
    setSelectedDamageType((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const toggleRangeFilter = (value: string) => {
    setSelectedRange((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#FF9500] rounded-full animate-spin"></div>
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
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 text-red-400">{error}</div>
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
            <h1 className="text-3xl font-bold text-white">Champion Tier List</h1>
            <p className="text-zinc-400">
              Patch {patchVersion} • {filteredChampions.length} champions
            </p>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search champions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white w-full"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <Sliders className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:flex">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                  <TabsTrigger value="table" className="data-[state=active]:bg-zinc-800">
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="data-[state=active]:bg-zinc-800">
                    Grid
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"}
                    {sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="p-2 border-b border-zinc-800">
                    <p className="text-sm font-medium text-zinc-400">Sort by</p>
                  </div>
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-3 py-1.5 text-sm ${sortBy === option.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                        onClick={() => {
                          if (sortBy === option.value) {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setSortBy(option.value)
                            setSortOrder("desc")
                          }
                        }}
                      >
                        {option.label}
                        {sortBy === option.value &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4 ml-1 inline" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-1 inline" />
                          ))}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Mobile Filters (Collapsible) */}
          {mobileFiltersOpen && (
            <div className="md:hidden bg-zinc-900 rounded-lg border border-zinc-800 p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    {tiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Rank</label>
                  <select
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    {ranks.map((rank) => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Difficulty</label>
                  <div className="flex gap-2">
                    {difficulties.map((diff) => (
                      <Button
                        key={diff.value}
                        variant={selectedDifficulty.includes(diff.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDifficultyFilter(diff.value)}
                        className="flex-1"
                      >
                        {diff.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Damage Type</label>
                  <div className="flex gap-2">
                    {damageTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedDamageType.includes(type.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDamageTypeFilter(type.value)}
                        className="flex-1"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">Range</label>
                  <div className="flex gap-2">
                    {ranges.map((range) => (
                      <Button
                        key={range.value}
                        variant={selectedRange.includes(range.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRangeFilter(range.value)}
                        className="flex-1"
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap gap-2 mb-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Role
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by role</p>
                      </div>
                      <div className="py-1">
                        {roles.map((role) => (
                          <button
                            key={role.value}
                            className={`w-full text-left px-3 py-1.5 text-sm flex items-center ${selectedRole === role.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                            onClick={() => setSelectedRole(role.value)}
                          >
                            <span className="mr-2">{role.icon}</span>
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by champion role</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Tier
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by tier</p>
                      </div>
                      <div className="py-1">
                        {tiers.map((tier) => (
                          <button
                            key={tier.value}
                            className={`w-full text-left px-3 py-1.5 text-sm ${selectedTier === tier.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                            onClick={() => setSelectedTier(tier.value)}
                          >
                            {tier.value && (
                              <span
                                className="inline-block w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: tierColors[tier.value as keyof typeof tierColors] }}
                              ></span>
                            )}
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by champion tier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Rank
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by rank</p>
                      </div>
                      <div className="py-1">
                        {ranks.map((rank) => (
                          <button
                            key={rank.value}
                            className={`w-full text-left px-3 py-1.5 text-sm ${selectedRank === rank.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                            onClick={() => setSelectedRank(rank.value)}
                          >
                            {rank.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by player rank</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Difficulty
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by difficulty</p>
                      </div>
                      <div className="p-2">
                        {difficulties.map((diff) => (
                          <div key={diff.value} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`difficulty-${diff.value}`}
                              checked={selectedDifficulty.includes(diff.value)}
                              onCheckedChange={() => toggleDifficultyFilter(diff.value)}
                            />
                            <Label htmlFor={`difficulty-${diff.value}`} className="text-sm text-zinc-300">
                              {diff.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by champion difficulty</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Damage
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by damage type</p>
                      </div>
                      <div className="p-2">
                        {damageTypes.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`damage-${type.value}`}
                              checked={selectedDamageType.includes(type.value)}
                              onCheckedChange={() => toggleDamageTypeFilter(type.value)}
                            />
                            <Label htmlFor={`damage-${type.value}`} className="text-sm text-zinc-300">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by damage type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="p-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400">Filter by range</p>
                      </div>
                      <div className="p-2">
                        {ranges.map((range) => (
                          <div key={range.value} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`range-${range.value}`}
                              checked={selectedRange.includes(range.value)}
                              onCheckedChange={() => toggleRangeFilter(range.value)}
                            />
                            <Label htmlFor={`range-${range.value}`} className="text-sm text-zinc-300">
                              {range.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by attack range</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="bg-zinc-900 text-zinc-300 gap-1 px-3 py-1">
                  {filter}
                  <button className="ml-1 text-zinc-500 hover:text-zinc-300" onClick={() => removeFilter(filter)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
                Clear All
              </Button>
            </div>
          )}

          {/* Content Tabs */}
          <TabsContent value="table" className="mt-0">
            {/* Champion Table */}
            <div className="rounded-lg overflow-hidden border border-zinc-800">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-zinc-900">
                <div
                  className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium cursor-pointer hover:text-white flex items-center"
                  onClick={() => handleHeaderClick("ranking")}
                >
                  Rank
                  {sortBy === "ranking" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
                <div className="col-span-3 py-4 px-4 text-zinc-300 text-sm font-medium">Champion</div>
                <div
                  className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium cursor-pointer hover:text-white flex items-center"
                  onClick={() => handleHeaderClick("role")}
                >
                  Lane
                  {sortBy === "role" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
                <div
                  className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium cursor-pointer hover:text-white flex items-center"
                  onClick={() => handleHeaderClick("tier")}
                >
                  Tier
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 ml-1 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Champion performance tier based on win rate, pick rate, and ban rate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {sortBy === "tier" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
                <div
                  className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium text-right cursor-pointer hover:text-white"
                  onClick={() => handleHeaderClick("winRate")}
                >
                  Winrate
                  {sortBy === "winRate" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1 inline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1 inline" />
                    ))}
                </div>
                <div
                  className="col-span-1 py-4 px-4 text-zinc-300 text-sm font-medium text-right cursor-pointer hover:text-white"
                  onClick={() => handleHeaderClick("pickRate")}
                >
                  Pickrate
                  {sortBy === "pickRate" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1 inline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1 inline" />
                    ))}
                </div>
                <div
                  className="col-span-2 py-4 px-4 text-zinc-300 text-sm font-medium text-right cursor-pointer hover:text-white"
                  onClick={() => handleHeaderClick("totalGames")}
                >
                  Games
                  {sortBy === "totalGames" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4 ml-1 inline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1 inline" />
                    ))}
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-zinc-800">
                {filteredChampions.map((champion, index) => (
                  <div
                    key={champion.id}
                    className="grid grid-cols-12 items-center bg-zinc-950 hover:bg-zinc-900/50 transition-colors"
                  >
                    {/* Rank */}
                    <div className="col-span-1 py-3 px-4 text-center">
                      <span className="text-zinc-300 font-medium">{index + 1}</span>
                    </div>

                    {/* Champion */}
                    <div className="col-span-3 py-3 px-4 flex items-center">
                      <div
                        className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2"
                        style={{ borderColor: tierColors[champion.tier as keyof typeof tierColors] || "#FFFFFF" }}
                      >
                        <Image
                          src={champion.image || "/placeholder.svg"}
                          alt={champion.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="ml-3 font-medium text-white">{champion.name}</span>
                    </div>

                    {/* Lane */}
                    <div className="col-span-2 py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{roleIcons[champion.role] || "❓"}</span>
                        <div className="text-zinc-400 text-sm">{champion.role.toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div className="col-span-2 py-3 px-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-semibold text-sm"
                        style={{
                          backgroundColor: `${tierColors[champion.tier as keyof typeof tierColors]}20` || "#FFFFFF20",
                          color: tierColors[champion.tier as keyof typeof tierColors] || "#FFFFFF",
                        }}
                      >
                        {champion.tier}
                      </span>
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-1 py-3 px-4 text-right">
                      <div>
                        <div className="text-white font-medium">{champion.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-green-500">+0.2%</div>
                      </div>
                    </div>

                    {/* Pick Rate */}
                    <div className="col-span-1 py-3 px-4 text-right">
                      <div className="text-white">{champion.pickRate.toFixed(1)}%</div>
                    </div>

                    {/* Games */}
                    <div className="col-span-2 py-3 px-4 text-right">
                      <div className="text-white">{champion.totalGames.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredChampions.map((champion) => (
                <div
                  key={champion.id}
                  className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="relative">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={champion.image || "/placeholder.svg"}
                        alt={champion.name}
                        fill
                        className="object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${tierColors[champion.tier as keyof typeof tierColors]}CC` || "#FFFFFFCC",
                          color: "#000000",
                        }}
                      >
                        {champion.tier}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">{roleIcons[champion.role] || "❓"}</span>
                        <div className="text-white text-xs font-medium">{champion.winRate.toFixed(1)}% WR</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white truncate">{champion.name}</h3>
                    <div className="flex justify-between items-center mt-1 text-xs text-zinc-400">
                      <span>{champion.pickRate.toFixed(1)}% PR</span>
                      <span>{champion.totalGames.toLocaleString()} games</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {filteredChampions.length === 0 && (
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-center">
              <p className="text-zinc-400">No champions found matching your filters.</p>
              <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

