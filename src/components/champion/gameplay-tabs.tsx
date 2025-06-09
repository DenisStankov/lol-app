"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sword, Shield, Sparkles } from "lucide-react"

interface GameplayTabsProps {
  champion: any // We'll type this properly later
}

export default function GameplayTabs({ champion }: GameplayTabsProps) {
  const [activeTab, setActiveTab] = useState("runes")

  // Loading state for runes
  const LoadingRunes = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
          <div className="h-6 w-32 bg-slate-700/50 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-slate-700/50 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Loading state for builds
  const LoadingBuilds = () => (
    <div className="space-y-8">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
          <div className="h-6 w-48 bg-slate-700/50 rounded mb-6 animate-pulse" />
          <div className="space-y-4 mb-8">
            <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse" />
            <div className="flex space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-lg bg-slate-700/50 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Loading state for matchups
  const LoadingMatchups = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
          <div className="h-6 w-32 bg-slate-700/50 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-700/50 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-600/50" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-slate-600/50 rounded mb-2" />
                  <div className="h-3 w-16 bg-slate-600/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-slate-100">Gameplay Guide</h2>

      <Tabs defaultValue="runes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 rounded-xl p-1">
          <TabsTrigger
            value="runes"
            className="flex items-center space-x-2 data-[state=active]:bg-yellow-400/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>Runes</span>
          </TabsTrigger>
          <TabsTrigger
            value="builds"
            className="flex items-center space-x-2 data-[state=active]:bg-yellow-400/10"
          >
            <Sword className="w-4 h-4" />
            <span>Build Paths</span>
          </TabsTrigger>
          <TabsTrigger
            value="matchups"
            className="flex items-center space-x-2 data-[state=active]:bg-yellow-400/10"
          >
            <Shield className="w-4 h-4" />
            <span>Matchups</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="runes" className="mt-6">
              {!champion?.runes ? <LoadingRunes /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Primary Runes */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Primary Path</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(champion.runes?.primary || []).map((rune: any, index: number) => (
                        <motion.div
                          key={rune.id || index}
                          className="relative aspect-square rounded-lg overflow-hidden 
                                   bg-slate-900/50 border border-slate-700/30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Image
                            src={rune.iconUrl || "/placeholder.svg"}
                            alt={rune.name || `Rune ${index + 1}`}
                            fill
                            className="object-cover p-2"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-medium text-slate-200 text-center">
                              {rune.name || `Rune ${index + 1}`}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Runes */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Secondary Path</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(champion.runes?.secondary || []).map((rune: any, index: number) => (
                        <motion.div
                          key={rune.id || index}
                          className="relative aspect-square rounded-lg overflow-hidden 
                                   bg-slate-900/50 border border-slate-700/30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Image
                            src={rune.iconUrl || "/placeholder.svg"}
                            alt={rune.name || `Secondary Rune ${index + 1}`}
                            fill
                            className="object-cover p-2"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-medium text-slate-200 text-center">
                              {rune.name || `Secondary Rune ${index + 1}`}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="builds" className="mt-6">
              {!champion?.recommendedBuilds ? <LoadingBuilds /> : (
                <div className="space-y-8">
                  {(champion.recommendedBuilds || []).map((build: any, buildIndex: number) => (
                    <motion.div
                      key={build.name || buildIndex}
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: buildIndex * 0.1 }}
                    >
                      <h3 className="text-xl font-semibold text-slate-100 mb-6">
                        {build.name || `Build ${buildIndex + 1}`}
                      </h3>

                      {/* Starter Items */}
                      <div className="space-y-4 mb-8">
                        <h4 className="text-lg font-medium text-slate-300">Starting Items</h4>
                        <div className="flex space-x-4">
                          {(build.starterItems || []).map((item: any, index: number) => (
                            <motion.div
                              key={item.id || index}
                              className="relative w-16 h-16 rounded-lg overflow-hidden 
                                       bg-slate-900/50 border border-slate-700/30"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Image
                                src={item.iconUrl || "/placeholder.svg"}
                                alt={item.name || `Item ${index + 1}`}
                                fill
                                className="object-cover p-2"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Core Build */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-slate-300">Core Build</h4>
                        <div className="flex items-center space-x-4">
                          {(build.coreItems || []).map((item: any, index: number) => (
                            <motion.div
                              key={item.id || index}
                              className="relative"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden 
                                            bg-slate-900/50 border border-slate-700/30">
                                <Image
                                  src={item.iconUrl || "/placeholder.svg"}
                                  alt={item.name || `Core Item ${index + 1}`}
                                  width={64}
                                  height={64}
                                  className="object-cover p-2"
                                />
                              </div>
                              {index < (build.coreItems?.length || 0) - 1 && (
                                <div className="absolute top-1/2 -right-4 w-4 h-px bg-slate-700" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matchups" className="mt-6">
              {!champion?.counters ? <LoadingMatchups /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strong Against */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Strong Against</h3>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {(champion.counters || [])
                          .filter((c: any) => c.type === "strong")
                          .map((counter: any, index: number) => (
                          <motion.div
                            key={counter.championId || index}
                            className="flex items-center space-x-4 p-3 rounded-lg 
                                     bg-slate-900/50 border border-slate-700/30"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={counter.championIconUrl || "/placeholder.svg"}
                                alt={counter.championName || `Champion ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-200">
                                {counter.championName || `Champion ${index + 1}`}
                              </h4>
                              <p className="text-sm text-slate-400">
                                Win Rate: {counter.winRate || '50'}%
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Weak Against */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Weak Against</h3>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {(champion.counters || [])
                          .filter((c: any) => c.type === "weak")
                          .map((counter: any, index: number) => (
                          <motion.div
                            key={counter.championId || index}
                            className="flex items-center space-x-4 p-3 rounded-lg 
                                     bg-slate-900/50 border border-slate-700/30"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={counter.championIconUrl || "/placeholder.svg"}
                                alt={counter.championName || `Champion ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-200">
                                {counter.championName || `Champion ${index + 1}`}
                              </h4>
                              <p className="text-sm text-slate-400">
                                Win Rate: {counter.winRate || '50'}%
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
} 