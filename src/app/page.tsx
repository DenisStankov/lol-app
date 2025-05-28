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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import axios from "axios"
import ProfileIcon from "@/components/ProfileIcon"

interface Summoner {
  summonerName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
  region?: string;
}

function PatchCard() {
  const [patchVersion, setPatchVersion] = useState("...");
  const [patchUrl, setPatchUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatchData() {
      const response = await fetch('/api/patch-notes');
      const data = await response.json();
      setPatchVersion(data.displayVersion);
      setPatchUrl(data.url);
      setLoading(false);
    }
    fetchPatchData();
  }, []);

  return (
    <Card className="h-full bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Star className="h-4 w-4 text-blue-400" />
          </div>
          Patch {patchVersion}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-slate-400 text-center">Loading patch info...</div>
        ) : (
          <a
            href={patchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
              View Full Patch Notes
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const currentYear = new Date().getFullYear()
  const router = useRouter();
  const [summonerName, setSummonerName] = useState("");
  const [region, setRegion] = useState("euw1");
  const [results, setResults] = useState<Summoner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ left: 0, top: 0, width: 0 });

  const fetchSummoners = useCallback(async () => {
    if (summonerName.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`/api/searchSummoner?query=${encodeURIComponent(summonerName)}&region=${region}`);
      setResults([res.data]); // Store results
      setShowResults(true);
    } catch (err) {
      console.error("❌ Search Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [summonerName, region]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (summonerName.length >= 3) fetchSummoners();
    }, 500);
    return () => clearTimeout(timer);
  }, [summonerName, fetchSummoners]);

  useEffect(() => {
    if (showResults && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        left: rect.left,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  }, [showResults, summonerName]);

  const handleSelect = (summoner: Summoner) => {
    const formattedName = `${summoner.summonerName}-${summoner.tagLine}`;
    router.push(`/summoner/${region}/${formattedName}`);
  };

  const handleSearch = () => {
    if (!summonerName.trim()) return;
    router.push(`/summoner/${region}/${encodeURIComponent(summonerName.trim())}`);
  };

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
    <div className="min-h-screen text-white">
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
                    <div className="flex gap-4 flex-col md:flex-row">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                        <Input
                          ref={inputRef}
                          placeholder="Search summoner name..."
                          value={summonerName}
                          onChange={e => setSummonerName(e.target.value)}
                          onFocus={() => setShowResults(true)}
                          onBlur={() => setTimeout(() => setShowResults(false), 200)}
                          className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 text-lg"
                        />
                        {/* Search Results Dropdown rendered in a portal */}
                        {showResults && summonerName.length >= 3 && typeof window !== 'undefined' && createPortal(
                          <div style={{ position: 'absolute', left: dropdownStyle.left, top: dropdownStyle.top, width: dropdownStyle.width, zIndex: 9999 }} className="max-h-80 overflow-y-auto bg-[#181A2A] border border-blue-400/30 rounded-xl shadow-2xl p-2">
                            {loading ? (
                              <div className="p-6 text-center">
                                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-400 rounded-full" aria-label="loading"></div>
                                <p className="text-white mt-3 text-lg font-medium">Searching summoners...</p>
                              </div>
                            ) : results.length > 0 ? (
                              <div>
                                <p className="px-4 py-2 text-xs text-blue-400/80 uppercase font-semibold tracking-wider">Search Results</p>
                                {results.map((summoner) => (
                                  <div 
                                    key={summoner.puuid} 
                                    className="flex items-center gap-4 p-3 cursor-pointer hover:bg-blue-400/10 rounded-lg transition-colors"
                                    onClick={() => handleSelect(summoner)}
                                  >
                                    <ProfileIcon 
                                      iconId={summoner.profileIconId}
                                      alt="Profile Icon" 
                                      width={40} 
                                      height={40} 
                                      className="rounded-full border border-blue-400/40"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-white font-semibold leading-tight">{summoner.summonerName}</span>
                                      <span className="text-slate-400 text-xs leading-tight">#{summoner.tagLine}</span>
                                    </div>
                                    <span className="ml-auto px-2 py-0.5 text-xs rounded bg-blue-400/10 text-blue-400 font-medium">{region.toUpperCase().replace(/[0-9]/g, '')}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-white">No summoners found</div>
                            )}
                          </div>,
                          document.body
                        )}
                      </div>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="w-full md:w-32 h-14 bg-white/5 border-white/20 text-blue-400 text-lg font-medium rounded-xl hover:bg-white/10 hover:border-blue-400/40 transition-all">
                          <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/10 border-white/20 rounded-lg">
                          <SelectItem value="euw1" className="text-base">EUW</SelectItem>
                          <SelectItem value="na1" className="text-base">NA</SelectItem>
                          <SelectItem value="kr" className="text-base">KR</SelectItem>
                          <SelectItem value="eun1" className="text-base">EUNE</SelectItem>
                          <SelectItem value="br1" className="text-base">BR</SelectItem>
                          <SelectItem value="jp1" className="text-base">JP</SelectItem>
                          <SelectItem value="la1" className="text-base">LAN</SelectItem>
                          <SelectItem value="la2" className="text-base">LAS</SelectItem>
                          <SelectItem value="oc1" className="text-base">OCE</SelectItem>
                          <SelectItem value="tr1" className="text-base">TR</SelectItem>
                          <SelectItem value="ru" className="text-base">RU</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSearch} className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 font-medium">
                        Search
                      </Button>
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
              <PatchCard />
            </div>

            {/* Enhanced Top Champions */}
            <div className="lg:col-span-8">
              <TopChampions />
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

