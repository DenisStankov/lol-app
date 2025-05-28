import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get latest version from Data Dragon
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await versionRes.json();
    const latestVersion = versions[0];

    // Convert version to year-based format (e.g., 15.10.1 -> 25.10)
    const [major, minor] = latestVersion.split('.');
    const year = parseInt(major) + 10;
    const displayVersion = `${year}.${minor}`;

    // Get champion data for the latest version
    const championRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const championData = await championRes.json();
    
    // Get list of champions that were updated in this patch
    const updatedChampions = Object.values(championData.data)
      .filter((champion: any) => champion.version === latestVersion)
      .map((champion: any) => champion.name);

    // Create a basic summary
    const title = `Patch ${displayVersion} Updates`;
    const summary = updatedChampions.length > 0 
      ? `This patch includes updates for ${updatedChampions.length} champions: ${updatedChampions.join(', ')}`
      : `Patch ${displayVersion} is now live. Check the official patch notes for detailed changes.`;

    return NextResponse.json({
      version: latestVersion,
      displayVersion,
      title,
      summary,
      url: `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${displayVersion}-notes/`
    });
  } catch (error) {
    console.error('Error fetching patch data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patch information' },
      { status: 500 }
    );
  }
} 