import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Fallback versions to try in order of preference
const FALLBACK_VERSIONS = ['14.8.1', '14.7.1', '14.6.1', '14.5.1', '13.24.1', '13.23.1', '13.22.1', '13.10.1'];

// Common default profile icons that are known to exist across versions
const DEFAULT_ICONS = ['1', '29', '0', '4', '7'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let iconId = searchParams.get('iconId') || '1'; // Default to icon 1 if none provided

  // Validate iconId - ensure it's a number
  if (!/^\d+$/.test(iconId)) {
    iconId = '1'; // Use default if not a valid number
  }

  // Build version list starting with latest (use local copy to avoid mutating module-level array)
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
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
      
      const response = await axios.get(iconUrl, { 
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200 // Only accept 200 responses
      });
      
      // Return the image with appropriate headers
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch {
      // Continue to the next version
    }
  }
  
  // If the requested icon fails, try a series of known good default icons
  for (const defaultIcon of DEFAULT_ICONS) {
    if (defaultIcon === iconId) continue; // Skip if it's the same as the requested icon we already failed to fetch
    
    try {
      const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/img/profileicon/${defaultIcon}.png`;
      
      const fallbackResponse = await axios.get(fallbackUrl, { 
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200
      });
      
      return new NextResponse(fallbackResponse.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      // Try the next default icon
      continue;
    }
  }
  
  // If all attempts fail, return a 404
  return NextResponse.json({ error: 'Profile icon not found' }, { status: 404 });
} 