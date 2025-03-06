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

// Tier type follows dpm.lol format
type TierType = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

interface RoleStats {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: TierType; // Added tier information
}

interface ChampionStats {
  id: string;
  name: string;
  image: ChampionImage;
  roles: Record<string, RoleStats>;
  // Additional dpm.lol-like data
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
}

// Calculate tier based on win rate and pick rate, mimicking dpm.lol's approach
function calculateTier(winRate: number, pickRate: number): TierType {
  const score = (winRate - 48) * 2 + pickRate * 0.5;
  
  if (score > 15) return 'S+';
  if (score > 10) return 'S';
  if (score > 5) return 'A';
  if (score > 0) return 'B';
  if (score > -5) return 'C';
  return 'D';
}

// Since we can't directly get role-specific stats from the Data Dragon API,
// we'll generate deterministic mock data based on championId and role
async function getRoleStats(championId: string, role: string): Promise<RoleStats | null> {
  // Use championId and role to create deterministic but mock data
  // This ensures the same champion+role always gets the same stats
  const championNumber = parseInt(championId) || championId.charCodeAt(0);
  
  // Different base stats for different roles
  const roleMultipliers: Record<string, { win: number, pick: number, ban: number }> = {
    'top': { win: 1.0, pick: 0.8, ban: 1.2 },
    'jungle': { win: 0.9, pick: 1.2, ban: 0.9 },
    'mid': { win: 1.1, pick: 1.0, ban: 1.3 },
    'bot': { win: 1.2, pick: 0.9, ban: 0.7 },
    'support': { win: 0.95, pick: 0.7, ban: 0.8 }
  };

  const multiplier = roleMultipliers[role] || { win: 1.0, pick: 1.0, ban: 1.0 };
  
  // Seed for deterministic randomness
  const seed = (championNumber % 100) / 100;
  
  // Calculate statistics
  const winRate = 45 + (seed * 15 * multiplier.win); // Win rate between 45-60%
  const pickRate = 3 + (seed * 22 * multiplier.pick); // Pick rate between 3-25%
  const banRate = 1 + (seed * 15 * multiplier.ban); // Ban rate between 1-16%
  const totalGames = 1000 + Math.floor(seed * 10000); // Games between 1000-11000
  
  // Calculate tier based on win and pick rates
  const tier = calculateTier(winRate, pickRate);
  
  return {
    winRate,
    pickRate,
    banRate,
    totalGames,
    tier
  };
}

// Generate deterministic champion attributes based on champion ID
function getChampionAttributes(championId: string): {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
} {
  const championNumber = parseInt(championId) || championId.charCodeAt(0);
  
  // Deterministic difficulty based on champion number
  let difficulty: 'Easy' | 'Medium' | 'Hard';
  const difficultyValue = championNumber % 3;
  if (difficultyValue === 0) difficulty = 'Easy';
  else if (difficultyValue === 1) difficulty = 'Medium';
  else difficulty = 'Hard';
  
  // Deterministic damage type based on champion number
  let damageType: 'AP' | 'AD' | 'Hybrid';
  const damageValue = Math.floor(championNumber / 3) % 3;
  if (damageValue === 0) damageType = 'AP';
  else if (damageValue === 1) damageType = 'AD';
  else damageType = 'Hybrid';
  
  // Deterministic range based on champion number
  const range = championNumber % 2 === 0 ? 'Melee' : 'Ranged';
  
  return { difficulty, damageType, range };
}

// Fetch the latest patch version dynamically
async function getCurrentPatch(): Promise<string> {
  const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
  return response.data[0]; // Latest patch version
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || await getCurrentPatch(); // Fetch current patch if not specified

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
      
      // Get attributes that are consistent across roles
      const attributes = getChampionAttributes(champion.id);

      // Get stats for each role
      for (const role of roles) {
        const stats = await getRoleStats(champion.id, role);
        if (stats) {
          // Only include role if pick rate is above threshold (simulating real data where champions
          // aren't played equally in all roles)
          if (stats.pickRate > 5) {
            roleStats[role] = stats;
          }
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