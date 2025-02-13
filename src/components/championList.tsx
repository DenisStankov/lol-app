"use client"

import { useState } from "react"
import { ArrowUp, Swords, Users, Trophy } from 'lucide-react'
import { Card } from "@/components/card"
import Image from "next/image";

// Sample data - in production, fetch from API
const champions = [
  {
    id: "ahri",
    name: "Ahri",
    role: "Mid",
    winRate: 53.2,
    pickRate: 12.5,
    banRate: 8.7,
    trend: "up",
    difficulty: "Moderate",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg"
  },
  {
    id: "kaisa",
    name: "Kai'Sa",
    role: "ADC",
    winRate: 51.8,
    pickRate: 15.3,
    banRate: 5.2,
    trend: "up",
    difficulty: "Moderate",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg"
  },
  {
    id: "yasuo",
    name: "Yasuo",
    role: "Mid",
    winRate: 49.5,
    pickRate: 18.7,
    banRate: 14.3,
    trend: "up",
    difficulty: "High",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg"
  },
  {
    id: "lux",
    name: "Lux",
    role: "Support",
    winRate: 52.4,
    pickRate: 11.2,
    banRate: 3.8,
    trend: "up",
    difficulty: "Easy",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg"
  },
  {
    id: "leona",
    name: "Leona",
    role: "Support",
    winRate: 51.9,
    pickRate: 9.8,
    banRate: 4.1,
    trend: "up",
    difficulty: "Moderate",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Leona_0.jpg"
  }
]

export default function TopChampions() {
  const [hoveredChamp, setHoveredChamp] = useState<string | null>(null)

  return (
    <div className="p-6 bg-zinc-950 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Top Champions</h2>
          <p className="text-zinc-400 text-sm mt-1">Current meta powerhouses</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
          <Trophy className="w-4 h-4" />
          <span>Patch 14.3</span>
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
                  <ArrowUp className="w-4 h-4 text-green-400" />
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
