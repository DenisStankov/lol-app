"use client"

import { useState, useEffect } from "react"
import { ArrowUp, Swords, Users, Trophy, Loader2 } from 'lucide-react'
import { Card } from "@/components/card"
import Image from "next/image"
import axios from "axios"

interface Champion {
  id: string
  name: string
  role: string
  winRate: number
  pickRate: number
  banRate: number
  trend: string
  difficulty: string
  image: string
}

// Define interface for champion data from Riot's API
interface RiotChampionData {
  id: string;
  name: string;
  key: string;
  tags: string[];
  info: {
    difficulty: number;
    [key: string]: number;
  };
  [key: string]: unknown;
}

export default function TopChampions() {
  const [hoveredChamp, setHoveredChamp] = useState<string | null>(null)
  const [champions, setChampions] = useState<Champion[]>([])
  const [patchVersion, setPatchVersion] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current patch version
        const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = patchResponse.data[0]
        setPatchVersion(currentPatch)
        
        // Fetch champion data
        const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
        const champData = response.data.data
        
        // Get champion stats from your backend API
        let champStats: Record<string, { winRate: number, pickRate: number, banRate: number }> = {};
        try {
          const statsResponse = await axios.get('/api/champion-stats')
          champStats = statsResponse.data || {}
        } catch (statsError) {
          console.warn('Could not fetch champion stats, using fallback data', statsError)
          // Continue with empty stats - the component will use fallback values
        }
        
        // Transform the data into the format we need
        const transformedChampions = (Object.values(champData) as RiotChampionData[]).map((champ: RiotChampionData) => {
          const stats = champStats[champ.key] || {
            winRate: 49 + Math.random() * 6, // Fallback random win rate between 49-55%
            pickRate: 5 + Math.random() * 15, // Fallback random pick rate between 5-20%
            banRate: 2 + Math.random() * 12, // Fallback random ban rate between 2-14%
          }
          
          return {
            id: champ.id,
            name: champ.name,
            role: champ.tags[0] || "Unknown",
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            trend: stats.winRate > 50 ? "up" : "down",
            difficulty: getDifficulty(champ.info?.difficulty || 0),
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`
          }
        })
        
        // Sort by win rate and take top 5
        const topChampions = transformedChampions
          .sort((a: Champion, b: Champion) => b.winRate - a.winRate)
          .slice(0, 5)
        
        setChampions(topChampions)
      } catch (err) {
        console.error("Error fetching champion data:", err)
        setError("Failed to load champion data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Helper function to determine difficulty
  const getDifficulty = (difficultyValue: number): string => {
    if (difficultyValue <= 3) return "Easy"
    if (difficultyValue <= 7) return "Moderate"
    return "High"
  }

  if (loading) {
    return (
      <div className="p-6 bg-zinc-950 rounded-xl min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#C89B3C] animate-spin" />
          <p className="mt-4 text-zinc-400">Loading champion data...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6 bg-zinc-950 rounded-xl">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-zinc-950 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Top Champions</h2>
          <p className="text-zinc-400 text-sm mt-1">Current meta powerhouses</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
          <Trophy className="w-4 h-4" />
          <span>Patch {patchVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {champions.map((champion) => (
          <Card
            key={champion.id}
            className={`group relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm
              ${hoveredChamp === champion.id ? 'scale-[1.02]' : 'scale-100'}
              transition-all duration-300 ease-out`}
            onMouseEnter={() => setHoveredChamp(champion.id)}
            onMouseLeave={() => setHoveredChamp(null)}
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/20 to-[#C89B3C]/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-4">
              {/* Champion image and info */}
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <Image
                    src={champion.image || "/placeholder.svg"}
                    alt={champion.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-[#C89B3C] transition-colors">
                    {champion.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-400 text-sm">{champion.role}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-zinc-400 text-sm">{champion.difficulty}</span>
                  </div>
                  {/* Win rate indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div 
                      className="h-1.5 bg-gradient-to-r from-[#C89B3C] to-[#C89B3C]/50 rounded-full transition-all duration-300"
                      style={{ width: `${champion.winRate}%` }}
                    />
                    <span className="text-[#C89B3C] text-sm font-medium">
                      {champion.winRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 p-3 rounded-lg bg-black/20">
                <div className="flex items-center gap-2">
                  <ArrowUp className={`w-4 h-4 ${champion.trend === "up" ? "text-green-400" : "text-red-400"}`} />
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{champion.winRate}%</div>
                    <div className="text-xs text-zinc-500">Win Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{champion.pickRate}%</div>
                    <div className="text-xs text-zinc-500">Pick Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{champion.banRate}%</div>
                    <div className="text-xs text-zinc-500">Ban Rate</div>
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
