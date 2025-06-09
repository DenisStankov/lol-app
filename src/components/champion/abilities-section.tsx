"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Clock, Droplet } from "lucide-react"

interface AbilitiesSectionProps {
  champion: any // We'll type this properly later
}

export default function AbilitiesSection({ champion }: AbilitiesSectionProps) {
  const [selectedAbility, setSelectedAbility] = useState<number>(0)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!champion?.abilities?.length) {
    return (
      <div className="space-y-12">
        <h2 className="text-3xl font-bold text-center text-slate-100">Champion Abilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-xl overflow-hidden bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold text-center text-slate-100">Champion Abilities</h2>

      {/* Abilities Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {champion.abilities.map((ability: any, index: number) => (
          <motion.div
            key={ability.id || index}
            variants={item}
            className={`relative group cursor-pointer rounded-xl overflow-hidden
                       border ${index === selectedAbility ? 'border-yellow-400/50' : 'border-slate-700/50'}
                       bg-slate-900/50 backdrop-blur-sm transition-all duration-300
                       hover:border-yellow-400/50 hover:bg-slate-900/70`}
            onClick={() => setSelectedAbility(index)}
          >
            {/* Ability Header */}
            <div className="relative aspect-video">
              <Image
                src={ability.iconUrl || "/placeholder.svg"}
                alt={ability.name || `Ability ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{ability.name || `Ability ${index + 1}`}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    {ability.cooldown && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {ability.cooldown}s
                      </span>
                    )}
                    {ability.cost && (
                      <span className="flex items-center">
                        <Droplet className="w-4 h-4 mr-1" />
                        {ability.cost}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/50">
                  {ability.keyBinding || ['Q', 'W', 'E', 'R'][index]}
                </div>
              </div>
            </div>

            {/* Ability Description */}
            <div className="p-4">
              <p className="text-sm text-slate-300 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                {ability.description || 'No description available'}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Skill Order */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center text-slate-100 mb-8">Recommended Skill Order</h3>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Skill Path */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700/30 -translate-y-1/2" />
            <div className="relative z-10 flex justify-between">
              {Array.from({ length: 18 }).map((_, index) => {
                const skillIndex = champion.skillOrder && index < champion.skillOrder.length ? champion.skillOrder[index] : null
                const ability = skillIndex !== null && champion.abilities ? champion.abilities[skillIndex] : null
                
                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="relative mb-2">
                      {ability ? (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-yellow-400/50 overflow-hidden">
                          <Image
                            src={ability.iconUrl || "/placeholder.svg"}
                            alt={ability.name || `Ability ${skillIndex + 1}`}
                            width={40}
                            height={40}
                            className="opacity-90"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/30" />
                      )}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-400">
                        {index + 1}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Skill Priority */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {champion.abilities && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Max First</h4>
                  <div className="flex items-center space-x-2">
                    {champion.abilities.slice(0, 1).map((ability: any) => (
                      <div key={ability.id || 'first'} className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={ability.iconUrl || "/placeholder.svg"}
                          alt={ability.name || 'First Ability'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Max Second</h4>
                  <div className="flex items-center space-x-2">
                    {champion.abilities.slice(1, 2).map((ability: any) => (
                      <div key={ability.id || 'second'} className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={ability.iconUrl || "/placeholder.svg"}
                          alt={ability.name || 'Second Ability'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Max Last</h4>
                  <div className="flex items-center space-x-2">
                    {champion.abilities.slice(2, 3).map((ability: any) => (
                      <div key={ability.id || 'last'} className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={ability.iconUrl || "/placeholder.svg"}
                          alt={ability.name || 'Last Ability'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 