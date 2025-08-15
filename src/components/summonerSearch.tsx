"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, History, ChevronRight, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select";
import ProfileIcon from "@/components/ProfileIcon";

interface Summoner {
  summonerName: string;
  tagLine?: string;
  puuid: string;
  profileIconId: number;
  region?: string;
  name?: string;
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
  const [region, setRegion] = useState("euw1"); // Default preferred region (hint only)
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
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setResults(data);
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
  const handleSelect = (summoner: Summoner, selectedRegion = summoner.region || region) => {
    const safeName = encodeURIComponent(summoner.summonerName || summoner.name || "");
    
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
    
    router.push(`/summoner/${selectedRegion}/${safeName}?puuid=${encodeURIComponent(summoner.puuid)}`);
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
    <Card className="border-accent/20 bg-bg-main/50 backdrop-blur-sm shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Input Field - Improved styling */}
          <div className="relative w-full md:w-4/5">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
            <Input
              placeholder="Name or Name#TAG..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-12 pr-4 py-2.5 h-10 w-full bg-bg-card border-2 border-accent/30 text-text-main placeholder:text-accent/60 focus:ring-accent focus:border-accent/70 text-base rounded-xl font-medium tracking-wide shadow-inner"
            />
          </div>

          {/* Region Select Dropdown - Improved styling */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full md:w-24 h-10 bg-bg-card border-2 border-accent/30 text-accent text-base font-medium rounded-xl hover:bg-bg-card-hover hover:border-accent/50 transition-all">
              <SelectValue placeholder="EUW" />
            </SelectTrigger>
            <SelectContent className="bg-bg-card border-accent/30 rounded-lg">
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
          <div className="fixed inset-x-4 md:absolute md:inset-x-0 z-50 mt-2 max-h-96 overflow-y-auto bg-bg-main border-2 border-accent/30 rounded-xl shadow-2xl">
            {/* Loading indicator */}
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-accent rounded-full" aria-label="loading"></div>
                <p className="text-text-main mt-3 text-lg font-medium">Searching summoners...</p>
              </div>
            )}

            {/* Search results */}
            {!loading && results.length > 0 && (
              <div className="p-3">
                <p className="px-4 py-2 text-sm text-accent/80 uppercase font-semibold">Search Results</p>
                {results.map((summoner) => {
                  const namePart = query.includes('#') ? query.split('#')[0] : query;
                  const tagPart = query.includes('#') ? query.split('#')[1] : undefined;
                  const displayName = summoner.summonerName || summoner.name || namePart || 'Unknown';
                  const displayTag = summoner.tagLine ?? tagPart;
                  return (
                  <div 
                    key={summoner.puuid} 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent/20 rounded-lg transition-colors"
                    onClick={() => handleSelect(summoner)}
                  >
                    <div className="relative">
                      <ProfileIcon 
                        iconId={summoner.profileIconId}
                        alt="Profile Icon" 
                        width={48} 
                        height={48} 
                        className="rounded-full border-2 border-accent/40"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-bg-card text-xs font-bold px-1.5 py-0.5 rounded border border-accent/30 text-accent">
                        {(summoner.region || region).toUpperCase().replace(/[0-9]/g, '')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-main text-lg">{displayName}</div>
                      {displayTag ? (
                        <div className="text-sm text-text-secondary">#{displayTag}</div>
                      ) : null}
                    </div>
                    <ChevronRight className="h-5 w-5 text-accent/70" />
                  </div>
                )})}
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 3 && results.length === 0 && (
              <div className="p-6 text-center text-text-main">
                <User className="h-10 w-10 mx-auto mb-3 text-text-secondary" />
                <p className="text-lg font-medium">No summoners found</p>
                <p className="text-sm mt-2">Try a different name or region</p>
              </div>
            )}
          </div>
        )}
        
        {/* Recent searches - Now permanently displayed below search bar */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="mt-4 border-t border-accent/20 pt-4">
            <p className="px-2 text-sm text-accent/80 uppercase font-semibold flex items-center mb-2">
              <History className="h-4 w-4 mr-1.5" />
              Recent Searches
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recentSearches.map((summoner) => (
                <div 
                  key={summoner.puuid} 
                  className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent/20 rounded-lg transition-colors"
                  onClick={() => handleSelect(summoner, summoner.region)}
                >
                  <div className="relative flex-shrink-0">
                    <ProfileIcon 
                      iconId={summoner.profileIconId}
                      alt="Profile Icon" 
                      width={36} 
                      height={36} 
                      className="rounded-full border-2 border-accent/40"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-bg-card text-xs font-bold px-1 py-0 rounded border border-accent/30 text-accent">
                      {summoner.region.toUpperCase().replace(/[0-9]/g, '')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-main truncate">{summoner.summonerName}</div>
                    <div className="text-sm text-text-secondary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(summoner.lastSearched)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-accent/70" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}