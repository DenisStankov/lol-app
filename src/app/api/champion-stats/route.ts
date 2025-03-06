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
  // We'll add more properties as needed from the Data Dragon API
}

interface ChampionDataResponse {
  type: string;
  version: string;
  data: Record<string, ChampionData>;
}

// Tier type follows popular tier list formats
type TierType = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

interface RoleStats {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: TierType; // Tier information
}

interface ChampionStats {
  id: string;
  name: string;
  image: ChampionImage;
  roles: Record<string, RoleStats>;
  // Additional metadata
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
}

// Improved tier calculation based on win rate, pick rate, and ban rate
function calculateTier(winRate: number, pickRate: number, banRate: number): TierType {
  // Win rate has highest weight, followed by pick rate, then ban rate
  const score = (winRate - 50) * 3 + pickRate * 0.7 + banRate * 0.3;
  
  if (score > 12) return 'S+';
  if (score > 8) return 'S';
  if (score > 4) return 'A';
  if (score > 0) return 'B';
  if (score > -4) return 'C';
  return 'D';
}

// Champion power levels - these dictate which champions are naturally stronger
// This simulates the current meta state of champions
const championPowerLevels: Record<string, number> = {
  // Strong meta champions (just examples - add more as needed)
  'Aatrox': 6,
  'Ahri': 5,
  'Akali': 8,
  'Aphelios': 7,
  'Ashe': 4,
  'Blitzcrank': 6,
  'Caitlyn': 5,
  'Darius': 7,
  'Garen': 3,
  'Irelia': 8,
  'Jhin': 7,
  'Jinx': 6,
  'Kaisa': 8,
  'Kayle': 5,
  'LeeSin': 7,
  'Lux': 4,
  'MasterYi': 3,
  'Pyke': 6,
  'Samira': 9,
  'Sett': 5,
  'Sylas': 8,
  'Thresh': 7,
  'Vayne': 6,
  'Yasuo': 7,
  'Yone': 8,
  'Yuumi': 4,
  'Zed': 7,
  'Zeri': 8
};

// Role affinity - indicates how well a champion performs in a given role
const roleAffinities: Record<string, Record<string, number>> = {
  // Just some examples - expand as needed
  'Aatrox': { top: 9, mid: 5, jungle: 2 },
  'Ahri': { mid: 9, support: 4 },
  'Caitlyn': { bot: 9 },
  'Darius': { top: 9, jungle: 3 },
  'Garen': { top: 8, mid: 4 },
  'LeeSin': { jungle: 9, top: 3 },
  'Lux': { mid: 7, support: 8 },
  'Pyke': { support: 8, mid: 5 },
  'Thresh': { support: 10 },
  'Yuumi': { support: 10 }
};

// Get role-specific stats based on champion ID and role
async function getRoleStats(championId: string, championName: string, role: string): Promise<RoleStats | null> {
  // Base power level from 1-10 (default to 5 if not specified)
  const basePowerLevel = championPowerLevels[championName] || 5;
  
  // Role-specific affinity from 1-10 (default to values based on role popularity)
  const roleDefaultAffinity: Record<string, number> = {
    'top': 5, 'jungle': 5, 'mid': 5, 'bot': 5, 'support': 5
  };
  
  const roleAffinity = (roleAffinities[championName] && roleAffinities[championName][role]) || 
                       roleDefaultAffinity[role] || 3;
  
  // Calculate stats based on power level and role affinity
  // Champions with high power level and role affinity will have better stats
  const powerScore = (basePowerLevel * 0.6) + (roleAffinity * 0.4);
  
  // Only include roles where champion has reasonable affinity
  if (roleAffinity < 2) return null;
  
  // Add some variation based on champion ID to prevent all stats being the same
  const championIdNumber = parseInt(championId) || championId.charCodeAt(0);
  const variation = (championIdNumber % 10) / 10 - 0.5; // -0.5 to +0.5
  
  // Calculate stats
  const winRate = 48 + (powerScore * 0.7) + (variation * 3);
  const pickRate = 4 + (powerScore * 1.2) + (variation * 5);
  const banRate = 2 + (powerScore * 0.8) + (variation * 3);
  const totalGames = 5000 + Math.floor(pickRate * 1000);
  
  // Calculate tier based on stats
  const tier = calculateTier(winRate, pickRate, banRate);
  
  return {
    winRate,
    pickRate,
    banRate,
    totalGames,
    tier
  };
}

// Determine champion attributes based on their name and ID
// This creates more realistic and consistent attributes
function getChampionAttributes(id: string, name: string): {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
} {
  // Pre-defined attributes for well-known champions
  const knownChampions: Record<string, {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    damageType: 'AP' | 'AD' | 'Hybrid';
    range: 'Melee' | 'Ranged';
  }> = {
    'Aatrox': { difficulty: 'Medium', damageType: 'AD', range: 'Melee' },
    'Ahri': { difficulty: 'Medium', damageType: 'AP', range: 'Ranged' },
    'Akali': { difficulty: 'Hard', damageType: 'AP', range: 'Melee' },
    'Ashe': { difficulty: 'Easy', damageType: 'AD', range: 'Ranged' },
    'Azir': { difficulty: 'Hard', damageType: 'AP', range: 'Ranged' },
    'Blitzcrank': { difficulty: 'Easy', damageType: 'AP', range: 'Melee' },
    'Caitlyn': { difficulty: 'Medium', damageType: 'AD', range: 'Ranged' },
    'Darius': { difficulty: 'Easy', damageType: 'AD', range: 'Melee' },
    'Ezreal': { difficulty: 'Medium', damageType: 'Hybrid', range: 'Ranged' },
    'Garen': { difficulty: 'Easy', damageType: 'AD', range: 'Melee' },
    'Irelia': { difficulty: 'Hard', damageType: 'AD', range: 'Melee' },
    'Jhin': { difficulty: 'Medium', damageType: 'AD', range: 'Ranged' },
    'Kaisa': { difficulty: 'Medium', damageType: 'Hybrid', range: 'Ranged' },
    'LeeSin': { difficulty: 'Hard', damageType: 'AD', range: 'Melee' },
    'Lux': { difficulty: 'Easy', damageType: 'AP', range: 'Ranged' },
    'Pyke': { difficulty: 'Medium', damageType: 'AD', range: 'Melee' },
    'Ryze': { difficulty: 'Hard', damageType: 'AP', range: 'Ranged' },
    'Thresh': { difficulty: 'Medium', damageType: 'AP', range: 'Melee' },
    'Yasuo': { difficulty: 'Hard', damageType: 'AD', range: 'Melee' },
    'Yuumi': { difficulty: 'Easy', damageType: 'AP', range: 'Ranged' },
    'Zed': { difficulty: 'Hard', damageType: 'AD', range: 'Melee' }
  };
  
  // Return pre-defined attributes if available
  if (knownChampions[name]) {
    return knownChampions[name];
  }
  
  // Fallback to deterministic generation for unknown champions
  const championNumber = parseInt(id) || id.charCodeAt(0);
  
  // Determine difficulty
  let difficulty: 'Easy' | 'Medium' | 'Hard';
  const difficultyValue = championNumber % 3;
  if (difficultyValue === 0) difficulty = 'Easy';
  else if (difficultyValue === 1) difficulty = 'Medium';
  else difficulty = 'Hard';
  
  // Determine damage type
  let damageType: 'AP' | 'AD' | 'Hybrid';
  const damageValue = Math.floor(championNumber / 3) % 3;
  if (damageValue === 0) damageType = 'AP';
  else if (damageValue === 1) damageType = 'AD';
  else damageType = 'Hybrid';
  
  // Determine range
  const range = championNumber % 2 === 0 ? 'Melee' : 'Ranged';
  
  return { difficulty, damageType, range };
}

// Fetch the latest patch version dynamically
async function getCurrentPatch(): Promise<string> {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data[0]; // Latest patch version
  } catch (error) {
    console.error('Error fetching patch version:', error);
    return '14.11.1'; // Fallback to a recent version
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || await getCurrentPatch();

    // Get the list of all champions from Data Dragon
    const championsResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    const champions = championsResponse.data.data;
    const roles = ['top', 'jungle', 'mid', 'bot', 'support'];
    const champStats: Record<string, ChampionStats> = {};
    
    for (const champKey in champions) {
      const champion = champions[champKey];
      const roleStats: Record<string, RoleStats> = {};
      
      // Get champion attributes based on ID and name
      const attributes = getChampionAttributes(champion.id, champion.name);

      // Get stats for each role
      for (const role of roles) {
        const stats = await getRoleStats(champion.id, champion.name, role);
        if (stats) {
          // Only include viable roles where pick rate is reasonable
          roleStats[role] = stats;
        }
      }

      // Only include champion if they have stats in at least one role
      if (Object.keys(roleStats).length > 0) {
        champStats[champion.id] = {
          id: champion.id,
          name: champion.name,
          image: champion.image,
          roles: roleStats,
          ...attributes
        };
      }
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