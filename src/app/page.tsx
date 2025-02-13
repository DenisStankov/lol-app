"use client";

import { Sparkles } from "lucide-react";
import SummonerSearch from "@/components/summonerSearch";
import TopChampions from "@/components/championList";
import TierList from "@/components/tierListPreview";
import PatchInfo from "@/components/patchInfo";
import RecentMatches from "@/components/recentMatches";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="text-center py-12 px-4 md:px-8 space-y-6">
        <div
          className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full 
          bg-[#C89B3C]/10 text-[#C89B3C] text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          <span>Live Stats & Analytics</span>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#C89B3C] tracking-tight">
            League Stats Tracker
          </h1>
          <p className="text-zinc-400">
            Track summoner performance, analyze meta champions, and stay updated with the latest patch information.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summoner Search */}
          <div className="lg:col-span-2">
            <SummonerSearch /> {/* 🔥 Fixed search component */}
          </div>

          {/* Patch Info */}
          <div className="lg:col-span-1">
            <PatchInfo />
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Champion List */}
          <div className="lg:col-span-2">
            <TopChampions />
          </div>

          {/* Tier List */}
          <div className="lg:col-span-1">
            <TierList />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Matches */}
          <RecentMatches />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © {new Date().getFullYear()} League Stats Tracker. Not affiliated with Riot Games.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-zinc-400 hover:text-[#C89B3C] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}