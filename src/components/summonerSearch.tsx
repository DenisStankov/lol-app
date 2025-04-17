"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, History, ChevronRight, Clock, User } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select";

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
      } catch (err) {
        console.error("Failed to load recent searches", err);
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
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Input Field - Improved styling */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#C89B3C]" />
            <Input
              placeholder="Search summoner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-14 pr-5 py-7 h-16 w-full bg-zinc-800/90 border-2 border-[#C89B3C]/30 text-white placeholder:text-[#C89B3C]/60 focus:ring-[#C89B3C] focus:border-[#C89B3C]/70 text-xl rounded-xl font-medium tracking-wide shadow-inner"
            />
          </div>

          {/* Region Select Dropdown - Improved styling */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-32 h-16 bg-zinc-800/90 border-2 border-[#C89B3C]/30 text-[#C89B3C] text-xl font-medium rounded-xl hover:bg-zinc-700/80 hover:border-[#C89B3C]/50 transition-all">
              <SelectValue placeholder="EUW" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-[#C89B3C]/30 rounded-lg">
              <SelectItem value="euw1" className="text-lg">EUW</SelectItem>
              <SelectItem value="na1" className="text-lg">NA</SelectItem>
              <SelectItem value="kr" className="text-lg">KR</SelectItem>
              <SelectItem value="eun1" className="text-lg">EUNE</SelectItem>
              <SelectItem value="br1" className="text-lg">BR</SelectItem>
              <SelectItem value="jp1" className="text-lg">JP</SelectItem>
              <SelectItem value="la1" className="text-lg">LAN</SelectItem>
              <SelectItem value="la2" className="text-lg">LAS</SelectItem>
              <SelectItem value="oc1" className="text-lg">OCE</SelectItem>
              <SelectItem value="tr1" className="text-lg">TR</SelectItem>
              <SelectItem value="ru" className="text-lg">RU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Results and Recent Searches Dropdown - Improved styling */}
        {showResults && (
          <div className="absolute z-20 left-0 right-0 mt-3 max-h-96 overflow-y-auto bg-zinc-900 border-2 border-[#C89B3C]/30 rounded-xl shadow-2xl">
            {/* Loading indicator */}
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#C89B3C] rounded-full" aria-label="loading"></div>
                <p className="text-zinc-300 mt-3 text-lg font-medium">Searching summoners...</p>
              </div>
            )}

            {/* Search results */}
            {!loading && query.length >= 3 && results.length > 0 && (
              <div className="p-3">
                <p className="px-4 py-2 text-sm text-[#C89B3C]/80 uppercase font-semibold">Search Results</p>
                {results.map((summoner) => (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#C89B3C]/20 rounded-lg transition-colors"
                    onClick={() => handleSelect(summoner)}
                  >
                    <div className="relative">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner.profileIconId}.png`} 
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

            {/* Recent searches */}
            {showRecentSearches && recentSearches.length > 0 && (query.length < 3 || results.length === 0) && (
              <div className="p-3">
                <p className="px-4 py-2 text-sm text-[#C89B3C]/80 uppercase font-semibold flex items-center">
                  <History className="h-4 w-4 mr-1.5" />
                  Recent Searches
                </p>
                {recentSearches.map((summoner) => (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#C89B3C]/20 rounded-lg transition-colors"
                    onClick={() => handleSelect(summoner, summoner.region)}
                  >
                    <div className="relative">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner.profileIconId}.png`} 
                        alt="Profile Icon" 
                        width={48} 
                        height={48} 
                        className="rounded-full border-2 border-[#C89B3C]/40" 
                      />
                      <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-xs font-bold px-1.5 py-0.5 rounded border border-[#C89B3C]/30 text-[#C89B3C]">
                        {summoner.region.toUpperCase().replace(/[0-9]/g, '')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">{summoner.summonerName}</div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <span>#{summoner.tagLine}</span>
                        <span className="mx-2 text-zinc-600">•</span>
                        <Clock className="h-3 w-3 mr-1 text-zinc-500" />
                        <span>{formatTimeAgo(summoner.lastSearched)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#C89B3C]/70" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}