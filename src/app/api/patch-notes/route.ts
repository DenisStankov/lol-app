import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function GET() {
  try {
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await versionRes.json();
    const latestVersion = versions[0];
    const [major, minor] = latestVersion.split('.');
    const year = parseInt(major) + 10;
    const displayVersion = `${year}.${minor}`;
    const url = `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${displayVersion}-notes/`;

    return NextResponse.json({
      version: latestVersion,
      displayVersion,
      url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patch information' },
      { status: 500 }
    );
  }
} 