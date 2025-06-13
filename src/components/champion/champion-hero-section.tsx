"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Sword, Shield, Wand2, Brain, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChampionHeroSectionProps {
  champion: any // We'll type this properly later
}

const roleIcons = {
  Fighter: Sword,
  Tank: Shield,
  Mage: Wand2,
  Assassin: Sword,
  Marksman: Sword,
  Support: Sparkles,
}

export default function ChampionHeroSection({ champion }: ChampionHeroSectionProps) {
  const [showLore, setShowLore] = useState(false)
  const RoleIcon = roleIcons[champion?.role as keyof typeof roleIcons] || Brain

  if (!champion) {
    return (
      <section className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
              <div className="w-24 h-6 rounded bg-slate-800 animate-pulse" />
              <div className="w-px h-6 bg-slate-700" />
              <div className="w-32 h-6 rounded bg-slate-800 animate-pulse" />
            </div>
            <div className="w-64 h-12 rounded bg-slate-800 animate-pulse mb-4" />
            <div className="w-48 h-8 rounded bg-slate-800 animate-pulse mb-8" />
            <div className="w-full h-24 rounded bg-slate-800 animate-pulse" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[70vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={champion.imageURLs.splash || "/placeholder.svg"}
          alt={champion.name || "Champion"}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
      </div>

      {/* Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Add your particles component here */}
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <RoleIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-lg text-slate-300">{champion.tags?.join(' • ') || "Unknown Role"}</span>
              <div className="w-px h-6 bg-slate-700" />
              <span className="text-lg text-slate-300">
                Difficulty: {champion.info?.difficulty || "Unknown"}
              </span>
            </div>

            <div className="flex items-end gap-6">
              {/* Champion Portrait */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-[#C89B3C] shadow-lg shadow-black/50 transform translate-y-4">
                <Image 
                  src={champion.imageURLs.square || "/placeholder.svg"}
                  alt={champion.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              <div className="flex-1">
                <h1 className="text-5xl md:text-7xl font-bold text-slate-100 mb-4">
                  {champion.name || "Unknown Champion"}
                </h1>
                <p className="text-2xl md:text-3xl text-yellow-400 font-medium mb-8">
                  {champion.title || "The Unknown"}
                </p>

                {/* Lore Toggle */}
                <div 
                  className={cn(
                    "relative max-w-2xl transition-all duration-500 ease-in-out overflow-hidden",
                    showLore ? "h-auto" : "h-24"
                  )}
                >
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {champion.lore || "No lore available for this champion."}
                  </p>
                  {!showLore && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
                  )}
                </div>

                {champion.lore && (
                  <button
                    onClick={() => setShowLore(!showLore)}
                    className="mt-4 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    {showLore ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 