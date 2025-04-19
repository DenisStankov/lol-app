import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// List of versions to try in order of preference
const VERSIONS = ['13.24.1', '13.23.1', '13.22.1', '13.10.1', '12.23.1'];

// Common default profile icons that are known to exist across versions
const DEFAULT_ICONS = ['1', '29', '0', '4', '7'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let iconId = searchParams.get('iconId') || '1'; // Default to icon 1 if none provided
  
  // Validate iconId - ensure it's a number
  if (!/^\d+$/.test(iconId)) {
    iconId = '1'; // Use default if not a valid number
  }
  
  // Try fetching from different versions until one works
  for (const version of VERSIONS) {
    try {
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`, 
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
  
  // If the requested icon fails, try a series of known good default icons
  for (const defaultIcon of DEFAULT_ICONS) {
    try {
      const fallbackResponse = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/${defaultIcon}.png`,
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
      // Try the next default icon
      continue;
    }
  }
  
  // If all attempts fail, return a 404
  return NextResponse.json({ error: 'Profile icon not found' }, { status: 404 });
} 