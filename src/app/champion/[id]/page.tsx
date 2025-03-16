"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ArrowLeft, Info } from "lucide-react"
import Navigation from "@/components/navigation"

interface ChampionDetails {
  id: string
  name: string
  title: string
  lore: string
  image: string
  splash: string
  loading: string
  role: string
  damageType: 'AP' | 'AD' | 'Hybrid'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  range: 'Melee' | 'Ranged'
  winRate: number
  pickRate: number
  banRate: number
  abilities: Array<{
    id: string
    name: string
    description: string
    image: string
    cooldown: number[]
    cost: number[]
    range: number[]
    key: string
  }>
  itemBuilds: {
    startingItems: Array<{
      id: string
      name: string
      description: string
      image: string
      gold: number
      winRate: number
      pickRate: number
    }>
    coreItems: Array<{
      id: string
      name: string
      description: string
      image: string
      gold: number
      winRate: number
      pickRate: number
    }>
    boots: Array<{
      id: string
      name: string
      description: string
      image: string
      gold: number
      winRate: number
      pickRate: number
    }>
    situationalItems: Array<{
      id: string
      name: string
      description: string
      image: string
      gold: number
      winRate: number
      pickRate: number
    }>
  }
  runeBuilds: Array<{
    primaryPath: {
      id: string
      name: string
      image: string
      runes: Array<{
        id: string
        name: string
        image: string
        winRate: number
        pickRate: number
      }>
    }
    secondaryPath: {
      id: string
      name: string
      image: string
      runes: Array<{
        id: string
        name: string
        image: string
        winRate: number
        pickRate: number
      }>
    }
    shards: {
      offense: string
      flex: string
      defense: string
    }
    winRate: number
    pickRate: number
  }>
  counters: Array<{
    id: string
    name: string
    image: string
    winRate: number
    role: string
  }>
  synergies?: Array<{
    id: string
    name: string
    image: string
    winRate: number
    role: string
  }>
  skillOrder: string[]
  tips: {
    allies: string[]
    enemies: string[]
  }
}

// Define role data for display
const roleData: Record<string, { label: string; color: string }> = {
  "TOP": { label: "TOP", color: "#FF9500" },
  "JUNGLE": { label: "JNG", color: "#19B326" },
  "MIDDLE": { label: "MID", color: "#4F8EFF" },
  "BOTTOM": { label: "BOT", color: "#FF4E50" },
  "UTILITY": { label: "SUP", color: "#CC66FF" }
}

export default function ChampionPage() {
  // Get params from useParams hook instead of props
  const params = useParams()
  const champId = params?.id as string
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'MIDDLE'
  const [championData, setChampionData] = useState<ChampionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAbility, setSelectedAbility] = useState<string>("passive")
  const [selectedRuneBuild, setSelectedRuneBuild] = useState<number>(0)
  
  useEffect(() => {
    async function fetchChampionData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/champion-details?id=${champId}&role=${role}`)
        
        if (!response.ok) {
          throw new Error(`Error fetching champion data: ${response.status}`)
        }
        
        const data = await response.json()
        setChampionData(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching champion data:', err)
        setError('Failed to load champion data. Please try again later.')
        setLoading(false)
      }
    }
    
    if (champId) {
      fetchChampionData()
    }
  }, [champId, role])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-xl">Loading champion data...</p>
        </div>
      </div>
    )
  }
  
  if (error || !championData) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <Navigation />
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 text-red-300 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Champion</h2>
            <p className="mb-4">{error || "Failed to load champion data"}</p>
            <Link href="/tier-list" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Tier List
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const currentAbility = championData.abilities.find(ability => ability.id === selectedAbility) || championData.abilities[0]
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      
      {/* Champion header with splash image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 z-10"></div>
        <Image 
          src={championData.splash} 
          alt={championData.name} 
          fill 
          className="object-cover object-center" 
          priority
        />
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 z-20">
          <div className="container mx-auto">
            <Link href="/tier-list" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors">
              <ChevronLeft size={20} />
              <span>Back to Tier List</span>
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="text-white py-1 px-3 rounded-md text-sm font-semibold" 
                style={{ backgroundColor: `${roleData[championData.role]?.color || '#FFFFFF'}40` }}
              >
                {roleData[championData.role]?.label || championData.role}
              </div>
              <div className="text-white py-1 px-3 bg-zinc-800/60 rounded-md text-sm">
                {championData.damageType} • {championData.range}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{championData.name}</h1>
            <p className="text-lg md:text-xl text-zinc-300">{championData.title}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Champion stats summary */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-white">Champion Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/60 rounded-md p-3 text-center">
                  <p className="text-zinc-400 text-sm">Win Rate</p>
                  <p className={`text-xl font-bold ${championData.winRate >= 51.5 ? 'text-green-400' : championData.winRate < 49 ? 'text-red-400' : 'text-white'}`}>
                    {championData.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-zinc-800/60 rounded-md p-3 text-center">
                  <p className="text-zinc-400 text-sm">Pick Rate</p>
                  <p className="text-xl font-bold text-white">{championData.pickRate.toFixed(1)}%</p>
                </div>
                <div className="bg-zinc-800/60 rounded-md p-3 text-center">
                  <p className="text-zinc-400 text-sm">Ban Rate</p>
                  <p className="text-xl font-bold text-white">{championData.banRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            {/* Abilities */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-white">Abilities</h2>
              
              {/* Ability selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {championData.abilities.map((ability) => (
                  <button
                    key={ability.id}
                    onClick={() => setSelectedAbility(ability.id)}
                    className={`relative w-14 h-14 rounded-md border-2 flex-shrink-0 overflow-hidden ${
                      selectedAbility === ability.id 
                        ? 'border-blue-500' 
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <Image
                      src={ability.image}
                      alt={ability.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs text-center py-0.5">
                      {ability.key}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Ability details */}
              {currentAbility && (
                <div className="bg-zinc-800/60 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{currentAbility.name}</h3>
                  <div className="text-zinc-300 mb-4" dangerouslySetInnerHTML={{ __html: currentAbility.description }} />
                  
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-zinc-400">Cooldown</p>
                      <p className="text-white">{currentAbility.cooldown.join(" / ")}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Cost</p>
                      <p className="text-white">{currentAbility.cost.join(" / ")}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Range</p>
                      <p className="text-white">{Array.isArray(currentAbility.range) && currentAbility.range.length > 0 ? currentAbility.range[0] : "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Item builds */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-white">Recommended Build</h2>
              
              {/* Starting items */}
              <div className="mb-6">
                <h3 className="text-zinc-300 font-semibold mb-3 text-sm uppercase tracking-wider">Starting Items</h3>
                <div className="flex gap-2 flex-wrap">
                  {championData.itemBuilds.startingItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {item.winRate.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.gold} gold</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {item.winRate.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {item.pickRate.toFixed(1)}%</span>
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
                  {championData.itemBuilds.coreItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {item.winRate.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.gold} gold</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {item.winRate.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {item.pickRate.toFixed(1)}%</span>
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
                  {championData.itemBuilds.boots.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {item.winRate.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.gold} gold</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {item.winRate.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {item.pickRate.toFixed(1)}%</span>
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
                  {championData.itemBuilds.situationalItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden border border-zinc-700">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-900/80 text-green-300 text-[10px] px-1 rounded">
                        {item.winRate.toFixed(1)}%
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.description}</p>
                        <div className="text-amber-400 text-xs mt-1">Cost: {item.gold} gold</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-400">Win: {item.winRate.toFixed(1)}%</span>
                          <span className="text-blue-400">Pick: {item.pickRate.toFixed(1)}%</span>
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
                  {championData.runeBuilds.map((build, index) => (
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
              
              {championData.runeBuilds[selectedRuneBuild] && (
                <div>
                  <div className="flex gap-2 items-start mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                      <Image
                        src={championData.runeBuilds[selectedRuneBuild].primaryPath.image}
                        alt={championData.runeBuilds[selectedRuneBuild].primaryPath.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{championData.runeBuilds[selectedRuneBuild].primaryPath.name}</p>
                      <div className="flex gap-1 items-center text-sm text-zinc-400">
                        <span className="text-green-400">{championData.runeBuilds[selectedRuneBuild].winRate.toFixed(1)}% WR</span>
                        <span>•</span>
                        <span>{championData.runeBuilds[selectedRuneBuild].pickRate.toFixed(1)}% PR</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary runes */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {championData.runeBuilds[selectedRuneBuild].primaryPath.runes.map((rune) => (
                        <div key={rune.id} className="relative group">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                            <Image
                              src={rune.image}
                              alt={rune.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-40 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-semibold">{rune.name}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-green-400">Win: {rune.winRate.toFixed(1)}%</span>
                              <span className="text-blue-400">Pick: {rune.pickRate.toFixed(1)}%</span>
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
                          src={championData.runeBuilds[selectedRuneBuild].secondaryPath.image}
                          alt={championData.runeBuilds[selectedRuneBuild].secondaryPath.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <p className="text-white font-medium">{championData.runeBuilds[selectedRuneBuild].secondaryPath.name}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {championData.runeBuilds[selectedRuneBuild].secondaryPath.runes.map((rune) => (
                        <div key={rune.id} className="relative group">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                            <Image
                              src={rune.image}
                              alt={rune.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-40 bg-zinc-800 border border-zinc-700 rounded-md p-2 z-30 text-white text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-semibold">{rune.name}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-green-400">Win: {rune.winRate.toFixed(1)}%</span>
                              <span className="text-blue-400">Pick: {rune.pickRate.toFixed(1)}%</span>
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
                        <p className="text-white">{championData.runeBuilds[selectedRuneBuild].shards.offense}</p>
                      </div>
                      <div className="bg-zinc-800 rounded-md p-2 text-center">
                        <p className="text-zinc-400 mb-1">Flex</p>
                        <p className="text-white">{championData.runeBuilds[selectedRuneBuild].shards.flex}</p>
                      </div>
                      <div className="bg-zinc-800 rounded-md p-2 text-center">
                        <p className="text-zinc-400 mb-1">Defense</p>
                        <p className="text-white">{championData.runeBuilds[selectedRuneBuild].shards.defense}</p>
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
                {championData.counters.map((counter) => (
                  <Link 
                    href={`/champion/${counter.id}?role=${counter.role}`} 
                    key={counter.id}
                    className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-md hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                        <Image
                          src={counter.image}
                          alt={counter.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{counter.name}</p>
                        <p className="text-zinc-400 text-xs">{roleData[counter.role]?.label || counter.role}</p>
                      </div>
                    </div>
                    <div className="text-red-400 font-medium">{counter.winRate.toFixed(1)}%</div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Synergies (only for ADC/Support) */}
            {championData.synergies && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 text-white">
                  {championData.role === "BOTTOM" ? "Best Supports" : "Best ADCs"}
                </h2>
                <div className="space-y-4">
                  {championData.synergies.map((synergy) => (
                    <Link 
                      href={`/champion/${synergy.id}?role=${synergy.role}`} 
                      key={synergy.id}
                      className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-md hover:bg-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                          <Image
                            src={synergy.image}
                            alt={synergy.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{synergy.name}</p>
                          <p className="text-zinc-400 text-xs">{roleData[synergy.role]?.label || synergy.role}</p>
                        </div>
                      </div>
                      <div className="text-green-400 font-medium">{synergy.winRate.toFixed(1)}%</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
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
                  
                  {championData.skillOrder.map((skill, index) => {
                    const isHighlighted = 
                      (skill === 'R' && (index === 5 || index === 10 || index === 16)) || 
                      (skill === championData.skillOrder[0] && index !== 5 && index !== 10 && index !== 16);
                    
                    return (
                      <div 
                        key={`skill-${index}`} 
                        className={`w-full h-8 flex items-center justify-center text-xs rounded ${
                          isHighlighted 
                            ? 'bg-blue-600/50 text-white font-bold' 
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {skill}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-zinc-400 text-sm">
                <p>Max order: {champMaxOrder(championData.skillOrder)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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