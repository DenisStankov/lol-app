import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API route to fetch summoner profile data by Riot ID or PUUID
 */
export async function GET(request: NextRequest) {
  console.log("📞 fetchSummoner API called");
  try {
    // Get query parameters
    const params = request.nextUrl.searchParams;
    const riotId = params.get('riotId');
    const puuid = params.get('puuid');
    const region = params.get('region') || 'euw1'; // Default to EUW if not specified
    
    console.log("🔍 Query params:", { riotId, puuid, region });
    
    if (!riotId && !puuid) {
      console.log("❌ Missing required parameters");
      return NextResponse.json(
        { error: 'Missing required parameter: riotId or puuid' }, 
        { status: 400 }
      );
    }

    // First try to use the access token from cookies if available
    const accessToken = request.cookies.get('auth_token')?.value;
    console.log("🔑 Access token available:", !!accessToken);
    
    // Set up the Riot API request
    let summonerData;
    
    // Determine which API endpoint to use
    if (accessToken) {
      // If we have an auth token, we can use the authenticated endpoints
      try {
        console.log("🔐 Using authenticated endpoint");
        // Get user data from authenticated endpoint
        const response = await axios.get('https://europe.api.riotgames.com/riot/account/v1/accounts/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log("👤 Me endpoint response:", response.data);
        
        if (response.data && response.data.puuid) {
          // Use the PUUID to get summoner data
          console.log("🎮 Fetching summoner data with PUUID:", response.data.puuid);
          const summonerResponse = await axios.get(
            `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}`,
            {
              headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY || ''
              }
            }
          );
          
          console.log("📊 Summoner data received:", summonerResponse.data);
          summonerData = summonerResponse.data;
        }
      } catch (authError) {
        console.error('❌ Error using auth token:', authError);
        // Fall back to standard API if token is invalid
      }
    }
    
    // If we couldn't get the data with the auth token, fall back to the standard API
    if (!summonerData) {
      console.log("⚠️ No data from authenticated endpoint, trying fallback");
      if (puuid) {
        // Fetch by PUUID
        console.log("🔎 Fetching by PUUID:", puuid);
        const response = await axios.get(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
          {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY || ''
            }
          }
        );
        summonerData = response.data;
        console.log("📊 Summoner data by PUUID:", summonerData);
      } else {
        // We don't have a direct endpoint for Riot ID, so we'll use mock data for now
        console.log("⚠️ Using mock data for Riot ID:", riotId);
        // In a real app, you would implement proper logic to get the summoner from Riot ID
        summonerData = {
          id: '123456',
          accountId: '123456',
          puuid: riotId,
          name: 'LoLytics Summoner',
          profileIconId: 29, // Default profile icon as fallback
          revisionDate: Date.now(),
          summonerLevel: 100
        };
        console.log("📊 Mock summoner data:", summonerData);
      }
    }
    
    console.log("✅ Returning summoner data:", summonerData);
    return NextResponse.json(summonerData);
    
  } catch (error) {
    console.error('❌ Error in fetchSummoner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summoner data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}