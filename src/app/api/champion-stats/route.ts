import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

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
// For now, we'll return mock stats
async function getRoleStats(championId: string, role: string): Promise<RoleStats | null> {
  // TODO: Replace with actual API call to get real statistics
  // This is a mock implementation
  return {
    winRate: Math.random() * 10 + 45, // Random win rate between 45-55%
    pickRate: Math.random() * 15 + 5, // Random pick rate between 5-20%
    banRate: Math.random() * 10 + 1, // Random ban rate between 1-11%
    totalGames: Math.floor(Math.random() * 10000 + 1000) // Random games between 1000-11000
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