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

// Improved tier color mapping to match dpm.lol
const tierColors: Record<string, string> = {
  "S+": "#FF4E50", // Red
  "S": "#FF9500",  // Orange
  "A": "#FFCC00",  // Yellow
  "B": "#00CC88",  // Teal
  "C": "#4F8EFF",  // Blue
  "D": "#A855F7",  // Purple
}

// Define role icons using the exact SVGs provided
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
  "top": { 
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
  "jungle": { 
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
  "mid": { 
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
  "bot": { 
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
  "support": { 
    label: "SUP", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.4622 10.2574C12.7023 10.2574 12.9114 10.4209 12.9694 10.6538L14.5978 17.1957C14.6081 17.237 14.6133 17.2794 14.6133 17.322V17.8818C14.6133 18.0204 14.5582 18.1534 14.4601 18.2514L13.0238 19.6869C12.9258 19.7848 12.7929 19.8398 12.6543 19.8398H11.3457C11.2071 19.8398 11.0742 19.7848 10.9762 19.6868L9.53979 18.2504C9.44177 18.1524 9.38671 18.0194 9.38671 17.8808V17.3209C9.38671 17.2784 9.39191 17.236 9.40219 17.1947L11.0306 10.6538C11.0886 10.4209 11.2977 10.2574 11.5377 10.2574H12.4622ZM6.55692 6.77339C6.69554 6.77339 6.82848 6.82845 6.9265 6.92647L9.143 9.14297C9.29085 9.29082 9.33635 9.51255 9.25869 9.70668L7.93856 13.0066C7.79919 13.355 7.34903 13.4474 7.08372 13.1821L5.29732 11.3957C5.13821 11.2366 5.09879 10.9935 5.19947 10.7922L5.52419 10.1432C5.69805 9.79566 5.44535 9.38668 5.05676 9.38668H3.56906C3.39433 9.38668 3.23115 9.29936 3.13421 9.15398L2.08869 7.586C1.85709 7.23867 2.10607 6.77339 2.52354 6.77339H6.55692ZM21.4765 6.77339C21.8939 6.77339 22.1429 7.23867 21.9113 7.586L20.8658 9.15398C20.7688 9.29936 20.6057 9.38668 20.4309 9.38668H18.9432C18.5546 9.38668 18.3019 9.79567 18.4758 10.1432L18.8005 10.7922C18.9012 10.9935 18.8618 11.2366 18.7027 11.3957L16.9163 13.1821C16.651 13.4474 16.2008 13.355 16.0614 13.0066L14.7413 9.70668C14.6636 9.51255 14.7092 9.29082 14.857 9.14297L17.0735 6.92647C17.1715 6.82845 17.3045 6.77339 17.4431 6.77339H21.4765ZM13.5907 4.1601C13.738 4.1601 13.8785 4.22224 13.9775 4.33124L14.4774 4.88134C14.5649 4.97754 14.6133 5.10287 14.6133 5.23285V5.74436C14.6133 5.84757 14.5827 5.94846 14.5255 6.03432L13.0259 8.28323C12.929 8.42861 12.7658 8.51593 12.5911 8.51593H11.4089C11.2342 8.51593 11.071 8.42861 10.9741 8.28323L9.47452 6.03432C9.41726 5.94846 9.38671 5.84757 9.38671 5.74436V5.23285C9.38671 5.10287 9.43515 4.97754 9.52257 4.88134L10.0225 4.33124C10.1215 4.22224 10.262 4.1601 10.4093 4.1601H13.5907Z"></path>
      </svg>
    ), 
    color: "#CC66FF" 
  }
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
                    <div className="grid grid-cols-6 gap-1.5">
                      {Object.entries(roleData).map(([roleKey, roleInfo]) => (
                        <Button
                          key={roleKey}
                          variant="outline"
                          className={`h-11 rounded-md ${
                            selectedRole === roleKey 
                              ? "bg-zinc-800 border-0" 
                              : "bg-zinc-900 border-0 hover:bg-zinc-800"
                          }`}
                          style={{ 
                            color: selectedRole === roleKey ? roleInfo.color : 'rgba(255,255,255,0.65)',
                          }}
                          onClick={() => {
                            if (selectedRole === roleKey) {
                              setSelectedRole("");
                              updateActiveFilters({role: ""});
                            } else {
                              setSelectedRole(roleKey);
                              updateActiveFilters({role: roleKey});
                            }
                          }}
                        >
                          {roleInfo.icon}
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
                          className={`h-10 ${selectedTier === tier ? "bg-gradient-to-r from-zinc-800 to-zinc-900" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          style={{ 
                            borderColor: selectedTier === tier ? tierColors[tier] : 'transparent',
                            color: selectedTier === tier ? tierColors[tier] : 'white',
                            ...(selectedTier === tier ? { boxShadow: `0 0 8px ${tierColors[tier]}40` } : {})
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
                      {[
                        { value: "Easy", color: "#19B326" },
                        { value: "Medium", color: "#FF9500" },
                        { value: "Hard", color: "#FF4E50" }
                      ].map((diff) => (
                        <Button
                          key={diff.value}
                          variant={selectedDifficulty.includes(diff.value) ? "default" : "outline"}
                          className={`h-10 ${selectedDifficulty.includes(diff.value) ? "bg-gradient-to-r from-zinc-800 to-zinc-900" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          style={{ 
                            borderColor: selectedDifficulty.includes(diff.value) ? diff.color : 'transparent',
                            color: selectedDifficulty.includes(diff.value) ? diff.color : 'white',
                            ...(selectedDifficulty.includes(diff.value) ? { boxShadow: `0 0 8px ${diff.color}40` } : {})
                          }}
                          onClick={() => toggleDifficultyFilter(diff.value)}
                        >
                          {diff.value}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Damage Type */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Damage Type</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: "AP", color: "#4F8EFF" },
                        { value: "AD", color: "#FF4E50" },
                        { value: "Hybrid", color: "#CC66FF" }
                      ].map((type) => (
                        <Button
                          key={type.value}
                          variant={selectedDamageType.includes(type.value) ? "default" : "outline"}
                          className={`h-10 ${selectedDamageType.includes(type.value) ? "bg-gradient-to-r from-zinc-800 to-zinc-900" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          style={{ 
                            borderColor: selectedDamageType.includes(type.value) ? type.color : 'transparent',
                            color: selectedDamageType.includes(type.value) ? type.color : 'white',
                            ...(selectedDamageType.includes(type.value) ? { boxShadow: `0 0 8px ${type.color}40` } : {})
                          }}
                          onClick={() => toggleDamageTypeFilter(type.value)}
                        >
                          {type.value}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Range */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Range</label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { value: "Melee", color: "#FF9500" },
                        { value: "Ranged", color: "#00CC88" }
                      ].map((range) => (
                        <Button
                          key={range.value}
                          variant={selectedRange.includes(range.value) ? "default" : "outline"}
                          className={`h-10 ${selectedRange.includes(range.value) ? "bg-gradient-to-r from-zinc-800 to-zinc-900" : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"}`}
                          style={{ 
                            borderColor: selectedRange.includes(range.value) ? range.color : 'transparent',
                            color: selectedRange.includes(range.value) ? range.color : 'white',
                            ...(selectedRange.includes(range.value) ? { boxShadow: `0 0 8px ${range.color}40` } : {})
                          }}
                          onClick={() => toggleRangeFilter(range.value)}
                        >
                          {range.value}
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
                                <div 
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800"
                                  style={{ 
                                    color: roleData[champion.role]?.color || '#FFFFFF'
                                  }}
                                >
                                  {roleData[champion.role]?.icon || roleData[""].icon}
                                </div>
                              </div>
                            </div>

                            {/* Tier */}
                            <div className="col-span-2 py-3 px-4">
                              <div className="flex justify-center">
                                <span
                                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                                  style={{
                                    backgroundColor: `${tierColors[champion.tier as keyof typeof tierColors]}20`,
                                    color: tierColors[champion.tier as keyof typeof tierColors],
                                    boxShadow: `0 0 10px ${tierColors[champion.tier as keyof typeof tierColors]}30`
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

