"use client"

import type { ChampionData } from "@/lib/types"
import Image from "next/image"
import { FrostedCard } from "@/components/ui/frosted-card"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface AbilitiesShowcaseProps {
  champion: ChampionData
}

export default function AbilitiesShowcase({ champion }: AbilitiesShowcaseProps) {
  return (
    <section id="abilities" aria-labelledby="abilities-heading">
      <h2 id="abilities-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
        Abilities
      </h2>

      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-4">
          {champion.abilities.map((ability, index) => (
            <CarouselItem key={ability.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
                          {ability.cost.type}: {ability.cost.values.join(" / ")}
                        </p>
                      )}
                      <p className="text-xs text-lol-grey">Cooldown: {ability.cooldown.join(" / ")}s</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardDescription className="text-lol-gold-light/80 text-sm mb-3">
                    {ability.description}
                  </CardDescription>
                  {ability.videoUrl && (
                    <div className="aspect-video bg-lol-grey-dark rounded-md overflow-hidden mb-3">
                      {/* Placeholder for video player */}
                      <Image
                        src="/placeholder.svg?width=160&height=90"
                        alt="Ability video preview"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-lol-gold">Scaling:</h4>
                    {ability.scaling.length > 0 ? (
                      ability.scaling.map((s) => (
                        <TooltipProvider key={s.type + s.value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="mr-1 border-lol-gold/30 text-lol-gold/80 cursor-default"
                              >
                                {s.value} {s.type}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-lol-blue-dark text-lol-gold-light border-lol-gold/50">
                              <p>Scales with {s.type}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))
                    ) : (
                      <p className="text-xs text-lol-grey">No direct scaling.</p>
                    )}
                  </div>
                </CardContent>
              </FrostedCard>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="text-lol-gold bg-lol-blue-dark/80 hover:bg-lol-blue-dark border-lol-gold/50 disabled:opacity-50" />
        <CarouselNext className="text-lol-gold bg-lol-blue-dark/80 hover:bg-lol-blue-dark border-lol-gold/50 disabled:opacity-50" />
      </Carousel>

      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-lol-gold mb-4 text-center">Skill Order</h3>
        <FrostedCard className="p-4 md:p-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {champion.skillOrder.map((key, index) => (
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
                        {key}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-lol-blue-dark text-lol-gold-light border-lol-gold/50">
                    <p>
                      Level {index + 1}: Level up {champion.abilities.find((a) => a.keyBinding === key)?.name}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </FrostedCard>
      </div>
      <p className="text-center mt-8 text-sm text-lol-grey">
        Ability combo suggestions with visual guides would appear here.
      </p>
    </section>
  )
} 