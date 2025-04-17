import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosResponse } from 'axios';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

interface SummonerData {
  gameName: string;
  tagLine: string;
  puuid: string;
}

interface SummonerStats {
  id: string;
  summonerLevel: number;
  profileIconId: number;
}

interface RankedStats {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  queueType: string;
}

/**
 * API route to fetch summoner profile data by Riot ID or PUUID
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const params = request.nextUrl.searchParams;
    const riotId = params.get('riotId');
    const puuid = params.get('puuid');
    const region = params.get('region') || 'euw1'; // Default to EUW if not specified
    
    if (!riotId && !puuid) {
      return NextResponse.json(
        { error: 'Missing required parameter: riotId or puuid' }, 
        { status: 400 }
      );
    }

    // First try to use the access token from cookies if available
    const accessToken = request.cookies.get('auth_token')?.value;
    
    // Set up the Riot API request
    let summonerData;
    
    // Determine which API endpoint to use
    if (accessToken) {
      // If we have an auth token, we can use the authenticated endpoints
      try {
        // Get user data from authenticated endpoint
        const response = await axios.get('https://europe.api.riotgames.com/riot/account/v1/accounts/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.data && response.data.puuid) {
          // Use the PUUID to get summoner data
          const summonerResponse = await axios.get(
            `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}`,
            {
              headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY || ''
              }
            }
          );
          
          summonerData = summonerResponse.data;
        }
      } catch (authError) {
        console.error('Error using auth token:', authError);
        // Fall back to standard API if token is invalid
      }
    }
    
    // If we couldn't get the data with the auth token, fall back to the standard API
    if (!summonerData) {
      if (puuid) {
        // Fetch by PUUID
        const response = await axios.get(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
          {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY || ''
            }
          }
        );
        summonerData = response.data;
      } else {
        // We don't have a direct endpoint for Riot ID, so we'll use mock data for now
        // In a real app, you would implement proper logic to get the summoner from Riot ID
        summonerData = {
          id: '123456',
          accountId: '123456',
          puuid: riotId,
          name: 'Summoner',
          profileIconId: 29, // Default profile icon as fallback
          revisionDate: Date.now(),
          summonerLevel: 100
        };
      }
    }
    
    return NextResponse.json(summonerData);
    
  } catch (error) {
    console.error('Error fetching summoner data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summoner data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}