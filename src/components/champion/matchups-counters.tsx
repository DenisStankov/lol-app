"use client"

import type { ChampionData, Matchup } from "@/lib/types"
import Image from "next/image"
import { FrostedCard } from "@/components/ui/frosted-card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface MatchupsCountersProps {
  champion: ChampionData
}

const difficultyColors: Record<Matchup["difficulty"], string> = {
  Easy: "bg-green-500/20 text-green-300 border-green-400/50",
  Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
  Even: "bg-sky-500/20 text-sky-300 border-sky-400/50",
  Hard: "bg-red-500/20 text-red-300 border-red-400/50",
  Severe: "bg-purple-500/20 text-purple-300 border-purple-400/50",
}

export default function MatchupsCounters({ champion }: MatchupsCountersProps) {
  return (
    <section id="matchups" aria-labelledby="matchups-heading">
      <h2 id="matchups-heading" className="text-3xl md:text-4xl font-bold text-lol-gold mb-8 text-center">
        Matchups & Counters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {champion.matchups.map((matchup) => (
          <FrostedCard key={matchup.championId} className="p-4 flex flex-col">
            <div className="flex items-center space-x-3 mb-3">
              <Image
                src={matchup.championIconUrl || "/placeholder.svg"}
                alt={matchup.championName}
                width={48}
                height={48}
                className="rounded-full border-2 border-lol-gold/30"
              />
              <div>
                <h4 className="text-lg font-semibold text-lol-gold-light">{matchup.championName}</h4>
                <Badge className={difficultyColors[matchup.difficulty]}>{matchup.difficulty}</Badge>
              </div>
            </div>
            <ul className="list-disc list-inside text-sm text-lol-gold-light/80 space-y-1 flex-grow">
              {matchup.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </FrostedCard>
        ))}
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-lol-gold mb-4 text-center">Counters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FrostedCard className="p-4">
            <h4 className="text-xl font-semibold text-green-400 mb-3 flex items-center">
              <ThumbsUp className="mr-2" /> Strong Against
            </h4>
            <div className="space-y-2">
              {champion.counters
                .filter((c) => c.type === "weak")
                .map(
                  (
                    counter, // 'weak' for opponent means strong for our champion
                  ) => (
                    <div
                      key={counter.championId}
                      className="flex items-center space-x-2 p-2 bg-lol-blue-dark/30 rounded"
                    >
                      <Image
                        src={counter.championIconUrl || "/placeholder.svg"}
                        alt={counter.championName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-lol-gold-light/90">{counter.championName}</span>
                    </div>
                  ),
                )}
            </div>
          </FrostedCard>
          <FrostedCard className="p-4">
            <h4 className="text-xl font-semibold text-red-400 mb-3 flex items-center">
              <ThumbsDown className="mr-2" /> Weak Against
            </h4>
            <div className="space-y-2">
              {champion.counters
                .filter((c) => c.type === "strong")
                .map(
                  (
                    counter, // 'strong' for opponent means weak for our champion
                  ) => (
                    <div
                      key={counter.championId}
                      className="flex items-center space-x-2 p-2 bg-lol-blue-dark/30 rounded"
                    >
                      <Image
                        src={counter.championIconUrl || "/placeholder.svg"}
                        alt={counter.championName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-lol-gold-light/90">{counter.championName}</span>
                    </div>
                  ),
                )}
            </div>
          </FrostedCard>
        </div>
      </div>
      <p className="text-center mt-8 text-sm text-lol-grey">
        Interactive counters wheel and detailed champion vs champion comparison cards would appear here.
      </p>
    </section>
  )
} 