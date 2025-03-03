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

interface RoleStats {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
}

interface ChampionStats {
  id: string;
  name: string;
  image: ChampionImage;
  roles: Record<string, RoleStats>;
}

// Since we can't directly get role-specific stats from the Data Dragon API,
// we'll need to get this data from a different source (like u.gg or op.gg)
// For now, we'll generate deterministic mock data based on championId and role
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
  
  return {
    winRate: 45 + (seed * 10 * multiplier.win), // Win rate between 45-55%
    pickRate: 5 + (seed * 15 * multiplier.pick), // Pick rate between 5-20%
    banRate: 1 + (seed * 10 * multiplier.ban), // Ban rate between 1-11%
    totalGames: 1000 + Math.floor(seed * 10000) // Games between 1000-11000
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || '13.23.1'; // Use latest patch if not specified

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

      // Get stats for each role
      for (const role of roles) {
        const stats = await getRoleStats(champion.id, role);
        if (stats) {
          roleStats[role] = stats;
        }
      }

      // Only include champion if they have stats in at least one role
      if (Object.keys(roleStats).length > 0) {
        champStats[champion.id] = {
          id: champion.id,
          name: champion.name,
          image: champion.image,
          roles: roleStats
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