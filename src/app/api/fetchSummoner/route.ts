import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API route to fetch summoner profile data by Riot ID or PUUID
 */
export async function GET(request: NextRequest) {
  // Minimal logging without exposing secrets
  console.log("fetchSummoner GET", new Date().toISOString());
  try {
    // Verify API key presence without printing it
    const API_KEY = process.env.RIOT_SUMMONER_V4_KEY || process.env.RIOT_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    
    // Get query parameters
    const params = request.nextUrl.searchParams;
    const riotId = params.get('riotId');
    const puuid = params.get('puuid');
    const region = params.get('region') || 'euw1'; // Default to EUW if not specified
    
    // Get gameName and tagLine directly from parameters
    const gameName = params.get('gameName');
    const tagLine = params.get('tagLine');
    const isSearched = params.get('isSearched') === 'true';
    
    console.log("🔍 Query params:", { riotId, puuid, gameName, tagLine, region, isSearched });
    
    // Allow for different parameter combinations
    if (!riotId && !puuid && !(gameName && tagLine)) {
      console.log("❌ Missing required parameters");
      return NextResponse.json(
        { error: 'Missing required parameters: Either riotId, puuid, or both gameName and tagLine must be provided' }, 
        { status: 400 }
      );
    }

    // First try to use the access token from cookies if available
    const accessToken = request.cookies.get('auth_token')?.value;
    console.log("🔑 Access token available:", !!accessToken);
    if (accessToken) {
      console.log("🔑 Access token first few chars:", accessToken.substring(0, 5) + "...");
    }
    
    // Set up the Riot API request
    let summonerData;
    
    // Determine which API endpoint to use
    if (accessToken && !isSearched) {
      // Only use auth token if we're not explicitly looking for a searched summoner
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
          
          // IMPORTANT: We need to test all regions since we don't know which one the user's account is in
          const regions = ['euw1', 'na1', 'kr', 'eun1', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1'];
          let foundSummoner = false;
          
          try {
            // First get the PUUID using the Account v1 API
            const riotIdLookupResponse = await axios.get(
              `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
              {
                headers: {
                  'X-Riot-Token': API_KEY || ''
                }
              }
            );
            
            console.log("🔎 Riot ID lookup response:", riotIdLookupResponse.data);
            
            if (riotIdLookupResponse.data && riotIdLookupResponse.data.puuid) {
              // Try to find summoner data in each region
              for (const regionToTry of regions) {
                console.log(`🌐 Trying region ${regionToTry} for summoner data...`);
                try {
                  // Now get the summoner data using the PUUID
                  const summonerResponse = await axios.get(
                    `https://${regionToTry}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${riotIdLookupResponse.data.puuid}`,
                    {
                      headers: {
                        'X-Riot-Token': API_KEY || ''
                      }
                    }
                  );
                  
                  if (summonerResponse.data && summonerResponse.data.profileIconId) {
                    console.log(`✅ Found summoner data in region ${regionToTry}:`, summonerResponse.data);
                    summonerData = summonerResponse.data;
                    
                    // Add additional info
                    summonerData = {
                      ...summonerData,
                      riotId: `${gameName}#${tagLine}`,
                      region: regionToTry
                    };
                    
                    foundSummoner = true;
                    break;
                  }
                } catch (regionError) {
                  console.log(`❌ Error for region ${regionToTry}:`, regionError instanceof Error ? regionError.message : String(regionError));
                }
              }
              
              if (!foundSummoner) {
                console.log("❌ Could not find summoner data in any region");
              }
            }
          } catch (riotApiError) {
            console.error("❌ Error fetching summoner via Riot API:", riotApiError instanceof Error ? riotApiError.message : String(riotApiError));
            
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
        console.error('❌ Error using auth token:', authError instanceof Error ? authError.message : String(authError));
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
              'X-Riot-Token': API_KEY || ''
            }
          }
        );
        summonerData = response.data;
        console.log("📊 Summoner data by PUUID:", summonerData);
      } else if (gameName && tagLine) {
        // Fetch by gameName and tagLine
        console.log(`🔎 Fetching by Riot ID: ${gameName}#${tagLine} in region ${region}`);
        try {
          // First get the account info to get PUUID
          const accountRegion = region.startsWith('euw') || region.startsWith('eun') || region === 'tr1' || region === 'ru'
            ? 'europe'
            : region.startsWith('na') || region.startsWith('br') || region.startsWith('la')
              ? 'americas'
              : 'asia';
              
          console.log(`🌐 Using account region: ${accountRegion}`);
          
          const accountResponse = await axios.get(
            `https://${accountRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            {
              headers: {
                'X-Riot-Token': API_KEY || ''
              }
            }
          );
          
          if (accountResponse.data && accountResponse.data.puuid) {
            // Now get the summoner data using the PUUID
            const summonerResponse = await axios.get(
              `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountResponse.data.puuid}`,
              {
                headers: {
                  'X-Riot-Token': API_KEY || ''
                }
              }
            );
            
            summonerData = {
              ...summonerResponse.data,
              summonerName: gameName,
              tagLine: tagLine,
              puuid: accountResponse.data.puuid
            };
            
            console.log("📊 Summoner data by gameName/tagLine:", summonerData);
            console.log("🖼️ Profile Icon ID:", summonerData.profileIconId);
            
            // Ensure profileIconId exists and is a valid number (default to 29 if missing or invalid)
            if (!summonerData.profileIconId || typeof summonerData.profileIconId !== 'number' || isNaN(summonerData.profileIconId)) {
              console.log("⚠️ Invalid profileIconId found, using default");
              summonerData.profileIconId = 29;
            } else {
              // Ensure it's a number, not a string
              summonerData.profileIconId = Number(summonerData.profileIconId);
            }
          }
        } catch (error) {
          console.error("❌ Error fetching by gameName/tagLine:", error instanceof Error ? error.message : String(error));
          // Return an error response for this specific case
          return NextResponse.json(
            { error: 'Summoner not found', details: 'Could not find summoner with the provided name and tag' },
            { status: 404 }
          );
        }
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
    console.error('❌ Error in fetchSummoner:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch summoner data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}