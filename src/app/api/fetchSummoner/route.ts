import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import axios from 'axios';

// Map platform IDs to Account-V1 / Match-V5 regional routing values
function platformToAccountRegion(platform: string): string {
  const mapping: Record<string, string> = {
    na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas',
    euw1: 'europe', eun1: 'europe', tr1: 'europe', ru: 'europe',
    kr: 'asia', jp1: 'asia',
    oc1: 'sea', ph2: 'sea', sg2: 'sea', th2: 'sea', tw2: 'sea', vn2: 'sea',
  };
  return mapping[platform.toLowerCase()] || 'europe';
}

const ALL_PLATFORMS = ['euw1', 'na1', 'kr', 'eun1', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
const ACCOUNT_REGIONS = ['europe', 'americas', 'asia', 'sea'];

/**
 * API route to fetch summoner profile data by Riot ID or PUUID
 */
export async function GET(request: NextRequest) {
  // Minimal logging without exposing secrets
  console.log("fetchSummoner GET", new Date().toISOString());
  try {
    // Verify API key presence without printing it
    const API_KEY = process.env.RIOT_API_KEY;
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
        // Get user data from authenticated endpoint - try region based on user's platform preference
        const accountRegion = platformToAccountRegion(region);
        const accountResponse = await axios.get(`https://${accountRegion}.api.riotgames.com/riot/account/v1/accounts/me`, {
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
          
          let foundSummoner = false;

          try {
            // First get the PUUID using the Account v1 API with correct regional routing
            const riotIdLookupResponse = await axios.get(
              `https://${accountRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
              {
                headers: {
                  'X-Riot-Token': API_KEY || ''
                }
              }
            );
            
            console.log("🔎 Riot ID lookup response:", riotIdLookupResponse.data);
            
            if (riotIdLookupResponse.data && riotIdLookupResponse.data.puuid) {
              // Try to find summoner data in each platform, prioritizing user's region
              const platformsToTry = [region, ...ALL_PLATFORMS.filter(p => p !== region)];
              for (const regionToTry of platformsToTry) {
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
        // Fetch by Riot ID across all account regions, then try all platform shards for Summoner-V4
        console.log(`🔎 Fetching by Riot ID: ${gameName}#${tagLine} (start region ${region})`);
        try {
          let puuidFound: string | null = null;
          // Try Account-V1 in all regional routing clusters
          for (const accRegion of ACCOUNT_REGIONS) {
            try {
              const accountResponse = await axios.get(
                `https://${accRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
                { headers: { 'X-Riot-Token': API_KEY || '' } }
              );
              if (accountResponse.data?.puuid) {
                puuidFound = accountResponse.data.puuid;
                break;
              }
            } catch (e) {
              // try next account region
            }
          }

          if (!puuidFound) {
            return NextResponse.json(
              { error: 'Summoner not found', details: 'Could not resolve Riot ID to PUUID via Account-V1' },
              { status: 404 }
            );
          }

          for (const platform of [region, ...ALL_PLATFORMS.filter(p => p !== region)]) {
            try {
              const summonerResponse = await axios.get(
                `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuidFound}`,
                { headers: { 'X-Riot-Token': API_KEY || '' } }
              );

              const data = summonerResponse.data;
              summonerData = {
                ...data,
                summonerName: gameName,
                tagLine: tagLine,
                puuid: puuidFound,
                region: platform,
              };

              // Ensure profileIconId is a number
              if (!summonerData.profileIconId || typeof summonerData.profileIconId !== 'number' || isNaN(summonerData.profileIconId)) {
                summonerData.profileIconId = 29;
              } else {
                summonerData.profileIconId = Number(summonerData.profileIconId);
              }

              break;
            } catch (e) {
              // try next platform
            }
          }

          if (!summonerData) {
            return NextResponse.json(
              { error: 'Summoner not found', details: 'Could not find summoner in any platform' },
              { status: 404 }
            );
          }
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 403) {
            return NextResponse.json(
              { error: 'Forbidden', details: 'Riot API key is invalid or lacks permission for this endpoint' },
              { status: 403 }
            );
          }
          if (status === 429) {
            const retryAfter = parseInt(error.response.headers?.['retry-after']) || 1;
            return NextResponse.json(
              { error: 'Rate limited', details: `Retry after ${retryAfter}s` },
              { status: 429 }
            );
          }
          console.error('❌ Error fetching by Riot ID flow:', error instanceof Error ? error.message : String(error));
          return NextResponse.json(
            { error: 'Summoner not found', details: 'Riot API lookup failed' },
            { status: 404 }
          );
        }
      } else if (riotId) {
        // Parse riotId format "name#tag" and resolve via Account-V1
        const parts = riotId.split('#');
        if (parts.length === 2) {
          const [name, tag] = parts;
          const accRegion = platformToAccountRegion(region);
          try {
            const accountResponse = await axios.get(
              `https://${accRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
              { headers: { 'X-Riot-Token': API_KEY || '' } }
            );
            if (accountResponse.data?.puuid) {
              const summonerResponse = await axios.get(
                `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountResponse.data.puuid}`,
                { headers: { 'X-Riot-Token': API_KEY || '' } }
              );
              summonerData = {
                ...summonerResponse.data,
                riotId,
                region,
              };
            }
          } catch (e) {
            return NextResponse.json(
              { error: 'Summoner not found', details: 'Could not resolve Riot ID' },
              { status: 404 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Invalid Riot ID format', details: 'Use format: name#tag' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        );
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