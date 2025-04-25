"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Sword, Heart, Activity, Droplet } from "lucide-react"
import Navigation from "@/components/navigation"

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
  winRate?: string;
}

interface BuildData {
  starter: ItemData[];
  core: ItemData[];
  situational: ItemData[];
  boots: BootData[];
  winRate?: string;
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

export default function ChampionDetailsPage() {
  const params = useParams()
  const champId = params?.id as string
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  const [metaData, setMetaData] = useState<ChampionMetaData | null>(null)
  const [selectedAbility, setSelectedAbility] = useState<string>('passive')
  const [selectedTab, setSelectedTab] = useState('build')

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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Build & Runes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Build Selection Tabs */}
            <div className="bg-[#1E2328] rounded-lg overflow-hidden border border-[#2d3640] shadow-lg">
              <div className="flex border-b border-[#2d3640]">
                <button 
                  onClick={() => setSelectedTab('build')}
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    selectedTab === 'build' 
                      ? 'bg-[#0A1428] text-[#C89B3C] border-b-2 border-[#C89B3C]' 
                      : 'text-zinc-400 hover:bg-[#0A1428]/50'
                  }`}
                >
                  Recommended Build
                </button>
                <button 
                  onClick={() => setSelectedTab('runes')}
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    selectedTab === 'runes' 
                      ? 'bg-[#0A1428] text-[#C89B3C] border-b-2 border-[#C89B3C]' 
                      : 'text-zinc-400 hover:bg-[#0A1428]/50'
                  }`}
                >
                  Runes
                </button>
                <button 
                  onClick={() => setSelectedTab('counters')}
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    selectedTab === 'counters' 
                      ? 'bg-[#0A1428] text-[#C89B3C] border-b-2 border-[#C89B3C]' 
                      : 'text-zinc-400 hover:bg-[#0A1428]/50'
                  }`}
                >
                  Counters
                </button>
              </div>

              {/* Build Tab Content */}
              {selectedTab === 'build' && (
                <div className="p-4">
                  {/* Build Metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#C89B3C]">Recommended Build</h3>
                    <div className="flex items-center">
                      <div className="text-xs px-2 py-1 bg-green-900/20 rounded border border-green-900/40 text-green-400">
                        {metaData?.roleSpecificData?.build?.winRate || "54.7%"} Win Rate
                      </div>
                      <div className="ml-3 flex gap-1">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => setSelectedRuneBuild(num - 1)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              selectedRuneBuild === num - 1
                                ? 'bg-[#C89B3C] text-[#0A1428]'
                                : 'bg-[#2d3640] text-zinc-300 hover:bg-[#3d4650]'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Starter Items */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#F0E6D2] mb-3 flex items-center justify-between">
                      <span>Starter Items</span>
                      <span className="text-xs text-zinc-400">Early game</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {metaData?.roleSpecificData?.build?.starter?.map((item, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                        >
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-[#2d3640] bg-[#1E2328] group-hover:border-[#C89B3C]/50 transition-colors">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover p-1"
                            />
                            {item.cost && (
                              <div className="absolute bottom-0 right-0 bg-[#0A1428]/90 px-1 text-[10px] text-[#C89B3C] border-t border-l border-[#2d3640] rounded-tl-md">
                                {item.cost}g
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0A1428] rounded border border-[#2d3640] shadow-lg p-2 text-sm pointer-events-none transition-opacity">
                            <div className="font-medium text-[#C89B3C]">{item.name}</div>
                            {item.condition && <div className="text-xs text-zinc-400 mt-1">{item.condition}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Items */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#F0E6D2] mb-3 flex items-center justify-between">
                      <span>Core Build</span>
                      <span className="text-xs text-zinc-400">Build in this order</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {metaData?.roleSpecificData?.build?.core?.map((item, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                        >
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-[#2d3640] bg-[#1E2328] group-hover:border-[#C89B3C]/50 transition-colors">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover p-1"
                            />
                            {item.cost && (
                              <div className="absolute bottom-0 right-0 bg-[#0A1428]/90 px-1 text-[10px] text-[#C89B3C] border-t border-l border-[#2d3640] rounded-tl-md">
                                {item.cost}g
                              </div>
                            )}
                            {item.order && (
                              <div className="absolute top-0 left-0 w-5 h-5 bg-[#C89B3C] rounded-br-md flex items-center justify-center text-xs font-bold text-[#0A1428] shadow-md">
                                {item.order}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0A1428] rounded border border-[#2d3640] shadow-lg p-2 text-sm pointer-events-none transition-opacity">
                            <div className="font-medium text-[#C89B3C]">{item.name}</div>
                            {item.condition && <div className="text-xs text-zinc-400 mt-1">{item.condition}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Boots Options */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#F0E6D2] mb-3 flex items-center justify-between">
                      <span>Boots Options</span>
                      <span className="text-xs text-zinc-400">Choose based on matchup</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {metaData?.roleSpecificData?.build?.boots?.map((boot, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                        >
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-[#2d3640] bg-[#1E2328] group-hover:border-[#C89B3C]/50 transition-colors">
                            <Image
                              src={boot.image}
                              alt={boot.name}
                              fill
                              className="object-cover p-1"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-900/80 px-1 text-[10px] text-green-400 border-t border-l border-green-900/40 rounded-tl-md">
                              {boot.pickRate}%
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0A1428] rounded border border-[#2d3640] shadow-lg p-2 text-sm pointer-events-none transition-opacity">
                            <div className="font-medium text-[#C89B3C]">{boot.name}</div>
                            <div className="text-xs text-green-400 mt-1">Pick Rate: {boot.pickRate}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Situational Items */}
                  <div>
                    <div className="text-sm font-medium text-[#F0E6D2] mb-3 flex items-center justify-between">
                      <span>Situational Items</span>
                      <span className="text-xs text-zinc-400">Consider these based on enemy team</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {metaData?.roleSpecificData?.build?.situational?.map((item, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                        >
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-[#2d3640] bg-[#1E2328] group-hover:border-[#C89B3C]/50 transition-colors">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover p-1"
                            />
                            {item.cost && (
                              <div className="absolute bottom-0 right-0 bg-[#0A1428]/90 px-1 text-[10px] text-[#C89B3C] border-t border-l border-[#2d3640] rounded-tl-md">
                                {item.cost}g
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0A1428] rounded border border-[#2d3640] shadow-lg p-2 text-sm pointer-events-none transition-opacity">
                            <div className="font-medium text-[#C89B3C]">{item.name}</div>
                            {item.condition && <div className="text-xs text-zinc-400 mt-1">{item.condition}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Runes Tab Content */}
              {selectedTab === 'runes' && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#C89B3C]">Recommended Runes</h3>
                    <div className="flex items-center">
                      <div className="text-xs px-2 py-1 bg-blue-900/20 rounded border border-blue-900/40 text-blue-400">
                        {metaData?.roleSpecificData?.runes?.winRate || "55.2%"} Win Rate
                      </div>
                    </div>
                  </div>
                  
                  {/* Rune Setup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Primary Rune Path */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[#1E2328] flex items-center justify-center text-xs text-[#C89B3C] border border-[#C89B3C]">P</div>
                        <h4 className="text-[#F0E6D2] font-medium">{metaData?.roleSpecificData?.runes?.primary?.name || "Precision"}</h4>
                      </div>
                      
                      {/* Keystone */}
                      <div className="mb-4">
                        <div className="text-xs text-zinc-400 mb-2">Keystone</div>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden border-2 border-[#C89B3C]">
                            <Image
                              src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png"
                              alt="Keystone"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#C89B3C]">{metaData?.roleSpecificData?.runes?.primary?.keystone || "Press the Attack"}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Row 1-3 */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((row, index) => (
                          <div key={row} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#2d3640]">
                              <Image
                                src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Overheal.png"
                                alt={`Rune ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-xs text-[#F0E6D2]">
                              {["Overheal", "Legend: Alacrity", "Coup de Grace"][index]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Secondary Rune Path */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[#1E2328] flex items-center justify-center text-xs text-zinc-400 border border-zinc-700">S</div>
                        <h4 className="text-[#F0E6D2] font-medium">{metaData?.roleSpecificData?.runes?.secondary?.name || "Domination"}</h4>
                      </div>
                      
                      {/* Row 1-2 */}
                      <div className="space-y-3 mb-6">
                        {[1, 2].map((row, index) => (
                          <div key={row} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#2d3640]">
                              <Image
                                src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/TasteOfBlood/TasteOfBlood.png"
                                alt={`Rune ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-xs text-[#F0E6D2]">
                              {["Taste of Blood", "Relentless Hunter"][index]}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Stat Shards */}
                      <div>
                        <div className="text-xs text-zinc-400 mb-2">Stat Shards</div>
                        <div className="flex items-center gap-3">
                          {["Adaptive Force", "Adaptive Force", "Armor"].map((shard, index) => (
                            <div key={index} className="bg-[#1E2328] border border-[#2d3640] rounded px-2 py-1 text-xs text-[#F0E6D2]">
                              {shard}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Counters Tab Content */}
              {selectedTab === 'counters' && (
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#C89B3C] mb-4">Champion Counters</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {metaData?.roleSpecificData?.counters?.map((counter, index) => (
                      <div 
                        key={index} 
                        className="bg-[#1E2328]/80 border border-[#2d3640] rounded-lg overflow-hidden hover:border-[#C89B3C]/50 transition-colors"
                      >
                        <div className="relative h-24 bg-cover bg-center border-b border-[#2d3640]">
                          <Image
                            src={counter.image}
                            alt={counter.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428]/90 via-transparent to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <div className="font-medium text-sm text-[#F0E6D2]">{counter.name}</div>
                          </div>
                        </div>
                        <div className="p-2 flex items-center justify-between">
                          <div className="text-xs text-zinc-400">Counter Score</div>
                          <div className="text-xs font-medium text-red-400">
                            {counter.winRate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Champion Abilities */}
          <div className="space-y-6">
            <div className="bg-[#1E2328] rounded-lg overflow-hidden border border-[#2d3640] shadow-lg">
              <div className="bg-gradient-to-r from-[#1E2328] to-[#1E2328]/80 px-4 py-3 border-b border-[#2d3640]">
                <h3 className="text-lg font-bold text-[#C89B3C]">Abilities</h3>
              </div>
              <div className="p-4">
                {/* Ability Navigation */}
                <div className="flex mb-4 border-b border-[#2d3640]">
                  <button 
                    onClick={() => setSelectedAbility('passive')}
                    className={`flex-1 flex flex-col items-center p-2 ${selectedAbility === 'passive' ? 'border-b-2 border-[#C89B3C]' : ''}`}
                  >
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#2d3640]">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/passive/${championData.passive.image.full}`}
                        alt="Passive"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">P</div>
                  </button>
                  {championData.spells.map((spell, index) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedAbility(['q', 'w', 'e', 'r'][index])}
                      className={`flex-1 flex flex-col items-center p-2 ${selectedAbility === ['q', 'w', 'e', 'r'][index] ? 'border-b-2 border-[#C89B3C]' : ''}`}
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#2d3640]">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/spell/${spell.image.full}`}
                          alt={spell.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">{['Q', 'W', 'E', 'R'][index]}</div>
                    </button>
                  ))}
                </div>
                
                {/* Ability Details */}
                <div className="pt-2">
                  {selectedAbility === 'passive' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#2d3640]">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#C89B3C]/50 shadow-md shadow-[#C89B3C]/10">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/passive/${championData.passive.image.full}`}
                            alt={championData.passive.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-y-2">
                            <h4 className="text-base font-semibold text-[#C89B3C]">{championData.passive.name}</h4>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 italic">Innate ability</p>
                        </div>
                      </div>
                      <div className="text-sm text-[#F0E6D2] leading-relaxed">
                        {formatDescription(championData.passive.description)}
                      </div>
                    </div>
                  )}

                  {['q', 'w', 'e', 'r'].includes(selectedAbility) && championData.spells && (
                    <div>
                      {championData.spells.map((spell, index) => {
                        const spellKey = ['q', 'w', 'e', 'r'][index];
                        if (spellKey !== selectedAbility) return null;
                        
                        return (
                          <div key={spell.id}>
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#2d3640]">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#C89B3C]/50 shadow-md shadow-[#C89B3C]/10">
                                <Image
                                  src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/spell/${spell.image.full}`}
                                  alt={spell.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-y-2">
                                  <h4 className="text-base font-semibold text-[#C89B3C]">{spell.name}</h4>
                                  <div className="flex gap-2 text-xs">
                                    {spell.cooldownBurn && (
                                      <div className="px-2 py-0.5 bg-blue-900/30 border border-blue-900/40 rounded text-blue-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        {spell.cooldownBurn}s
                                      </div>
                                    )}
                                    {spell.costBurn && spell.costBurn !== "0" && (
                                      <div className="px-2 py-0.5 bg-indigo-900/30 border border-indigo-900/40 rounded text-indigo-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        {championData.partype}: {spell.costBurn}
                                      </div>
                                    )}
                                    {spell.rangeBurn && spell.rangeBurn !== "0" && (
                                      <div className="px-2 py-0.5 bg-green-900/30 border border-green-900/40 rounded text-green-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Range: {spell.rangeBurn}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5 italic">
                                  Ability {selectedAbility.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="text-sm text-[#F0E6D2] leading-relaxed">
                                {formatDescription(spell.description)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-zinc-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>This app is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.</p>
          <p className="mt-2">League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.</p>
        </div>
      </footer>
    </div>
  )
} 