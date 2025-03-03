import { NextResponse } from 'next/server';

// In a production environment, you would use your Riot API key
// const API_KEY = process.env.RIOT_API_KEY;

export async function GET() {
  try {
    // Note: In a real implementation, you'd call the Riot API with your API key
    // Since we can't make direct calls to the Riot API without a key, we'll simulate data
    
    // Generate mock champion stats based on realistic values
    // In production, you'd replace this with actual API calls
    const mockStats = {
      // Champion keys mapped to stats (key is the numerical champion ID)
      "266": { winRate: 50.8, pickRate: 6.2, banRate: 3.1 }, // Aatrox
      "103": { winRate: 49.2, pickRate: 7.5, banRate: 1.8 }, // Ahri
      "84": { winRate: 52.3, pickRate: 8.9, banRate: 4.5 },  // Akali
      "12": { winRate: 48.7, pickRate: 5.3, banRate: 2.2 },  // Alistar
      // Add more champions as needed...
    };
    
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching champion stats:', error);
    return NextResponse.json({ error: 'Failed to fetch champion stats' }, { status: 500 });
  }
} 