"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Trophy, Clock, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { cn } from "../../lib/utils"
import Image from "next/image";

// Sample data - in production, fetch from API
const recentSummoners = [
  {
    id: "1",
    name: "Faker",
    profileIcon: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/5710.png",
    rank: "Challenger",
    lp: 1247,
    winRate: 67.2,
    lastPlayed: "2h ago",
    region: "KR",
    trend: "up"
  },
  {
    id: "2",
    name: "Caps",
    profileIcon: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/5393.png",
    rank: "Grandmaster",
    lp: 856,
    winRate: 58.9,
    lastPlayed: "4h ago",
    region: "EUW",
    trend: "up"
  },
  {
    id: "3",
    name: "Chovy",
    profileIcon: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/6069.png",
    rank: "Challenger",
    lp: 1089,
    winRate: 62.4,
    lastPlayed: "5h ago",
    region: "KR",
    trend: "up"
  },
  {
    id: "4",
    name: "Rekkles",
    profileIcon: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/5205.png",
    rank: "Master",
    lp: 432,
    winRate: 48.6,
    lastPlayed: "8h ago",
    region: "EUW",
    trend: "down"
  },
  {
    id: "5",
    name: "ShowMaker",
    profileIcon: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/5877.png",
    rank: "Challenger",
    lp: 987,
    winRate: 59.8,
    lastPlayed: "12h ago",
    region: "KR",
    trend: "up"
  }
]

export default function RecentMatches() {
  const [hoveredSummoner, setHoveredSummoner] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Your data fetching logic here
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Challenger":
        return "#C89B3C"
      case "Grandmaster":
        return "#E84057"
      case "Master":
        return "#9D4DB3"
      default:
        return "#64748b"
    }
  }

  return (
    <div className="p-6 bg-zinc-950 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Recent Searches</h2>
          <p className="text-zinc-400 text-sm mt-1">Last 5 summoners looked up</p>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />}
      </div>

      <div className="space-y-4">
        {recentSummoners.map((summoner) => (
          <Card
            key={summoner.id}
            className={cn(
              "group relative overflow-hidden border-0 bg-zinc-900/50 backdrop-blur-sm",
              "transition-all duration-300 ease-out hover:bg-zinc-900/80",
              hoveredSummoner === summoner.id ? "scale-[1.02] ring-1 ring-[#C89B3C]/50" : "scale-100"
            )}
            onMouseEnter={() => setHoveredSummoner(summoner.id)}
            onMouseLeave={() => setHoveredSummoner(null)}
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/10 to-[#C89B3C]/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-4">
              <div className="flex items-center gap-4">
                {/* Profile Icon */}
                <div className="relative">
                  <div
                    style={{ borderColor: getRankColor(summoner.rank) }}
                    className="border-2 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={summoner.profileIcon || "/placeholder.svg"}
                      alt={`${summoner.name}'s profile icon`}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                    {summoner.region}
                  </div>
                </div>

                {/* Summoner Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-[#C89B3C] transition-colors">
                      {summoner.name}
                    </h3>
                    <div 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getRankColor(summoner.rank)}20`,
                        color: getRankColor(summoner.rank)
                      }}
                    >
                      {summoner.rank}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#C89B3C]" />
                      <span className="text-sm text-zinc-300">{summoner.lp} LP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {summoner.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={cn(
                        "text-sm",
                        summoner.winRate >= 50 ? "text-green-400" : "text-red-400"
                      )}>
                        {summoner.winRate}% WR
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm text-zinc-500">{summoner.lastPlayed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
