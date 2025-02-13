"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Trophy, Swords, Users } from "lucide-react"
import { Card } from "@/components/card"
import Image from 'next/image'

// Sample data - in production, fetch from API
const tiers = {
  S: {
    color: "#C89B3C",
    description: "Overpowered - First pick or ban material",
    champions: [
      {
        id: "kaisa",
        name: "Kai'Sa",
        winRate: 53.2,
        pickRate: 15.3,
        banRate: 8.7,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg",
      },
      {
        id: "ahri",
        name: "Ahri",
        winRate: 52.8,
        pickRate: 12.5,
        banRate: 7.2,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      },
    ],
  },
  A: {
    color: "#45D1B0",
    description: "Strong - Consistently powerful picks",
    champions: [
      {
        id: "lux",
        name: "Lux",
        winRate: 51.5,
        pickRate: 11.2,
        banRate: 4.8,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
      },
      {
        id: "yasuo",
        name: "Yasuo",
        winRate: 50.8,
        pickRate: 18.7,
        banRate: 14.3,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
      },
    ],
  },
  B: {
    color: "#3B82F6",
    description: "Balanced - Solid picks in most situations",
    champions: [
      {
        id: "leona",
        name: "Leona",
        winRate: 50.2,
        pickRate: 9.8,
        banRate: 4.1,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Leona_0.jpg",
      },
    ],
  },
  C: {
    color: "#A855F7",
    description: "Situational - Requires specific team comps",
    champions: [
      {
        id: "aatrox",
        name: "Aatrox",
        winRate: 48.5,
        pickRate: 7.2,
        banRate: 3.2,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg",
      },
    ],
  },
  D: {
    color: "#EF4444",
    description: "Weak - Currently underperforming",
    champions: [
      {
        id: "ryze",
        name: "Ryze",
        winRate: 46.8,
        pickRate: 4.5,
        banRate: 1.8,
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg",
      },
    ],
  },
}

export default function TierList() {
  const [expandedTier, setExpandedTier] = useState<string>("S")
  const [hoveredChamp, setHoveredChamp] = useState<string | null>(null)

  return (
    <div className="p-6 bg-zinc-950 rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Champion Tier List</h2>
          <p className="text-zinc-400 text-sm mt-1">Current meta rankings by tier</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
          <Trophy className="w-4 h-4" />
          <span>Patch 14.3</span>
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

