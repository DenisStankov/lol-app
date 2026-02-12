import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Fallback versions to try if latest version fetch fails
const FALLBACK_VERSIONS = ['14.8.1', '14.7.1', '13.24.1', '13.23.1'];

// Default champions that are known to exist in all versions
const DEFAULT_CHAMPIONS = ['Aatrox', 'Annie', 'Ashe', 'Garen', 'Ryze'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const championId = searchParams.get('championId') || 'Aatrox'; // Default to Aatrox if none provided

  // Build version list starting with latest
  const versions = [...FALLBACK_VERSIONS];
  try {
    const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    if (versionsResponse.data?.[0] && !versions.includes(versionsResponse.data[0])) {
      versions.unshift(versionsResponse.data[0]);
    }
  } catch {
    // Continue with fallback versions
  }

  // Try fetching from different versions until one works
  for (const version of versions) {
    try {
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`, 
        { 
          responseType: 'arraybuffer',
          validateStatus: (status) => status === 200 // Only accept 200 responses 
        }
      );
      
      // Return the image with appropriate headers
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch {
      // Silently continue to the next version without logging error
    }
  }
  
  // If the requested champion fails, try known default champions
  for (const defaultChampion of DEFAULT_CHAMPIONS) {
    try {
      const fallbackResponse = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${defaultChampion}.png`,
        { 
          responseType: 'arraybuffer',
          validateStatus: (status) => status === 200
        }
      );
      
      return new NextResponse(fallbackResponse.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      // Try the next default champion
      continue;
    }
  }
  
  // If all attempts fail, return a 404
  return NextResponse.json({ error: 'Champion icon not found' }, { status: 404 });
} 