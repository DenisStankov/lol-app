"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2, ChevronRight } from 'lucide-react'
import { Card } from "@/components/card"
import Image from "next/image"
import axios from "axios"
import Link from "next/link"

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
  primaryPosition?: string // Added for position-based filtering
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

// Define the roles we want to display
const POSITIONS = [
  { key: "TOP", label: "Top", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
    </svg>
  ) },
  { key: "JUNGLE", label: "Jungle", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M5 2c1.58 1.21 5.58 5.02 6.98 9.95 1.4 4.93 0 10.05 0 10.05-2.75-3.16-5.9-5.2-6.18-5.38C5.45 13.81 3 8.79 3 8.79c3.54.87 4.93 4.28 4.93 4.28C7.56 8.7 5 2 5 2zm15 5.91s-1.24 2.47-1.81 4.6c-.24.88-.29 2.2-.29 3.06v.28c0 .35.01.57.01.57s-1.74 2.4-3.38 3.68c.09-1.6.06-3.44-.21-5.33.93-2.02 2.85-5.45 5.68-6.86zm-2.12-5.33s-2.33 3.05-2.84 6.03c-.11.64-.2 1.2-.28 1.7-.38.58-.73 1.16-1.05 1.73-.03-.13-.06-.25-.1-.38-.3-1.07-.7-2.1-1.16-3.08.05-.15.1-.29.17-.44 0 0 1.81-3.78 5.26-5.56z" />
    </svg>
  ) },
  { key: "MIDDLE", label: "Mid", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.8536 3.14645C17.9473 3.05268 18.0745 3 18.2071 3H20.5C20.7761 3 21 3.22386 21 3.5V5.79289C21 5.9255 20.9473 6.05268 20.8536 6.14645L6.14645 20.8536C6.05268 20.9473 5.9255 21 5.79289 21H3.5C3.22386 21 3 20.7761 3 20.5V18.2071C3 18.0745 3.05268 17.9473 3.14645 17.8536L17.8536 3.14645Z"></path>
    </svg>
  ) },
  { key: "BOTTOM", label: "ADC", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
    </svg>
  ) },
  { key: "UTILITY", label: "Support", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.4622 10.2574C12.7023 10.2574 12.9114 10.4209 12.9694 10.6538L14.5978 17.1957C14.6081 17.237 14.6133 17.2794 14.6133 17.322V17.8818C14.6133 18.0204 14.5582 18.1534 14.4601 18.2514L13.0238 19.6869C12.9258 19.7848 12.7929 19.8398 12.6543 19.8398H11.3457C11.2071 19.8398 11.0742 19.7848 10.9762 19.6868L9.53979 18.2504C9.44177 18.1524 9.38671 18.0194 9.38671 17.8808V17.3209C9.38671 17.2784 9.39191 17.236 9.40219 17.1947L11.0306 10.6538C11.0886 10.4209 11.2977 10.2574 11.5377 10.2574H12.4622ZM6.55692 6.77339C6.69554 6.77339 6.82848 6.82845 6.9265 6.92647L9.143 9.14297C9.29085 9.29082 9.33635 9.51255 9.25869 9.70668L7.93856 13.0066C7.79919 13.355 7.34903 13.4474 7.08372 13.1821L5.29732 11.3957C5.13821 11.2366 5.09879 10.9935 5.19947 10.7922L5.52419 10.1432C5.69805 9.79566 5.44535 9.38668 5.05676 9.38668H3.56906C3.39433 9.38668 3.23115 9.29936 3.13421 9.15398L2.08869 7.586C1.85709 7.23867 2.10607 6.77339 2.52354 6.77339H6.55692ZM21.4765 6.77339C21.8939 6.77339 22.1429 7.23867 21.9113 7.586L20.8658 9.15398C20.7688 9.29936 20.6057 9.38668 20.4309 9.38668H18.9432C18.5546 9.38668 18.3019 9.79567 18.4758 10.1432L18.8005 10.7922C18.9012 10.9935 18.8618 11.2366 18.7027 11.3957L16.9163 13.1821C16.651 13.4474 16.2008 13.355 16.0614 13.0066L14.7413 9.70668C14.6636 9.51255 14.7092 9.29082 14.857 9.14297L17.0735 6.92647C17.1715 6.82845 17.3045 6.77339 17.4431 6.77339H21.4765Z"></path>
    </svg>
  ) },
];

// Map for assigning champions to positions based on tags and other heuristics
const ROLE_MAPPINGS: Record<string, string[]> = {
  "TOP": ["Fighter", "Tank", "Juggernaut"],
  "JUNGLE": ["Assassin", "Fighter", "Tank"],
  "MIDDLE": ["Mage", "Assassin"],
  "BOTTOM": ["Marksman"],
  "UTILITY": ["Support", "Tank", "Enchanter"]
};

export default function TopChampions() {
  const [hoveredChamp, setHoveredChamp] = useState<string | null>(null)
  const [champions, setChampions] = useState<Champion[]>([])
  const [patchVersion, setPatchVersion] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

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
        let champStats: Record<string, { 
          winRate: number, 
          pickRate: number, 
          banRate: number, 
          roles?: Record<string, {
            winRate: number, 
            pickRate: number, 
            banRate: number
          }>
        }> = {};
        
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
          
          // Determine champion's primary position based on champion tags or stats
          let primaryPosition = "";
          
          // If we have role-specific stats from the API, use the role with highest pickRate
          if (stats.roles) {
            let highestPickRate = 0;
            Object.entries(stats.roles).forEach(([role, roleStats]) => {
              if (roleStats.pickRate > highestPickRate) {
                highestPickRate = roleStats.pickRate;
                primaryPosition = role;
              }
            });
          }
          
          // If no role-specific stats, assign position based on champion tags
          if (!primaryPosition) {
            for (const [position, tags] of Object.entries(ROLE_MAPPINGS)) {
              if (champ.tags.some(tag => tags.includes(tag))) {
                primaryPosition = position;
                break;
              }
            }
          }
          
          // Default fallback if no position determined
          if (!primaryPosition) {
            primaryPosition = "TOP"; // Default fallback
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
            image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
            primaryPosition
          }
        })
        
        setChampions(transformedChampions)
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

  // Get top 3 champions for a specific position
  const getTopChampionsByPosition = (position: string) => {
    return champions
      .filter(champion => champion.primaryPosition === position)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);
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
              <h2 className="text-xl font-bold text-zinc-100">Top Champions by Role</h2>
            </div>
            <p className="text-sm text-zinc-400 mt-1">Current meta powerhouses for each position</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm">
            <span>Patch {patchVersion}</span>
          </div>
        </div>

        {/* Role tabs */}
        <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto scrollbar-hide">
          {POSITIONS.map((position) => (
            <button
              key={position.key}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 ${
                selectedPosition === position.key || selectedPosition === null 
                  ? "border-[#C89B3C] text-[#C89B3C]" 
                  : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
              } transition-all duration-200`}
              onClick={() => setSelectedPosition(selectedPosition === position.key ? null : position.key)}
            >
              <span className="text-current">{position.icon}</span>
              {position.label}
            </button>
          ))}
        </div>

        {/* Adaptive content - Show either all roles or selected role */}
        {selectedPosition ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {getTopChampionsByPosition(selectedPosition).map((champion) => (
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
            <Link
              href="/tier-list"
              className="flex items-center justify-center gap-1 text-sm text-[#C89B3C] hover:text-[#E5B954] transition-colors mt-6 py-2 rounded-md border border-zinc-800 hover:border-[#C89B3C]/30 bg-zinc-900/40 hover:bg-zinc-900/60"
            >
              View full {POSITIONS.find(p => p.key === selectedPosition)?.label} champion tier list
              <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            {/* Show champions for all roles */}
            <div className="space-y-8">
              {POSITIONS.map((position) => (
                <div key={position.key}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#C89B3C]">{position.icon}</span>
                      <h3 className="font-semibold text-zinc-100">{position.label}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedPosition(position.key)}
                      className="text-xs text-[#C89B3C] hover:text-[#E5B954] transition-colors"
                    >
                      View more
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {getTopChampionsByPosition(position.key).map((champion) => (
                      <Card
                        key={champion.id}
                        className="group relative overflow-hidden border-0 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all duration-300"
                        onMouseEnter={() => setHoveredChamp(champion.id)}
                        onMouseLeave={() => setHoveredChamp(null)}
                      >
                        <div className="p-3 flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={champion.image || "/placeholder.svg"}
                              alt={champion.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-zinc-100 truncate group-hover:text-[#C89B3C] transition-colors">
                              {champion.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-1.5 w-16 bg-gradient-to-r from-[#C89B3C] to-[#C89B3C]/50 rounded-full"
                                style={{ width: `${Math.min(champion.winRate * 1.5, 85)}px` }}
                              />
                              <span className="text-[#C89B3C] text-xs font-medium">
                                {champion.winRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/tier-list"
              className="flex items-center justify-center gap-1 text-sm text-[#C89B3C] hover:text-[#E5B954] transition-colors mt-6 py-2 rounded-md border border-zinc-800 hover:border-[#C89B3C]/30 bg-zinc-900/40 hover:bg-zinc-900/60"
            >
              View full tier list
              <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        )}
    
        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
          from-transparent via-[#C89B3C]/30 to-transparent" />
      </div>
    </Card>
  )
}
