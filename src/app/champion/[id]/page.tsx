"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Info, Shield, Sword, Heart, Zap, Activity, Layers } from "lucide-react"
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

export default function ChampionDetailsPage() {
  const params = useParams()
  const champId = params?.id as string
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  
  // Fetch champion data
  useEffect(() => {
    async function fetchChampionData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/champion-details?id=${champId}`)
        
        if (!response.ok) {
          throw new Error(`Error fetching champion data: ${response.status}`)
        }
        
        const data = await response.json()
        setChampionData(data)
        setLoading(false)
      } catch {
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navigation />
      
      {/* Champion Hero Section */}
      <div 
        className="relative w-full h-[500px] bg-cover bg-center" 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.8) 100%), url(${championData.imageURLs.splash})`,
          backgroundPosition: 'center 20%' 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <Link 
            href="/champions" 
            className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md text-zinc-300 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Champions
          </Link>
          
          <div className="flex items-end gap-6">
            <div className="relative w-32 h-32 border-2 border-[#C89B3C] rounded-md overflow-hidden">
              <Image 
                src={championData.imageURLs.square} 
                alt={championData.name} 
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="mb-1 text-sm text-[#C89B3C] font-medium">
                {championData.tags.join(' • ')}
              </div>
              <h1 className="text-5xl font-bold">{championData.name}</h1>
              <p className="text-xl text-zinc-400 mt-1">{championData.title}</p>
              
              <div className="mt-4 flex gap-4">
                <div className="flex items-center text-sm text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-[#45CC8F] mr-2"></span>
                  <span>{championData.partype || "Mana"}</span>
                </div>
                <div className="text-sm text-zinc-400">Version {championData.version}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-1 space-y-6">
            {/* Champion Stats */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#C89B3C]">Champion Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-red-400" /> Health
                    </span>
                    <span>{championData.stats.hp} (+{championData.stats.hpperlevel} per level)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.hp / 700 * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap size={14} className="text-blue-400" /> {championData.partype || "Mana"}
                    </span>
                    <span>{championData.stats.mp} (+{championData.stats.mpperlevel} per level)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.mp / 500 * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Activity size={14} className="text-green-400" /> Move Speed
                    </span>
                    <span>{championData.stats.movespeed}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.movespeed / 355 * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Sword size={14} className="text-amber-400" /> Attack Damage
                    </span>
                    <span>{championData.stats.attackdamage} (+{championData.stats.attackdamageperlevel} per level)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.attackdamage / 70 * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Shield size={14} className="text-zinc-400" /> Armor
                    </span>
                    <span>{championData.stats.armor} (+{championData.stats.armorperlevel} per level)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-zinc-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.armor / 40 * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Layers size={14} className="text-purple-400" /> Magic Resist
                    </span>
                    <span>{championData.stats.spellblock} (+{championData.stats.spellblockperlevel} per level)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(championData.stats.spellblock / 40 * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Runes Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#C89B3C]">Runes</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedRuneBuild(num - 1)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        selectedRuneBuild === num - 1
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {/* Keystone Selection */}
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-md mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 to-amber-700 border-2 border-amber-400 flex items-center justify-center">
                    <div className="text-white text-lg font-bold">?</div>
                  </div>
                  <div>
                    <p className="text-white font-medium">Conqueror</p>
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-green-400">54.2% WR</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-blue-400">92.7% PR</span>
                    </div>
                  </div>
                </div>

                {/* Primary Path */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <div className="bg-amber-500/20 px-2 py-1 rounded text-xs font-semibold text-amber-300">PRECISION</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={`keystone-${i}`} className={`aspect-square rounded-full ${i === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 border-2 border-amber-400' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 0 ? 'text-white' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={`row1-${i}`} className={`aspect-square rounded-full ${i === 1 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 1 ? 'text-amber-300' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={`row2-${i}`} className={`aspect-square rounded-full ${i === 0 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 0 ? 'text-amber-300' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={`row3-${i}`} className={`aspect-square rounded-full ${i === 2 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 2 ? 'text-amber-300' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Path */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <div className="bg-green-500/20 px-2 py-1 rounded text-xs font-semibold text-green-300">RESOLVE</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={`sec-row1-${i}`} className={`aspect-square rounded-full ${i === 0 ? 'bg-green-500/30 border border-green-500/60' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 0 ? 'text-green-300' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={`sec-row2-${i}`} className={`aspect-square rounded-full ${i === 2 ? 'bg-green-500/30 border border-green-500/60' : 'bg-zinc-800/70 border border-zinc-700'} flex items-center justify-center`}>
                        <div className={`${i === 2 ? 'text-green-300' : 'text-zinc-500'} text-lg font-bold`}>?</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shards */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="bg-blue-500/20 px-2 py-1 rounded text-xs font-semibold text-blue-300">STAT SHARDS</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-zinc-800/70 rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">Offense</span>
                        <div className="w-4 h-4 rounded-full bg-red-500/30 border border-red-500/60 flex items-center justify-center">
                          <span className="text-red-300 text-[8px]">+</span>
                        </div>
                      </div>
                      <p className="text-white font-medium">Adaptive Force</p>
                    </div>
                    
                    <div className="bg-zinc-800/70 rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">Flex</span>
                        <div className="w-4 h-4 rounded-full bg-blue-500/30 border border-blue-500/60 flex items-center justify-center">
                          <span className="text-blue-300 text-[8px]">+</span>
                        </div>
                      </div>
                      <p className="text-white font-medium">Armor</p>
                    </div>
                    
                    <div className="bg-zinc-800/70 rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">Defense</span>
                        <div className="w-4 h-4 rounded-full bg-green-500/30 border border-green-500/60 flex items-center justify-center">
                          <span className="text-green-300 text-[8px]">+</span>
                        </div>
                      </div>
                      <p className="text-white font-medium">Health</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hard Counters Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#C89B3C]">Hard Counters</h3>
              <div className="space-y-3">
                {[
                  { name: 'Jax', winRate: '54.8%', image: 'https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/Jax.png' },
                  { name: 'Fiora', winRate: '53.2%', image: 'https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/Fiora.png' },
                  { name: 'Malphite', winRate: '52.6%', image: 'https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/Malphite.png' },
                  { name: 'Irelia', winRate: '51.4%', image: 'https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/Irelia.png' }
                ].map((counter) => (
                  <div 
                    key={counter.name}
                    className="flex items-center justify-between bg-zinc-800/60 p-3 rounded-md hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-red-400/30">
                        <Image 
                          src={counter.image}
                          alt={counter.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{counter.name}</p>
                        <p className="text-zinc-400 text-xs">Counter</p>
                      </div>
                    </div>
                    <div className="text-red-400 font-medium">{counter.winRate}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Order Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#C89B3C]">Skill Order</h3>
                <div className="text-zinc-400 text-sm">54.2% Win Rate</div>
              </div>
              
              <div className="mb-6">
                {/* Skill Level Grid */}
                <div className="mb-4 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-19">
                    {/* Headers */}
                    <div className="col-span-1 bg-zinc-800/80 p-2 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-400">Lvl</span>
                    </div>
                    {[...Array(18)].map((_, i) => (
                      <div key={`level-${i}`} className="bg-zinc-800/80 p-2 flex items-center justify-center">
                        <span className="text-xs font-medium text-zinc-400">{i + 1}</span>
                      </div>
                    ))}
                    
                    {/* Q Row */}
                    <div className="col-span-1 bg-zinc-800/40 p-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">Q</span>
                    </div>
                    {[1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((active, i) => (
                      <div key={`q-${i}`} className="bg-zinc-800/40 p-2 flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${active ? 'bg-blue-500' : 'bg-zinc-700'} flex items-center justify-center`}>
                          {active ? <span className="text-[10px] text-white">•</span> : null}
                        </div>
                      </div>
                    ))}
                    
                    {/* W Row */}
                    <div className="col-span-1 bg-zinc-800/60 p-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-400">W</span>
                    </div>
                    {[0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0].map((active, i) => (
                      <div key={`w-${i}`} className="bg-zinc-800/60 p-2 flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-zinc-700'} flex items-center justify-center`}>
                          {active ? <span className="text-[10px] text-white">•</span> : null}
                        </div>
                      </div>
                    ))}
                    
                    {/* E Row */}
                    <div className="col-span-1 bg-zinc-800/40 p-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">E</span>
                    </div>
                    {[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0].map((active, i) => (
                      <div key={`e-${i}`} className="bg-zinc-800/40 p-2 flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${active ? 'bg-amber-500' : 'bg-zinc-700'} flex items-center justify-center`}>
                          {active ? <span className="text-[10px] text-white">•</span> : null}
                        </div>
                      </div>
                    ))}
                    
                    {/* R Row */}
                    <div className="col-span-1 bg-zinc-800/60 p-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-400">R</span>
                    </div>
                    {[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1].map((active, i) => (
                      <div key={`r-${i}`} className="bg-zinc-800/60 p-2 flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${active ? 'bg-red-500' : 'bg-zinc-700'} flex items-center justify-center`}>
                          {active ? <span className="text-[10px] text-white">•</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Max Order */}
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <p className="text-zinc-300 text-sm">Max Order:</p>
                    <p className="text-zinc-400 text-xs">92.7% of matches</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-500 text-white font-bold">Q</div>
                    <span className="text-zinc-400">→</span>
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-green-500 text-white font-bold">W</div>
                    <span className="text-zinc-400">→</span>
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-amber-500 text-white font-bold">E</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - right 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lore Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#C89B3C]">Lore</h3>
              <p className="text-zinc-300 leading-relaxed">{championData.lore}</p>
            </div>
            
            {/* Abilities Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6 text-[#C89B3C]">Abilities</h3>
              
              {/* Passive */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-zinc-700 flex items-center justify-center">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/passive/${championData.passive.image.full}`}
                        alt={championData.passive.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-zinc-300">P</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Passive</div>
                    <h4 className="text-lg font-bold">{championData.passive.name}</h4>
                    <p className="text-zinc-300 mt-2">{formatDescription(championData.passive.description)}</p>
                  </div>
                </div>
              </div>
              
              {/* Active Abilities */}
              <div className="space-y-8">
                {championData.spells.map((spell, index) => {
                  const abilityColor = getAbilityColor(index);
                  const abilityKey = mapAbilityToKey(index);
                  
                  return (
                    <div key={spell.id}>
                      <div className="flex items-start gap-4 mb-2">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-md overflow-hidden border border-zinc-700 flex items-center justify-center">
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/spell/${spell.image.full}`}
                              alt={spell.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                          <div 
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: abilityColor.bg, border: `1px solid ${abilityColor.bg}` }}
                          >
                            <span className="text-xs font-bold" style={{ color: abilityColor.text }}>{abilityKey}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-zinc-400 mb-1">Ability {index + 1}</div>
                          <h4 className="text-lg font-bold">{spell.name}</h4>
                          <p className="text-zinc-300 mt-2">{formatDescription(spell.description)}</p>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {spell.cooldownBurn && (
                              <div className="bg-zinc-800/50 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1">Cooldown</div>
                                <div className="text-sm text-white font-medium">{spell.cooldownBurn}s</div>
                              </div>
                            )}
                            
                            {spell.costBurn && (
                              <div className="bg-zinc-800/50 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1">Cost</div>
                                <div className="text-sm text-white font-medium">{spell.costBurn} {championData.partype}</div>
                              </div>
                            )}
                            
                            {spell.rangeBurn && spell.rangeBurn !== "self" && (
                              <div className="bg-zinc-800/50 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1">Range</div>
                                <div className="text-sm text-white font-medium">{spell.rangeBurn}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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