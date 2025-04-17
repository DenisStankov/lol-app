"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2 } from 'lucide-react'
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
        
        // Sort by win rate and take top 6
        const topChampions = transformedChampions
          .sort((a: Champion, b: Champion) => b.winRate - a.winRate)
          .slice(0, 6)
        
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
      <Card className="relative overflow-hidden bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm h-full flex items-center justify-center">
        <div className="flex flex-col items-center p-12">
          <Loader2 className="w-10 h-10 text-[#C89B3C] animate-spin" />
          <p className="mt-6 text-zinc-400">Loading champion data...</p>
        </div>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="relative overflow-hidden bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm h-full flex items-center justify-center p-8">
        <div className="text-red-400 text-center">
          <div className="text-xl mb-2">😞</div>
          {error}
        </div>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm h-full">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1428]/50 to-transparent" />

      <div className="relative p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C89B3C]" />
              <h2 className="text-xl font-bold text-zinc-100">Top Champions</h2>
            </div>
            <p className="text-sm text-zinc-400 mt-1">Current meta powerhouses</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
            <span>Patch {patchVersion}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {champions.map((champion) => (
            <Card
              key={champion.id}
              className={`group relative overflow-hidden border-0 bg-zinc-900/50 hover:bg-zinc-900/80
                ${hoveredChamp === champion.id ? 'ring-1 ring-[#C89B3C]/50 scale-[1.02]' : 'scale-100'}
                transition-all duration-300 ease-out`}
              onMouseEnter={() => setHoveredChamp(champion.id)}
              onMouseLeave={() => setHoveredChamp(null)}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/10 to-[#C89B3C]/0 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative p-4">
                {/* Champion image and info */}
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={champion.image || "/placeholder.svg"}
                      alt={champion.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-[#C89B3C] transition-colors">
                      {champion.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-zinc-400 text-xs">{champion.role}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-zinc-400 text-xs">{champion.difficulty}</span>
                    </div>
                    {/* Win rate indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="h-1.5 bg-gradient-to-r from-[#C89B3C] to-[#C89B3C]/50 rounded-full transition-all duration-300"
                        style={{ width: `${champion.winRate}%` }}
                      />
                      <span className="text-[#C89B3C] text-xs font-medium">
                        {champion.winRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-lg bg-black/20">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`text-sm font-medium ${champion.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                      {champion.winRate}%
                    </div>
                    <div className="text-xs text-zinc-500">Win Rate</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-sm font-medium text-blue-400">{champion.pickRate}%</div>
                    <div className="text-xs text-zinc-500">Pick Rate</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-sm font-medium text-red-400">{champion.banRate}%</div>
                    <div className="text-xs text-zinc-500">Ban Rate</div>
                  </div>
                </div>
              </div>
              
              {/* Bottom gradient border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                from-transparent via-[#C89B3C]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>

        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
          from-transparent via-[#C89B3C]/30 to-transparent" />
      </div>
    </Card>
  )
}
