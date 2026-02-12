import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET() {
  try {
    // Try both environment variable options
    const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY || process.env.RIOT_API_KEY || '';
    
    // Log key information (masked for security)
    console.log("NEXT_PUBLIC_RIOT_API_KEY present:", !!process.env.NEXT_PUBLIC_RIOT_API_KEY);
    console.log("RIOT_API_KEY present:", !!process.env.RIOT_API_KEY);
    console.log("Using key:", apiKey ? `${apiKey.substring(0, 8)}...` : "No key found");
    console.log("Key appears valid:", apiKey && !apiKey.includes('xxxxxxxx') && !apiKey.includes('your-api-key-here') ? "YES" : "NO");
    
    if (!apiKey || apiKey.includes('xxxxxxxx') || apiKey.includes('your-api-key-here')) {
      return NextResponse.json({
        success: false,
        error: "Invalid or missing API key",
        envVars: {
          NEXT_PUBLIC_RIOT_API_KEY: !!process.env.NEXT_PUBLIC_RIOT_API_KEY,
          RIOT_API_KEY: !!process.env.RIOT_API_KEY
        },
        keyMasked: apiKey ? `${apiKey.substring(0, 8)}...` : null,
        instructions: "Add a valid RIOT API key to your .env.local file as NEXT_PUBLIC_RIOT_API_KEY=RGAPI-your-actual-key"
      });
    }
    
    // Test the API by requesting the challenger league (a stable endpoint)
    try {
      const response = await axios.get(
        'https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5',
        {
          headers: {
            'X-Riot-Token': apiKey
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: "API key works correctly!",
        league: {
          tier: response.data.tier,
          totalPlayers: response.data.entries?.length || 0,
        }
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("API request failed:", axiosError.message);
      console.error("Status:", axiosError.response?.status);
      console.error("Data:", axiosError.response?.data);

      return NextResponse.json({
        success: false,
        error: axiosError.response?.status === 403 ? "API key unauthorized" :
               axiosError.response?.status === 429 ? "Rate limit exceeded" :
               "API request failed",
        status: axiosError.response?.status,
        details: axiosError.response?.data
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Unexpected error:", err);
    
    return NextResponse.json({
      success: false,
      error: "Error testing Riot API key",
      message: err.message
    });
  }
} 