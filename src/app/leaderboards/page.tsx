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

const regions = [
  { code: "ALL", name: "All Regions", flag: "/placeholder-tepo6.png" },
  { code: "NA", name: "North America", flag: "/american-flag-waving.png" },
  { code: "EUW", name: "Europe West", flag: "/eu-flag.png" },
  { code: "EUNE", name: "Europe Nordic & East", flag: "/europe-flag.png" },
  { code: "KR", name: "Korea", flag: "/south-korea-flag.png" },
  { code: "CN", name: "China", flag: "/china-flag.png" },
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
  return <span className="text-slate-400 font-medium">{rank}</span>
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

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/leaderboard?region=${selectedRegion}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard")
        return res.json()
      })
      .then((data) => {
        setLeaderboard(data)
        setLoading(false)
      })
      .catch((e) => {
        setError("Could not load leaderboard. Try again later.")
        setLoading(false)
      })
  }, [selectedRegion])

  useEffect(() => {
    setAnimateRows(true)
    const timer = setTimeout(() => setAnimateRows(false), 500)
    return () => clearTimeout(timer)
  }, [sortField, sortDirection, selectedRegion, leaderboard])

  // Filter by search
  const filteredData = leaderboard.filter((player) =>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative w-full bg-gradient-to-b from-black/50 to-transparent border-b border-white/10 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-blue-500/30 rounded-full blur-sm"></div>
                <Trophy className="h-7 w-7 text-blue-400" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                LoL Leaderboards
              </span>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Search summoner..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-blue-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Live Rankings</span>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 mb-3">
            Challenger Leaderboard
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Track the top ranked summoners across all regions and see who dominates the Challenger tier
          </p>
        </header>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Filter Options
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white focus:ring-blue-400/20 focus:border-blue-400/50">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
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
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 text-white shadow-lg shadow-blue-500/20"
                onClick={() => setSelectedRegion(selectedRegion)}
                disabled={loading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Swords className="h-5 w-5 text-blue-400" />
              Top Challenger Players
            </h3>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-blue-400">Loading leaderboard...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5 border-b-white/10">
                      <TableHead className="text-slate-400 w-16">Rank</TableHead>
                      <TableHead className="text-slate-400">Summoner</TableHead>
                      <TableHead className="text-slate-400">Region</TableHead>
                      <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("lp")}> <div className="flex items-center gap-1">LP {renderSortIndicator("lp")}</div></TableHead>
                      <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("winrate")}> <div className="flex items-center gap-1">Winrate {renderSortIndicator("winrate")}</div></TableHead>
                      <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("gamesPlayed")}> <div className="flex items-center gap-1">Games {renderSortIndicator("gamesPlayed")}</div></TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((player, index) => (
                      <TableRow
                        key={player.id}
                        className={`
                          group hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent border-b-white/10 transition-all duration-300
                          ${animateRows ? "animate-fadeIn" : ""}
                          ${player.rank <= 3 ? "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent" : ""}
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex justify-center items-center">{getRankIcon(player.rank)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                              {player.summonerName.charAt(0)}
                            </div>
                            <div>
                              <div
                                className={`font-semibold ${
                                  player.rank <= 3
                                    ? "text-blue-400 group-hover:text-blue-300"
                                    : "text-white group-hover:text-blue-200"
                                } transition-colors duration-300`}
                              >
                                {player.summonerName}
                              </div>
                              <div className="text-xs text-slate-400">{player.mainChampion ? `${player.mainChampion} Main` : ""}</div>
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
                          <div className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                            {player.lp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-20 h-2 rounded-full bg-white/10 overflow-hidden`}>
                              <div
                                className={`h-full ${
                                  player.winrate > 60
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                    : player.winrate > 50
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
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
                            <Badge variant="outline" className="border-white/10 text-slate-400">
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
      <footer className="relative z-10 border-t border-white/10 bg-black/20 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} League Stats Tracker. Not affiliated with Riot Games.
            </p>
            <div className="flex items-center gap-6">
              {["Terms", "Privacy", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300"
                >
                  {link}
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