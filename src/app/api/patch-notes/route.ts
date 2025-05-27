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
    const [major, minor, patch] = latestVersion.split('.');
    const year = parseInt(major) + 10;
    const patchNotesVersions = [
      `${year}.${minor}`, // two-part
      `${year}.${minor}.${patch}` // three-part
    ];
    const urlFormats = [
      `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${year}-${minor}-notes/`,
      `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${year}-${minor}-${patch}-notes/`
    ];

    let response, html, urlUsed;
    for (const url of urlFormats) {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (response.ok) {
        html = await response.text();
        urlUsed = url;
        break;
      }
    }

    if (!html) {
      throw new Error('Failed to fetch patch notes: 404');
    }

    const $ = cheerio.load(html);

    // Extract the title
    const title = $('h1').first().text().trim();

    // Log the tag names, attributes, and text of all direct children of .article__content
    const articleContent = $('.article__content');
    articleContent.children().each((_, el) => {
      const node = $(el).get(0);
      if (!node) return;
      console.log({
        tag: node.tagName,
        attrs: $(el).attr(),
        text: $(el).text().trim()
      });
    });

    // Improved summary extraction: get all <p> tags before the first <h2> in .article__content
    let summary = '';
    let beforeH2 = true;
    articleContent.children().each((_, el) => {
      if ($(el).is('h2')) {
        beforeH2 = false;
        return false; // break loop
      }
      if (beforeH2 && $(el).is('p')) {
        const text = $(el).text().trim();
        if (text) summary += (summary ? ' ' : '') + text;
      }
    });

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
      displayVersion: patchNotesVersions[0],
      title,
      summary,
      championChanges,
      url: urlUsed
    });
  } catch (error) {
    console.error('Error fetching patch notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patch notes' },
      { status: 500 }
    );
  }
} 