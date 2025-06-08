"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FrostedCard } from "@/components/ui/frosted-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ChampionDetailClientProps {
  champion: ChampionData
}

export default function ChampionDetailClient({ champion }: ChampionDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        className="relative min-h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${champion.imageURLs.splash})`,
          backgroundPosition: "center 20%"
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link 
                href="/champions" 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 text-sm transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Champions
              </Link>
            </div>

            {/* Champion Info */}
            <div className="flex items-end gap-6">
              {/* Champion Portrait */}
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20 shadow-xl">
                <Image 
                  src={champion.imageURLs.square} 
                  alt={champion.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Champion Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{champion.name}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {champion.title}
                  </Badge>
                </div>
                
                {/* Champion Tags */}
                <div className="flex items-center gap-2">
                  {champion.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Champion Stats Summary */}
              <div className="flex gap-4">
                {Object.entries(champion.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{value}</div>
                    <div className="text-xs text-slate-400">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="abilities">Abilities</TabsTrigger>
            <TabsTrigger value="builds">Builds</TabsTrigger>
            <TabsTrigger value="matchups">Matchups</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Role Performance */}
              <FrostedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Role Performance</h3>
                {Object.entries(champion.roles).map(([role, stats]) => (
                  <div key={role} className="flex items-center justify-between mb-3 last:mb-0">
                    <span className="text-slate-300">{role}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-blue-400">{stats.winRate}%</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-400">{stats.pickRate}% PR</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        stats.tier === "S+" ? "bg-red-500/20 text-red-400" :
                        stats.tier === "S" ? "bg-orange-500/20 text-orange-400" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                        {stats.tier}
                      </div>
                    </div>
                  </div>
                ))}
              </FrostedCard>

              {/* Difficulty Breakdown */}
              <FrostedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Champion Mastery</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">Mechanical</span>
                      <span className="text-blue-400">{champion.difficulty.mechanical}/10</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${champion.difficulty.mechanical * 10}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">Teamfight</span>
                      <span className="text-blue-400">{champion.difficulty.teamfight}/10</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${champion.difficulty.teamfight * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </FrostedCard>

              {/* Quick Stats */}
              <FrostedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{champion.stats.winRate}%</div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{champion.stats.pickRate}%</div>
                    <div className="text-sm text-slate-400">Pick Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{champion.stats.banRate}%</div>
                    <div className="text-sm text-slate-400">Ban Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{champion.stats.matches}k</div>
                    <div className="text-sm text-slate-400">Matches</div>
                  </div>
                </div>
              </FrostedCard>
            </div>
          </TabsContent>

          {/* Abilities Tab */}
          <TabsContent value="abilities" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {champion.abilities.map((ability) => (
                <FrostedCard key={ability.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                      <Image
                        src={ability.iconUrl}
                        alt={ability.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{ability.name}</h3>
                        <Badge variant="secondary">{ability.keyBinding}</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{ability.description}</p>
                      {ability.cost && (
                        <div className="mt-2 text-sm">
                          <span className="text-blue-400">Cost:</span>
                          <span className="text-slate-300 ml-1">{ability.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </FrostedCard>
              ))}
            </div>
          </TabsContent>

          {/* Add other tab contents similarly */}
        </Tabs>
      </div>
    </div>
  )
} 