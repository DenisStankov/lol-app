import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    // Get champion ID from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Champion ID is required' }, { status: 400 });
    }

    // First get the latest version
    const versionResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const latestVersion = versionResponse.data[0];
    
    // Fetch detailed champion data
    const championResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${id}.json`
    );
    
    if (!championResponse.data || !championResponse.data.data || !championResponse.data.data[id]) {
      return NextResponse.json({ error: 'Champion not found' }, { status: 404 });
    }
    
    // Extract the champion data
    const championData = championResponse.data.data[id];
    
    // Format response data
    const formattedData = {
      id: championData.id,
      key: championData.key,
      name: championData.name,
      title: championData.title,
      image: championData.image,
      skins: championData.skins,
      lore: championData.lore,
      blurb: championData.blurb,
      allytips: championData.allytips,
      enemytips: championData.enemytips,
      tags: championData.tags,
      partype: championData.partype,
      info: championData.info,
      stats: championData.stats,
      spells: championData.spells,
      passive: championData.passive,
      recommended: championData.recommended,
      
      // Add useful URLs for images
      imageURLs: {
        splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`,
        loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`,
        square: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${id}.png`,
        passive: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/passive/${championData.passive.image.full}`,
        spells: championData.spells.map((spell: any) => 
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${spell.image.full}`
        )
      },
      
      // Add version info
      version: latestVersion
    };
    
    return NextResponse.json(formattedData);
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return NextResponse.json({ error: 'Champion not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch champion data' },
      { status: 500 }
    );
  }
} 