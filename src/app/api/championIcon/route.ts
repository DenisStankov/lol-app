import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// List of versions to try in order of preference
const VERSIONS = ['13.24.1', '13.23.1', '13.22.1', '13.10.1', '12.23.1'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const championId = searchParams.get('championId') || 'Aatrox'; // Default to Aatrox if none provided
  
  // Try fetching from different versions until one works
  for (const version of VERSIONS) {
    try {
      console.log(`Attempting to fetch champion ${championId} from version ${version}`);
      
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`, 
        { responseType: 'arraybuffer' }
      );
      
      console.log(`✅ Successfully fetched champion ${championId} from version ${version}`);
      
      // Return the image with appropriate headers
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch (error) {
      console.error(`❌ Failed to fetch champion ${championId} from version ${version}:`, 
        error instanceof Error ? error.message : String(error));
      // Continue to the next version
    }
  }
  
  // If all versions fail, try to return a default champion
  try {
    console.log('Falling back to default champion icon (Aatrox)');
    const fallbackResponse = await axios.get(
      'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Aatrox.png',
      { responseType: 'arraybuffer' }
    );
    
    return new NextResponse(fallbackResponse.data, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('❌ Even fallback champion icon failed:', 
      error instanceof Error ? error.message : String(error));
    
    // Return 404 if everything fails
    return NextResponse.json({ error: 'Champion icon not found' }, { status: 404 });
  }
} 