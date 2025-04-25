"use client"

import { useState, useEffect, Fragment } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Sword, Heart, Zap, Activity, Layers } from "lucide-react"
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

export default function ChampionDetailsPage() {
  const params = useParams()
  const champId = params?.id as string
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  const [metaData, setMetaData] = useState<ChampionMetaData | null>(null)
  
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#C89B3C]">Runes</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedRuneBuild(num - 1)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
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

              <div className="flex gap-4">
                {/* Primary Path */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-4 h-4 rounded-full overflow-hidden bg-amber-600/50">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${metaData?.roleSpecificData?.runes?.primary?.name === 'Precision' ? '7201_Precision.png' : 
                          metaData?.roleSpecificData?.runes?.primary?.name === 'Domination' ? '7200_Domination.png' :
                          metaData?.roleSpecificData?.runes?.primary?.name === 'Sorcery' ? '7202_Sorcery.png' :
                          metaData?.roleSpecificData?.runes?.primary?.name === 'Resolve' ? '7204_Resolve.png' :
                          metaData?.roleSpecificData?.runes?.primary?.name === 'Inspiration' ? '7203_Whimsy.png' :
                          '7201_Precision.png'}`}
                        alt={metaData?.roleSpecificData?.runes?.primary?.name || "Precision"}
                        fill
                        className="object-cover scale-75"
                      />
                    </div>
                    <div className="text-xs text-amber-300 font-semibold">{metaData?.roleSpecificData?.runes?.primary?.name || "PRECISION"}</div>
                  </div>

                  {/* Keystone Row */}
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png"
                    ].map((iconSrc, i) => (
                      <div key={`keystone-${i}`} className={`relative aspect-square rounded-full ${
                        // Highlight the keystone that matches the meta data
                        (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Conqueror' && i === 0) ||
                        (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Press the Attack' && i === 1) ||
                        (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Lethal Tempo' && i === 2) ||
                        (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Fleet Footwork' && i === 3) ||
                        (!metaData && i === 0)
                        ? 'bg-gradient-to-br from-amber-500/40 to-amber-700/40 border border-amber-500/50' : 'bg-zinc-800/70'
                      } flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${
                            // Dim the ones that don't match
                            (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Conqueror' && i === 0) ||
                            (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Press the Attack' && i === 1) ||
                            (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Lethal Tempo' && i === 2) ||
                            (metaData?.roleSpecificData?.runes?.primary?.keystone === 'Fleet Footwork' && i === 3) ||
                            (!metaData && i === 0)
                            ? '' : 'opacity-40'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Overheal.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Triumph.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png"
                    ].map((iconSrc, i) => (
                      <div key={`row1-${i}`} className={`relative aspect-square rounded-full ${i === 1 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70'} flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Row 1 Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${i !== 1 ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendTenacity/LegendTenacity.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png"
                    ].map((iconSrc, i) => (
                      <div key={`row2-${i}`} className={`relative aspect-square rounded-full ${i === 0 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70'} flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Row 2 Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${i !== 0 ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CutDown/CutDown.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LastStand/LastStand.png"
                    ].map((iconSrc, i) => (
                      <div key={`row3-${i}`} className={`relative aspect-square rounded-full ${i === 2 ? 'bg-amber-500/30 border border-amber-500/60' : 'bg-zinc-800/70'} flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Row 3 Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${i !== 2 ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Path + Shards */}
                <div className="flex-1">
                  {/* Secondary Path Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-4 h-4 rounded-full overflow-hidden bg-green-600/50">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${metaData?.roleSpecificData?.runes?.secondary?.name === 'Precision' ? '7201_Precision.png' : 
                          metaData?.roleSpecificData?.runes?.secondary?.name === 'Domination' ? '7200_Domination.png' :
                          metaData?.roleSpecificData?.runes?.secondary?.name === 'Sorcery' ? '7202_Sorcery.png' :
                          metaData?.roleSpecificData?.runes?.secondary?.name === 'Resolve' ? '7204_Resolve.png' :
                          metaData?.roleSpecificData?.runes?.secondary?.name === 'Inspiration' ? '7203_Whimsy.png' :
                          '7204_Resolve.png'}`}
                        alt={metaData?.roleSpecificData?.runes?.secondary?.name || "Resolve"}
                        fill
                        className="object-cover scale-75"
                      />
                    </div>
                    <div className="text-xs text-green-300 font-semibold">{metaData?.roleSpecificData?.runes?.secondary?.name || "RESOLVE"}</div>
                  </div>
                  
                  {/* Secondary Row 1 */}
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/SecondWind/SecondWind.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/BonePlating/BonePlating.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Conditioning/Conditioning.png"
                    ].map((iconSrc, i) => (
                      <div key={`sec-row1-${i}`} className={`relative aspect-square rounded-full ${i === 0 ? 'bg-green-500/30 border border-green-500/60' : 'bg-zinc-800/70'} flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Secondary Row 1 Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${i !== 0 ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Secondary Row 2 */}
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {[
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Overgrowth/Overgrowth.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Revitalize/Revitalize.png",
                      "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Unflinching/Unflinching.png"
                    ].map((iconSrc, i) => (
                      <div key={`sec-row2-${i}`} className={`relative aspect-square rounded-full ${i === 2 ? 'bg-green-500/30 border border-green-500/60' : 'bg-zinc-800/70'} flex items-center justify-center overflow-hidden`}>
                        <Image 
                          src={iconSrc}
                          alt={`Secondary Row 2 Rune ${i}`}
                          fill
                          className={`object-cover p-1 ${i !== 2 ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Shards */}
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="text-xs text-blue-300 font-semibold">SHARDS</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="flex items-center gap-1 bg-zinc-800/50 rounded px-1 py-0.5">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden bg-red-500/20 border border-red-500/40">
                          <Image 
                            src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsAdaptiveForceIcon.png"
                            alt="Adaptive Force"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="truncate">Adaptive</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-zinc-800/50 rounded px-1 py-0.5">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden bg-blue-500/20 border border-blue-500/40">
                          <Image 
                            src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsArmorIcon.png"
                            alt="Armor"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="truncate">Armor</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-zinc-800/50 rounded px-1 py-0.5">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden bg-green-500/20 border border-green-500/40">
                          <Image 
                            src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsHealthScalingIcon.png"
                            alt="Health"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="truncate">Health</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rune Stats at Bottom */}
              <div className="flex items-center mt-3 pt-2 border-t border-zinc-800/50">
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-amber-500/40 to-amber-700/40 border border-amber-500/50">
                    <Image 
                      src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png"
                      alt={metaData?.roleSpecificData?.runes?.primary?.keystone || "Conqueror"}
                      fill
                      className="object-cover p-1"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-medium">{metaData?.roleSpecificData?.runes?.primary?.keystone || "Conqueror"}</p>
                    <div className="flex gap-2 items-center text-xs">
                      <span className="text-green-400">{metaData?.winRate || "54.2%"}</span>
                      <span className="text-zinc-500 text-[10px]">•</span>
                      <span className="text-blue-400">{metaData?.pickRate || "92.7%"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-zinc-500 flex gap-1">
                  <span className="rounded px-1 bg-green-900/20 text-green-400">Win</span>
                  <span className="rounded px-1 bg-blue-900/20 text-blue-400">Pick</span>
                </div>
              </div>
            </div>

            {/* Build Section - NEW */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#C89B3C]">Recommended Build</h3>
                <div className="text-zinc-400 text-xs">{metaData?.winRate || "59.1% Win Rate"}</div>
              </div>
              
              {/* Starter Items */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <h4 className="text-sm font-semibold text-zinc-300">Starter Items</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(metaData?.roleSpecificData?.build?.starter || [
                    { name: "Doran's Blade", cost: 450, image: "1055.png" },
                    { name: "Health Potion", cost: 50, image: "2003.png" }
                  ]).map((item: ItemData) => (
                    <div key={item.name} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 border border-zinc-700 rounded-md overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${item.image}`}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-1 text-center">
                        <div className="text-xs text-zinc-400">{item.cost}g</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Core Items */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full mr-2"></div>
                  <h4 className="text-sm font-semibold text-zinc-300">Core Build</h4>
                </div>
                <div className="flex gap-2 flex-wrap mb-1">
                  {(metaData?.roleSpecificData?.build?.core || [
                    { name: "Kraken Slayer", cost: 3400, image: "6672.png", order: 1 },
                    { name: "Runaan's Hurricane", cost: 2600, image: "3085.png", order: 2 },
                    { name: "Infinity Edge", cost: 3400, image: "3031.png", order: 3 }
                  ]).map((item: ItemData, index: number) => (
                    <div key={item.name} className="relative flex flex-col items-center">
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{item.order || index + 1}</div>
                      <div className="relative w-14 h-14 border border-amber-700/50 rounded-md overflow-hidden bg-gradient-to-br from-amber-950/30 to-zinc-900 flex items-center justify-center">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${item.image}`}
                          alt={item.name}
                          width={45}
                          height={45}
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-1 text-center">
                        <div className="text-xs text-zinc-400">{item.cost}g</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Total: {(metaData?.roleSpecificData?.build?.core || []).reduce((acc: number, item: ItemData) => acc + (item.cost || 0), 0).toLocaleString()}g
                </div>
              </div>
              
              {/* Situational Items */}
              <div className="mb-2">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full mr-2"></div>
                  <h4 className="text-sm font-semibold text-zinc-300">Situational Items</h4>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {(metaData?.roleSpecificData?.build?.situational || [
                    { name: "Bloodthirster", image: "3072.png", condition: "vs Burst" },
                    { name: "Lord Dominik's", image: "3036.png", condition: "vs Tanks" },
                    { name: "Guardian Angel", image: "3026.png", condition: "Safety" },
                    { name: "Mortal Reminder", image: "3033.png", condition: "vs Healing" },
                    { name: "Mercurial Scimitar", image: "3139.png", condition: "vs CC" }
                  ]).map((item: ItemData) => (
                    <div key={item.name} className="flex flex-col items-center">
                      <div className="relative w-12 h-12 border border-zinc-700 rounded-md overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${item.image}`}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-1 text-center">
                        <div className="text-[10px] text-zinc-500">{item.condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Boots Options */}
              <div className="pt-3 border-t border-zinc-800/50 mt-4">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-green-500 rounded-full mr-2"></div>
                  <h4 className="text-sm font-semibold text-zinc-300">Boots</h4>
                </div>
                <div className="flex gap-4">
                  {(metaData?.roleSpecificData?.build?.boots || [
                    { name: "Berserker's Greaves", image: "3006.png", pickRate: "89.7%" }
                  ]).map((boot: BootData) => (
                    <div key={boot.name} className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-md flex-1">
                      <div className="relative w-10 h-10 border border-green-700/30 rounded-md overflow-hidden bg-gradient-to-br from-green-950/20 to-zinc-900 flex items-center justify-center">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${boot.image}`}
                          alt={boot.name}
                          width={32}
                          height={32}
                          className="object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-300">{boot.name}</div>
                        <div className="text-[10px] text-zinc-500">Attack Speed</div>
                      </div>
                      <div className="ml-auto text-green-400 text-xs font-medium">{boot.pickRate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hard Counters Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-3 text-[#C89B3C]">Hard Counters</h3>
              <div className="space-y-2">
                {(metaData?.roleSpecificData?.counters || [
                  { name: 'Jax', winRate: '54.8%', image: 'Jax.png' },
                  { name: 'Fiora', winRate: '53.2%', image: 'Fiora.png' },
                  { name: 'Malphite', winRate: '52.6%', image: 'Malphite.png' },
                  { name: 'Irelia', winRate: '51.4%', image: 'Irelia.png' }
                ]).map((counter: CounterData) => (
                  <div 
                    key={counter.name}
                    className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-md hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-red-400/30">
                        <Image 
                          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${counter.image}`}
                          alt={counter.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{counter.name}</p>
                        <p className="text-zinc-400 text-xs">Counter</p>
                      </div>
                    </div>
                    <div className="text-red-400 font-medium text-sm">{counter.winRate}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Order Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#C89B3C]">Skill Order</h3>
                <div className="text-zinc-400 text-xs">{metaData?.winRate || "54.2% Win Rate"}</div>
              </div>
              
              {/* Skill Max Priority */}
              <div className="flex items-center gap-3 mb-4 bg-zinc-800/30 p-3 rounded-lg">
                <div className="text-sm font-medium text-zinc-400">Max Priority:</div>
                <div className="flex items-center gap-2">
                  {(metaData?.roleSpecificData?.skillOrder?.maxPriority || ['Q', 'W', 'E']).map((skill: string, index: number) => (
                    <Fragment key={skill}>
                      <div className={`w-8 h-8 rounded ${
                        skill === 'Q' ? 'bg-blue-500' : 
                        skill === 'W' ? 'bg-green-500' :
                        skill === 'E' ? 'bg-amber-500' :
                        skill === 'R' ? 'bg-red-500' : 'bg-zinc-500'
                      } text-white flex items-center justify-center font-bold`}>{skill}</div>
                      {index < (metaData?.roleSpecificData?.skillOrder?.maxPriority?.length || 3) - 1 && <span className="text-xl text-zinc-600">→</span>}
                    </Fragment>
                  ))}
                </div>
                <div className="ml-auto text-sm font-medium text-zinc-300">(Always max R when possible)</div>
              </div>
              
              {/* Skill Leveling Table */}
              <div className="mb-4 overflow-x-auto">
                <div className="inline-grid grid-cols-19 gap-x-0 min-w-full">
                  {/* Level Headers */}
                  <div className="text-center text-xs font-medium bg-zinc-800/50 p-1 rounded-tl-md">Lvl</div>
                  {[...Array(18)].map((_, i) => (
                    <div key={`level-${i+1}`} className={`text-center text-xs font-medium bg-zinc-800/50 p-1 ${i === 17 ? 'rounded-tr-md' : ''}`}>{i + 1}</div>
                  ))}
                  
                  {/* Skill Q */}
                  <div className="text-center text-xs font-medium bg-blue-500/20 p-1 flex items-center justify-center">
                    <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">Q</div>
                  </div>
                  {[1, 3, 5, 7, 9].includes(1) && <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">1</div>}
                  {[1, 3, 5, 7, 9].includes(2) && <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">2</div>}
                  {[1, 3, 5, 7, 9].includes(3) && <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">3</div>}
                  {[1, 3, 5, 7, 9].includes(4) && <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">4</div>}
                  {[1, 3, 5, 7, 9].includes(5) && <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">5</div>}
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-blue-500 text-white text-xs font-medium p-1 text-center">9</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  
                  {/* Skill W */}
                  <div className="text-center text-xs font-medium bg-green-500/20 p-1 flex items-center justify-center">
                    <div className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold">W</div>
                  </div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-green-500 text-white text-xs font-medium p-1 text-center">2</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-green-500 text-white text-xs font-medium p-1 text-center">4</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-green-500 text-white text-xs font-medium p-1 text-center">8</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-green-500 text-white text-xs font-medium p-1 text-center">12</div>
                  <div className="bg-green-500 text-white text-xs font-medium p-1 text-center">13</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  
                  {/* Skill E */}
                  <div className="text-center text-xs font-medium bg-amber-500/20 p-1 flex items-center justify-center">
                    <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center text-xs font-bold">E</div>
                  </div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-amber-500 text-white text-xs font-medium p-1 text-center">10</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-amber-500 text-white text-xs font-medium p-1 text-center">14</div>
                  <div className="bg-amber-500 text-white text-xs font-medium p-1 text-center">15</div>
                  <div className="bg-amber-500 text-white text-xs font-medium p-1 text-center">16</div>
                  <div className="bg-amber-500 text-white text-xs font-medium p-1 text-center">17</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  
                  {/* Skill R */}
                  <div className="text-center text-xs font-medium bg-red-500/20 p-1 rounded-bl-md flex items-center justify-center">
                    <div className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center text-xs font-bold">R</div>
                  </div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-red-500 text-white text-xs font-medium p-1 text-center">6</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-red-500 text-white text-xs font-medium p-1 text-center">11</div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-zinc-800/30 p-1"></div>
                  <div className="bg-red-500 text-white text-xs font-medium p-1 text-center rounded-br-md">18</div>
                </div>
              </div>
              
              {/* Ability Quick Reference */}
              <div className="bg-zinc-800/30 rounded-md p-2">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[
                    { key: 'Q', color: '#1E88E5', name: championData.spells[0]?.name || 'First Ability' },
                    { key: 'W', color: '#43A047', name: championData.spells[1]?.name || 'Second Ability' },
                    { key: 'E', color: '#FB8C00', name: championData.spells[2]?.name || 'Third Ability' },
                    { key: 'R', color: '#E53935', name: championData.spells[3]?.name || 'Ultimate' }
                  ].map((ability) => (
                    <div key={ability.key} className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-white text-xs font-bold"
                        style={{ backgroundColor: ability.color }}
                      >
                        {ability.key}
                      </div>
                      <div className="text-zinc-300 text-xs truncate">
                        {ability.name}
                      </div>
                    </div>
                  ))}
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
              
              {/* Ability Quick Summary */}
              <div className="flex items-center justify-center mb-6 bg-zinc-800/50 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-zinc-300">P</span>
                  </div>
                  <div className="text-zinc-500 font-bold">→</div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Q</span>
                  </div>
                  <div className="text-zinc-500 font-bold">→</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">W</span>
                  </div>
                  <div className="text-zinc-500 font-bold">→</div>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">E</span>
                  </div>
                  <div className="text-zinc-500 font-bold">→</div>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">R</span>
                  </div>
                </div>
              </div>
              
              {/* Passive */}
              <div className="mb-8">
                <div className="border-l-4 border-zinc-600 pl-2 mb-4">
                  <h4 className="text-lg font-bold text-zinc-300">Passive Ability</h4>
                </div>
                <div className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-lg transition-transform hover:scale-[1.01]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-zinc-700 flex items-center justify-center bg-black/20">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/passive/${championData.passive.image.full}`}
                        alt={championData.passive.name}
                        width={60}
                        height={60}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-zinc-300">P</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Passive</div>
                    <h4 className="text-xl font-bold">{championData.passive.name}</h4>
                    <p className="text-zinc-300 mt-2">{formatDescription(championData.passive.description)}</p>
                  </div>
                </div>
              </div>
              
              {/* Active Abilities */}
              <div className="space-y-6">
                <div className="border-l-4 border-[#C89B3C] pl-2 mb-4">
                  <h4 className="text-lg font-bold text-zinc-300">Active Abilities</h4>
                </div>
                
                {championData.spells.map((spell, index) => {
                  const abilityColor = getAbilityColor(index);
                  const abilityKey = mapAbilityToKey(index);
                  
                  return (
                    <div key={spell.id} className="p-4 bg-zinc-800/30 rounded-lg transition-transform hover:scale-[1.01]">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-zinc-700 flex items-center justify-center bg-black/20">
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/spell/${spell.image.full}`}
                              alt={spell.name}
                              width={60}
                              height={60}
                              className="object-cover"
                            />
                          </div>
                          <div 
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2"
                            style={{ backgroundColor: abilityColor.bg, borderColor: `${abilityColor.bg}80` }}
                          >
                            <span className="text-sm font-bold" style={{ color: abilityColor.text }}>{abilityKey}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-sm text-zinc-400">Ability {index + 1}</div>
                            <div className="text-xs text-zinc-500 bg-zinc-800/70 px-2 py-0.5 rounded">Max this {index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : "4th"}</div>
                          </div>
                          <h4 className="text-xl font-bold">{spell.name}</h4>
                          <p className="text-zinc-300 mt-2">{formatDescription(spell.description)}</p>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {spell.cooldownBurn && (
                              <div className="bg-zinc-800/70 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  Cooldown
                                </div>
                                <div className="text-sm text-white font-medium">{spell.cooldownBurn}s</div>
                              </div>
                            )}
                            
                            {spell.costBurn && (
                              <div className="bg-zinc-800/70 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7" />
                                    <path d="M15 7h6v6" />
                                  </svg>
                                  Cost
                                </div>
                                <div className="text-sm text-white font-medium">{spell.costBurn} {championData.partype}</div>
                              </div>
                            )}
                            
                            {spell.rangeBurn && spell.rangeBurn !== "self" && (
                              <div className="bg-zinc-800/70 rounded p-2">
                                <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <polyline points="19 12 12 19 5 12"></polyline>
                                  </svg>
                                  Range
                                </div>
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