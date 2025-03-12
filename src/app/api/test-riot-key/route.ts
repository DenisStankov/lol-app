import { NextResponse } from 'next/server';
import axios from 'axios';

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
      const response = await axios.get(
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
    } catch (error: any) {
      // API key didn't work, get detailed error info
      const statusCode = error.response?.status || 'unknown';
      const errorMessage = error.response?.data?.status?.message || error.message || 'Unknown error';
      
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
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Server error testing API key',
      error: error.message
    }, { status: 500 });
  }
} 