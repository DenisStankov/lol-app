"use client"

import { Sparkles } from "lucide-react"
import SummonerSearch from "@/components/summonerSearch"
import TopChampions from "@/components/championList"
import TierList from "@/components/tierListPreview"
import PatchInfo from "@/components/patchInfo"
import RecentMatches from "@/components/recentMatches"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header - Made more compact while maintaining visual impact */}
      <header className="text-center py-8 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full 
            bg-[#C89B3C]/10 text-[#C89B3C] text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            <span>Live Stats & Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#C89B3C] tracking-tight">League Stats Tracker</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Track summoner performance, analyze meta champions, and stay updated with the latest patch information.
          </p>
        </div>
      </header>

      {/* Main Content - Improved spacing and grid layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Search and Patch Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <SummonerSearch />
          </div>
          <div className="lg:col-span-4">
            <PatchInfo />
          </div>
        </div>

        {/* Champions and Tier List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <TopChampions />
          </div>
          <div className="lg:col-span-4">
            <TierList />
          </div>
        </div>

        {/* Recent Matches Section */}
        <div className="w-full">
          <RecentMatches />
        </div>
      </main>

      {/* Footer - Simplified and more responsive */}
      <footer className="border-t border-zinc-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © {new Date().getFullYear()} League Stats Tracker. Not affiliated with Riot Games.
            </p>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

