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
        const accountResponse = await axios.get('https://europe.api.riotgames.com/riot/account/v1/accounts/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log("👤 Account endpoint response:", accountResponse.data);
        
        if (accountResponse.data && accountResponse.data.gameName && accountResponse.data.tagLine) {
          // Use the Riot ID (gameName + tagLine) to get summoner data
          const gameName = accountResponse.data.gameName;
          const tagLine = accountResponse.data.tagLine;
          console.log("🎮 Riot ID found:", `${gameName}#${tagLine}`);
          
          try {
            // First get the PUUID using the Account v1 API
            const riotIdLookupResponse = await axios.get(
              `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
              {
                headers: {
                  'X-Riot-Token': process.env.RIOT_API_KEY || ''
                }
              }
            );
            
            console.log("🔎 Riot ID lookup response:", riotIdLookupResponse.data);
            
            if (riotIdLookupResponse.data && riotIdLookupResponse.data.puuid) {
              // Now get the summoner data using the PUUID
              const summonerResponse = await axios.get(
                `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${riotIdLookupResponse.data.puuid}`,
                {
                  headers: {
                    'X-Riot-Token': process.env.RIOT_API_KEY || ''
                  }
                }
              );
              
              console.log("📊 Summoner data received:", summonerResponse.data);
              summonerData = summonerResponse.data;
              
              // Ensure we include the Riot ID in the response
              summonerData = {
                ...summonerData,
                riotId: `${gameName}#${tagLine}`
              };
            }
          } catch (riotApiError) {
            console.error("❌ Error fetching summoner via Riot API:", riotApiError);
            
            // Create a fallback with at least the real name
            summonerData = {
              id: accountResponse.data.puuid,
              accountId: accountResponse.data.puuid,
              puuid: accountResponse.data.puuid,
              name: gameName,
              profileIconId: 29, // Default icon
              revisionDate: Date.now(),
              summonerLevel: 30,
              riotId: `${gameName}#${tagLine}`
            };
          }
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
        // We don't have a direct endpoint for Riot ID from query params, so let's at least return the Riot ID
        console.log("⚠️ Using mock data for Riot ID:", riotId);
        // In a real app, you would implement proper logic to get the summoner from Riot ID
        summonerData = {
          id: riotId || '123456',
          accountId: riotId || '123456',
          puuid: riotId || '123456',
          name: riotId || 'LoLytics User',
          profileIconId: 29, // Default profile icon as fallback
          revisionDate: Date.now(),
          summonerLevel: 30
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