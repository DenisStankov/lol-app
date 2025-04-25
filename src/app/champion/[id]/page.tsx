"use client"

import { useState, useEffect, Fragment } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Sword, Heart, Zap, Activity, Layers, Droplet } from "lucide-react"
import Navigation from "@/components/navigation"
import { Tooltip } from '@/components/ui/tooltip'

// Define our champion data interface based on the Riot API
interface ChampionData {
  id: string
  key: string
  name: string
  title: string
  lore: string
  blurb: string
  allytips: string[]
  enemytips: string[]
  tags: string[]
  partype: string
  info: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
  stats: {
    hp: number
    hpperlevel: number
    mp: number
    mpperlevel: number
    movespeed: number
    armor: number
    armorperlevel: number
    spellblock: number
    spellblockperlevel: number
    attackrange: number
    hpregen: number
    hpregenperlevel: number
    mpregen: number
    mpregenperlevel: number
    crit: number
    critperlevel: number
    attackdamage: number
    attackdamageperlevel: number
    attackspeedperlevel: number
    attackspeed: number
  }
  spells: Array<{
    id: string
    name: string
    description: string
    tooltip: string
    maxrank: number
    cooldown: number[]
    cooldownBurn: string
    cost: number[]
    costBurn: string
    range: number[]
    rangeBurn: string
    tags: string[]
    image: {
      full: string
    }
  }>
  passive: {
    name: string
    description: string
    image: {
      full: string
    }
  }
  imageURLs: {
    splash: string
    loading: string
    square: string
    passive: string
    spells: string[]
  }
  version: string
}

// Define interfaces for meta data
interface ChampionMetaData {
  championId: string;
  winRate: string;
  pickRate: string;
  banRate: string;
  roleSpecificData: RoleSpecificData;
}

interface RoleSpecificData {
  runes: RuneData;
  build: BuildData;
  counters: CounterData[];
  skillOrder: SkillOrderData;
  skills: {
    winRate: string;
  };
}

interface RuneData {
  primary: {
    name: string;
    keystone: string;
    row1: string;
    row2: string;
    row3: string;
  };
  secondary: {
    name: string;
    row1: string;
    row2: string;
  };
  shards: string[];
}

interface BuildData {
  starter: ItemData[];
  core: ItemData[];
  situational: ItemData[];
  boots: BootData[];
}

interface ItemData {
  name: string;
  image: string;
  cost?: number;
  condition?: string;
  order?: number;
}

interface BootData {
  name: string;
  image: string;
  pickRate: string;
}

interface CounterData {
  name: string;
  winRate: string;
  image: string;
}

interface SkillOrderData {
  maxPriority: string[];
  order: { level: number; skill: string }[];
}

// Helper function to format ability descriptions
const formatDescription = (description: string) => {
  // Replace HTML tags with proper formatting
  return description
    .replace(/<br>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\.(?! )/g, '. '); // Ensure periods are followed by a space
};

// Map ability index to keyboard key
const mapAbilityToKey = (index: number) => {
  switch (index) {
    case 0: return 'Q';
    case 1: return 'W';
    case 2: return 'E';
    case 3: return 'R';
    default: return '';
  }
};

// Get color for ability key label
const getAbilityColor = (index: number) => {
  switch (index) {
    case 0: return { bg: '#1E88E5', text: '#fff' }; // Q - Blue
    case 1: return { bg: '#43A047', text: '#fff' }; // W - Green
    case 2: return { bg: '#FB8C00', text: '#fff' }; // E - Orange
    case 3: return { bg: '#E53935', text: '#fff' }; // R - Red
    default: return { bg: '#757575', text: '#fff' };
  }
};

// Helper function to get the right keystone image URL
function getKeystoneImageUrl(keystoneName: string | undefined): string {
  if (!keystoneName) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png";
  
  const keystoneMap: {[key: string]: string} = {
    "Press the Attack": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
    "Lethal Tempo": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
    "Fleet Footwork": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png",
    "Conqueror": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png",
    "Electrocute": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png",
    "Predator": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Predator/Predator.png",
    "Dark Harvest": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png",
    "Hail of Blades": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png",
    "Summon Aery": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
    "Arcane Comet": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
    "Phase Rush": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png",
    "Grasp of the Undying": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
    "Aftershock": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png",
    "Guardian": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Guardian/Guardian.png",
    "Glacial Augment": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png",
    "Unsealed Spellbook": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png",
    "First Strike": "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png"
  };
  
  return keystoneMap[keystoneName] || keystoneMap["Conqueror"];
}

export default function ChampionDetailsPage() {
  const params = useParams()
  const champId = params?.id as string
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  const [metaData, setMetaData] = useState<ChampionMetaData | null>(null)
  const [selectedAbility, setSelectedAbility] = useState<string>('passive')

  // Fetch champion data
  useEffect(() => {
    async function fetchChampionData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/champion-details?id=${champId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch champion data: ${response.statusText}`)
        }
        
        const data = await response.json()
        setChampionData(data)
        
        // Fetch meta data
        const metaResponse = await fetch(`/api/champion-meta?id=${champId}`)
        if (metaResponse.ok) {
          const metaData = await metaResponse.json()
          setMetaData(metaData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error(`Error fetching champion data for ${champId}:`, error)
        setError('Failed to load champion data. Please try again later.')
        setLoading(false)
      }
    }

    if (champId) {
      fetchChampionData()
    }
  }, [champId])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#C89B3C]/30 border-t-[#C89B3C] rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-[#C89B3C]">Loading Champion Data</h2>
            <p className="text-zinc-400 mt-2">Fetching the latest information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !championData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center bg-red-900/20 border border-red-800/50 rounded-lg p-8 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-red-400">Error Loading Champion</h2>
            <p className="mt-4 text-zinc-300">{error || "Failed to load champion data"}</p>
            <Link 
              href="/champions" 
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Champions
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0A1428] text-white">
      <Navigation />
      
      {/* Hero Section - Champion Banner */}
      <div 
        className="relative min-h-[350px] bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${championData.imageURLs.splash})`,
          backgroundPosition: '50% 20%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <div className="mb-6">
              <Link 
                href="/champions" 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E2328]/80 hover:bg-[#1E2328] rounded-md text-zinc-300 text-sm transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Champions
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-6">
              {/* Champion Portrait */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-[#C89B3C] shadow-lg shadow-black/50 transform translate-y-4">
                <Image 
                  src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${championData.id}.png`}
                  alt={championData.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              {/* Champion Info */}
              <div className="flex-1 z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                  <div>
                    <div className="text-[#C89B3C] text-sm mb-1 font-medium">{championData.title}</div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-1">{championData.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      {championData.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1E2328]/80 text-[#F0E6D2] border border-[#2d3640]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0A1428]/90 text-[#C89B3C] border border-[#C89B3C]/30">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#C89B3C] mr-1.5"></span>
                        {metaData?.winRate || "53.2%"} WR
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 md:mt-0 mt-4">
                    <div className="flex gap-1">
                      {[...Array(Math.floor(championData.info.difficulty / 2))].map((_, i) => (
                        <div key={i} className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                      ))}
                      {[...Array(5 - Math.floor(championData.info.difficulty / 2))].map((_, i) => (
                        <div key={i} className="w-1.5 h-6 bg-[#2d3640] rounded-full"></div>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-[#F0E6D2] px-2 py-1 rounded bg-[#1E2328]/70 border border-[#2d3640]">
                      {championData.info.difficulty <= 3 
                        ? 'Easy' 
                        : championData.info.difficulty <= 6
                          ? 'Moderate'
                          : 'Hard'} to Play
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Champion Stats Summary */}
      <div className="bg-[#0A1428] border-t border-b border-[#2d3640]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-[#1E2328]/80 p-3 rounded border border-[#2d3640]">
              <div className="flex items-center text-xs text-zinc-400 mb-1">
                <Heart size={12} className="text-red-400 mr-1" /> Health
              </div>
              <div className="text-sm font-semibold">{championData.stats.hp}</div>
              <div className="text-xs text-zinc-500">+{championData.stats.hpperlevel} per level</div>
            </div>
            
            <div className="bg-[#1E2328]/80 p-3 rounded border border-[#2d3640]">
              <div className="flex items-center text-xs text-zinc-400 mb-1">
                <Droplet size={12} className="text-blue-400 mr-1" /> {championData.partype}
              </div>
              <div className="text-sm font-semibold">{championData.stats.mp}</div>
              <div className="text-xs text-zinc-500">+{championData.stats.mpperlevel} per level</div>
            </div>
            
            <div className="bg-[#1E2328]/80 p-3 rounded border border-[#2d3640]">
              <div className="flex items-center text-xs text-zinc-400 mb-1">
                <Sword size={12} className="text-amber-400 mr-1" /> Attack
              </div>
              <div className="text-sm font-semibold">{championData.stats.attackdamage}</div>
              <div className="text-xs text-zinc-500">+{championData.stats.attackdamageperlevel} per level</div>
            </div>
            
            <div className="bg-[#1E2328]/80 p-3 rounded border border-[#2d3640]">
              <div className="flex items-center text-xs text-zinc-400 mb-1">
                <Activity size={12} className="text-green-400 mr-1" /> Speed
              </div>
              <div className="text-sm font-semibold">{championData.stats.movespeed}</div>
              <div className="text-xs text-zinc-500">Base value</div>
            </div>
            
            <div className="hidden lg:block bg-[#1E2328]/80 p-3 rounded border border-[#2d3640]">
              <div className="flex items-center text-xs text-zinc-400 mb-1">
                <Shield size={12} className="text-gray-400 mr-1" /> Armor
              </div>
              <div className="text-sm font-semibold">{championData.stats.armor}</div>
              <div className="text-xs text-zinc-500">+{championData.stats.armorperlevel} per level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the champion page - existing code */}
      {/* ... existing code ... */}
    </div>
  )
} 