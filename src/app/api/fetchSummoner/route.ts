import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/lib/riotUtils';

/**
 * API route to fetch summoner profile data by Riot ID or PUUID
 */
export async function GET(request: NextRequest) {
  console.log("📞 fetchSummoner API called", new Date().toISOString());
  try {
    // Verify API key is available
    console.log("RIOT_API_KEY available:", !!process.env.RIOT_API_KEY);
    console.log("RIOT_API_KEY first few chars:", process.env.RIOT_API_KEY ? process.env.RIOT_API_KEY.substring(0, 4) + "..." : "not set");
    
    // Get query parameters
    const params = request.nextUrl.searchParams;
    const riotId = params.get('riotId');
    const puuid = params.get('puuid');
    const gameName = params.get('gameName');
    const tagLine = params.get('tagLine');
    const region = params.get('region') || 'euw1'; // Default to EUW if not specified
    
    console.log("🔍 Query params:", { riotId, puuid, gameName, tagLine, region });
    
    if (!riotId && !puuid && (!gameName || !tagLine)) {
      console.log("❌ Missing required parameters");
      return NextResponse.json(
        { error: 'Missing required parameter: riotId or puuid or (gameName and tagLine)' }, 
        { status: 400 }
      );
    }

    // Set up the Riot API request
    let summonerData;
    
    // Process search parameters - prioritize these over authenticated user
    if (gameName && tagLine) {
      console.log("🔎 Searching by Riot ID:", `${gameName}#${tagLine}`);
      
      try {
        // First determine the routing value based on region
        const routingValue = getRoutingValue(region);
        
        // Step 1: Get PUUID from Account v1 API
        const accountResponse = await axios.get(
          `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY || ''
            }
          }
        );
        
        if (!accountResponse.data || !accountResponse.data.puuid) {
          throw new Error("Could not find account with this Riot ID");
        }
        
        const retrievedPuuid = accountResponse.data.puuid;
        console.log("✅ Found PUUID:", retrievedPuuid);
        
        // Step 2: Get summoner data by PUUID using Summoner V4 API
        const summonerResponse = await axios.get(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${retrievedPuuid}`,
          {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY || ''
            }
          }
        );
        
        if (!summonerResponse.data) {
          throw new Error("Could not find summoner data for this account");
        }
        
        // Step 3: Create the response with all needed data
        summonerData = {
          ...summonerResponse.data,
          summonerName: gameName,
          tagLine: tagLine,
          region: region,
          profileIconId: summonerResponse.data.profileIconId || 29
        };
        
        console.log("✅ Found summoner by Riot ID:", summonerData);
        return NextResponse.json(summonerData);
      } catch (error) {
        console.error("❌ Error searching by Riot ID:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
          { error: 'Could not find summoner with this Riot ID' },
          { status: 404 }
        );
      }
    }
    else if (puuid) {
      // Fetch by PUUID
      console.log("🔎 Fetching by PUUID:", puuid);
      try {
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
        return NextResponse.json(summonerData);
      } catch (error) {
        console.error("❌ Error fetching by PUUID:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
          { error: 'Could not find summoner with this PUUID' },
          { status: 404 }
        );
      }
    }
    
    // If we get here, try authenticated user (but only if we haven't found by other means)
    const accessToken = request.cookies.get('auth_token')?.value;
    console.log("🔑 Access token available:", !!accessToken);
    
    if (accessToken) {
      console.log("🔑 Using authenticated user token as fallback");
      try {
        const accountResponse = await axios.get('https://europe.api.riotgames.com/riot/account/v1/accounts/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (accountResponse.data && accountResponse.data.gameName && accountResponse.data.tagLine) {
          // We found the authenticated user's data
          const authedGameName = accountResponse.data.gameName;
          const authedTagLine = accountResponse.data.tagLine;
          const authedPuuid = accountResponse.data.puuid;
          
          console.log("🎮 Authenticated user:", `${authedGameName}#${authedTagLine}`);
          
          // Only use this if it matches the requested gameName/tagLine (if provided)
          if (gameName && tagLine && 
              (gameName.toLowerCase() !== authedGameName.toLowerCase() || 
               tagLine.toLowerCase() !== authedTagLine.toLowerCase())) {
            console.log("⚠️ Authenticated user doesn't match requested summoner, ignoring auth token");
            return NextResponse.json(
              { error: 'Could not find the requested summoner' },
              { status: 404 }
            );
          }
          
          // Try to find summoner data for the authenticated user
          try {
            // Try with the specified region first
            const summonerResponse = await axios.get(
              `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${authedPuuid}`,
              { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY || '' } }
            );
            
            summonerData = {
              ...summonerResponse.data,
              summonerName: authedGameName,
              tagLine: authedTagLine,
              region: region,
              profileIconId: summonerResponse.data.profileIconId || 29
            };
            
            console.log("✅ Found authenticated user's summoner data");
            return NextResponse.json(summonerData);
          } catch (regionError) {
            console.error("❌ Error fetching authenticated user data:", 
                         regionError instanceof Error ? regionError.message : String(regionError));
            return NextResponse.json(
              { error: 'Could not find summoner data for authenticated user in this region' },
              { status: 404 }
            );
          }
        }
      } catch (authError) {
        console.error('❌ Error using auth token:', authError instanceof Error ? authError.message : String(authError));
      }
    }
    
    // If we get here, we couldn't find any relevant summoner data
    return NextResponse.json(
      { error: 'Could not find summoner with the provided information' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('❌ Error in fetchSummoner:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch summoner data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}