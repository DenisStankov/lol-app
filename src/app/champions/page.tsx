"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { SearchIcon, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import Navigation from "@/components/navigation";
import Link from "next/link";

interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  tags: string[]; // Champion roles (Fighter, Tank, Mage, etc.)
}

type SortOption = "name" | "role";

// Role color mapping for better visual differentiation
const roleColors: Record<string, string> = {
  "Assassin": "#E84057",
  "Fighter": "#D75A37",
  "Mage": "#0AC8B9",
  "Marksman": "#FEA526", 
  "Support": "#AA5DC9",
  "Tank": "#5383E8"
};

export default function ChampionsPage() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState("13.24.1");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [featured, setFeatured] = useState<Champion | null>(null);
  
  // All possible champion roles in League of Legends
  const roles = ["All", "Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];

  // Fetch champions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get latest version
        const versionResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
        const fetchedVersion = versionResponse.data[0];
        setLatestVersion(fetchedVersion);
        
        // Fetch champions data
        const response = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${fetchedVersion}/data/en_US/champion.json`
        );
        
        // Convert object of champions to array
        const championsArray = Object.values(response.data.data) as Champion[];
        setChampions(championsArray);
        setFilteredChampions(championsArray);
        
        // Set a random featured champion
        const randomIndex = Math.floor(Math.random() * championsArray.length);
        setFeatured(championsArray[randomIndex]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching champions:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort champions
  useEffect(() => {
    let result = [...champions];
    
    // Filter by search
    if (searchQuery) {
      result = result.filter(champion => 
        champion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        champion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by role
    if (filter && filter !== "All") {
      result = result.filter(champion => 
        champion.tags.includes(filter)
      );
    }
    
    // Sort champions
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "role") {
        return sortDirection === "asc"
          ? a.tags[0].localeCompare(b.tags[0])
          : b.tags[0].localeCompare(a.tags[0]);
      }
      return 0;
    });
    
    setFilteredChampions(result);
  }, [champions, searchQuery, filter, sortBy, sortDirection]);

  const handleRoleFilter = (role: string) => {
    setFilter(role === "All" ? null : role);
  };
  
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction if clicking the same sort option
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navigation />
      
      {/* Version badge for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-mono z-50 border border-purple-500/20 shadow-lg">
          Data Dragon v{latestVersion}
        </div>
      )}
      
      {/* Featured Champion Header */}
      {featured && !loading && (
        <div className="relative">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div 
            className="h-80 w-full bg-center bg-cover" 
            style={{ 
              backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${featured.id}_0.jpg)`,
              backgroundPosition: "center 20%"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10"></div>
          
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1 block">Featured Champion</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white">{featured.name}</h1>
            <p className="text-lg text-white/70 max-w-md mt-2">{featured.title}</p>
            <Link
              href={`/champion/${featured.id}`}
              className="mt-4 inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow transition-all duration-300"
            >
              View Champion Details
            </Link>
          </div>
        </div>
      )}
      
      {/* Main Content Header */}
      <div className="border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Champion Roster</h1>
          <p className="mt-2 text-zinc-400">Explore the full lineup of League of Legends champions</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-auto relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-10 bg-purple-500/5 border-purple-500/15 focus:border-purple-400 text-white"
                placeholder="Search champions or roles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort options */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Sort by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("name")}
                className={`px-2 py-1 ${sortBy === "name" ? "text-purple-400" : "text-zinc-400"}`}
              >
                Name
                {sortBy === "name" && (
                  <ArrowUpDown size={14} className="ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("role")}
                className={`px-2 py-1 ${sortBy === "role" ? "text-purple-400" : "text-zinc-400"}`}
              >
                Role
                {sortBy === "role" && (
                  <ArrowUpDown size={14} className="ml-1" />
                )}
              </Button>
            </div>
            
            {/* Role filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {roles.map(role => (
                <Button
                  key={role}
                  onClick={() => handleRoleFilter(role)}
                  variant="outline"
                  className={`px-3 py-1 text-sm ${
                    (role === "All" && !filter) || filter === role
                      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : "bg-purple-500/5 text-zinc-400 border-purple-500/10 hover:bg-purple-500/10"
                  }`}
                  style={
                    (role !== "All" && filter === role)
                      ? { backgroundColor: `${roleColors[role]}15`, color: roleColors[role], borderColor: `${roleColors[role]}30` }
                      : undefined
                  }
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Champions Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 mb-6">
              Showing {filteredChampions.length} champions {filter ? `in ${filter} role` : ""}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredChampions.map((champion) => (
                <Link 
                  href={`/champion/${champion.id}`} 
                  key={champion.id}
                  className="group relative overflow-hidden rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div 
                    className="aspect-square overflow-hidden bg-cover bg-center" 
                    style={{
                      backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg)`,
                      backgroundPosition: "center 20%"
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent group-hover:from-black/90 group-hover:via-black/50 transition-all duration-300">
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-lg transition-all duration-300"></div>
                      
                      <div className="absolute top-2 right-2">
                        {champion.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-block px-1.5 py-0.5 mb-1 bg-black/80 backdrop-blur-sm rounded text-[10px] text-right"
                            style={{ color: roleColors[tag] }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-bold text-purple-400 text-lg truncate group-hover:text-purple-300 transition-colors">
                          {champion.name}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">{champion.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-purple-500/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 text-sm">
            LoLytics isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.
          </p>
        </div>
      </footer>
    </div>
  );
} 