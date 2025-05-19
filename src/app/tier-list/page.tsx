"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUp, ArrowDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Input } from "@/components/input"
import { cn } from "@/lib/utils"
import Navigation from "@/components/navigation"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
  "challenger+": "Challenger"
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
        
        // Log the data structure for debugging
        console.log("API Response:", {
          dataType: typeof data,
          champions: Object.keys(data).length,
          sampleChampion: Object.keys(data).length > 0 ? {
            champion: data[Object.keys(data)[0]],
            imageStructure: data[Object.keys(data)[0]].image
          } : 'No champions found'
        });
        
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
          
          // Make sure we have a valid icon URL
          let iconUrl = "";
          if (champ.image && typeof champ.image === 'object') {
            // Use the icon property if it exists, otherwise construct from full
            iconUrl = champ.image.icon || 
              `https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${champ.image.full}`;
          }
          
          return {
            id: String(id),
            name: String(champ.name),
            icon: iconUrl,
            primaryRole: roleMap[mainRole] || "all",
            primaryRolePercentage: Number(roleStats?.rolePercentage || 100),
            tier: String(roleStats?.tier || "C") as Tier,
            winrate: Number(roleStats?.winRate || 0),
            winrateDelta: Number(roleStats?.winRateDelta || 0),
            pickrate: Number(roleStats?.pickRate || 0),
            games: Number(roleStats?.totalGames || 0),
            banrate: Number(roleStats?.banRate || 0),
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

  // Get role icon - update paths to match official League icons
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

  // Function to get rank icon path based on selected division
  const getRankIcon = (division: Division) => {
    const rankName = rankMap[division] || "Platinum"
    return `/images/ranks/Rank=${rankName}.png`
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
          <p className="text-gray-400 text-center max-w-2xl mb-4">
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
                      ? "bg-[#0F0F0F] border-2 border-[#C89B3C]"
                      : "bg-[#0A0A0A] border border-[#333333] hover:border-[#555555]",
                  )}
                  aria-label={`Filter by ${role} role`}
                >
                  <img 
                    src={getRoleIcon(role)} 
                    alt={`${role} role`} 
                    className={cn(
                      "w-7 h-7", 
                      selectedRole === role ? "brightness-125" : "opacity-75 hover:opacity-100"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Division Filter with Rank Icon */}
            <div className="w-full md:w-48">
              <Select value={selectedDivision} onValueChange={(value) => setSelectedDivision(value as Division)}>
                <SelectTrigger className="bg-[#0F0F0F] border-[#333333] focus:ring-[#C89B3C] focus:ring-opacity-50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getRankIcon(selectedDivision)}
                        alt={selectedDivision}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <span>{selectedDivision}</span>
          </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-[#333333]">
                  {Object.entries(rankMap).map(([division, rankName]) => (
                    <SelectItem key={division} value={division}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={`/images/ranks/Rank=${rankName}.png`}
                            alt={rankName}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
              </div>
                        <span>{division}</span>
            </div>
                    </SelectItem>
                  ))}
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
                              src={getRoleIcon(champion.primaryRole)}
                              alt={champion.primaryRole}
                              className="h-6 w-6 opacity-90"
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
                              "text-xs flex items-center",
                              champion.winrateDelta > 0
                                ? "text-green-500"
                                : champion.winrateDelta < 0
                                  ? "text-red-500"
                                  : "text-gray-400",
                            )}
                          >
                            {champion.winrateDelta > 0 ? (
                              <ArrowUp className="h-3 w-3 mr-0.5" />
                            ) : champion.winrateDelta < 0 ? (
                              <ArrowDown className="h-3 w-3 mr-0.5" />
                            ) : null}
                            {champion.winrateDelta > 0 ? "+" : ""}
                            {champion.winrateDelta.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">{champion.pickrate.toFixed(1)}%</span>
                          {champion.banrate && (
                            <span className="text-xs text-gray-400 flex items-center">
                              <svg 
                                width="10" 
                                height="10" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-0.5 opacity-75"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0 1 12 20zm6.31-3.1L7.1 5.69A7.902 7.902 0 0 1 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" 
                                  fill="currentColor"
                                />
                              </svg>
                              {champion.banrate.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
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

