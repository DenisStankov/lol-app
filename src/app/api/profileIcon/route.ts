import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Recent versions to try in order of preference
const VERSIONS = ['14.8.1', '14.7.1', '14.6.1', '14.5.1', '13.24.1', '13.23.1', '13.22.1', '13.10.1'];

// Common default profile icons that are known to exist across versions
const DEFAULT_ICONS = ['1', '29', '0', '4', '7'];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let iconId = searchParams.get('iconId') || '1'; // Default to icon 1 if none provided
  
  // Validate iconId - ensure it's a number
  if (!/^\d+$/.test(iconId)) {
    console.log(`Invalid icon ID requested: ${iconId}, using default icon 1`);
    iconId = '1'; // Use default if not a valid number
  }
  
  // Get latest version first
  let latestVersion;
  try {
    const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    if (versionsResponse.data && Array.isArray(versionsResponse.data) && versionsResponse.data.length > 0) {
      latestVersion = versionsResponse.data[0];
      // Add latestVersion to the beginning of our versions array if it's not already there
      if (!VERSIONS.includes(latestVersion)) {
        VERSIONS.unshift(latestVersion);
      }
    }
  } catch {
    // Continue with hardcoded versions if we can't fetch the latest
  }
  
  console.log(`Attempting to fetch profile icon ${iconId} (Latest available version: ${latestVersion || 'using fallback versions'})`);
  
  // Try fetching from different versions until one works
  for (const version of VERSIONS) {
    try {
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
      console.log(`Trying to fetch icon from: ${iconUrl}`);
      
      const response = await axios.get(iconUrl, { 
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200 // Only accept 200 responses
      });
      
      console.log(`✅ Successfully fetched icon ${iconId} from version ${version}`);
      
      // Return the image with appropriate headers
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log(`❌ Failed to fetch icon ${iconId} from version ${version}: Status ${error.response.status}`);
      } else {
        console.log(`❌ Failed to fetch icon ${iconId} from version ${version}: Unknown error`);
      }
      // Continue to the next version
    }
  }
  
  console.log(`⚠️ All versions failed for icon ${iconId}, trying default icons`);
  
  // If the requested icon fails, try a series of known good default icons
  for (const defaultIcon of DEFAULT_ICONS) {
    if (defaultIcon === iconId) continue; // Skip if it's the same as the requested icon we already failed to fetch
    
    try {
      const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/${VERSIONS[0]}/img/profileicon/${defaultIcon}.png`;
      console.log(`Trying fallback icon: ${fallbackUrl}`);
      
      const fallbackResponse = await axios.get(fallbackUrl, { 
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200
      });
      
      console.log(`✅ Successfully fetched fallback icon ${defaultIcon}`);
      
      return new NextResponse(fallbackResponse.data, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      console.log(`❌ Failed to fetch fallback icon ${defaultIcon}`);
      // Try the next default icon
      continue;
    }
  }
  
  // If all attempts fail, return a 404
  console.log(`❌ All profile icon attempts failed, returning 404`);
  return NextResponse.json({ error: 'Profile icon not found' }, { status: 404 });
} 