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
    cost: number[]
    range: number[]
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

// Define role data for display
const roleData: Record<string, { label: string; color: string }> = {
  "TOP": { label: "TOP", color: "#FF9500" },
  "JUNGLE": { label: "JNG", color: "#19B326" },
  "MIDDLE": { label: "MID", color: "#4F8EFF" },
  "BOTTOM": { label: "BOT", color: "#FF4E50" },
  "UTILITY": { label: "SUP", color: "#CC66FF" }
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
      } catch (_) {
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
          <div className="col-span-1">
            {/* Champion Stats */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6">
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
            
            {/* Champion Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#C89B3C]">Champion Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-zinc-400 mb-1">Attack</div>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={`attack-${i}`} 
                        className={`w-2 h-6 mx-0.5 rounded-sm ${i < championData.info.attack ? 'bg-red-500' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-zinc-400 mb-1">Magic</div>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={`magic-${i}`} 
                        className={`w-2 h-6 mx-0.5 rounded-sm ${i < championData.info.magic ? 'bg-blue-500' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-zinc-400 mb-1">Defense</div>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={`defense-${i}`} 
                        className={`w-2 h-6 mx-0.5 rounded-sm ${i < championData.info.defense ? 'bg-green-500' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-zinc-400 mb-1">Difficulty</div>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={`difficulty-${i}`} 
                        className={`w-2 h-6 mx-0.5 rounded-sm ${i < championData.info.difficulty ? 'bg-purple-500' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lore Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 text-[#C89B3C]">Lore</h3>
              <p className="text-zinc-300 leading-relaxed">{championData.lore}</p>
            </div>
            
            {/* Abilities Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6 text-[#C89B3C]">Abilities</h3>
              
              {/* Passive */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-700">
                    <Image 
                      src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/passive/${championData.passive.image.full}`}
                      alt={championData.passive.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Passive</div>
                    <h4 className="text-lg font-bold">{championData.passive.name}</h4>
                  </div>
                </div>
                <div className="pl-20">
                  <p className="text-zinc-300">{formatDescription(championData.passive.description)}</p>
                </div>
              </div>
              
              {/* Active Abilities */}
              <div className="space-y-8">
                {championData.spells.map((spell, index) => {
                  const abilityColor = getAbilityColor(index);
                  const abilityKey = mapAbilityToKey(index);
                  
                  return (
                    <div key={spell.id}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-700">
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/spell/${spell.image.full}`}
                              alt={spell.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div 
                            className="absolute -top-2 -left-2 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: abilityColor.bg, color: abilityColor.text }}
                          >
                            {abilityKey}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-zinc-400 mb-1">Ability {index + 1}</div>
                          <h4 className="text-lg font-bold">{spell.name}</h4>
                        </div>
                      </div>
                      <div className="pl-20">
                        <p className="text-zinc-300 mb-4">{formatDescription(spell.description)}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                          {spell.cooldownBurn && (
                            <div className="bg-zinc-800/50 rounded p-2">
                              <div className="text-xs text-zinc-400 mb-1">Cooldown</div>
                              <div className="text-sm">{spell.cooldownBurn}s</div>
                            </div>
                          )}
                          
                          {spell.costBurn && (
                            <div className="bg-zinc-800/50 rounded p-2">
                              <div className="text-xs text-zinc-400 mb-1">Cost</div>
                              <div className="text-sm">{spell.costBurn} {championData.partype}</div>
                            </div>
                          )}
                          
                          {spell.rangeBurn && spell.rangeBurn !== "self" && (
                            <div className="bg-zinc-800/50 rounded p-2">
                              <div className="text-xs text-zinc-400 mb-1">Range</div>
                              <div className="text-sm">{spell.rangeBurn}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Item builds */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-white">Recommended Build</h2>
              
              {/* Starting items */}
              <div className="mb-6">
                <h3 className="text-zinc-300 font-semibold mb-3 text-sm uppercase tracking-wider">Starting Items</h3>
                <div className="flex gap-2 flex-wrap">
                  {championData.spells.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image.full}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {championData.info.difficulty.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.cost.join(" / ")}</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Core build */}
              <div className="mb-6">
                <h3 className="text-zinc-300 font-semibold mb-3 text-sm uppercase tracking-wider">Core Items</h3>
                <div className="flex gap-2 flex-wrap">
                  {championData.spells.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image.full}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {championData.info.difficulty.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.cost.join(" / ")}</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Boots */}
              <div className="mb-6">
                <h3 className="text-zinc-300 font-semibold mb-3 text-sm uppercase tracking-wider">Boots</h3>
                <div className="flex gap-2 flex-wrap">
                  {championData.spells.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image.full}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {championData.info.difficulty.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.cost.join(" / ")}</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Situational items */}
              <div>
                <h3 className="text-zinc-300 font-semibold mb-3 text-sm uppercase tracking-wider">Situational Items</h3>
                <div className="flex gap-2 flex-wrap">
                  {championData.spells.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image.full}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {championData.info.difficulty.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.cost.join(" / ")}</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar - right 1/3 */}
          <div className="space-y-8">
            {/* Rune builds */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Runes</h2>
                <div className="flex gap-2">
                  {championData.spells.map((build, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRuneBuild(index)}
                      className={`w-6 h-6 rounded-full ${
                        selectedRuneBuild === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      } flex items-center justify-center text-xs`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              {championData.spells[selectedRuneBuild] && (
                <div>
                  <div className="flex gap-2 items-start mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                      <Image
                        src={championData.spells[selectedRuneBuild].image.full}
                        alt={championData.spells[selectedRuneBuild].name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{championData.spells[selectedRuneBuild].name}</p>
                      <div className="flex gap-1 items-center text-sm text-zinc-400">
                        <span className="text-green-400">{championData.info.difficulty.toFixed(1)}% WR</span>
                        <span>•</span>
                        <span>{championData.info.difficulty.toFixed(1)}% PR</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary runes */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {championData.spells[selectedRuneBuild].cooldown.map((rune) => (
                        <div key={rune} className="relative group">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                            <Image
                              src={rune}
                              alt={rune}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-40 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-semibold">{rune}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                              <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Secondary path */}
                  <div className="mb-6">
                    <div className="flex gap-2 items-start mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                        <Image
                          src={championData.spells[selectedRuneBuild].image.full}
                          alt={championData.spells[selectedRuneBuild].name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <p className="text-white font-medium">{championData.spells[selectedRuneBuild].name}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {championData.spells[selectedRuneBuild].cooldown.map((rune) => (
                        <div key={rune} className="relative group">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                            <Image
                              src={rune}
                              alt={rune}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-40 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-semibold">{rune}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-green-400">Win: {championData.info.difficulty.toFixed(1)}%</span>
                              <span className="text-blue-400">Pick: {championData.info.difficulty.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Shards */}
                  <div>
                    <p className="text-zinc-300 font-semibold mb-2 text-sm">Shards</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-zinc-800 rounded-md p-2 text-center">
                        <p className="text-zinc-400 mb-1">Offense</p>
                        <p className="text-white">{championData.spells[selectedRuneBuild].cooldown.join(" / ")}</p>
                      </div>
                      <div className="bg-zinc-800 rounded-md p-2 text-center">
                        <p className="text-zinc-400 mb-1">Flex</p>
                        <p className="text-white">{championData.spells[selectedRuneBuild].cooldown.join(" / ")}</p>
                      </div>
                      <div className="bg-zinc-800 rounded-md p-2 text-center">
                        <p className="text-zinc-400 mb-1">Defense</p>
                        <p className="text-white">{championData.spells[selectedRuneBuild].cooldown.join(" / ")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Counters */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-white">Hard Counters</h2>
              <div className="space-y-4">
                {championData.spells.map((counter) => (
                  <Link 
                    href={`/champion/${counter.id}?role=${counter.tags[0]}`} 
                    key={counter.id}
                    className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-md hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                        <Image
                          src={counter.image.full}
                          alt={counter.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{counter.name}</p>
                        <p className="text-zinc-400 text-xs">{roleData[counter.tags[0]]?.label || counter.tags[0]}</p>
                      </div>
                    </div>
                    <div className="text-red-400 font-medium">{championData.info.difficulty.toFixed(1)}%</div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Synergies (only for ADC/Support) */}
            {championData.spells.map((synergyChamp) => (
              <div key={synergyChamp.id} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 text-white">
                  {championData.tags[0] === "BOTTOM" ? "Best Supports" : "Best ADCs"}
                </h2>
                <div className="space-y-4">
                  {championData.spells.map((synergyPartner) => (
                    <Link 
                      href={`/champion/${synergyPartner.id}?role=${synergyPartner.tags[0]}`} 
                      key={synergyPartner.id}
                      className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-md hover:bg-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                          <Image
                            src={synergyPartner.image.full}
                            alt={synergyPartner.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{synergyPartner.name}</p>
                          <p className="text-zinc-400 text-xs">{roleData[synergyPartner.tags[0]]?.label || synergyPartner.tags[0]}</p>
                        </div>
                      </div>
                      <div className="text-green-400 font-medium">{championData.info.difficulty.toFixed(1)}%</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Skill order */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Skill Order</h2>
                <button className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
                  <Info size={14} />
                  <span>Tips</span>
                </button>
              </div>
              
              <div className="mb-4">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((level) => (
                    <div key={level} className="w-full h-8 flex items-center justify-center text-xs text-zinc-400 bg-zinc-800/50 rounded">
                      {level}
                    </div>
                  ))}
                  
                  {championData.spells.map((skill, index) => {
                    const isHighlighted = 
                      (skill.id === 'R' && (index === 5 || index === 10 || index === 16)) || 
                      (skill.id === championData.spells[0].id && index !== 5 && index !== 10 && index !== 16);
                    
                    return (
                      <div 
                        key={`skill-${index}`} 
                        className={`w-full h-8 flex items-center justify-center text-xs rounded ${
                          isHighlighted 
                            ? 'bg-blue-600/50 text-white font-bold' 
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {skill.name}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-zinc-400 text-sm">
                <p>Max order: {champMaxOrder(championData.spells.map(skill => skill.id))}</p>
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

// Helper function to determine the max order from skill order
function champMaxOrder(skillOrder: string[]): string {
  const counts: Record<string, number> = {};
  
  skillOrder.forEach(skill => {
    if (skill !== 'R') { // Exclude ultimate from max order
      counts[skill] = (counts[skill] || 0) + 1;
    }
  });
  
  const maxSkills = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
  
  return maxSkills.join(' > ');
} 