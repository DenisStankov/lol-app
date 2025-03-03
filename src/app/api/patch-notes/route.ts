import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');
    
    // In a production environment, you might fetch this from Riot's official API
    // For now, we'll return mock data based on the version
    const patchNotes = [
      {
        type: "Champion",
        title: `${version} Champion balance updates`,
      },
      {
        type: "Item",
        title: `${version} Item system adjustments`,
      },
      {
        type: "System",
        title: `${version} Ranked improvements`,
      },
      {
        type: "Map",
        title: `${version} Map changes`,
      },
    ];
    
    return NextResponse.json(patchNotes);
  } catch (error) {
    console.error('Error fetching patch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch patch notes' }, { status: 500 });
  }
} 