"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUp, ArrowDown, Trophy, Filter, Star, Sparkles, Shield, Swords } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/badge"
import { Card, CardContent } from "@/components/card"
import Image from "next/image"
import { createPortal } from "react-dom"
import { useRef } from "react"

// Role types
type Role = "top" | "jungle" | "mid" | "adc" | "support" | "all"

// Division types
type Division =
  | "iron+"
  | "bronze+"
  | "silver+"
  | "gold+"
  | "platinum+"
  | "emerald+"
  | "diamond+"
  | "master+"
  | "grandmaster+"
  | "challenger+"

// Tier types
type Tier = "S+" | "S" | "A" | "B" | "C" | "D"

// Sort types
type SortField = "tier" | "winrate" | "pickrate" | null
type SortDirection = "asc" | "desc"

// Champion data type
interface Champion {
  id: string
  name: string
  icon: string
  primaryRole: Role
  secondaryRole?: Role
  primaryRolePercentage: number
  tier: Tier
  winrate: number
  winrateDelta: number
  pickrate: number
  games: number
  banrate?: number
}

// Define rank map for use in multiple places
const rankMap: Record<Division, string> = {
  "iron+": "Iron",
  "bronze+": "Bronze",
  "silver+": "Silver",
  "gold+": "Gold",
  "platinum+": "Platinum",
  "emerald+": "Emerald",
  "diamond+": "Diamond",
  "master+": "Master",
  "grandmaster+": "Grandmaster",
  "challenger+": "Challenger",
}

// Add a mapping for role labels
const roleLabels: Record<Role, string> = {
  all: "All",
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  adc: "ADC",
  support: "Support",
};

// Define supported divisions for real data
const supportedDivisions: Division[] = ["challenger+", "grandmaster+", "master+"];

const regionMap: Record<string, string> = {
  na: "NA",
  euw: "EUW",
  eune: "EUNE",
  kr: "KR",
  br: "BR",
  jp: "JP",
  lan: "LAN",
  las: "LAS",
  oce: "OCE",
  tr: "TR",
  ru: "RU",
};

export default function TierList() {
  // State for filters
  const [selectedRole, setSelectedRole] = useState<Role>("all")
  const [selectedDivision, setSelectedDivision] = useState<Division>("grandmaster+")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof regionMap>("na")

  // State for sorting
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // State for data
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [animateRows, setAnimateRows] = useState(false)

  // Add state for patch version
  const [patchVersion, setPatchVersion] = useState<string>("")

  const router = useRouter()

  const dropdownRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 })

  // Fetch current patch version on mount
  useEffect(() => {
    const fetchPatch = async () => {
      try {
        const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
        const data = await response.json()
        setPatchVersion(data[0])
      } catch (err) {
        setPatchVersion("14.14.1") // fallback
      }
    }
    fetchPatch()
  }, [])

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
    setAnimateRows(true)
    setTimeout(() => setAnimateRows(false), 500)
  }

  // Fetch champions data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/champion-stats?rank=${selectedDivision}&region=${selectedRegion}`)
        const data = await res.json()
        setChampions(Object.values(data))
      } catch (err) {
        setChampions([])
      }
      setLoading(false)
    }
    fetchStats()
  }, [selectedRole, selectedDivision, selectedRegion, searchQuery])

  // Filter champions based on selected filters
  const filteredChampions = champions.filter((champion) => {
    if (selectedRole !== "all" && champion.primaryRole !== selectedRole) {
      return false
    }
    if (searchQuery && !champion.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Sort champions
  const sortedChampions = [...filteredChampions].sort((a, b) => {
    if (!sortField) {
      const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4, D: 5 }
      return tierOrder[a.tier] - tierOrder[b.tier]
    }
    if (sortField === "tier") {
      const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4, D: 5 }
      return sortDirection === "asc" ? tierOrder[a.tier] - tierOrder[b.tier] : tierOrder[b.tier] - tierOrder[a.tier]
    }
    if (sortField === "winrate") {
      return sortDirection === "asc" ? a.winrate - b.winrate : b.winrate - a.winrate
    }
    if (sortField === "pickrate") {
      return sortDirection === "asc" ? a.pickrate - b.pickrate : b.pickrate - a.pickrate
    }
    return 0
  })

  const navigateToChampion = (championId: string) => {
    router.push(`/champion/${championId}`)
  }

  const getTierColor = (tier: Tier) => {
    switch (tier) {
      case "S+":
        return "text-[#FF4E50] bg-gradient-to-r from-[#FF4E50]/20 to-[#FF4E50]/5"
      case "S":
        return "text-[#FF9800] bg-gradient-to-r from-[#FF9800]/20 to-[#FF9800]/5"
      case "A":
        return "text-[#4CAF50] bg-gradient-to-r from-[#4CAF50]/20 to-[#4CAF50]/5"
      case "B":
        return "text-[#2196F3] bg-gradient-to-r from-[#2196F3]/20 to-[#2196F3]/5"
      case "C":
        return "text-[#9C27B0] bg-gradient-to-r from-[#9C27B0]/20 to-[#9C27B0]/5"
      case "D":
        return "text-[#607D8B] bg-gradient-to-r from-[#607D8B]/20 to-[#607D8B]/5"
      default:
        return "text-white"
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "top":
        return "/images/roles/official/Top_icon.png"
      case "jungle":
        return "/images/roles/official/Jungle_icon.webp"
      case "mid":
        return "/images/roles/official/Middle_icon.webp"
      case "adc":
        return "/images/roles/official/Bottom_icon.webp"
      case "support":
        return "/images/roles/official/Support_icon.webp"
      default:
        return "/images/roles/official/All_roles_icon.png"
    }
  }

  const getRankIcon = (division: Division) => {
    const rankName = rankMap[division] || "Platinum"
    return `/images/ranks/Rank=${rankName}.png`
  }

  // When opening the dropdown, set its position
  const handleDropdownToggle = () => {
    setIsDropdownOpen((open) => {
      if (!open && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width })
      }
      return !open
    })
  }

  // Fix dropdown: close on outside click and add keyboard accessibility
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".rank-dropdown")) {
        setIsDropdownOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [isDropdownOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow"></div>
        {/* Particle Effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <Navigation />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 px-4 py-1 mb-4 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm">Patch {patchVersion || "..."} Analysis</span>
          </Badge>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 mb-3">
            Champion Tier List
          </h1>
          <p className="text-slate-400 text-center max-w-2xl mb-6">
            Track champion performance, analyze meta picks, and stay updated with the latest patch information.
          </p>

          {/* Filter Bar moved here */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8 overflow-hidden w-full max-w-3xl">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" />
                Filter Options
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-row gap-2 items-center w-full flex-wrap md:flex-nowrap mb-4">
                {/* Role Filter */}
                <div className="flex gap-2 md:gap-3 items-center">
                  {(["all", "top", "jungle", "mid", "adc", "support"] as Role[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl w-12 h-12 md:w-14 md:h-14 transition-all duration-200 border-2",
                        selectedRole === role
                          ? "bg-blue-500/20 border-blue-400 shadow-md"
                          : "bg-white/5 border-transparent hover:bg-blue-400/10"
                      )}
                      aria-label={`Filter by ${roleLabels[role]} role`}
                      tabIndex={0}
                    >
                      <Image
                        src={getRoleIcon(role) || "/placeholder.svg"}
                        alt={`${roleLabels[role]} role`}
                        width={28}
                        height={28}
                        className={cn(
                          "w-7 h-7 md:w-8 md:h-8",
                          selectedRole === role ? "brightness-125" : "opacity-80 hover:opacity-100"
                        )}
                      />
                      <span className={cn(
                        "text-xs mt-1 font-medium",
                        selectedRole === role ? "text-blue-400" : "text-slate-400"
                      )}>
                        {roleLabels[role]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Division Filter with Rank Icon */}
                <div className="relative flex-shrink-0">
                  <button
                    ref={dropdownRef}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 font-medium",
                      isDropdownOpen
                        ? "bg-blue-500/20 border-blue-400 shadow-md"
                        : "bg-white/5 border-transparent hover:bg-blue-400/10"
                    )}
                    onClick={handleDropdownToggle}
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                  >
                    <Image
                      src={getRankIcon(selectedDivision) || "/placeholder.svg"}
                      alt={selectedDivision}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-cover rounded-full"
                    />
                    <span>{rankMap[selectedDivision]}+</span>
                    <ArrowDown className={cn("h-4 w-4 ml-1 transition-transform", isDropdownOpen && "rotate-180")} />
                  </button>
                  {isDropdownOpen && typeof window !== "undefined" && createPortal(
                    <div
                      className="z-50 min-w-[180px] bg-slate-900 border border-white/10 rounded-xl shadow-xl py-1 backdrop-blur-sm"
                      style={{
                        position: "fixed",
                        left: dropdownPos.left,
                        top: dropdownPos.top,
                        width: dropdownPos.width,
                      }}
                      role="listbox"
                      tabIndex={-1}
                    >
                      {supportedDivisions.map((division) => (
                        <button
                          key={division}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            selectedDivision === division ? "bg-blue-500/10 text-blue-400" : "hover:bg-blue-400/10 text-white"
                          )}
                          onMouseDown={() => {
                            setSelectedDivision(division as Division)
                            setIsDropdownOpen(false)
                          }}
                        >
                          <Image
                            src={getRankIcon(division) || "/placeholder.svg"}
                            alt={rankMap[division]}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-cover rounded-full"
                          />
                          <span>{rankMap[division]}+</span>
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>

                {/* Region dropdown */}
                <select
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value as keyof typeof regionMap)}
                  className="rounded-xl border-2 px-3 py-1 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select region"
                >
                  {Object.entries(regionMap).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xs ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search champions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/30 transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Top Tier</h3>
                    <p className="text-lg font-bold text-white">
                      {champions.filter((c) => c.tier === "S+" || c.tier === "S").length} Champions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Swords className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Highest Winrate</h3>
                    <p className="text-lg font-bold text-white">
                      {champions.length > 0
                        ? `${Math.max(...champions.map((c) => c.winrate)).toFixed(1)}%`
                        : "Loading..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/10 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Most Banned</h3>
                    <p className="text-lg font-bold text-white">
                      {champions.length > 0 && champions.some((c) => c.banrate)
                        ? champions.reduce((prev, current) => {
                            return (prev.banrate || 0) > (current.banrate || 0) ? prev : current
                          }).name
                        : "Loading..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Champion Table */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-400" />
              Champion Rankings
            </h3>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                  <TableRow className="border-b border-white/10">
                    <TableHead className="w-16 text-center text-blue-400 font-medium">Rank</TableHead>
                    <TableHead className="w-64 text-blue-400 font-medium">Champion</TableHead>
                    <TableHead className="w-24 text-center text-blue-400 font-medium">Lane</TableHead>
                    <TableHead
                      className="w-24 text-center cursor-pointer hover:bg-white/5 transition-colors text-blue-400 font-medium"
                      onClick={() => handleSort("tier")}
                    >
                      <div className="flex items-center justify-center">
                        Tier
                        {sortField === "tier" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-28 text-center cursor-pointer hover:bg-white/5 transition-colors text-blue-400 font-medium"
                      onClick={() => handleSort("winrate")}
                    >
                      <div className="flex items-center justify-center">
                        Winrate
                        {sortField === "winrate" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-28 text-center cursor-pointer hover:bg-white/5 transition-colors text-blue-400 font-medium"
                      onClick={() => handleSort("pickrate")}
                    >
                      <div className="flex items-center justify-center">
                        Pickrate
                        {sortField === "pickrate" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="w-24 text-right text-blue-400 font-medium">Games</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mb-6"></div>
                          <p className="text-slate-400 text-lg">Loading champion data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sortedChampions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-slate-500" />
                          </div>
                          <p className="text-slate-400 mb-4 text-lg">No champions found</p>
                          <button
                            onClick={() => {
                              setSearchQuery("")
                              setSelectedRole("all")
                            }}
                            className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors"
                          >
                            Clear filters
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedChampions.map((champion, index) => (
                      <TableRow
                        key={champion.id}
                        className={`border-b border-white/5 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent cursor-pointer transition-all duration-300 ${
                          animateRows ? "animate-fadeIn" : ""
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => navigateToChampion(champion.id)}
                      >
                        <TableCell className="text-center font-medium">
                          {index < 3 ? (
                            <div className="relative mx-auto w-8 h-8 flex items-center justify-center">
                              {index === 0 && (
                                <div className="absolute -inset-1 bg-yellow-400/30 rounded-full blur-sm animate-pulse"></div>
                              )}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0
                                    ? "bg-gradient-to-br from-yellow-400/20 to-amber-600/20 text-yellow-400"
                                    : index === 1
                                      ? "bg-gradient-to-br from-slate-300/20 to-slate-500/20 text-slate-300"
                                      : "bg-gradient-to-br from-amber-700/20 to-amber-900/20 text-amber-700"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-0.5">
                              <div className="h-full w-full rounded-full overflow-hidden">
                                <Image
                                  src={champion.icon || "/placeholder.svg"}
                                  alt={champion.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                            <span className="font-bold text-white group-hover:text-blue-300 transition-colors">
                              {champion.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-0.5 flex items-center justify-center">
                              <Image
                                src={getRoleIcon(champion.primaryRole) || "/placeholder.svg"}
                                alt={champion.primaryRole}
                                width={32}
                                height={32}
                                className="h-8 w-8 opacity-90"
                              />
                            </div>
                            <span className="text-xs text-slate-400 mt-1">
                              {typeof champion.primaryRolePercentage === "number"
                                ? champion.primaryRolePercentage.toFixed(1) + "%"
                                : "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-block px-4 py-1.5 rounded-full font-bold shadow-sm",
                              getTierColor(champion.tier),
                            )}
                          >
                            {champion.tier}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-white">
                              {typeof champion.winrate === "number"
                                ? champion.winrate.toFixed(1) + "%"
                                : "—"}
                            </span>
                            <span
                              className={cn(
                                "text-xs flex items-center",
                                champion.winrateDelta > 0
                                  ? "text-emerald-400"
                                  : champion.winrateDelta < 0
                                    ? "text-red-400"
                                    : "text-slate-400",
                              )}
                            >
                              {champion.winrateDelta > 0 ? (
                                <ArrowUp className="h-3 w-3 mr-0.5" />
                              ) : champion.winrateDelta < 0 ? (
                                <ArrowDown className="h-3 w-3 mr-0.5" />
                              ) : null}
                              {champion.winrateDelta > 0 ? "+" : ""}
                              {typeof champion.winrateDelta === "number"
                                ? champion.winrateDelta.toFixed(1) + "%"
                                : "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center">
                            <div className="w-full max-w-[100px] h-1.5 bg-white/10 rounded-full mb-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${Math.min(champion.pickrate * 5, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between w-full max-w-[100px]">
                              <span className="font-bold text-white">
                                {typeof champion.pickrate === "number"
                                  ? champion.pickrate.toFixed(1) + "%"
                                  : "—"}
                              </span>
                              {champion.banrate && (
                                <span className="text-xs text-slate-400 flex items-center">
                                  <Shield className="h-3 w-3 mr-0.5 opacity-75" />
                                  {champion.banrate && (
                                    typeof champion.banrate === "number"
                                      ? champion.banrate.toFixed(1) + "%"
                                      : "—"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {typeof champion.games === "number"
                            ? champion.games.toLocaleString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tier Explanation */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              tier: "S+",
              description: "Extremely strong champions that dominate the meta",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#FF4E50]/20 to-[#FF4E50]/5",
              textColor: "text-[#FF4E50]",
            },
            {
              tier: "S",
              description: "Very strong champions that excel in the current meta",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#FF9800]/20 to-[#FF9800]/5",
              textColor: "text-[#FF9800]",
            },
            {
              tier: "A",
              description: "Strong champions that perform well consistently",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#4CAF50]/20 to-[#4CAF50]/5",
              textColor: "text-[#4CAF50]",
            },
            {
              tier: "B",
              description: "Balanced champions with good performance",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#2196F3]/20 to-[#2196F3]/5",
              textColor: "text-[#2196F3]",
            },
            {
              tier: "C",
              description: "Average champions that may need specific conditions",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#9C27B0]/20 to-[#9C27B0]/5",
              textColor: "text-[#9C27B0]",
            },
            {
              tier: "D",
              description: "Weaker champions that struggle in the current meta",
              icon: <Star className="h-5 w-5" />,
              color: "from-[#607D8B]/20 to-[#607D8B]/5",
              textColor: "text-[#607D8B]",
            },
          ].map((tierInfo) => (
            <Card
              key={tierInfo.tier}
              className={`bg-gradient-to-br ${tierInfo.color} border-white/10 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tierInfo.color} ${tierInfo.textColor}`}
                  >
                    {tierInfo.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${tierInfo.textColor}`}>Tier {tierInfo.tier}</h3>
                    <p className="text-sm text-slate-400">{tierInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-slate-400 text-sm">
              LoLytics isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
              anyone officially involved in producing or managing League of Legends.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}
