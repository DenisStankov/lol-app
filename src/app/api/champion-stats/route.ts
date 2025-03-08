import { NextResponse } from 'next/server';
import axios from 'axios';

interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionData {
  id: string;
  key: string;
  name: string;
  image: ChampionImage;
  tags: string[];  // Champion tags from Data Dragon (Fighter, Mage, etc.)
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
}

interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

interface ChampionDataResponse {
  type: string;
  version: string;
  data: Record<string, ChampionData>;
}

// Role mapping for consistent naming
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const roleMapping: Record<string, string> = {
  "TOP": "TOP",
  "JUNGLE": "JUNGLE",
  "MIDDLE": "MIDDLE",
  "BOTTOM": "BOTTOM",
  "UTILITY": "UTILITY",
  "top": "TOP",
  "jungle": "JUNGLE",
  "mid": "MIDDLE",
  "middle": "MIDDLE",
  "bot": "BOTTOM",
  "bottom": "BOTTOM", 
  "adc": "BOTTOM",
  "supp": "UTILITY",
  "sup": "UTILITY",
  "support": "UTILITY",
};

// Tier type follows standard tier list format
type TierType = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

interface RoleStats {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: TierType;
}

interface ChampionStats {
  id: string;
  name: string;
  image: ChampionImage;
  roles: Record<string, RoleStats>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
}

// Calculate tier based on win rate, pick rate, and ban rate
function calculateTier(winRate: number, pickRate: number, banRate: number): TierType {
  // Calculate presence (pick rate + ban rate)
  const presence = pickRate + banRate;
  
  // Calculate score based on win rate and presence (similar to dpm.lol approach)
  // Win rate is weighted more heavily, with adjustments based on pick+ban rate
  let score = 0;
  
  // Win rate component (centered around 50%)
  const winRateComponent = (winRate - 50) * 3;
  
  // Presence component (pick + ban rate)
  const presenceComponent = Math.log10(presence) * 5;
  
  // Combined score with adjustments
  score = winRateComponent + presenceComponent;
  
  // Additional bonus for very high win rates
  if (winRate > 52) {
    score += (winRate - 52) * 1.5;
  }
  
  // Additional bonus for very high presence
  if (presence > 20) {
    score += (presence - 20) * 0.3;
  }
  
  // Tier thresholds
  if (score > 15) return 'S+';  // Extremely strong champions
  if (score > 10) return 'S';   // Very strong champions
  if (score > 5) return 'A';    // Strong champions
  if (score > 0) return 'B';    // Balanced champions
  if (score > -5) return 'C';   // Below average champions
  return 'D';                  // Weak champions
}

// Function to get the current patch version
async function getCurrentPatch(): Promise<string> {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!response.ok) {
      throw new Error('Failed to fetch versions');
    }
    const versions = await response.json();
    return versions[0]; // Return the latest version
  } catch (error) {
    console.error('Error fetching current patch:', error);
    return '14.14.1'; // Fallback to a known version
  }
}

// Map Data Dragon tags to damage type
function getDamageType(tags: string[], info: ChampionInfo): 'AP' | 'AD' | 'Hybrid' {
  if (tags.includes('Assassin') && tags.includes('Mage')) return 'Hybrid';
  if (tags.includes('Marksman') && tags.includes('Mage')) return 'Hybrid';
  
  // Champions with high magic damage are typically AP
  if (info.magic > 7) return 'AP';
  if (tags.includes('Mage')) return 'AP';
  if (tags.includes('Support') && !tags.includes('Fighter') && !tags.includes('Tank')) return 'AP';
  
  // Certain tags usually indicate AD champions
  if (tags.includes('Marksman')) return 'AD';
  if (tags.includes('Fighter') && !tags.includes('Mage')) return 'AD';
  if (tags.includes('Assassin') && !tags.includes('Mage')) return 'AD';
  
  // Hybrid champions
  if (info.attack > 5 && info.magic > 5) return 'Hybrid';
  
  // Default to AD if unsure
  return 'AD';
}

// Map Data Dragon info to difficulty
function getDifficulty(info: ChampionInfo): 'Easy' | 'Medium' | 'Hard' {
  const difficultyRating = info.difficulty;
  
  if (difficultyRating <= 3) return 'Easy';
  if (difficultyRating <= 7) return 'Medium';
  return 'Hard';
}

// Function to normalize role names
function normalizeRoleName(role: string): string {
  return roleMapping[role] || role;
}

// Fetch champion stats from Riot API
async function fetchChampionStats(): Promise<Record<string, Record<string, RoleStats>>> {
  try {
    // In a real implementation, you would fetch data from the Riot API endpoints shown in the images
    // For example:
    // const championRotations = await fetch('/lol/platform/v3/champion-rotations');
    // We'll simulate the response for this exercise
    
    // This would be the actual implementation using the endpoints you have access to
    // const response = await fetch('https://your-proxy-server.com/lol/league/v4/entries/by-summoner/{encryptedSummonerId}', {
    //   headers: { 'X-Riot-Token': process.env.RIOT_API_KEY as string }
    // });
    
    // Mock data for demonstration - this would be replaced with real API calls
    const champStats: Record<string, Record<string, RoleStats>> = {};
    
    // Popular champions in their respective roles with realistic stats
    const popularChampions = [
      // TOP LANE
      { id: 'Darius', roles: ['TOP'], winRate: 51.7, pickRate: 9.8, banRate: 15.2 },
      { id: 'Jax', roles: ['TOP', 'JUNGLE'], winRate: 50.3, pickRate: 8.2, banRate: 9.5 },
      { id: 'Sett', roles: ['TOP'], winRate: 52.4, pickRate: 7.8, banRate: 6.9 },
      { id: 'Fiora', roles: ['TOP'], winRate: 49.8, pickRate: 7.2, banRate: 8.1 },
      { id: 'Camille', roles: ['TOP'], winRate: 50.2, pickRate: 6.4, banRate: 4.3 },
      { id: 'Irelia', roles: ['TOP', 'MIDDLE'], winRate: 49.5, pickRate: 8.9, banRate: 12.3 },
      { id: 'Garen', roles: ['TOP'], winRate: 51.9, pickRate: 5.6, banRate: 2.8 },
      { id: 'Mordekaiser', roles: ['TOP'], winRate: 52.3, pickRate: 6.1, banRate: 7.2 },

      // JUNGLE
      { id: 'LeeSin', roles: ['JUNGLE'], winRate: 48.3, pickRate: 11.2, banRate: 8.7 },
      { id: 'Kayn', roles: ['JUNGLE'], winRate: 50.7, pickRate: 10.1, banRate: 11.5 },
      { id: 'Graves', roles: ['JUNGLE'], winRate: 49.8, pickRate: 7.5, banRate: 4.1 },
      { id: 'Hecarim', roles: ['JUNGLE'], winRate: 52.2, pickRate: 8.3, banRate: 9.6 },
      { id: 'Udyr', roles: ['JUNGLE'], winRate: 53.1, pickRate: 5.4, banRate: 7.8 },
      { id: 'Karthus', roles: ['JUNGLE'], winRate: 51.3, pickRate: 4.2, banRate: 2.1 },
      { id: 'Khazix', roles: ['JUNGLE'], winRate: 50.2, pickRate: 6.8, banRate: 5.4 },
      { id: 'Shaco', roles: ['JUNGLE', 'UTILITY'], winRate: 51.4, pickRate: 6.3, banRate: 10.2 },

      // MIDDLE
      { id: 'Yasuo', roles: ['MIDDLE'], winRate: 49.2, pickRate: 12.5, banRate: 18.3 },
      { id: 'Zed', roles: ['MIDDLE'], winRate: 50.3, pickRate: 10.8, banRate: 20.1 },
      { id: 'Ahri', roles: ['MIDDLE'], winRate: 51.5, pickRate: 9.3, banRate: 3.2 },
      { id: 'Syndra', roles: ['MIDDLE'], winRate: 49.7, pickRate: 6.1, banRate: 2.8 },
      { id: 'Viktor', roles: ['MIDDLE'], winRate: 52.1, pickRate: 5.7, banRate: 3.1 },
      { id: 'Leblanc', roles: ['MIDDLE'], winRate: 48.9, pickRate: 7.2, banRate: 9.3 },
      { id: 'Katarina', roles: ['MIDDLE'], winRate: 50.8, pickRate: 8.4, banRate: 12.5 },
      { id: 'Sylas', roles: ['MIDDLE', 'TOP'], winRate: 50.1, pickRate: 9.1, banRate: 11.2 },
      { id: 'Lux', roles: ['MIDDLE', 'UTILITY'], winRate: 51.8, pickRate: 11.5, banRate: 5.6 },

      // BOTTOM
      { id: 'Jinx', roles: ['BOTTOM'], winRate: 52.1, pickRate: 14.5, banRate: 7.8 },
      { id: 'Caitlyn', roles: ['BOTTOM'], winRate: 50.6, pickRate: 12.8, banRate: 6.9 },
      { id: 'Ezreal', roles: ['BOTTOM'], winRate: 49.2, pickRate: 15.6, banRate: 5.3 },
      { id: 'Jhin', roles: ['BOTTOM'], winRate: 51.3, pickRate: 11.2, banRate: 4.1 },
      { id: 'Vayne', roles: ['BOTTOM', 'TOP'], winRate: 50.4, pickRate: 10.6, banRate: 14.2 },
      { id: 'Samira', roles: ['BOTTOM'], winRate: 50.9, pickRate: 9.7, banRate: 16.8 },
      { id: 'KaiSa', roles: ['BOTTOM'], winRate: 49.8, pickRate: 13.2, banRate: 6.3 },
      { id: 'MissFortune', roles: ['BOTTOM'], winRate: 52.4, pickRate: 8.9, banRate: 2.7 },

      // UTILITY (SUPPORT)
      { id: 'Thresh', roles: ['UTILITY'], winRate: 50.9, pickRate: 13.7, banRate: 6.2 },
      { id: 'Pyke', roles: ['UTILITY'], winRate: 50.2, pickRate: 9.3, banRate: 12.8 },
      { id: 'Blitzcrank', roles: ['UTILITY'], winRate: 51.6, pickRate: 10.2, banRate: 18.9 },
      { id: 'Leona', roles: ['UTILITY'], winRate: 51.8, pickRate: 8.7, banRate: 9.4 },
      { id: 'Morgana', roles: ['UTILITY', 'MIDDLE'], winRate: 50.5, pickRate: 10.4, banRate: 22.3 },
      { id: 'Nami', roles: ['UTILITY'], winRate: 51.3, pickRate: 7.1, banRate: 2.1 },
      { id: 'Soraka', roles: ['UTILITY'], winRate: 52.7, pickRate: 6.8, banRate: 4.6 },
      { id: 'Yuumi', roles: ['UTILITY'], winRate: 48.9, pickRate: 8.2, banRate: 19.5 },
    ];
    
    popularChampions.forEach(champion => {
      if (!champStats[champion.id]) {
        champStats[champion.id] = {};
      }
      
      champion.roles.forEach(role => {
        // Normalize the role name using our mapping
        const normalizedRole = normalizeRoleName(role);
        
        // Adjust stats slightly for secondary roles
        const isSecondaryRole = role !== champion.roles[0];
        const winRateAdjustment = isSecondaryRole ? -1.5 : 0;
        const pickRateAdjustment = isSecondaryRole ? -3.0 : 0;
        
        champStats[champion.id][normalizedRole] = {
          winRate: champion.winRate + winRateAdjustment,
          pickRate: champion.pickRate + pickRateAdjustment,
          banRate: champion.banRate,
          totalGames: Math.floor((champion.pickRate + pickRateAdjustment) * 10000),
          tier: calculateTier(
            champion.winRate + winRateAdjustment, 
            champion.pickRate + pickRateAdjustment, 
            champion.banRate
          )
        };
      });
    });
    
    return champStats;
  } catch (error) {
    console.error('Error fetching champion stats from Riot API:', error);
    return {};  // Return empty object on error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || await getCurrentPatch();
    
    console.log(`Fetching champion data for patch ${patch}`);

    // Get the list of all champions from Data Dragon (Riot's official CDN)
    const championsResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    const champions = championsResponse.data.data;
    
    // Fetch champion stats from Riot API
    const riotChampionStats = await fetchChampionStats();
    
    const champStats: Record<string, ChampionStats> = {};
    
    // Process each champion
    for (const champKey in champions) {
      const champion = champions[champKey];
      
      // Get champion's difficulty and attributes
      const difficulty = getDifficulty(champion.info);
      const damageType = getDamageType(champion.tags, champion.info);
      const range = champion.tags.includes('Marksman') ? 'Ranged' : 
                   (champion.id === 'Thresh' || champion.id === 'Urgot') ? 'Ranged' : 'Melee';
      
      // Initialize roles
      const roles: Record<string, RoleStats> = {};
      
      // If we have stats from Riot API for this champion, use them
      if (riotChampionStats[champion.id]) {
        Object.entries(riotChampionStats[champion.id]).forEach(([role, stats]) => {
          roles[role] = stats;
        });
      } else {
        // Otherwise, generate some reasonable mock data based on champion tags
        const potentialRoles = [];
        
        if (champion.tags.includes('Tank') || champion.tags.includes('Fighter')) {
          potentialRoles.push('TOP');
        }
        
        if ((champion.tags.includes('Assassin') || champion.tags.includes('Mage')) &&
            !champion.tags.includes('Support')) {
          potentialRoles.push('MIDDLE');
        }
        
        if (champion.tags.includes('Marksman')) {
          potentialRoles.push('BOTTOM');
        }
        
        if (champion.tags.includes('Support')) {
          potentialRoles.push('UTILITY');
        }
        
        // Special case for certain jungle champions
        const commonJunglers = ['Amumu', 'Elise', 'Hecarim', 'Ivern', 'JarvanIV', 'Kayn', 
          'KhaZix', 'LeeSin', 'Nocturne', 'RekSai', 'Vi', 'Warwick', 'Zac'];
        
        if (commonJunglers.includes(champion.id) || 
            (champion.tags.includes('Fighter') && !potentialRoles.includes('TOP'))) {
          potentialRoles.push('JUNGLE');
        }
        
        // If no roles determined, default to a reasonable one
        if (potentialRoles.length === 0) {
          potentialRoles.push('TOP');
        }
        
        // Create data for each potential role
        potentialRoles.forEach((role, index) => {
          // Normalize the role name
          const normalizedRole = normalizeRoleName(role);
          
          // Primary role gets better stats than secondary roles
          const isPrimary = index === 0;
          
          // Base win rate around 50% with some variation
          const baseWinRate = 50 + (Math.random() * 6 - 3);
          
          // Pick rate is higher for primary role
          const pickRate = isPrimary ? 5 + (Math.random() * 10) : 2 + (Math.random() * 5);
          
          // Ban rate depends on champion's perceived strength
          const banRate = baseWinRate > 52 ? 5 + (Math.random() * 15) : 1 + (Math.random() * 5);
          
          // Total games based on pick rate
          const totalGames = Math.floor(pickRate * 10000);
          
          // Calculate tier
          const tier = calculateTier(baseWinRate, pickRate, banRate);
          
          roles[normalizedRole] = {
            winRate: parseFloat(baseWinRate.toFixed(1)),
            pickRate: parseFloat(pickRate.toFixed(1)),
            banRate: parseFloat(banRate.toFixed(1)),
            totalGames,
            tier
          };
        });
      }
      
      champStats[champion.id] = {
        id: champion.id,
        name: champion.name,
        image: champion.image, // Direct from Data Dragon
        roles,
        difficulty,
        damageType,
        range
      };
    }

    // Cache the results for 1 hour
    const cacheControl = 'public, s-maxage=3600, stale-while-revalidate=1800';

    return NextResponse.json(champStats, {
      headers: {
        'Cache-Control': cacheControl
      }
    });
  } catch (error) {
    console.error('Error fetching champion stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion stats' },
      { status: 500 }
    );
  }
} 