"use client"

import { Sparkles } from "lucide-react"
import SummonerSearch from "@/components/summonerSearch"
import TopChampions from "@/components/championList"
import PatchInfo from "@/components/patchInfo"
import RecentMatches from "@/components/recentMatches"
import Navigation from "@/components/navigation"
import Image from "next/image"

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation Bar */}
      <Navigation />

      {/* Header with centered search */}
      <header className="text-center py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full 
            bg-[#C89B3C]/10 text-[#C89B3C] text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            <span>Live Stats & Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#C89B3C] tracking-tight">League Stats Tracker</h1>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            Track summoner performance, analyze meta champions, and stay updated with the latest patch information.
          </p>
          
          {/* Centered Search Component */}
          <div className="max-w-lg mx-auto">
            <SummonerSearch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patch Info - Repositioned */}
          <div className="lg:col-span-1">
            <PatchInfo />
          </div>

          {/* Top Champions */}
          <div className="lg:col-span-2">
            <TopChampions />
          </div>
        </div>

        {/* Recent Matches Section */}
        <div className="max-w-7xl mx-auto mt-8">
          <RecentMatches />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © {currentYear} League Stats Tracker. Not affiliated with Riot Games.
            </p>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">Terms</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </footer>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
    </div>
  )
}

