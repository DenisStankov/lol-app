"use client"
import Image from "next/image"
import type { ChampionData } from "@/lib/types"
import { motion, useScroll, useTransform } from "framer-motion"

interface HeroSectionProps {
  champion: ChampionData
}

export default function HeroSection({ champion }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -100]) // Parallax effect
  const opacity = useTransform(scrollY, [0, 300, 500], [1, 0.5, 0]) // Fade out title

  return (
    <header className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <Image
          src={champion.splashArtUrl || "/placeholder.svg"}
          alt={`${champion.name} Splash Art`}
          layout="fill"
          objectFit="cover"
          objectPosition="center top"
          priority
          className="opacity-80"
        />
        <div className="absolute inset-0 bg-hero-gradient z-10" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-end h-full pb-12 md:pb-20 text-center"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-lol-gold-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          {champion.name}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-lol-gold-light/80 mt-2 md:mt-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          {champion.title}
        </p>
      </motion.div>
    </header>
  )
} 