"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, History, ChevronRight, Clock, User } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select";
import ProfileIcon from "@/components/ProfileIcon";

interface Summoner {
  summonerName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
  region?: string;
}

interface RecentSummoner extends Summoner {
  lastSearched: string; // ISO date string
  region: string;
}

interface SummonerSearchProps {
  showRecentSearches?: boolean;
}

export default function SummonerSearch({ showRecentSearches = false }: SummonerSearchProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("euw1"); // Default region
  const [results, setResults] = useState<Summoner[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSummoner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      try {
        const savedSearches = localStorage.getItem('recentSearches');
        if (savedSearches) {
          const parsed = JSON.parse(savedSearches);
          setRecentSearches(parsed.slice(0, 5)); // Show top 5 most recent
        }
      } catch {
        // Silently handle error
      }
    }
  }, [showRecentSearches]);

  // ✅ Fetch Summoner Suggestions
  const fetchSummoners = useCallback(async () => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`/api/searchSummoner?query=${encodeURIComponent(query)}&region=${region}`);
      setResults([res.data]); // Store results
      setShowResults(true);
    } catch (err) {
      console.error("❌ Search Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, region]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) fetchSummoners();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchSummoners]);

  // Save to recent searches and navigate
  const handleSelect = (summoner: Summoner, selectedRegion = region) => {
    const formattedName = `${summoner.summonerName}-${summoner.tagLine}`;
    
    // Save to recent searches
    try {
      const newSearch: RecentSummoner = {
        ...summoner,
        region: selectedRegion,
        lastSearched: new Date().toISOString()
      };
      
      const savedSearches = localStorage.getItem('recentSearches');
      let searches: RecentSummoner[] = savedSearches ? JSON.parse(savedSearches) : [];
      
      // Remove duplicates
      searches = searches.filter(s => s.puuid !== summoner.puuid);
      
      // Add new search to the beginning
      searches.unshift(newSearch);
      
      // Limit to 10 recent searches
      if (searches.length > 10) searches = searches.slice(0, 10);
      
      localStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (err) {
      console.error("Failed to save recent search", err);
    }
    
    router.push(`/summoner/${selectedRegion}/${formattedName}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleInputFocus = () => {
    if (query.length >= 3) {
      setShowResults(true);
    } else if (showRecentSearches && recentSearches.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <Card className="border-[#C89B3C]/20 bg-zinc-900/50 backdrop-blur-sm shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Input Field - Improved styling */}
          <div className="relative w-full md:w-4/5">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C89B3C]" />
            <Input
              placeholder="Name or Name#TAG..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-12 pr-4 py-2.5 h-10 w-full bg-zinc-800/90 border-2 border-[#C89B3C]/30 text-white placeholder:text-[#C89B3C]/60 focus:ring-[#C89B3C] focus:border-[#C89B3C]/70 text-base rounded-xl font-medium tracking-wide shadow-inner"
            />
          </div>

          {/* Region Select Dropdown - Improved styling */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full md:w-24 h-10 bg-zinc-800/90 border-2 border-[#C89B3C]/30 text-[#C89B3C] text-base font-medium rounded-xl hover:bg-zinc-700/80 hover:border-[#C89B3C]/50 transition-all">
              <SelectValue placeholder="EUW" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-[#C89B3C]/30 rounded-lg">
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
        </div>

        {/* Search Results Dropdown */}
        {showResults && query.length >= 3 && (
          <div className="fixed inset-x-4 md:absolute md:inset-x-0 z-50 mt-2 max-h-96 overflow-y-auto bg-zinc-900 border-2 border-[#C89B3C]/30 rounded-xl shadow-2xl">
            {/* Loading indicator */}
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#C89B3C] rounded-full" aria-label="loading"></div>
                <p className="text-zinc-300 mt-3 text-lg font-medium">Searching summoners...</p>
              </div>
            )}

            {/* Search results */}
            {!loading && results.length > 0 && (
              <div className="p-3">
                <p className="px-4 py-2 text-sm text-[#C89B3C]/80 uppercase font-semibold">Search Results</p>
                {results.map((summoner) => (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#C89B3C]/20 rounded-lg transition-colors"
                    onClick={() => handleSelect(summoner)}
                  >
                    <div className="relative">
                      <ProfileIcon 
                        iconId={summoner.profileIconId}
                        alt="Profile Icon" 
                        width={48} 
                        height={48} 
                        className="rounded-full border-2 border-[#C89B3C]/40"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-xs font-bold px-1.5 py-0.5 rounded border border-[#C89B3C]/30 text-[#C89B3C]">
                        {region.toUpperCase().replace(/[0-9]/g, '')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">{summoner.summonerName}</div>
                      <div className="text-sm text-zinc-400">#{summoner.tagLine}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#C89B3C]/70" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 3 && results.length === 0 && (
              <div className="p-6 text-center text-zinc-300">
                <User className="h-10 w-10 mx-auto mb-3 text-zinc-500" />
                <p className="text-lg font-medium">No summoners found</p>
                <p className="text-sm mt-2">Try a different name or region</p>
              </div>
            )}
          </div>
        )}
        
        {/* Recent searches - Now permanently displayed below search bar */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="mt-4 border-t border-[#C89B3C]/20 pt-4">
            <p className="px-2 text-sm text-[#C89B3C]/80 uppercase font-semibold flex items-center mb-2">
              <History className="h-4 w-4 mr-1.5" />
              Recent Searches
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recentSearches.map((summoner) => (
                <div 
                  key={summoner.puuid} 
                  className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#C89B3C]/20 rounded-lg transition-colors"
                  onClick={() => handleSelect(summoner, summoner.region)}
                >
                  <div className="relative flex-shrink-0">
                    <ProfileIcon 
                      iconId={summoner.profileIconId}
                      alt="Profile Icon" 
                      width={36} 
                      height={36} 
                      className="rounded-full border-2 border-[#C89B3C]/40"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-xs font-bold px-1 py-0 rounded border border-[#C89B3C]/30 text-[#C89B3C]">
                      {summoner.region.toUpperCase().replace(/[0-9]/g, '')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-base truncate">{summoner.summonerName}</div>
                    <div className="flex items-center text-xs text-zinc-400">
                      <span className="truncate">#{summoner.tagLine}</span>
                      <span className="mx-1 text-zinc-600 flex-shrink-0">•</span>
                      <Clock className="h-3 w-3 mr-0.5 text-zinc-500 flex-shrink-0" />
                      <span className="flex-shrink-0">{formatTimeAgo(summoner.lastSearched)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#C89B3C]/70 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}