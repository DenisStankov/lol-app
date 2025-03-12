import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// Interface for champion rotation data
interface ChampionRotationsResponse {
  freeChampionIds: number[];
  freeChampionIdsForNewPlayers: number[];
  maxNewPlayerLevel: number;
}

// Interface for Riot API error responses
interface RiotErrorData {
  status?: {
    message?: string;
    status_code?: number;
  };
}

export async function GET() {
  try {
    const apiKey = process.env.RIOT_API_KEY || 'RGAPI-your-api-key-here';
    
    // Log the API key status (safely)
    console.log("API KEY EXISTS:", Boolean(process.env.RIOT_API_KEY));
    console.log("API KEY LOOKS VALID:", apiKey && !apiKey.includes('your-api-key-here'));
    
    // If no valid key, return error
    if (!apiKey || apiKey === 'RGAPI-your-api-key-here') {
      return NextResponse.json({ 
        status: 'error',
        message: 'No valid Riot API key found in environment variables',
        howToFix: 'Create a .env.local file in the project root with RIOT_API_KEY=your-actual-key'
      }, { status: 400 });
    }
    
    // Test the API key with a simple request to get platform status
    try {
      // We'll use NA1 for testing, but this could be any valid region
      const response = await axios.get<ChampionRotationsResponse>(
        'https://na1.api.riotgames.com/lol/platform/v3/champion-rotations',
        { headers: { 'X-Riot-Token': apiKey } }
      );
      
      // If we got here, the API key works!
      return NextResponse.json({ 
        status: 'success',
        message: 'Riot API key is valid and working',
        data: {
          freeChampionIds: response.data.freeChampionIds.length,
          freeChampionIdsForNewPlayers: response.data.freeChampionIdsForNewPlayers.length,
          maxNewPlayerLevel: response.data.maxNewPlayerLevel
        }
      });
    } catch (error: unknown) {
      // API key didn't work, get detailed error info
      let statusCode: number | string = 'unknown';
      let errorMessage = 'Unknown error';
      
      if (error instanceof AxiosError) {
        statusCode = error.response?.status || 'unknown';
        // Access error data in a type-safe way
        if (error.response?.data) {
          const errorData = error.response.data as RiotErrorData;
          errorMessage = errorData.status?.message || error.message || 'Unknown error';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      let problemType = 'Unknown error';
      if (statusCode === 401 || statusCode === 403) {
        problemType = 'Invalid API key or expired';
      } else if (statusCode === 429) {
        problemType = 'Rate limit exceeded';
      }
      
      return NextResponse.json({
        status: 'error',
        message: `API key test failed: ${problemType}`,
        details: {
          statusCode,
          errorMessage,
          howToFix: 'Make sure your API key is valid and not expired. Development keys expire every 24 hours.'
        }
      }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      status: 'error',
      message: 'Server error testing API key',
      error: errorMessage
    }, { status: 500 });
  }
} 