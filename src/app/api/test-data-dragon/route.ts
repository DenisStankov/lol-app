import { NextResponse } from 'next/server';
import * as dataDragon from '@/lib/data-dragon';

export async function GET() {
  try {
    console.log("[Test Data Dragon] Testing Data Dragon utility");
    
    // Get current patch version
    const currentPatch = await dataDragon.getCurrentPatch();
    console.log(`[Test Data Dragon] Current patch: ${currentPatch}`);
    
    // Test getting champion list
    const champions = await dataDragon.getChampionsList(currentPatch);
    const championCount = Object.keys(champions).length;
    console.log(`[Test Data Dragon] Fetched ${championCount} champions`);
    
    // Test getting items
    const items = await dataDragon.getItemsData(currentPatch);
    const itemCount = Object.keys(items).length;
    console.log(`[Test Data Dragon] Fetched ${itemCount} items`);
    
    // Test getting champion details for Ahri
    const ahriDetails = await dataDragon.getChampionDetails('Ahri', currentPatch);
    
    // Test image URL generation
    const ahriImages = dataDragon.getChampionImageURLs('Ahri', currentPatch);
    
    return NextResponse.json({
      status: 'success',
      currentPatch,
      championCount,
      itemCount,
      ahriName: ahriDetails.name,
      ahriTitle: ahriDetails.title,
      ahriImages
    });
  } catch (error) {
    console.error("[Test Data Dragon] Error:", error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 