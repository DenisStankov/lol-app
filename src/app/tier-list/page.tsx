"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, X, Info } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import Navigation from "@/components/navigation"

// Import regions from the correct file
import { regions } from "@/app/api/champion-stats/regions"

interface Champion {
  id: string
  name: string
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  role: string
  tier: string
  image: {
    icon: string
    splash: string
    loading: string
    full: string | null
    sprite: string | null
  }
  difficulty: string
  damageType: string
  range: string
  roles: {
    [key: string]: {
      winRate: number
      pickRate: number
      banRate: number
      totalGames: number
      tier?: string
    }
  }
}

// Only keep interface definitions that are actually used
interface ChampionStatsResponse {
  [key: string]: {
    id: string
    name: string
    image: {
      full: string
    }
    roles: Record<string, RoleStatsResponse>
    difficulty: string
    damageType: string
    range: string
  }
}

interface RoleStatsResponse {
  winRate: number
  pickRate: number
  banRate: number
  totalGames: number
  tier: string
}

// Define SVG icons for roles
const roleData: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "": { 
    label: "ALL", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <g fillRule="evenodd">
          <g fillRule="nonzero">
            <g>
              <path d="M16.293 17.03c.362.628.147 1.43-.48 1.793-.629.364-1.431.149-1.794-.479l-2.144-3.717-2.144 3.717c-.363.628-1.165.843-1.793.48-.628-.363-.843-1.166-.48-1.793l2.144-3.718h-4.29c-.724 0-1.312-.587-1.312-1.312 0-.727.588-1.313 1.313-1.314h4.289L7.457 6.969c-.362-.627-.147-1.43.48-1.792.629-.364 1.431-.149 1.794.479l2.144 3.717 2.144-3.717c.363-.628 1.165-.843 1.793-.48.628.363.843 1.166.48 1.793l-2.144 3.718h4.29c.725 0 1.312.587 1.312 1.312 0 .727-.587 1.314-1.312 1.314h-4.29l2.145 3.718z" />
            </g>
          </g>
        </g>
      </svg>
    ),  
    color: "#FFFFFF" 
  },
  "TOP": { 
    label: "TOP", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
        <path d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z"></path>
      </svg>
    ), 
    color: "#FF9500" 
  },
  "JUNGLE": { 
    label: "JNG", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M5 2c1.58 1.21 5.58 5.02 6.98 9.95 1.4 4.93 0 10.05 0 10.05-2.75-3.16-5.9-5.2-6.18-5.38C5.45 13.81 3 8.79 3 8.79c3.54.87 4.93 4.28 4.93 4.28C7.56 8.7 5 2 5 2zm15 5.91s-1.24 2.47-1.81 4.6c-.24.88-.29 2.2-.29 3.06v.28c0 .35.01.57.01.57s-1.74 2.4-3.38 3.68c.09-1.6.06-3.44-.21-5.33.93-2.02 2.85-5.45 5.68-6.86zm-2.12-5.33s-2.33 3.05-2.84 6.03c-.11.64-.2 1.2-.28 1.7-.38.58-.73 1.16-1.05 1.73-.03-.13-.06-.25-.1-.38-.3-1.07-.7-2.1-1.16-3.08.05-.15.1-.29.17-.44 0 0 1.81-3.78 5.26-5.56z" />
      </svg>
    ), 
    color: "#19B326" 
  },
  "MIDDLE": { 
    label: "MID", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M13.7929 3C14.2383 3 14.4614 3.53857 14.1464 3.85355L11.1464 6.85355C11.0527 6.94732 10.9255 7 10.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V10.7929C7 10.9255 6.94732 11.0527 6.85355 11.1464L3.85355 14.1464C3.53857 14.4614 3 14.2383 3 13.7929V3.5C3 3.22386 3.22386 3 3.5 3H13.7929Z"></path>
        <path d="M17.8536 3.14645C17.9473 3.05268 18.0745 3 18.2071 3H20.5C20.7761 3 21 3.22386 21 3.5V5.79289C21 5.9255 20.9473 6.05268 20.8536 6.14645L6.14645 20.8536C6.05268 20.9473 5.9255 21 5.79289 21H3.5C3.22386 21 3 20.7761 3 20.5V18.2071C3 18.0745 3.05268 17.9473 3.14645 17.8536L17.8536 3.14645Z"></path>
        <path opacity="0.2" d="M10.2071 21C9.76165 21 9.53857 20.4614 9.85355 20.1464L12.8536 17.1464C12.9473 17.0527 13.0745 17 13.2071 17H16.5C16.7761 17 17 16.7761 17 16.5V13.2071C17 13.0745 17.0527 12.9473 17.1464 12.8536L20.1464 9.85355C20.4614 9.53857 21 9.76165 21 10.2071V20.5C21 20.7761 20.7761 21 20.5 21H10.2071Z"></path>
      </svg>
    ), 
    color: "#4F8EFF" 
  },
  "BOTTOM": { 
    label: "BOT", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path opacity="0.2" d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z"></path>
        <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z"></path>
        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z"></path>
      </svg>
    ), 
    color: "#FF4E50" 
  },
  "UTILITY": { 
    label: "SUP", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.4622 10.2574C12.7023 10.2574 12.9114 10.4209 12.9694 10.6538L14.5978 17.1957C14.6081 17.237 14.6133 17.2794 14.6133 17.322V17.8818C14.6133 18.0204 14.5582 18.1534 14.4601 18.2514L13.0238 19.6869C12.9258 19.7848 12.7929 19.8398 12.6543 19.8398H11.3457C11.2071 19.8398 11.0742 19.7848 10.9762 19.6868L9.53979 18.2504C9.44177 18.1524 9.38671 18.0194 9.38671 17.8808V17.3209C9.38671 17.2784 9.39191 17.236 9.40219 17.1947L11.0306 10.6538C11.0886 10.4209 11.2977 10.2574 11.5377 10.2574H12.4622ZM6.55692 6.77339C6.69554 6.77339 6.82848 6.82845 6.9265 6.92647L9.143 9.14297C9.29085 9.29082 9.33635 9.51255 9.25869 9.70668L7.93856 13.0066C7.79919 13.355 7.34903 13.4474 7.08372 13.1821L5.29732 11.3957C5.13821 11.2366 5.09879 10.9935 5.19947 10.7922L5.52419 10.1432C5.69805 9.79566 5.44535 9.38668 5.05676 9.38668H3.56906C3.39433 9.38668 3.23115 9.29936 3.13421 9.15398L2.08869 7.586C1.85709 7.23867 2.10607 6.77339 2.52354 6.77339H6.55692ZM21.4765 6.77339C21.8939 6.77339 22.1429 7.23867 21.9113 7.586L20.8658 9.15398C20.7688 9.29936 20.6057 9.38668 20.4309 9.38668H18.9432C18.5546 9.38668 18.3019 9.79567 18.4758 10.1432L18.8005 10.7922C18.9012 10.9935 18.8618 11.2366 18.7027 11.3957L16.9163 13.1821C16.651 13.4474 16.2008 13.355 16.0614 13.0066L14.7413 9.70668C14.6636 9.51255 14.7092 9.29082 14.857 9.14297L17.0735 6.92647C17.1715 6.82845 17.3045 6.77339 17.4431 6.77339H21.4765ZM13.5907 4.1601C13.738 4.1601 13.8785 4.22224 13.9775 4.33124L14.4774 4.88134C14.5649 4.97754 14.6133 5.10287 14.6133 5.23285V5.74436C14.6133 5.84757 14.5827 5.94846 14.5255 6.03432L13.0259 8.28323C12.929 8.42861 12.7658 8.51593 12.5911 8.51593H11.4089C11.2342 8.51593 11.071 8.42861 10.9741 8.28323L9.47452 6.03432C9.41726 5.94846 9.38671 5.84757 9.38671 5.74436V5.23285C9.38671 5.10287 9.43515 4.97754 9.52257 4.88134L10.0225 4.33124C10.1215 4.22224 10.262 4.1601 10.4093 4.1601H13.5907Z"></path>
      </svg>
    ), 
    color: "#CC66FF" 
  }
}

// Improved tier color mapping to match dpm.lol
const tierColors: Record<string, string> = {
  "S+": "#FF2D55", // Bright red - for extremely strong champions
  "S": "#FF9500",  // Orange - for very strong champions
  "A": "#FFCC00",  // Yellow - for strong champions
  "B": "#34C759",  // Green - for balanced champions
  "C": "#5AC8FA",  // Light blue - for below average champions
  "D": "#AF52DE",  // Purple - for weak champions
}

// Move this component definition outside of the main component function to fix React Hooks error #31
// Define the ChampionCard component here as a separate component
function ChampionCard({ champion, onNavigate }: { champion: Champion, onNavigate: (id: string) => void }) {
  const [imageError, setImageError] = useState(false);
  
  // Function to handle image errors
  const handleImageError = () => {
    console.log(`Image load error for ${champion.name}, using fallback`);
    setImageError(true);
  };
  
  // Function to navigate to champion details page without using router directly inside
  const handleClick = () => {
    onNavigate(champion.id);
  };
  
  // Get role data safely
  const roleInfo = roleData[champion.role] || { label: champion.role, color: "#FFFFFF" };
  
  return (
    <div 
      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 border border-zinc-800 hover:border-[#C89B3C]/60 shadow-md hover:shadow-lg hover:shadow-[#C89B3C]/10 cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {/* Champion header with image and basic info */}
      <div className="relative">
        {/* Champion splash art as background */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: `url(${champion.image.splash})` }} 
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/70 to-zinc-900"></div>
        
        <div className="relative p-4 flex items-center gap-4 z-10">
          {/* Champion image with Next.js Image component */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            {!imageError ? (
              <Image
                src={champion.image.icon}
                alt={champion.name}
                width={56}
                height={56}
                className="object-cover"
                onError={handleImageError}
                unoptimized={true}
              />
            ) : (
              <>
                <Image
                  src="/images/champions/fallback.png"
                  alt={champion.name}
                  width={56}
                  height={56}
                  className="object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 bg-opacity-50">
                  <span className="text-xs font-bold text-white text-center px-1">
                    {champion.name.substring(0, 4)}
                  </span>
                </div>
              </>
            )}
            
            {/* Tier badge */}
            <div 
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md text-black"
              style={{ backgroundColor: tierColors[champion.tier] || '#5AC8FA' }}
            >
              {champion.tier}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold truncate text-lg">
                {champion.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-black font-medium shadow-sm"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
            
            <div className="flex gap-2 items-center text-xs text-zinc-400">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.difficulty}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.damageType}
              </span>
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md border border-zinc-700">
                {champion.range}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Champion stats */}
      <div className="p-3 grid grid-cols-3 gap-1 bg-zinc-800/50 border-t border-zinc-700/30">
        <div className="text-center py-1 px-2 rounded-md bg-green-900/20 border border-green-900/30">
          <div className="text-green-400 font-bold text-sm">{champion.winRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Win Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-blue-900/20 border border-blue-900/30">
          <div className="text-blue-400 font-bold text-sm">{champion.pickRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Pick Rate</div>
        </div>
        
        <div className="text-center py-1 px-2 rounded-md bg-red-900/20 border border-red-900/30">
          <div className="text-red-400 font-bold text-sm">{champion.banRate.toFixed(1)}%</div>
          <div className="text-zinc-500 text-[10px]">Ban Rate</div>
        </div>
      </div>
      
      {/* View details indicator */}
      <div className="px-3 py-2 text-xs text-center text-[#C89B3C] border-t border-zinc-800 bg-zinc-900/80 font-medium">
        View Champion Details
      </div>
    </div>
  );
}

export default function TierList() {
  // Define state variables for filters with consistent naming
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRank, setSelectedRank] = useState("ALL")
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedDamageType, setSelectedDamageType] = useState<string[]>([])
  const [selectedRange, setSelectedRange] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchVersion, setPatchVersion] = useState("")
  const [availablePatches, setAvailablePatches] = useState<string[]>([])
  const [selectedPatch, setSelectedPatch] = useState("")
  const [sortBy, setSortBy] = useState("tier")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [riotApiKey, setRiotApiKey] = useState<string>("")
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  
  // Define router at the component level
  const router = useRouter();
  
  // Function to handle champion navigation
  const navigateToChampion = (championId: string) => {
    router.push(`/champion/${championId}`);
  };
  
  // Function to refetch data when there's an error
  const refetchData = () => {
    setLoading(true);
    setError(null);
    fetchChampionData();
  };
  
  // Function to fetch champion data
  const fetchChampionData = async () => {
    try {
      setLoading(true);
      
      const patchToUse = selectedPatch || "latest";
      const rankToUse = selectedRank || "ALL";
      
      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const apiUrl = `/api/champion-stats?patch=${patchToUse}&rank=${rankToUse}`;
      console.log(`Fetching champion data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received data for ${Object.keys(data).length} champions`);
      
      // Transform data to match Champion interface
      const transformedChampions = Object.values(data).map((champion: any) => {
        // Select primary role based on pick rate
        const roles = champion.roles || {};
        let primaryRole = "";
        let highestPickRate = 0;
        
        Object.entries(roles).forEach(([role, stats]: [string, any]) => {
          if (stats.pickRate > highestPickRate) {
            highestPickRate = stats.pickRate;
            primaryRole = role;
          }
        });
        
        if (!primaryRole && Object.keys(roles).length > 0) {
          primaryRole = Object.keys(roles)[0];
        } else if (!primaryRole) {
          primaryRole = "TOP";
        }
        
        const primaryRoleStats = roles[primaryRole] || {
          winRate: 50,
          pickRate: 5,
          banRate: 2,
          totalGames: 1000,
          tier: "C"
        };
        
        // Create proper image object with structure matching the Champion interface
        let imageObject;
        
        if (champion.image && typeof champion.image === 'object') {
          // If the image is already an object, ensure it has the correct structure
          imageObject = {
            icon: champion.image.icon || `https://ddragon.leagueoflegends.com/cdn/${patchToUse}/img/champion/${champion.id}.png`,
            splash: champion.image.splash || `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`,
            loading: champion.image.loading || `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
            full: champion.image.full || null,
            sprite: champion.image.sprite || null
          };
        } else {
          // If the image is not an object, create a new image object
          imageObject = {
            icon: `https://ddragon.leagueoflegends.com/cdn/${patchToUse}/img/champion/${champion.id}.png`,
            splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`,
            loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
            full: null,
            sprite: null
          };
        }
        
        return {
          id: champion.id,
          name: champion.name,
          image: imageObject,
          winRate: primaryRoleStats.winRate,
          pickRate: primaryRoleStats.pickRate,
          banRate: primaryRoleStats.banRate,
          totalGames: primaryRoleStats.totalGames || 0,
          role: primaryRole,
          tier: primaryRoleStats.tier || "C",
          roles: champion.roles,
          difficulty: champion.difficulty || "Medium",
          damageType: champion.damageType || "AD",
          range: champion.range || "Melee",
        };
      });
      
      setChampions(transformedChampions);
      setFilteredChampions(transformedChampions);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching champions:", error);
      
      // Try fallback to Data Dragon API
      try {
        console.log("Starting Data Dragon fallback data fetch");
        await fetchDataDragonChampions();
        // If fallback succeeded, show notification but don't stop the user
        setError(null);
        setUsingFallbackData(true);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setError(`All data sources failed: ${(fallbackError as Error).message}`);
        setLoading(false);
      }
    }
  };
  
  // Fallback function to fetch from Data Dragon API
  const fetchDataDragonChampions = async () => {
    try {
      console.log("Starting Data Dragon fallback data fetch");
      // Get latest version
      const versionsResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
      const versions = await versionsResponse.json();
      const latestVersion = versions[0];
      setPatchVersion(latestVersion);
      
      // Fetch champion data
      const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
      const championsData = await championsResponse.json();
      
      console.log(`Fetched ${Object.keys(championsData.data).length} champions from Data Dragon`);
      
      // Transform data
      const transformedChampions = Object.values(championsData.data).map((champion: any) => {
        // Create simulated tier and stats
        const tier = ["S+", "S", "A", "B", "C", "D"][Math.floor(Math.random() * 6)];
        const winRate = 45 + Math.random() * 10;
        const pickRate = 1 + Math.random() * 10;
        const banRate = 1 + Math.random() * 5;
        const totalGames = Math.floor(1000 + Math.random() * 9000);
        
        // Determine role from tags
        const role = determineRoleFromTags(champion.tags);
        
        // Create a properly structured image object
        const imageObject = {
          icon: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
          splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`,
          loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
          full: champion.image.full || null,
          sprite: champion.image.sprite || null
        };
        
        // Create role-specific stats for every possible role
        const roles: Record<string, any> = {};
        ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"].forEach(r => {
          // Create slightly varied stats for each role
          const variation = -5 + Math.random() * 10;
          roles[r] = {
            tier: ["S+", "S", "A", "B", "C", "D"][Math.floor(Math.random() * 6)],
            winRate: Math.max(40, Math.min(60, winRate + variation)),
            pickRate: Math.max(0.5, Math.min(20, pickRate + variation / 2)),
            banRate: Math.max(0.1, Math.min(15, banRate + variation / 3)),
            totalGames: Math.floor(totalGames * (0.5 + Math.random() * 1))
          };
        });
        
        // Ensure primary role has highest pickRate
        roles[role].pickRate = Math.max(...Object.values(roles).map(r => r.pickRate)) + 5;
        
        return {
          id: champion.id,
          name: champion.name,
          image: imageObject,
          winRate: winRate,
          pickRate: pickRate,
          banRate: banRate,
          totalGames: totalGames,
          role: role,
          tier: tier,
          roles: roles,
          difficulty: champion.info.difficulty <= 3 ? "Easy" : (champion.info.difficulty >= 7 ? "Hard" : "Medium"),
          damageType: champion.tags.includes("Mage") ? "AP" : "AD",
          range: champion.stats.attackrange > 150 ? "Ranged" : "Melee",
        };
      });
      
      console.log("Successfully processed fallback data");
      
      // Don't set an error, just show a one-time toast or notification instead
      setChampions(transformedChampions);
      setFilteredChampions(transformedChampions);
      setLoading(false);
      
      // Use a more subtle notification rather than an error screen
      console.log("Using fallback data from Data Dragon API");
      return true; // Return success
    } catch (error) {
      console.error("Fallback fetch failed:", error);
      throw error;
    }
  };
  
  // Helper function to determine role from champion tags
  const determineRoleFromTags = (tags: string[]) => {
    if (tags.includes("Marksman")) return "BOTTOM";
    if (tags.includes("Support")) return "UTILITY";
    if (tags.includes("Mage")) return "MIDDLE";
    if (tags.includes("Assassin")) return "MIDDLE";
    if (tags.includes("Fighter")) return "TOP";
    if (tags.includes("Tank")) return "TOP";
    return "TOP";
  };
  
  // Initial data load
  useEffect(() => {
    fetchChampionData();
  }, []);
  
  // Filter and sort champions
  useEffect(() => {
    let filtered = [...champions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((champ) => champ.name.toLowerCase().includes(query))
    }

    // Apply role filter
    if (selectedRole !== "") {
      // Create a new array with champions that have data for the selected role
      filtered = champions.filter(
        (champ) => champ.roles && champ.roles[selectedRole] && champ.roles[selectedRole].pickRate > 0
      ).map(champ => {
        // Clone the champion object but update with role-specific stats
        const roleStats = champ.roles[selectedRole]
        return {
          ...champ,
          winRate: roleStats.winRate,
          pickRate: roleStats.pickRate,
          banRate: roleStats.banRate,
          totalGames: roleStats.totalGames,
          tier: roleStats.tier || champ.tier,
          role: selectedRole,
        }
      })
    }

    // Filter by tier
    if (selectedTier !== "") {
      filtered = filtered.filter((champ) => champ.tier === selectedTier) 
    }

    // Filter by difficulty
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter((champ) => selectedDifficulty.includes(champ.difficulty))
    }

    // Filter by damage type
    if (selectedDamageType.length > 0) {
      filtered = filtered.filter((champ) => selectedDamageType.includes(champ.damageType))
    }

    // Filter by range
    if (selectedRange.length > 0) {
      filtered = filtered.filter((champ) => selectedRange.includes(champ.range))
    }

    // Apply sorting
    const tierValues: Record<string, number> = {
      "S+": 0,
      S: 1,
      A: 2,
      B: 3,
      C: 4,
      D: 5,
    }

    // Sort champions by tier and then by performance within tier
    const sortedChampions = filtered.sort((a, b) => {
      // First, compare tiers
      const tierDiff = tierValues[a.tier] - tierValues[b.tier];
      if (tierDiff !== 0) return tierDiff;
      
      // If same tier, sort by performance metrics
      const aScore = (a.winRate * 2) + ((a.pickRate + a.banRate) * 0.5);
      const bScore = (b.winRate * 2) + ((b.pickRate + b.banRate) * 0.5);
      
      // Sort by performance score in descending order
      return bScore - aScore;
    });

    setFilteredChampions(sortedChampions)
  }, [
    champions,
    selectedRole,
    selectedTier,
    selectedRank,
    selectedDifficulty,
    selectedDamageType,
    selectedRange,
    sortBy,
    sortOrder,
    searchQuery,
  ])

  const clearAllFilters = useCallback(() => {
    setSelectedRole("");
    setSelectedTier("");
    setSelectedRank("ALL");
    setSelectedRegion("global");
    setSelectedDifficulty([]);
    setSelectedDamageType([]);
    setSelectedRange([]);
    setSearchQuery("");
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Role:")) {
      setSelectedRole("");
    } else if (filter.startsWith("Tier:")) {
      setSelectedTier("");
    } else if (filter.startsWith("Difficulty:")) {
      const difficulty = filter.replace("Difficulty: ", "");
      setSelectedDifficulty(prev => prev.filter(item => item !== difficulty));
    } else if (filter.startsWith("Damage:")) {
      const damageType = filter.replace("Damage: ", "");
      setSelectedDamageType(prev => prev.filter(item => item !== damageType));
    } else if (filter.startsWith("Range:")) {
      const range = filter.replace("Range: ", "");
      setSelectedRange(prev => prev.filter(item => item !== range));
    } else if (filter.startsWith("Search:")) {
      setSearchQuery("");
    }
  }

  const toggleDifficultyFilter = (value: string) => {
    setSelectedDifficulty((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }
  
  const toggleDamageTypeFilter = (value: string) => {
    setSelectedDamageType((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }
  
  const toggleRangeFilter = (value: string) => {
    setSelectedRange((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  const saveRiotApiKey = () => {
    if (riotApiKey.trim()) {
      localStorage.setItem("riotApiKey", riotApiKey);
      alert("API key saved successfully! The page will refresh to apply changes.");
      window.location.reload();
    } else {
      localStorage.removeItem("riotApiKey");
      alert("API key removed. The page will refresh to apply changes.");
      window.location.reload();
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C89B3C]"></div>
          <p className="text-xl text-white">Loading champion data...</p>
        </div>
      </div>
    )
  }
  
  // Handle error state - check if it's a fallback data notification or a true error
  if (error) {
    const isFallback = error.includes("Using fallback data");
    
    return (
      <div className="min-h-screen bg-[#0E1015] p-8">
        <Navigation />
        <div className={`${isFallback ? "bg-blue-500/20 border-blue-500/50" : "bg-red-500/20 border-red-500/50"} border text-white p-8 rounded-lg text-center`}>
          <h2 className="text-2xl font-bold mb-4">{isFallback ? "Using Local Data" : "Error Loading Data"}</h2>
          <p className="mb-4">{isFallback ? "Connected to Data Dragon API for champion information. Some statistics may be simulated." : error}</p>
          <button
            onClick={refetchData}
            className={`px-4 py-2 ${isFallback ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-md transition-colors`}
          >
            {isFallback ? "Continue" : "Try Again"}
          </button>
        </div>
      </div>
    )
  }
  
  // Main render when data is loaded
  return (
    <div className="min-h-screen bg-[#0E1015]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Fallback data notification banner */}
        {usingFallbackData && (
          <div className="mb-8 bg-blue-500/20 border border-blue-500/50 text-white p-4 rounded-lg text-center animate-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-400" />
                <p>Using Data Dragon API for champion data. Some statistics are simulated.</p>
              </div>
              <button
                onClick={refetchData}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm whitespace-nowrap"
              >
                Try API Again
              </button>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative inline-block">
            <span className="relative z-10">Champion Tier List</span>
            <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#C89B3C]/0 via-[#C89B3C]/80 to-[#C89B3C]/0 transform -skew-x-12 z-0"></span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Discover the strongest champions for patch {patchVersion || '15.9.1'} based on win rates, pick rates, and overall performance
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="mb-8 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Patch Selection */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Patch Version</label>
              <div className="relative">
                <select
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-2 appearance-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none transition-all"
                  value={selectedPatch}
                  onChange={(e) => setSelectedPatch(e.target.value)}
                >
                  <option value="">-- All Patches --</option>
                  <option value="15.9.1">Patch 15.9.1</option>
                  <option value="15.8.1">Patch 15.8.1</option>
                  <option value="15.7.1">Patch 15.7.1</option>
                  <option value="15.6.1">Patch 15.6.1</option>
                </select>
                <ChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-zinc-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Rank Selection */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Rank</label>
              <div className="relative">
                <select
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-2 appearance-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none transition-all"
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                >
                  <option value="ALL">All Ranks</option>
                  <option value="MASTER">Master+</option>
                  <option value="DIAMOND">Diamond+</option>
                  <option value="PLATINUM">Platinum+</option>
                  <option value="GOLD">Gold+</option>
                  <option value="SILVER">Silver+</option>
                  <option value="BRONZE">Bronze+</option>
                  <option value="IRON">Iron</option>
                </select>
                <ChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-zinc-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Region Selection */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Region</label>
              <div className="relative">
                <select
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-2 appearance-none focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none transition-all"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="global">Global</option>
                  {Object.keys(regions).map((region) => (
                    <option key={region} value={region}>
                      {regions[region]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-zinc-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Role Filters */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-zinc-500 mb-2">Filter by Role</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleData).map(([role, data]) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(selectedRole === role ? "" : role)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                    selectedRole === role
                      ? "bg-[#C89B3C] text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {data.icon}
                  </span>
                  <span>{String(data.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {["Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => toggleDifficultyFilter(diff)}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      selectedDifficulty.includes(diff)
                        ? "bg-[#C89B3C] text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Damage Type Filter */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2">Damage Type</label>
              <div className="flex flex-wrap gap-2">
                {["AD", "AP", "Hybrid"].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleDamageTypeFilter(type)}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      selectedDamageType.includes(type)
                        ? "bg-[#C89B3C] text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Range Filter */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2">Range</label>
              <div className="flex flex-wrap gap-2">
                {["Melee", "Ranged"].map((range) => (
                  <button
                    key={range}
                    onClick={() => toggleRangeFilter(range)}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      selectedRange.includes(range)
                        ? "bg-[#C89B3C] text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedRole || 
           selectedDifficulty.length > 0 || 
           selectedDamageType.length > 0 || 
           selectedRange.length > 0 || 
           searchQuery) && (
             <div className="mt-4 pt-4 border-t border-zinc-800">
               <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-xs font-medium text-zinc-500">Active Filters:</span>
                 
                 {selectedRole && (
                   <button
                     onClick={() => setSelectedRole("")}
                     className="flex items-center gap-1 bg-[#C89B3C]/20 text-[#C89B3C] px-2 py-1 rounded-md text-xs"
                   >
                     Role: {String(roleData[selectedRole]?.label || selectedRole)}
                     <X className="h-3 w-3" />
                   </button>
                 )}

                 {selectedDifficulty.map((filter) => (
                   <button
                     key={filter}
                     onClick={() => removeFilter(`Difficulty: ${filter}`)}
                     className="flex items-center gap-1 bg-[#C89B3C]/20 text-[#C89B3C] px-2 py-1 rounded-md text-xs"
                   >
                     Difficulty: {filter}
                     <X className="h-3 w-3" />
                   </button>
                 ))}

                 {selectedDamageType.map((filter) => (
                   <button
                     key={filter}
                     onClick={() => removeFilter(`Damage: ${filter}`)}
                     className="flex items-center gap-1 bg-[#C89B3C]/20 text-[#C89B3C] px-2 py-1 rounded-md text-xs"
                   >
                     Damage: {filter}
                     <X className="h-3 w-3" />
                   </button>
                 ))}

                 {selectedRange.map((filter) => (
                   <button
                     key={filter}
                     onClick={() => removeFilter(`Range: ${filter}`)}
                     className="flex items-center gap-1 bg-[#C89B3C]/20 text-[#C89B3C] px-2 py-1 rounded-md text-xs"
                   >
                     Range: {filter}
                     <X className="h-3 w-3" />
                   </button>
                 ))}

                 {searchQuery && (
                   <button
                     onClick={() => setSearchQuery("")}
                     className="flex items-center gap-1 bg-[#C89B3C]/20 text-[#C89B3C] px-2 py-1 rounded-md text-xs"
                   >
                     Search: {searchQuery}
                     <X className="h-3 w-3" />
                   </button>
                 )}
                 
                 <button
                   onClick={() => {
                     setSelectedRole("");
                     setSelectedDifficulty([]);
                     setSelectedDamageType([]);
                     setSelectedRange([]);
                     setSearchQuery("");
                   }}
                   className="text-xs text-white/60 hover:text-white transition-colors underline"
                 >
                   Clear All
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* Champion Tier List */}
        {!loading && !error && filteredChampions.length > 0 && (
          <div className="grid grid-cols-1 gap-8 animate-fadeIn">
            {/* Group champions by tier */}
            {Object.entries(tierColors).map(([tier, color]) => {
              const championsInTier = filteredChampions.filter(
                (champ) => champ.tier === tier
              )

              if (championsInTier.length === 0) return null

              return (
                <div key={tier} className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                  {/* Tier Header */}
                  <div
                    className="p-4 flex items-center gap-4 border-b border-zinc-800"
                    style={{ backgroundColor: `${color}10` }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {tier}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-medium">
                        Tier {tier} Champions
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {championsInTier.length} champion{championsInTier.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Champions Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {championsInTier.map((champion) => (
                      <ChampionCard 
                        key={champion.id + champion.role} 
                        champion={champion} 
                        onNavigate={navigateToChampion}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Champions Found */}
        {!loading && !error && filteredChampions.length === 0 && (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="text-zinc-400 mb-2 text-6xl">😢</div>
            <h3 className="text-white text-xl font-medium mb-2">No Champions Found</h3>
            <p className="text-zinc-400 mb-4">
              No champions match your current filter criteria. Try removing some filters.
            </p>
            <button
              onClick={() => {
                setSelectedRole("");
                setSelectedDifficulty([]);
                setSelectedDamageType([]);
                setSelectedRange([]);
                setSearchQuery("");
              }}
              className="bg-[#C89B3C] text-black px-4 py-2 rounded-md hover:bg-[#C89B3C]/80 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

