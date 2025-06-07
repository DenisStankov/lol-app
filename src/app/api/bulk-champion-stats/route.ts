import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Constants for available ranks and regions
const AVAILABLE_RANKS = [
  'CHALLENGER',
  'GRANDMASTER',
  'MASTER',
  'DIAMOND',
  'EMERALD',
  'PLATINUM',
  'GOLD',
  'SILVER',
  'BRONZE',
  'IRON'
];

const AVAILABLE_REGIONS = [
  'na',
  'euw',
  'eune',
  'kr',
  'br',
  'jp',
  'lan',
  'las',
  'oce',
  'tr',
  'ru'
];

async function fetchVersions(): Promise<string[]> {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching versions:', error);
    return ['14.4.1']; // Fallback to current patch
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify required environment variables
    if (!process.env.RIOT_API_KEY) {
      return new NextResponse(JSON.stringify({ 
        error: 'Riot API key not configured' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse(JSON.stringify({ 
        error: 'Supabase configuration missing' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get parameters from request body
    const body = await req.json();
    const {
      patches = [], // Optional specific patches to collect
      ranks = AVAILABLE_RANKS, // Optional specific ranks to collect
      regions = AVAILABLE_REGIONS // Optional specific regions to collect
    } = body;

    // Get available patches if not specified
    let patchesToProcess = patches;
    if (!patches.length) {
      const versions = await fetchVersions();
      patchesToProcess = versions.slice(0, 5); // Get last 5 patches by default
    }

    // Initialize collection status
    const collectionStatus = {
      total: patchesToProcess.length * ranks.length * regions.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      errors: [] as string[]
    };

    // Process each combination
    const promises = [];
    for (const patch of patchesToProcess) {
      for (const rank of ranks) {
        for (const region of regions) {
          collectionStatus.inProgress++;
          
          const promise = fetch(`${req.nextUrl.origin}/api/champion-stats?rank=${rank}&region=${region}`)
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch stats for patch=${patch}, rank=${rank}, region=${region}`);
              }
              collectionStatus.completed++;
              collectionStatus.inProgress--;
              return response.json();
            })
            .catch((error) => {
              collectionStatus.failed++;
              collectionStatus.inProgress--;
              collectionStatus.errors.push(`${error.message}`);
            });
          
          promises.push(promise);
          
          // Add delay between requests to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Wait for all requests to complete
    await Promise.all(promises);

    return new NextResponse(JSON.stringify({
      message: 'Bulk collection completed',
      status: collectionStatus
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in bulk collection:', error);
    return new NextResponse(JSON.stringify({
      error: 'Failed to process bulk collection',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 