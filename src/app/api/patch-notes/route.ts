import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = "nodejs";

export async function GET() {
  try {
    // First get the latest version
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await versionRes.json();
    const latestVersion = versions[0];

    // Convert version to year-based format (e.g., 15.10.1 -> 25.10)
    const [major, minor] = latestVersion.split('.');
    const year = parseInt(major) + 10;
    const patchNotesVersion = `${year}.${minor}`;

    // Fetch the patch notes page
    const response = await fetch(
      `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${patchNotesVersion}-notes/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch patch notes: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract the title and summary
    const title = $('h1').first().text().trim();
    const summary = $('.article__content p').first().text().trim();

    // Get champion changes
    const championChanges: { name: string; changes: string }[] = [];
    $('.article__content h2').each((_, element) => {
      const $element = $(element);
      if ($element.text().includes('Champion Changes')) {
        $element.nextUntil('h2').each((_, changeElement) => {
          const $change = $(changeElement);
          if ($change.is('h3')) {
            const name = $change.text().trim();
            const changes = $change.next('p').text().trim();
            championChanges.push({ name, changes });
          }
        });
      }
    });

    return NextResponse.json({
      version: latestVersion,
      displayVersion: patchNotesVersion,
      title,
      summary,
      championChanges,
      url: `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${patchNotesVersion}-notes/`
    });
  } catch (error) {
    console.error('Error fetching patch notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patch notes' },
      { status: 500 }
    );
  }
} 