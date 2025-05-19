"use client"

import { useState, useEffect } from "react"
import { Loader2, ChevronRight, Star } from 'lucide-react'
import { Card } from "@/components/card"
import Image from "next/image"
import axios from "axios"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Champion {
  id: string
  name: string
  role: string
  winRate: number
  pickRate: number
  banRate: number
  trend: string
  winRateChange: string
  difficulty: string
  image: string
  primaryPosition?: string // Added for position-based filtering
  tier?: string // For tier classification like S, A, B tier
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

// Define the roles we want to display with more accurate icons
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

// More accurate position-to-champion mappings based on common meta
const ROLE_MAPPINGS = {
  // Primary roles for specific champions from the dpm.lol meta
  SPECIFIC_CHAMPIONS: {
    "Aatrox": "TOP",
    "Ahri": "MIDDLE",
    "Akali": "MIDDLE",
    "Akshan": "MIDDLE",
    "Alistar": "UTILITY",
    "Amumu": "JUNGLE",
    "Anivia": "MIDDLE",
    "Annie": "MIDDLE",
    "Aphelios": "BOTTOM",
    "Ashe": "BOTTOM",
    "AurelionSol": "MIDDLE",
    "Azir": "MIDDLE",
    "Bard": "UTILITY",
    "Belveth": "JUNGLE",
    "Blitzcrank": "UTILITY",
    "Brand": "UTILITY",
    "Braum": "UTILITY",
    "Briar": "JUNGLE",
    "Caitlyn": "BOTTOM",
    "Camille": "TOP",
    "Cassiopeia": "MIDDLE",
    "Chogath": "TOP",
    "Corki": "MIDDLE",
    "Darius": "TOP",
    "Diana": "JUNGLE",
    "DrMundo": "TOP",
    "Draven": "BOTTOM",
    "Ekko": "JUNGLE",
    "Elise": "JUNGLE",
    "Evelynn": "JUNGLE",
    "Ezreal": "BOTTOM",
    "Fiddlesticks": "JUNGLE",
    "Fiora": "TOP",
    "Fizz": "MIDDLE",
    "Galio": "MIDDLE",
    "Gangplank": "TOP",
    "Garen": "TOP",
    "Gnar": "TOP",
    "Gragas": "JUNGLE",
    "Graves": "JUNGLE",
    "Gwen": "TOP",
    "Hecarim": "JUNGLE",
    "Heimerdinger": "MIDDLE",
    "Illaoi": "TOP",
    "Irelia": "TOP",
    "Ivern": "JUNGLE",
    "Janna": "UTILITY",
    "JarvanIV": "JUNGLE",
    "Jax": "TOP",
    "Jayce": "TOP",
    "Jhin": "BOTTOM",
    "Jinx": "BOTTOM",
    "Kaisa": "BOTTOM",
    "Kalista": "BOTTOM",
    "Karma": "UTILITY",
    "Karthus": "JUNGLE",
    "Kassadin": "MIDDLE",
    "Katarina": "MIDDLE",
    "Kayle": "TOP",
    "Kayn": "JUNGLE",
    "Kennen": "TOP",
    "Khazix": "JUNGLE",
    "Kindred": "JUNGLE",
    "Kled": "TOP",
    "KogMaw": "BOTTOM",
    "KSante": "TOP",
    "Leblanc": "MIDDLE",
    "LeeSin": "JUNGLE",
    "Leona": "UTILITY",
    "Lillia": "JUNGLE",
    "Lissandra": "MIDDLE",
    "Lucian": "BOTTOM",
    "Lulu": "UTILITY",
    "Lux": "UTILITY",
    "Malphite": "TOP",
    "Malzahar": "MIDDLE",
    "Maokai": "UTILITY",
    "MasterYi": "JUNGLE",
    "Milio": "UTILITY",
    "MissFortune": "BOTTOM",
    "MonkeyKing": "JUNGLE",
    "Mordekaiser": "TOP",
    "Morgana": "UTILITY",
    "Nami": "UTILITY",
    "Nasus": "TOP",
    "Nautilus": "UTILITY",
    "Neeko": "MIDDLE",
    "Nidalee": "JUNGLE",
    "Nilah": "BOTTOM",
    "Nocturne": "JUNGLE",
    "Nunu": "JUNGLE",
    "Olaf": "JUNGLE",
    "Orianna": "MIDDLE",
    "Ornn": "TOP",
    "Pantheon": "UTILITY",
    "Poppy": "JUNGLE",
    "Pyke": "UTILITY",
    "Qiyana": "MIDDLE",
    "Quinn": "TOP",
    "Rakan": "UTILITY",
    "Rammus": "JUNGLE",
    "RekSai": "JUNGLE",
    "Rell": "UTILITY",
    "Renata": "UTILITY",
    "Renekton": "TOP",
    "Rengar": "JUNGLE",
    "Riven": "TOP",
    "Rumble": "TOP",
    "Ryze": "MIDDLE",
    "Samira": "BOTTOM",
    "Sejuani": "JUNGLE",
    "Senna": "UTILITY",
    "Seraphine": "UTILITY",
    "Sett": "TOP",
    "Shaco": "JUNGLE",
    "Shen": "TOP",
    "Shyvana": "JUNGLE",
    "Singed": "TOP",
    "Sion": "TOP",
    "Sivir": "BOTTOM",
    "Skarner": "JUNGLE",
    "Smolder": "BOTTOM",
    "Sona": "UTILITY",
    "Soraka": "UTILITY",
    "Swain": "MIDDLE",
    "Sylas": "MIDDLE",
    "Syndra": "MIDDLE",
    "TahmKench": "TOP",
    "Taliyah": "JUNGLE",
    "Talon": "MIDDLE",
    "Taric": "UTILITY",
    "Teemo": "TOP",
    "Thresh": "UTILITY",
    "Tristana": "BOTTOM",
    "Trundle": "JUNGLE",
    "Tryndamere": "TOP",
    "TwistedFate": "MIDDLE",
    "Twitch": "BOTTOM",
    "Udyr": "JUNGLE",
    "Urgot": "TOP",
    "Varus": "BOTTOM",
    "Vayne": "BOTTOM",
    "Veigar": "MIDDLE",
    "Velkoz": "MIDDLE",
    "Vex": "MIDDLE",
    "Vi": "JUNGLE",
    "Viego": "JUNGLE",
    "Viktor": "MIDDLE",
    "Vladimir": "MIDDLE",
    "Volibear": "JUNGLE",
    "Warwick": "JUNGLE",
    "Xayah": "BOTTOM",
    "Xerath": "MIDDLE",
    "XinZhao": "JUNGLE",
    "Yasuo": "MIDDLE",
    "Yone": "MIDDLE",
    "Yorick": "TOP",
    "Yuumi": "UTILITY",
    "Zac": "JUNGLE",
    "Zed": "MIDDLE",
    "Zeri": "BOTTOM",
    "Ziggs": "MIDDLE",
    "Zilean": "UTILITY",
    "Zoe": "MIDDLE",
    "Zyra": "UTILITY"
  } as Record<string, string>, // Use type assertion instead of index signature
  // Fallback role mappings by champion type
  "TOP": ["Fighter", "Tank", "Juggernaut"],
  "JUNGLE": ["Assassin", "Fighter", "Tank"],
  "MIDDLE": ["Mage", "Assassin"],
  "BOTTOM": ["Marksman"],
  "UTILITY": ["Support", "Enchanter"]
};

export default function TopChampions() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [selectedPosition, setSelectedPosition] = useState("TOP")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current patch version
        const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = patchResponse.data[0]
        
        // Fetch champion data
        const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
        const champData = response.data.data
        
        // Get champion win rates from your backend API
        const statsResponse = await axios.get('/api/champion-stats')
        const champStats = statsResponse.data || {}
        
        // Transform the data into the format we need
        const allChampions = (Object.values(champData) as RiotChampionData[]).map((champ: RiotChampionData) => {
          const stats = champStats[champ.key] || {
            winRate: 50,
            pickRate: 10,
            banRate: 5
          }
          
          const primaryRole = ROLE_MAPPINGS.SPECIFIC_CHAMPIONS[champ.id] || 'MIDDLE'
          
          return {
            id: champ.id,
            name: champ.name,
            role: primaryRole,
            winRate: parseFloat(stats.winRate.toFixed(1)),
            pickRate: parseFloat(stats.pickRate.toFixed(1)),
            banRate: parseFloat(stats.banRate.toFixed(1)),
            trend: stats.trend || 'stable',
            winRateChange: stats.winRateChange || '0%',
            difficulty: getDifficulty(champ.info.difficulty),
            image: `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/img/champion/${champ.id}.png`,
            primaryPosition: primaryRole,
            tier: stats.tier || 'B'
          }
        })

        setChampions(allChampions)
      } catch (err) {
        console.error("Error fetching champion data:", err)
        setError("Failed to load champion data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const getDifficulty = (difficultyValue: number): string => {
    if (difficultyValue <= 3) return "Easy"
    if (difficultyValue <= 7) return "Medium"
    return "Hard"
  }

  const getTopChampionsByPosition = (position: string) => {
    return champions
      .filter(champ => champ.primaryPosition === position)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="p-6 bg-bg-main rounded-xl min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="mt-4 text-text-secondary">Loading champions...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6 bg-bg-main rounded-xl">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-bg-main rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Top Champions</h2>
          <p className="text-text-secondary text-sm mt-1">Best performing champions by role</p>
        </div>
      </div>

      {/* Position Selector */}
      <div className="flex gap-2 mb-6">
        {POSITIONS.map((position) => (
          <button
            key={position.key}
            onClick={() => setSelectedPosition(position.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              selectedPosition === position.key
                ? "bg-accent/20 text-accent"
                : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
            )}
          >
            {position.icon}
            <span>{position.label}</span>
          </button>
        ))}
      </div>

      {/* Champions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getTopChampionsByPosition(selectedPosition).map((champion) => (
          <Card key={champion.id} className="bg-bg-card p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image
                  src={champion.image.replace('splash', 'champion').replace('_0.jpg', '.png') || "/placeholder.svg"}
                  alt={champion.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-text-main">{champion.name}</h4>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    champion.tier === 'S' ? "bg-accent/20 text-accent" :
                    champion.tier === 'A' ? "bg-green-500/20 text-green-500" :
                    champion.tier === 'B' ? "bg-blue-500/20 text-blue-500" :
                    "bg-text-secondary/20 text-text-secondary"
                  )}>
                    {champion.tier} Tier
                  </span>
                </div>
                <div className="flex gap-2 text-sm text-text-secondary">
                  <span>Win Rate: {champion.winRate}%</span>
                  <span>Pick Rate: {champion.pickRate}%</span>
                  <span>Ban Rate: {champion.banRate}%</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs",
                    champion.trend === 'up' ? "text-green-500" :
                    champion.trend === 'down' ? "text-red-500" :
                    "text-text-secondary"
                  )}>
                    {champion.winRateChange}
                  </span>
                  <span className="text-xs text-text-secondary">•</span>
                  <span className="text-xs text-text-secondary">{champion.difficulty}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
