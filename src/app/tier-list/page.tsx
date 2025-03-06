"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Search, X, ChevronUp, Info } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

// Improved tier color mapping with dpm.lol style colors
const tierColors: Record<string, string> = {
  "S+": "#FF4E50", // Red
  "S": "#FF9500", // Orange 
  "A": "#FFCC00", // Yellow
  "B": "#00CC88", // Teal
  "C": "#4F8EFF", // Blue
  "D": "#A855F7", // Purple
}

// Define role icons for the UI - using text abbreviations like in-game
const roleIcons: Record<string, string> = {
  "top": "TOP",
  "jungle": "JNG",
  "mid": "MID",
  "bot": "BOT",
  "support": "SUP",
  "": "ALL", // All roles
}

export default function TierList() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [patchVersion, setPatchVersion] = useState("")
  const [sortBy, setSortBy] = useState("tier")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRank, setSelectedRank] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedDamageType, setSelectedDamageType] = useState<string[]>([])
  const [selectedRange, setSelectedRange] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Filter options
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
      
      // Use a fixed patch version if patchVersion is empty
      const currentPatch = patchVersion || "14.11.1";
      setPatchVersion(currentPatch);

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

  const handleHeaderClick = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const clearAllFilters = () => {
    setSelectedRole("");
    setSelectedTier("");
    setSelectedRank("");
    setSelectedDifficulty([]);
    setSelectedDamageType([]);
    setSelectedRange([]);
    setSearchQuery("");
    setActiveFilters([]); // Clear all active filters at once
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Role:")) {
      setSelectedRole("");
      updateActiveFilters({role: ""});
    } else if (filter.startsWith("Tier:")) {
      setSelectedTier("");
      updateActiveFilters({tier: ""});
    } else if (filter.startsWith("Difficulty:")) {
      const difficulty = filter.replace("Difficulty: ", "");
      setSelectedDifficulty(prev => {
        const updated = prev.filter(item => item !== difficulty);
        updateActiveFilters({difficulty: updated});
        return updated;
      });
    } else if (filter.startsWith("Damage:")) {
      const damageType = filter.replace("Damage: ", "");
      setSelectedDamageType(prev => {
        const updated = prev.filter(item => item !== damageType);
        updateActiveFilters({damageType: updated});
        return updated;
      });
    } else if (filter.startsWith("Range:")) {
      const range = filter.replace("Range: ", "");
      setSelectedRange(prev => {
        const updated = prev.filter(item => item !== range);
        updateActiveFilters({range: updated});
        return updated;
      });
    } else if (filter.startsWith("Search:")) {
      setSearchQuery("");
      updateActiveFilters({search: ""});
    }
  }

  const toggleDifficultyFilter = (value: string) => {
    setSelectedDifficulty((prev) => {
      const updated = prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value];
      
      // Update active filters
      updateActiveFilters({difficulty: updated});
      return updated;
    });
  }

  const toggleDamageTypeFilter = (value: string) => {
    setSelectedDamageType((prev) => {
      const updated = prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value];
      
      // Update active filters
      updateActiveFilters({damageType: updated});
      return updated;
    });
  }

  const toggleRangeFilter = (value: string) => {
    setSelectedRange((prev) => {
      const updated = prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value];
      
      // Update active filters
      updateActiveFilters({range: updated});
      return updated;
    });
  }

  // Add a helper function to update active filters
  const updateActiveFilters = (filters: {
    role?: string;
    tier?: string;
    difficulty?: string[];
    damageType?: string[];
    range?: string[];
    search?: string;
  }) => {
    setActiveFilters((prev) => {
      let updated = [...prev];
      
      // Remove related filter types first
      if (filters.role !== undefined) {
        updated = updated.filter(f => !f.startsWith('Role:'));
        if (filters.role) updated.push(`Role: ${filters.role}`);
      }
      
      if (filters.tier !== undefined) {
        updated = updated.filter(f => !f.startsWith('Tier:'));
        if (filters.tier) updated.push(`Tier: ${filters.tier}`);
      }
      
      if (filters.difficulty !== undefined) {
        updated = updated.filter(f => !f.startsWith('Difficulty:'));
        filters.difficulty.forEach(d => updated.push(`Difficulty: ${d}`));
      }
      
      if (filters.damageType !== undefined) {
        updated = updated.filter(f => !f.startsWith('Damage:'));
        filters.damageType.forEach(d => updated.push(`Damage: ${d}`));
      }
      
      if (filters.range !== undefined) {
        updated = updated.filter(f => !f.startsWith('Range:'));
        filters.range.forEach(r => updated.push(`Range: ${r}`));
      }
      
      if (filters.search !== undefined) {
        updated = updated.filter(f => !f.startsWith('Search:'));
        if (filters.search) updated.push(`Search: ${filters.search}`);
      }
      
      return updated;
    });
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

      <main className="container py-6 px-4 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight">League of Legends Champion Tier List</h1>
            <div className="flex items-center">
              <p className="text-lg text-zinc-400">
                Patch <span className="font-semibold text-white">{patchVersion}</span>
              </p>
              <div className="ml-2 bg-blue-900/30 text-blue-300 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs">
                Solo Queue
              </div>
            </div>
          </div>

          {/* dpm.lol style filter layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Filter column - 25% width on desktop */}
            <div className="md:col-span-1">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="font-medium text-lg text-white">Filters</h3>
                  {activeFilters.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs text-zinc-400 hover:text-white">
                      Reset
                    </Button>
                  )}
                </div>
                
                <div className="p-4 space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
                      <Input
                        placeholder="Search champions..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const query = e.target.value;
                          setSearchQuery(query);
                          updateActiveFilters({search: query});
                        }}
                        className="pl-10 bg-zinc-800/50 border-zinc-700 text-white w-full"
                      />
                      {searchQuery && (
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                          onClick={() => {
                            setSearchQuery("");
                            updateActiveFilters({search: ""});
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Roles */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Roles</label>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        {value: "", label: "ALL"},
                        {value: "top", label: "TOP"},
                        {value: "jungle", label: "JNG"},
                        {value: "mid", label: "MID"},
                        {value: "bot", label: "BOT"},
                        {value: "support", label: "SUP"}
                      ].map((role) => (
                        <Button
                          key={role.value}
                          variant={selectedRole === role.value ? "default" : "outline"}
                          className={`h-10 ${selectedRole === role.value ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          onClick={() => {
                            if (selectedRole === role.value) {
                              setSelectedRole("");
                              updateActiveFilters({role: ""});
                            } else {
                              setSelectedRole(role.value);
                              updateActiveFilters({role: role.value});
                            }
                          }}
                        >
                          <span className="text-sm font-semibold">{role.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tiers */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Tiers</label>
                    <div className="grid grid-cols-3 gap-1">
                      {["S+", "S", "A", "B", "C", "D"].map((tier) => (
                        <Button
                          key={tier}
                          variant={selectedTier === tier ? "default" : "outline"}
                          className={`h-10 ${selectedTier === tier ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          style={{ 
                            borderColor: selectedTier === tier ? 'transparent' : tierColors[tier],
                            color: selectedTier === tier ? 'white' : tierColors[tier]
                          }}
                          onClick={() => {
                            if (selectedTier === tier) {
                              setSelectedTier("");
                              updateActiveFilters({tier: ""});
                            } else {
                              setSelectedTier(tier);
                              updateActiveFilters({tier});
                            }
                          }}
                        >
                          {tier}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Difficulty */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Difficulty</label>
                    <div className="grid grid-cols-3 gap-1">
                      {["Easy", "Medium", "Hard"].map((diff) => (
                        <Button
                          key={diff}
                          variant={selectedDifficulty.includes(diff) ? "default" : "outline"}
                          className={`h-10 ${selectedDifficulty.includes(diff) ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          onClick={() => toggleDifficultyFilter(diff)}
                        >
                          {diff}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Damage Type */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Damage Type</label>
                    <div className="grid grid-cols-3 gap-1">
                      {["AP", "AD", "Hybrid"].map((type) => (
                        <Button
                          key={type}
                          variant={selectedDamageType.includes(type) ? "default" : "outline"}
                          className={`h-10 ${selectedDamageType.includes(type) ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          onClick={() => toggleDamageTypeFilter(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Range */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Range</label>
                    <div className="grid grid-cols-2 gap-1">
                      {["Melee", "Ranged"].map((range) => (
                        <Button
                          key={range}
                          variant={selectedRange.includes(range) ? "default" : "outline"}
                          className={`h-10 ${selectedRange.includes(range) ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          onClick={() => toggleRangeFilter(range)}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Champions list column - 75% width on desktop */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white">
                    Champions ({filteredChampions.length})
                  </h2>
                  
                  {/* Active filters display as tags */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 ml-4">
                      {activeFilters.map((filter) => (
                        <Badge key={filter} variant="outline" className="bg-blue-900/30 border-blue-800 text-blue-300 gap-1 px-2 py-0.5">
                          {filter}
                          <button onClick={() => removeFilter(filter)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* View mode and sort controls */}
                <div className="flex items-center space-x-2">
                  <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
                    <TabsList className="bg-zinc-800 border border-zinc-700">
                      <TabsTrigger value="table" className="data-[state=active]:bg-zinc-700">
                        Table
                      </TabsTrigger>
                      <TabsTrigger value="grid" className="data-[state=active]:bg-zinc-700">
                        Grid
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700">
                        Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label || "Tier"}
                        {sortOrder === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0 bg-zinc-800 border-zinc-700" align="end">
                      <div className="py-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`w-full text-left px-3 py-1.5 text-sm ${sortBy === option.value ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
                            onClick={() => {
                              if (sortBy === option.value) {
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                              } else {
                                setSortBy(option.value);
                                setSortOrder("desc");
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

              {/* Champion list content */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-lg">
                  {error}
                </div>
              ) : (
                <Tabs value={viewMode}>
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
                            <div className="col-span-3 py-3 px-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 relative overflow-hidden rounded-md">
                                  <Image
                                    src={champion.image || "/placeholder.svg"}
                                    alt={champion.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <span className="ml-3 font-medium text-white">{champion.name}</span>
                              </div>
                            </div>

                            {/* Lane */}
                            <div className="col-span-2 py-3 px-4">
                              <div className="flex items-center justify-center">
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-md">
                                  <span className="text-sm font-semibold">{roleIcons[champion.role] || "ALL"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Tier */}
                            <div className="col-span-2 py-3 px-4">
                              <div className="flex justify-center">
                                <span
                                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                                  style={{
                                    backgroundColor: tierColors[champion.tier as keyof typeof tierColors] || "#FFFFFF",
                                    color: "#000000",
                                  }}
                                >
                                  {champion.tier}
                                </span>
                              </div>
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
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

