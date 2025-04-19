import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// List of versions to try in order of preference
const VERSIONS = ['13.24.1', '13.23.1', '13.22.1', '13.10.1', '12.23.1'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const iconId = searchParams.get('iconId') || '1'; // Default to icon 1 if none provided
  
  // Try fetching from different versions until one works
  for (const version of VERSIONS) {
    try {
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`, 
        { responseType: 'arraybuffer' }
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
  
  // If all versions fail, try to return a default icon (1)
  try {
    const fallbackResponse = await axios.get(
      'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/1.png',
      { responseType: 'arraybuffer' }
    );
    
    return new NextResponse(fallbackResponse.data, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    // Silently catch the error without logging
    
    // Return 404 if everything fails
    return NextResponse.json({ error: 'Profile icon not found' }, { status: 404 });
  }
} 