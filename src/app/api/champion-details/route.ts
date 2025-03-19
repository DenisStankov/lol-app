import { NextRequest, NextResponse } from 'next/server';
import { analyzeMatchData } from '@/lib/match-analyzer';
import { mockChampionDetailsData, ChampionDetail } from '../../../lib/mock-data';
import * as dataDragon from '@/lib/data-dragon';

/**
 * Handles GET requests to fetch champion details 
 */
export async function GET(request: NextRequest) {
  // Extract champion ID from the request
  const { searchParams } = new URL(request.url);
  const championId = searchParams.get('championId');
  
  // Log request information
  console.log(`[Champion Details API] Request for champion: ${championId}`);
  
  // Validate champion ID
  if (!championId) {
    console.error('[Champion Details API] Missing championId parameter');
    return NextResponse.json(
      { error: 'Missing championId parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch current patch version
    const currentPatch = await dataDragon.getCurrentPatch();
    console.log(`[Champion Details API] Using patch: ${currentPatch}`);
    
    // Fetch champion data from Data Dragon
    const championData = await dataDragon.getChampionDetails(championId, currentPatch);
    
    // Get champion numeric key for match analysis
    const championKey = await dataDragon.getChampionNumericKey(championId, currentPatch);
    
    if (!championKey) {
      console.error(`[Champion Details API] Could not find numeric key for champion: ${championId}`);
      // Continue with just the static data, without match analysis
    }
    
    // Check if we have a valid Riot API key for match analysis
    const riotApiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;
    const isValidKey = riotApiKey && 
                      !riotApiKey.includes('YOUR_API_KEY') && 
                      !riotApiKey.includes('RGAPI') && 
                      riotApiKey.length > 20;
    
    console.log(`[Champion Details API] Riot API key status: ${isValidKey ? 'Valid' : 'Invalid or missing'}`);
    
    // Get match analysis data if we have a valid key
    let matchAnalysisData = null;
    if (isValidKey && championKey) {
      try {
        console.log(`[Champion Details API] Fetching match analysis for champion key: ${championKey}`);
        // Use the region parameter with a default value
        matchAnalysisData = await analyzeMatchData(championKey);
        console.log(`[Champion Details API] Successfully fetched match analysis`);
      } catch (error) {
        console.error(`[Champion Details API] Error fetching match analysis:`, error);
        console.log(`[Champion Details API] Falling back to mock data for match analysis`);
      }
    } else {
      console.log(`[Champion Details API] Using mock data for match analysis (no valid API key or champion key)`);
    }
    
    // Transform the data into our application format
    const transformedData = transformChampionData(championId, championData, matchAnalysisData, currentPatch);
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error(`[Champion Details API] Error fetching champion details:`, error);
    
    // Fallback to mock data
    console.log(`[Champion Details API] Falling back to mock data for ${championId}`);
    const mockData = mockChampionDetailsData.find(
      (champ: ChampionDetail) => champ.id.toLowerCase() === championId.toLowerCase()
    );
    
    if (mockData) {
      return NextResponse.json(mockData);
    } else {
      return NextResponse.json(
        { error: `Champion not found: ${championId}` },
        { status: 404 }
      );
    }
  }
}

/**
 * Transforms champion data from Data Dragon format to our application format
 */
function transformChampionData(
  championId: string,
  championData: any,
  matchAnalysis: any | null,
  patch: string
) {
  console.log(`[Champion Details API] Transforming data for ${championId}`);
  const images = dataDragon.getChampionImageURLs(championId, patch);
  
  // If we have real match analysis, use it
  if (matchAnalysis) {
    console.log(`[Champion Details API] Using real match analysis data`);
    
    return {
      id: championId,
      name: championData.name,
      title: championData.title,
      lore: championData.lore,
      tags: championData.tags,
      stats: championData.stats,
      abilities: {
        passive: {
          name: championData.passive.name,
          description: championData.passive.description,
          image: dataDragon.getPassiveImageURL(championData.passive.image.full, patch)
        },
        spells: championData.spells.map((spell: any) => ({
          id: spell.id,
          name: spell.name,
          description: spell.description,
          image: dataDragon.getSpellImageURL(spell.image.full, patch)
        }))
      },
      images,
      // Use real match analysis data
      itemBuilds: matchAnalysis.itemBuilds || [],
      runeBuilds: matchAnalysis.runeBuilds || [],
      counters: matchAnalysis.counters || [],
      synergies: matchAnalysis.synergies || [],
      winRate: matchAnalysis.winRate || 0,
      pickRate: matchAnalysis.pickRate || 0,
      banRate: matchAnalysis.banRate || 0,
      skillOrder: matchAnalysis.skillOrder || []
    };
  }
  
  // Fallback to mock data for match analysis part
  console.log(`[Champion Details API] Using mock data for match analysis part`);
  const mockData = mockChampionDetailsData.find(
    (champ: ChampionDetail) => champ.id.toLowerCase() === championId.toLowerCase()
  );
  
  return {
    id: championId,
    name: championData.name,
    title: championData.title,
    lore: championData.lore,
    tags: championData.tags,
    stats: championData.stats,
    abilities: {
      passive: {
        name: championData.passive.name,
        description: championData.passive.description,
        image: dataDragon.getPassiveImageURL(championData.passive.image.full, patch)
      },
      spells: championData.spells.map((spell: any) => ({
        id: spell.id,
        name: spell.name,
        description: spell.description,
        image: dataDragon.getSpellImageURL(spell.image.full, patch)
      }))
    },
    images,
    // Use mock data for the match analysis part
    itemBuilds: mockData?.itemBuilds || [],
    runeBuilds: mockData?.runeBuilds || [],
    counters: mockData?.counters || [],
    synergies: mockData?.synergies || [],
    winRate: mockData?.winRate || 0,
    pickRate: mockData?.pickRate || 0,
    banRate: mockData?.banRate || 0,
    skillOrder: mockData?.skillOrder || []
  };
} 