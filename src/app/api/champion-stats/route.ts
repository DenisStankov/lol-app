import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Helper function to get role-specific stats
async function getRoleStats(championId: string, role: string, patch: string) {
  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-champion/${championId}/role/${role}`,
      {
        params: {
          patch,
          queue: 420, // Ranked Solo/Duo queue
          tier: 'PLATINUM_PLUS' // Plat+ games for better data quality
        },
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );

    const matches = response.data;
    const totalGames = matches.length;

    if (totalGames === 0) {
      return null;
    }

    // Calculate stats from matches
    const wins = matches.filter((match: any) => match.win).length;
    const bans = matches.filter((match: any) => match.banned).length;

    return {
      winRate: (wins / totalGames) * 100,
      pickRate: (totalGames / (totalGames + bans)) * 100,
      banRate: (bans / (totalGames + bans)) * 100,
      totalGames
    };
  } catch (error) {
    console.error(`Error fetching stats for champion ${championId} in ${role}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || '';

    // First, get the list of all champions
    const championsResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    const champions = championsResponse.data.data;

    // Roles we want to check
    const roles = ['top', 'jungle', 'mid', 'bot', 'support'];

    // Process each champion
    const champStats: Record<string, any> = {};
    
    for (const champKey in champions) {
      const champion = champions[champKey];
      const roleStats: Record<string, any> = {};

      // Get stats for each role
      for (const role of roles) {
        const stats = await getRoleStats(champion.key, role, patch);
        if (stats) {
          roleStats[role] = stats;
        }
      }

      // Only include champion if they have stats in at least one role
      if (Object.keys(roleStats).length > 0) {
        champStats[champion.key] = {
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