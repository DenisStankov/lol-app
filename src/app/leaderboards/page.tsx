"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, Crown, Medal, Search, Shield, Sparkles, Swords, Trophy } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/badge"
import Navigation from "@/components/navigation"

const regions = [
  { code: "ALL", name: "All Regions", flag: "/placeholder-tepo6.png" },
  { code: "NA", name: "North America", flag: "/american-flag-waving.png" },
  { code: "EUW", name: "Europe West", flag: "/eu-flag.png" },
  { code: "EUNE", name: "Europe Nordic & East", flag: "/europe-flag.png" },
  { code: "KR", name: "Korea", flag: "/south-korea-flag.png" },
  { code: "BR", name: "Brazil", flag: "/brazil-flag.png" },
  { code: "JP", name: "Japan", flag: "/japan-flag.png" },
  { code: "OCE", name: "Oceania", flag: "/australia-flag.png" },
]

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return (
      <div className="relative">
        <div className="absolute -inset-2 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>
        <Crown className="h-7 w-7 text-yellow-400" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-slate-400/20 rounded-full blur-sm"></div>
        <Medal className="h-6 w-6 text-slate-300" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-amber-700/20 rounded-full blur-sm"></div>
        <Medal className="h-6 w-6 text-amber-700" />
      </div>
    )
  }
  return <span className="text-zinc-400 font-medium">{rank}</span>
}

export default function GlassyLeaderboard() {
  const [selectedRegion, setSelectedRegion] = useState("KR")
  const [sortField, setSortField] = useState("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [animateRows, setAnimateRows] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/leaderboard?region=${selectedRegion}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard")
        return res.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(data?.error || "Could not load leaderboard. Try again later.")
          setLeaderboard([])
          setLoading(false)
          return
        }
        setLeaderboard(data)
        setLoading(false)
      })
      .catch((e) => {
        setError("Could not load leaderboard. Try again later.")
        setLoading(false)
      })
  }, [selectedRegion, refreshKey])

  useEffect(() => {
    setAnimateRows(true)
    const timer = setTimeout(() => setAnimateRows(false), 500)
    return () => clearTimeout(timer)
  }, [sortField, sortDirection, selectedRegion, leaderboard])

  // Filter by search, but only for valid player objects
  const filteredData = leaderboard
    .filter((player) => player && typeof player.summonerName === "string")
    .filter((player) =>
      player.summonerName.toLowerCase().includes(search.toLowerCase())
    )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const fieldA = a[sortField as keyof typeof a]
    const fieldB = b[sortField as keyof typeof b]
    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA
    }
    return sortDirection === "asc"
      ? String(fieldA).localeCompare(String(fieldB))
      : String(fieldB).localeCompare(String(fieldA))
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navigation searchValue={search} onSearchChange={setSearch} />
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative w-full bg-black/50 border-b border-purple-500/10 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-purple-500/30 rounded-full blur-sm"></div>
                <Trophy className="h-7 w-7 text-purple-400" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-300">
                LoL Leaderboards
              </span>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search summoner..."
                className="pl-9 bg-purple-500/5 border-purple-500/10 text-white placeholder:text-zinc-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-purple-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Live Rankings</span>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 mb-3">
            Challenger Leaderboard
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Track the top ranked summoners across all regions and see who dominates the Challenger tier
          </p>
        </header>

        {/* Filters */}
        <Card className="bg-purple-500/5 border-purple-500/10 backdrop-blur-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b border-purple-500/10 px-6 py-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Filter Options
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px] bg-purple-500/5 border-purple-500/10 text-white focus:ring-blue-400/20 focus:border-blue-400/50">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-purple-500/20">
                    {regions.map((region) => (
                      <SelectItem key={region.code} value={region.code} className="text-white">
                        <div className="flex items-center gap-2">
                          <Image
                            src={region.flag || "/placeholder.svg"}
                            alt={region.name}
                            width={20}
                            height={15}
                            className="rounded-sm"
                          />
                          <span>{region.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-500 border-0 text-white shadow-lg shadow-purple-500/20"
                onClick={() => setRefreshKey(prev => prev + 1)}
                disabled={loading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-purple-500/5 border-purple-500/10 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b border-purple-500/10 px-6 py-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Swords className="h-5 w-5 text-purple-400" />
              Top Challenger Players
            </h3>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-purple-400">Loading leaderboard...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5 border-b-purple-500/10">
                      <TableHead className="text-zinc-400 w-16">Rank</TableHead>
                      <TableHead className="text-zinc-400">Summoner</TableHead>
                      <TableHead className="text-zinc-400">Region</TableHead>
                      <TableHead className="text-zinc-400 cursor-pointer" onClick={() => handleSort("lp")}> <div className="flex items-center gap-1">LP {renderSortIndicator("lp")}</div></TableHead>
                      <TableHead className="text-zinc-400 cursor-pointer" onClick={() => handleSort("winrate")}> <div className="flex items-center gap-1">Winrate {renderSortIndicator("winrate")}</div></TableHead>
                      <TableHead className="text-zinc-400 cursor-pointer" onClick={() => handleSort("gamesPlayed")}> <div className="flex items-center gap-1">Games {renderSortIndicator("gamesPlayed")}</div></TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((player, index) => (
                      <TableRow
                        key={player.id}
                        className={`
                          group hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-transparent border-b-purple-500/10 transition-all duration-300
                          ${animateRows ? "animate-fadeIn" : ""}
                          ${player.rank <= 3 ? "bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-transparent" : ""}
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex justify-center items-center">{getRankIcon(player.rank)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center text-sm font-bold group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                              {player.summonerName.charAt(0)}
                            </div>
                            <div>
                              <div
                                className={`font-semibold ${
                                  player.rank <= 3
                                    ? "text-purple-400 group-hover:text-purple-300"
                                    : "text-white group-hover:text-purple-200"
                                } transition-colors duration-300`}
                              >
                                {player.summonerName}
                              </div>
                              <div className="text-xs text-zinc-400">{player.mainChampion ? `${player.mainChampion} Main` : ""}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={regions.find((r) => r.code === player.region)?.flag || "/placeholder.svg"}
                              alt={player.region}
                              width={20}
                              height={15}
                              className="rounded-sm"
                            />
                            <span>{player.region}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                            {player.lp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-20 h-2 rounded-full bg-white/10 overflow-hidden`}>
                              <div
                                className={`h-full ${
                                  player.winrate > 60
                                    ? "bg-gradient-to-r from-purple-500 to-violet-400"
                                    : player.winrate > 50
                                      ? "bg-purple-500"
                                      : "bg-violet-700"
                                }`}
                                style={{ width: `${player.winrate}%` }}
                              ></div>
                            </div>
                            <span>{player.winrate}%</span>
                            {player.trend === "up" ? (
                              <ArrowUp className="h-4 w-4 text-emerald-400" />
                            ) : player.trend === "down" ? (
                              <ArrowDown className="h-4 w-4 text-red-400" />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{player.gamesPlayed}</TableCell>
                        <TableCell>
                          {player.winStreak > 0 ? (
                            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 border-0">
                              {player.winStreak} Win Streak
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-purple-500/15 text-zinc-400">
                              No Streak
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/10 bg-black/20 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} LoLytics. Not affiliated with Riot Games.
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: "Terms", href: "/terms-of-service" },
                { label: "Privacy", href: "/privacy-policy" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-500 hover:text-purple-400 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
} 