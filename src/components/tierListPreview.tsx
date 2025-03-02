"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Trophy, Swords, Users, Loader2 } from "lucide-react"
import { Card } from "@/components/card"
import Image from 'next/image'
import axios from "axios"

interface ChampionTier {
  id: string
  name: string
  winRate: number
  pickRate: number
  banRate: number
  image: string
}

interface TierData {
  [key: string]: {
    color: string
    description: string
    champions: ChampionTier[]
  }
}

// Tier colors and descriptions
const tierDefinitions = {
  S: {
    color: "#C89B3C",
    description: "Overpowered - First pick or ban material"
  },
  A: {
    color: "#45D1B0",
    description: "Strong - Consistently powerful picks"
  },
  B: {
    color: "#3B82F6",
    description: "Balanced - Solid picks in most situations"
  },
  C: {
    color: "#A855F7",
    description: "Situational - Requires specific team comps"
  },
  D: {
    color: "#EF4444",
    description: "Weak - Currently underperforming"
  }
}

export default function TierList() {
  const [expandedTier, setExpandedTier] = useState<string>("S")
  const [hoveredChamp, setHoveredChamp] = useState<string | null>(null)
  const [tiers, setTiers] = useState<TierData>({})
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
        
        // Get champion win rates from your backend API (or mock it for now)
        // This is a placeholder - you'll need to implement this API
        const statsResponse = await axios.get('/api/champion-stats')
        const champStats = statsResponse.data || {}
        
        // Transform the data into the format we need
        const allChampions = Object.values(champData).map((champ: Record<string, any>) => {
          const stats = champStats[champ.key] || {
            winRate: 42 + Math.random() * 12, // Random win rate between 42-54%
            pickRate: 4 + Math.random() * 16, // Random pick rate between 4-20%
            banRate: 1 + Math.random() * 15  // Random ban rate between 1-16%
          }
          
          return {
            id: champ.id,
            name: champ.name,
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`
          }
        })

        // Create tiers based on win rates
        const tierData: TierData = {
          S: {
            ...tierDefinitions.S,
            champions: []
          },
          A: {
            ...tierDefinitions.A,
            champions: []
          },
          B: {
            ...tierDefinitions.B,
            champions: []
          },
          C: {
            ...tierDefinitions.C,
            champions: []
          },
          D: {
            ...tierDefinitions.D,
            champions: []
          }
        }
        
        // Assign champions to tiers based on win rate
        allChampions.forEach((champion: ChampionTier) => {
          if (champion.winRate >= 53) {
            tierData.S.champions.push(champion)
          } else if (champion.winRate >= 51) {
            tierData.A.champions.push(champion)
          } else if (champion.winRate >= 49) {
            tierData.B.champions.push(champion)
          } else if (champion.winRate >= 47) {
            tierData.C.champions.push(champion)
          } else {
            tierData.D.champions.push(champion)
          }
        })
        
        // Sort champions within each tier by win rate
        Object.keys(tierData).forEach(tier => {
          tierData[tier].champions.sort((a, b) => b.winRate - a.winRate)
          
          // Limit to 3 champions per tier for display purposes
          tierData[tier].champions = tierData[tier].champions.slice(0, 3)
        })
        
        setTiers(tierData)
      } catch (err) {
        console.error("Error fetching tier list data:", err)
        setError("Failed to load tier list")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 bg-zinc-950 rounded-xl min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#C89B3C] animate-spin" />
          <p className="mt-4 text-zinc-400">Loading tier list...</p>
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
    <div className="p-6 bg-zinc-950 rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Champion Tier List</h2>
          <p className="text-zinc-400 text-sm mt-1">Current meta rankings by tier</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
          <Trophy className="w-4 h-4" />
          <span>Patch {patchVersion}</span>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(tiers).map(([tier, { color, description, champions }]) => (
          <div
            key={tier}
            className={`rounded-lg bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 overflow-hidden
              transition-all duration-300 ease-out
              ${expandedTier === tier ? "ring-1" : "hover:ring-1"}`}
            style={
              {
                ringColor: color,
                "--tier-color": color,
              } as React.CSSProperties
            }
          >
            {/* Tier Header */}
            <button
              onClick={() => setExpandedTier(expandedTier === tier ? "" : tier)}
              className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-zinc-800/50"
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg text-2xl font-bold"
                style={{
                  backgroundColor: `${color}15`,
                  color: color,
                }}
              >
                {tier}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">Tier {tier}</h3>
                  <span className="text-sm text-zinc-400">({champions.length} champions)</span>
                </div>
                <p className="text-sm text-zinc-400">{description}</p>
              </div>
              {expandedTier === tier ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {/* Champions Grid */}
            {expandedTier === tier && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-t border-zinc-800/50">
                {champions.map((champion) => (
                  <Card
                    key={champion.id}
                    className={`group relative overflow-hidden bg-zinc-800/50 border-0
                      ${hoveredChamp === champion.id ? "scale-[1.02]" : "scale-100"}
                      transition-all duration-300 ease-out`}
                    onMouseEnter={() => setHoveredChamp(champion.id)}
                    onMouseLeave={() => setHoveredChamp(null)}
                  >
                    {/* Glowing border effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(45deg, ${color}00, ${color}40, ${color}00)`,
                      }}
                    />

                    <div className="relative p-4">
                      <div className="flex gap-4">
                        {/* Champion Image */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={champion.image || "/placeholder.svg"}
                            alt={champion.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Champion Info */}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-zinc-100 group-hover:text-[var(--tier-color)] transition-colors">
                            {champion.name}
                          </h4>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-[var(--tier-color)]" />
                              <span className="text-xs text-zinc-400">{champion.winRate}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-[var(--tier-color)]" />
                              <span className="text-xs text-zinc-400">{champion.pickRate}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Swords className="w-3 h-3 text-[var(--tier-color)]" />
                              <span className="text-xs text-zinc-400">{champion.banRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

