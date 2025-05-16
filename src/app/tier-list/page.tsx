"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUp, ArrowDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Navigation from "@/components/navigation"
import { useRouter } from "next/navigation"

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
}

export default function TierList() {
  // State for filters
  const [selectedRole, setSelectedRole] = useState<Role>("all")
  const [selectedDivision, setSelectedDivision] = useState<Division>("platinum+")
  const [searchQuery, setSearchQuery] = useState("")

  // State for sorting
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // State for data
  const [champions, setChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Fetch champions data (real API)
  useEffect(() => {
    const fetchChampions = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/champion-stats?rank=${encodeURIComponent(selectedDivision)}`)
        if (!response.ok) throw new Error("Failed to fetch champion data")
        const data = await response.json()
        // Transform API data to Champion[]
        const championsArray: Champion[] = Object.entries(data).map(([id, champ]: [string, any]) => {
          // Find the main role (highest games or winrate, or use champ.role)
          const mainRole = champ.role || Object.keys(champ.roles)[0]
          const roleStats = champ.roles[mainRole]
          // Map API role to v0 role
          const roleMap: Record<string, Role> = {
            TOP: "top",
            JUNGLE: "jungle",
            MIDDLE: "mid",
            BOTTOM: "adc",
            UTILITY: "support"
          }
          return {
            id: String(id),
            name: String(champ.name),
            icon: String(champ.image.icon),
            primaryRole: roleMap[mainRole] || "all",
            primaryRolePercentage: Number(roleStats?.rolePercentage || 100),
            tier: String(roleStats?.tier || "C") as Tier,
            winrate: Number(roleStats?.winRate || 0),
            winrateDelta: Number(roleStats?.winRateDelta || 0),
            pickrate: Number(roleStats?.pickRate || 0),
            games: Number(roleStats?.totalGames || 0),
          }
        })
        setChampions(championsArray)
      } catch (err) {
        setChampions([])
      } finally {
        setLoading(false)
      }
    }
    fetchChampions()
  }, [selectedDivision])

  // Filter champions based on selected filters
  const filteredChampions = champions.filter((champion) => {
    // Filter by role
    if (selectedRole !== "all" && champion.primaryRole !== selectedRole) {
      return false
    }
    // Filter by search query
    if (searchQuery && !champion.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Sort champions
  const sortedChampions = [...filteredChampions].sort((a, b) => {
    if (!sortField) {
      // Default sort by tier
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

  // Function to navigate to champion details
  const navigateToChampion = (championId: string) => {
    router.push(`/champion/${championId}`)
  }

  // Get tier color
  const getTierColor = (tier: Tier) => {
    switch (tier) {
      case "S+":
        return "text-[#FF4E50] bg-[#FF4E50]/10"
      case "S":
        return "text-[#FF9800] bg-[#FF9800]/10"
      case "A":
        return "text-[#4CAF50] bg-[#4CAF50]/10"
      case "B":
        return "text-[#2196F3] bg-[#2196F3]/10"
      case "C":
        return "text-[#9C27B0] bg-[#9C27B0]/10"
      case "D":
        return "text-[#607D8B] bg-[#607D8B]/10"
      default:
        return "text-white"
    }
  }

  // Get role icon - update paths to match your project structure
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "top":
        return "/images/roles/TOP.png"
      case "jungle":
        return "/images/roles/JUNGLE.png"
      case "mid":
        return "/images/roles/MIDDLE.png"
      case "adc":
        return "/images/roles/BOTTOM.png"
      case "support":
        return "/images/roles/UTILITY.png"
      default:
        return "/placeholder.svg"
    }
  }

  return (
    <div className="min-h-screen bg-[#0E1015] text-white">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center px-4 py-1.5 bg-[#1A1A1A] rounded-full mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M8 0L10.2 4.8L15.2 5.6L11.6 9.2L12.4 14.4L8 12L3.6 14.4L4.4 9.2L0.8 5.6L5.8 4.8L8 0Z"
                fill="#C89B3C"
              />
            </svg>
            <span className="text-sm text-[#C89B3C]">Live Stats & Analytics</span>
          </div>
          <h1 className="text-4xl font-bold text-[#C89B3C] mb-4">Champion Tier List</h1>
          <p className="text-gray-400 text-center max-w-2xl">
            Track champion performance, analyze meta picks, and stay updated with the latest patch information.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 mb-6 sticky top-0 z-10 shadow-md">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Role Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {(["all", "top", "jungle", "mid", "adc", "support"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-full w-12 h-12 transition-all",
                    selectedRole === role
                      ? "border-2 border-[#C89B3C]"
                      : "border border-[#333333] hover:border-[#555555]",
                    "bg-[#0F0F0F]",
                  )}
                  aria-label={`Filter by ${role} role`}
                >
                  <img src={getRoleIcon(role) || "/placeholder.svg"} alt={`${role} role`} className="w-6 h-6" />
                </button>
              ))}
            </div>

            {/* Division Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedDivision} onValueChange={(value) => setSelectedDivision(value as Division)}>
                <SelectTrigger className="bg-[#0F0F0F] border-[#333333] focus:ring-[#C89B3C] focus:ring-opacity-50">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-[#333333]">
                  <SelectItem value="iron+">Iron+</SelectItem>
                  <SelectItem value="bronze+">Bronze+</SelectItem>
                  <SelectItem value="silver+">Silver+</SelectItem>
                  <SelectItem value="gold+">Gold+</SelectItem>
                  <SelectItem value="platinum+">Platinum+</SelectItem>
                  <SelectItem value="emerald+">Emerald+</SelectItem>
                  <SelectItem value="diamond+">Diamond+</SelectItem>
                  <SelectItem value="master+">Master+</SelectItem>
                  <SelectItem value="grandmaster+">Grandmaster+</SelectItem>
                  <SelectItem value="challenger+">Challenger+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64 ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search champions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0F0F0F] border-[#333333] focus:ring-[#C89B3C] focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Champion Table */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0A0A0A] sticky top-0 z-10">
                <TableRow className="border-b border-[#222222]">
                  <TableHead className="w-16 text-center text-[#C89B3C]">Rank</TableHead>
                  <TableHead className="w-64 text-[#C89B3C]">Champion</TableHead>
                  <TableHead className="w-24 text-center text-[#C89B3C]">Lane</TableHead>
                  <TableHead
                    className="w-24 text-center cursor-pointer hover:bg-[#151515] transition-colors text-[#C89B3C]"
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
                    className="w-28 text-center cursor-pointer hover:bg-[#151515] transition-colors text-[#C89B3C]"
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
                    className="w-28 text-center cursor-pointer hover:bg-[#151515] transition-colors text-[#C89B3C]"
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
                  <TableHead className="w-24 text-right text-[#C89B3C]">Games</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 rounded-full border-2 border-[#C89B3C] border-t-transparent animate-spin mb-4"></div>
                        <p className="text-gray-400">Loading champion data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedChampions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-400 mb-2">No champions found</p>
                        <button
                          onClick={() => {
                            setSearchQuery("")
                            setSelectedRole("all")
                          }}
                          className="text-[#C89B3C] hover:underline"
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
                      className="border-b border-[#222222] hover:bg-[#151515] cursor-pointer transition-colors"
                      onClick={() => navigateToChampion(champion.id)}
                    >
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-[#0A0A0A] border border-[#333333]">
                            <img
                              src={champion.icon || "/placeholder.svg"}
                              alt={champion.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-bold">{champion.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#0A0A0A] border border-[#333333] flex items-center justify-center">
                            <img
                              src={getRoleIcon(champion.primaryRole) || "/placeholder.svg"}
                              alt={champion.primaryRole}
                              className="h-5 w-5"
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">{champion.primaryRolePercentage.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("inline-block px-3 py-1 rounded font-bold", getTierColor(champion.tier))}>
                          {champion.tier}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">{champion.winrate.toFixed(1)}%</span>
                          <span
                            className={cn(
                              "text-xs",
                              champion.winrateDelta > 0
                                ? "text-green-500"
                                : champion.winrateDelta < 0
                                  ? "text-red-500"
                                  : "text-gray-400",
                            )}
                          >
                            {champion.winrateDelta > 0 ? "+" : ""}
                            {champion.winrateDelta.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">{champion.pickrate.toFixed(1)}%</TableCell>
                      <TableCell className="text-right text-gray-400">{champion.games.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

