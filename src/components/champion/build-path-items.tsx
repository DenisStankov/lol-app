"use client"

import type { ChampionData, Item } from "@/lib/types"
import Image from "next/image"
import { FrostedCard } from "@/components/ui/frosted-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PackageOpen, ShieldCheck, Zap, Footprints, HelpCircle } from "lucide-react"

interface BuildPathItemsProps {
  champion: ChampionData
}

const ItemCategoryIcon = ({ type }: { type: Item["type"] }) => {
  switch (type) {
    case "Starter":
      return <PackageOpen className="w-5 h-5 text-lol-gold/70" />
    case "Boots":
      return <Footprints className="w-5 h-5 text-lol-gold/70" />
    case "Core":
      return <ShieldCheck className="w-5 h-5 text-lol-gold/70" />
    case "Legendary":
    case "Mythic":
      return <Zap className="w-5 h-5 text-lol-gold/70" />
    case "Situational":
      return <HelpCircle className="w-5 h-5 text-lol-gold/70" />
    default:
      return <PackageOpen className="w-5 h-5 text-lol-gold/70" />
  }
}

export default function BuildPathItems({ champion }: BuildPathItemsProps) {
  const build = champion.recommendedBuilds[0] // Assuming one primary build for now

  if (!build) {
    return (
      <section id="builds" aria-labelledby="builds-heading">
        <h2 id="builds-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
          Build Path & Items
        </h2>
        <p className="text-lol-grey text-center">No recommended build available for this champion.</p>
      </section>
    )
  }

  const renderItemList = (items: Item[] | { item: Item; context: string }[], title: string, type: Item["type"]) => (
    <div className="mb-6">
      <h4 className="text-xl font-semibold text-lol-gold mb-3 flex items-center">
        <ItemCategoryIcon type={type} />
        <span className="ml-2">{title}</span>
      </h4>
      <div className="flex flex-wrap gap-3">
        {items.map((itemOrContextual, index) => {
          const item = "item" in itemOrContextual ? itemOrContextual.item : itemOrContextual
          const context = "item" in itemOrContextual ? itemOrContextual.context : undefined
          return (
            <TooltipProvider key={item.id + index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FrostedCard className="p-2 w-fit hover:border-lol-gold/70 transition-colors">
                    <Image
                      src={item.iconUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  </FrostedCard>
                </TooltipTrigger>
                <TooltipContent className="bg-lol-blue-dark text-lol-gold-light border-lol-gold/50 max-w-xs">
                  <p className="font-bold text-lol-gold">
                    {item.name} <span className="text-xs text-lol-grey">({item.cost}g)</span>
                  </p>
                  {item.description && <p className="text-xs mt-1">{item.description}</p>}
                  {context && <p className="text-xs mt-1 text-lol-blue-light/80">Context: {context}</p>}
                  {item.stats.length > 0 && <p className="text-xs mt-1">Stats: {item.stats.join(", ")}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )

  return (
    <section id="builds" aria-labelledby="builds-heading">
      <h2 id="builds-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
        {build.name}
      </h2>
      <FrostedCard className="p-4 md:p-6">
        {renderItemList(build.starterItems, "Starter Items", "Starter")}
        {renderItemList([build.boots], "Boots", "Boots")}
        {renderItemList(build.coreItems, "Core Items", "Core")}
        {renderItemList(build.situationalItems, "Situational Items", "Situational")}
      </FrostedCard>
      <p className="text-center mt-8 text-sm text-lol-grey">
        Interactive build path timeline, win rate data, and drag-and-drop customization would appear here.
      </p>
    </section>
  )
} 