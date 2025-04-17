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
    <Card className="border-[#C89B3C]/20 bg-zinc-900/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Input Field */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C89B3C]" />
            <Input
              placeholder="Search summoner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-12 pr-4 py-6 h-14 w-full bg-zinc-800 border-[#C89B3C]/20 text-white placeholder:text-[#C89B3C]/60 focus:ring-[#C89B3C]/50 focus:border-[#C89B3C]/50 text-lg"
            />
          </div>

          {/* Region Select Dropdown */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-28 h-14 bg-zinc-800 border-[#C89B3C]/20 text-[#C89B3C] text-lg">
              <SelectValue placeholder="EUW" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-[#C89B3C]/20">
              <SelectItem value="euw1">EUW</SelectItem>
              <SelectItem value="na1">NA</SelectItem>
              <SelectItem value="kr">KR</SelectItem>
              <SelectItem value="eun1">EUNE</SelectItem>
              <SelectItem value="br1">BR</SelectItem>
              <SelectItem value="jp1">JP</SelectItem>
              <SelectItem value="la1">LAN</SelectItem>
              <SelectItem value="la2">LAS</SelectItem>
              <SelectItem value="oc1">OCE</SelectItem>
              <SelectItem value="tr1">TR</SelectItem>
              <SelectItem value="ru">RU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Results and Recent Searches Dropdown */}
        {showResults && (
          <div className="absolute z-20 left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-zinc-900 border border-[#C89B3C]/20 rounded-lg shadow-xl">
            {/* Loading indicator */}
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-[#C89B3C] rounded-full" aria-label="loading"></div>
                <p className="text-zinc-400 mt-2">Searching summoners...</p>
              </div>
            )}

            {/* Search results */}
            {!loading && query.length >= 3 && results.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs text-zinc-500 uppercase font-semibold">Search Results</p>
                {results.map((summoner) => (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#C89B3C]/20 rounded-md transition-colors"
                    onClick={() => handleSelect(summoner)}
                  >
                    <div className="relative">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner.profileIconId}.png`} 
                        alt="Profile Icon" 
                        width={40} 
                        height={40} 
                        className="rounded-full border border-[#C89B3C]/30" 
                      />
                      <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-xs px-1 rounded border border-[#C89B3C]/20 text-[#C89B3C]">
                        {region.toUpperCase().replace(/[0-9]/g, '')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{summoner.summonerName}</div>
                      <div className="text-xs text-zinc-400">#{summoner.tagLine}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 3 && results.length === 0 && (
              <div className="p-4 text-center text-zinc-400">
                <User className="h-6 w-6 mx-auto mb-2 text-zinc-500" />
                <p>No summoners found</p>
                <p className="text-xs mt-1">Try a different name or region</p>
              </div>
            )}

            {/* Recent searches */}
            {showRecentSearches && recentSearches.length > 0 && (query.length < 3 || results.length === 0) && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs text-zinc-500 uppercase font-semibold flex items-center">
                  <History className="h-3 w-3 mr-1" />
                  Recent Searches
                </p>
                {recentSearches.map((summoner) => (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#C89B3C]/20 rounded-md transition-colors"
                    onClick={() => handleSelect(summoner, summoner.region)}
                  >
                    <div className="relative">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner.profileIconId}.png`} 
                        alt="Profile Icon" 
                        width={40} 
                        height={40} 
                        className="rounded-full border border-[#C89B3C]/30" 
                      />
                      <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-xs px-1 rounded border border-[#C89B3C]/20 text-[#C89B3C]">
                        {summoner.region.toUpperCase().replace(/[0-9]/g, '')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{summoner.summonerName}</div>
                      <div className="text-xs text-zinc-400">#{summoner.tagLine}</div>
                    </div>
                    <div className="flex items-center text-xs text-zinc-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(summoner.lastSearched)}
                    </div>
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