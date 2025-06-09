"use client"

import { useState, useEffect } from "react"
import type { ChampionData } from "@/lib/types"
import Image from "next/image"
import { FrostedCard } from "@/components/ui/frosted-card"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/badge"
import useEmblaCarousel from "embla-carousel-react"

interface AbilitiesShowcaseProps {
  champion: ChampionData
}

export default function AbilitiesShowcase({ champion }: AbilitiesShowcaseProps) {
  const [mounted, setMounted] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !champion.abilities?.length) {
    return (
      <section id="abilities" aria-labelledby="abilities-heading">
        <h2 id="abilities-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
          Abilities
        </h2>
        <FrostedCard className="p-6">
          <p className="text-center text-lol-grey">Loading abilities...</p>
        </FrostedCard>
      </section>
    )
  }

  return (
    <section id="abilities" aria-labelledby="abilities-heading">
      <h2 id="abilities-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
        Abilities
      </h2>

      <div className="relative w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {champion.abilities.map((ability, index) => (
              <div key={ability.id || index} className="pl-4 min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3">
                <FrostedCard className="h-full flex flex-col">
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={ability.iconUrl || "/placeholder.svg"}
                        alt={ability.name}
                        width={64}
                        height={64}
                        className="rounded-md border-2 border-lol-gold/50"
                      />
                      <div>
                        <CardTitle className="text-xl text-lol-gold-light">
                          {ability.name}{" "}
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-lol-blue-light/20 text-lol-blue-light border-lol-blue-light/50"
                          >
                            {ability.keyBinding}
                          </Badge>
                        </CardTitle>
                        {ability.cost && (
                          <p className="text-xs text-lol-grey">
                            Cost: {ability.cost}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardDescription className="text-lol-gold-light/80 text-sm mb-3">
                      {ability.description}
                    </CardDescription>
                  </CardContent>
                </FrostedCard>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full text-lol-gold bg-lol-blue-dark/80 hover:bg-lol-blue-dark border border-lol-gold/50 disabled:opacity-50 p-2"
        >
          <span className="sr-only">Previous slide</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full text-lol-gold bg-lol-blue-dark/80 hover:bg-lol-blue-dark border border-lol-gold/50 disabled:opacity-50 p-2"
        >
          <span className="sr-only">Next slide</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-lol-gold mb-4 text-center">Skill Order</h3>
        <FrostedCard className="p-4 md:p-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {champion.abilities.map((ability, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-lol-grey group-hover:text-lol-gold transition-colors">
                        {index + 1}
                      </div>
                      <Badge
                        variant="secondary"
                        className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-lol-blue-light/10 text-lol-blue-light border-lol-blue-light/30 hover:bg-lol-blue-light/20 transition-colors cursor-default"
                      >
                        {ability.keyBinding}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-lol-blue-dark text-lol-gold-light border-lol-gold/50">
                    <p>Level {index + 1}: {ability.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </FrostedCard>
      </div>
    </section>
  )
} 