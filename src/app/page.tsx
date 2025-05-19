"use client"

import { Sparkles } from "lucide-react"
import SummonerSearch from "@/components/summonerSearch"
import TopChampions from "@/components/championList"
import PatchInfo from "@/components/patchInfo"
import Navigation from "@/components/navigation"

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Navigation Bar */}
      <Navigation />

      {/* Header with centered search */}
      <header className="text-center py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-transparent opacity-70"></div>
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg"
          >
            <Sparkles className="h-4 w-4 text-blue-300" />
            <span>Live Stats & Analytics</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">LoLytics</h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Track summoner performance, analyze meta champions, and stay updated with the latest patch information.
          </p>
          {/* Larger Search Component */}
          <div className="max-w-2xl mx-auto">
            <SummonerSearch showRecentSearches={true} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Patch Info - Same height as Top Champions */}
          <div className="lg:col-span-4">
            <div className="h-full flex flex-col">
              <PatchInfo />
            </div>
          </div>
          {/* Top Champions */}
          <div className="lg:col-span-8">
            <TopChampions />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {currentYear} LoLytics. Not affiliated with Riot Games.
            </p>
            <nav className="flex items-center gap-6">
              <a href="/terms-of-service" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

