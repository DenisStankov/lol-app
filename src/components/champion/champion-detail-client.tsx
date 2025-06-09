"use client"

import type { ChampionData } from "@/lib/types"
import HeroSection from "./hero-section"
import StatsVisualization from "@/components/champion/stats-visualization"
import AbilitiesShowcase from "@/components/champion/abilities-showcase"
import BuildPathItems from "@/components/champion/build-path-items"
import MatchupsCounters from "@/components/champion/matchups-counters"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { ParticlesComponent } from "@/components/champion/particles-component"
import { FrostedCard } from "@/components/ui/frosted-card"

interface ChampionDetailClientProps {
  champion: ChampionData
}

export default function ChampionDetailClient({ champion }: ChampionDetailClientProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Particles need to be loaded client-side
  if (!mounted) {
    return (
      <div className="min-h-screen bg-lol-blue-dark flex items-center justify-center">
        <p className="text-lol-gold-light text-xl">Forging Stars...</p>
      </div>
    )
  }

  return (
    <>
      <ParticlesComponent
        championTheme={champion.particleType}
        primaryColor={champion.themeColorPrimary}
        secondaryColor={champion.themeColorSecondary}
      />
      <HeroSection champion={champion} />
      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="space-y-12 md:space-y-16 lg:space-y-20">
          <StatsVisualization champion={champion} />
          <Separator className="bg-lol-gold/30" />
          <AbilitiesShowcase champion={champion} />
          <Separator className="bg-lol-gold/30" />
          <BuildPathItems champion={champion} />
          <Separator className="bg-lol-gold/30" />
          <MatchupsCounters champion={champion} />
          <Separator className="bg-lol-gold/30" />
          <LoreSection lore={champion.lore} />
        </div>
      </main>
      <footer className="text-center py-8 text-lol-grey">
        <p>&copy; {new Date().getFullYear()} League of Legends Champion Showcase. Data for illustrative purposes.</p>
      </footer>
    </>
  )
}

function LoreSection({ lore }: { lore: string }) {
  return (
    <section id="lore" aria-labelledby="lore-heading">
      <h2 id="lore-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-6 text-center">
        Lore
      </h2>
      <FrostedCard className="p-6 md:p-8">
        <p className="text-lol-gold-light/90 leading-relaxed whitespace-pre-line">{lore}</p>
      </FrostedCard>
    </section>
  )
} 