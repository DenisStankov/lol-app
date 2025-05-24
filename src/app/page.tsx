"use client"

import { Sparkles, TrendingUp, Users, Zap, ArrowUp, ArrowDown, Star, Crown, Badge, Search } from "lucide-react"
import SummonerSearch from "@/components/summonerSearch"
import TopChampions from "@/components/championList"
import PatchInfo from "@/components/patchInfo"
import Navigation from "@/components/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  const currentYear = new Date().getFullYear()

  // Mock data for top champions
  const topChampions = [
    { name: "Jinx", tier: "S+", winRate: 52.3, pickRate: 18.7, role: "ADC", trend: "up" },
    { name: "Graves", tier: "S+", winRate: 51.8, pickRate: 15.2, role: "Jungle", trend: "up" },
    { name: "Viktor", tier: "S", winRate: 50.9, pickRate: 12.4, role: "Mid", trend: "down" },
    { name: "Jinx", tier: "S", winRate: 50.1, pickRate: 11.8, role: "ADC", trend: "up" },
    { name: "Camille", tier: "A", winRate: 49.7, pickRate: 9.3, role: "Top", trend: "up" },
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "S+":
        return "text-red-400 bg-red-500/20"
      case "S":
        return "text-orange-400 bg-orange-500/20"
      case "A":
        return "text-green-400 bg-green-500/20"
      default:
        return "text-blue-400 bg-blue-500/20"
    }
  }

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Navigation Bar */}
      <Navigation />

      {/* Enhanced Header with centered search */}
      <header className="relative py-20 px-4 md:px-8 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          {/* Enhanced Badge */}
          <div className="flex justify-center">
            <div className="group inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 text-white text-sm font-medium shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-blue-400 group-hover:animate-spin transition-transform duration-300" />
                <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                Live Stats & Analytics
              </span>
            </div>
          </div>

          {/* Enhanced Title */}
          <div className="text-center space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 tracking-tight animate-gradient-x">
              LoLytics
            </h1>
            <div className="relative">
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                Track summoner performance, analyze meta champions, and stay updated with the latest patch information.
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Enhanced Search Component */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <Card className="bg-white/10 border-white/20 backdrop-blur-md overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                        <Input
                          placeholder="Search summoner name..."
                          className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 text-lg"
                        />
                      </div>
                      <Button className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 font-medium">
                        Search
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Faker", "Caps", "Bjergsen", "Rekkles"].map((name) => (
                        <button
                          key={name}
                          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {[
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Live Data",
                description: "Real-time statistics",
                color: "from-blue-500/20 to-blue-600/20",
                iconColor: "text-blue-400",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "All Regions",
                description: "Global coverage",
                color: "from-purple-500/20 to-purple-600/20",
                iconColor: "text-purple-400",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Fast Updates",
                description: "Instant analysis",
                color: "from-indigo-500/20 to-indigo-600/20",
                iconColor: "text-indigo-400",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className={stat.iconColor}>{stat.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{stat.title}</h3>
                    <p className="text-sm text-slate-400">{stat.description}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="py-12 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Latest Insights
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Stay ahead of the meta with real-time champion statistics and patch analysis
            </p>
          </div>

          {/* Enhanced Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Enhanced Patch Info */}
            <div className="lg:col-span-4">
              <div className="h-full">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative h-full">
                    <Card className="h-full bg-white/10 border-white/20 backdrop-blur-md">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Star className="h-4 w-4 text-blue-400" />
                          </div>
                          Patch 14.14.1
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Release Date</span>
                            <span className="text-white font-medium">July 17, 2024</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Champions Updated</span>
                            <span className="text-white font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Items Changed</span>
                            <span className="text-white font-medium">8</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-white">Key Changes</h4>
                          <div className="space-y-2">
                            {[
                              { type: "buff", champion: "Jinx", change: "Base AD increased" },
                              { type: "nerf", champion: "Graves", change: "Q damage reduced" },
                              { type: "buff", champion: "Viktor", change: "Mana costs lowered" },
                            ].map((change, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                <div
                                  className={`w-2 h-2 rounded-full ${change.type === "buff" ? "bg-green-400" : "bg-red-400"}`}
                                />
                                <span className="text-white font-medium">{change.champion}</span>
                                <span className="text-slate-400 text-sm">{change.change}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                          View Full Patch Notes
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Top Champions */}
            <div className="lg:col-span-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Crown className="h-4 w-4 text-purple-400" />
                        </div>
                        Top Champions This Patch
                        <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30">
                          Platinum+
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topChampions.map((champion, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold">
                                {index + 1}
                              </div>
                              <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden">
                                <Image
                                  src="/placeholder.svg?height=48&width=48"
                                  alt={champion.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                  {champion.name}
                                </div>
                                <div className="text-sm text-slate-400">{champion.role}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-bold ${getTierColor(champion.tier)}`}
                                >
                                  {champion.tier}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-semibold">{champion.winRate}%</div>
                                <div className="text-xs text-slate-400">Win Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-semibold">{champion.pickRate}%</div>
                                <div className="text-xs text-slate-400">Pick Rate</div>
                              </div>
                              <div className="text-center">
                                {champion.trend === "up" ? (
                                  <ArrowUp className="h-5 w-5 text-green-400 mx-auto" />
                                ) : (
                                  <ArrowDown className="h-5 w-5 text-red-400 mx-auto" />
                                )}
                                <div className="text-xs text-slate-400">Trend</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                          View Full Tier List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-white/20 mt-20 bg-black/30 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                LoLytics
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your ultimate League of Legends statistics and analytics platform.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <div className="space-y-2">
                {["Champions", "Tier List", "Leaderboards", "Patch Notes"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-slate-400 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Resources</h4>
              <div className="space-y-2">
                {["API Documentation", "Support", "Community", "Blog"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-slate-400 hover:text-purple-400 transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Legal</h4>
              <div className="space-y-2">
                {["Terms of Service", "Privacy Policy", "Contact"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-slate-400 hover:text-indigo-400 transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400 text-center md:text-left">
                © {currentYear} LoLytics. Not affiliated with Riot Games. League of Legends is a trademark of Riot
                Games, Inc.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

