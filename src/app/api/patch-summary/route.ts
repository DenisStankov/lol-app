import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const PATCH_NOTES_INDEX = 'https://www.leagueoflegends.com/en-us/news/tags/patch-notes/';

export async function GET() {
  try {
    // Fetch the patch notes index page
    const res = await fetch(PATCH_NOTES_INDEX);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Find the first patch notes article link
    const firstArticle = $('a[data-testid="link--news"]:contains("Patch")').first();
    const patchUrl = firstArticle.attr('href');
    const fullPatchUrl = patchUrl?.startsWith('http') ? patchUrl : `https://www.leagueoflegends.com${patchUrl}`;

    // Fetch the patch notes page
    const patchRes = await fetch(fullPatchUrl);
    const patchHtml = await patchRes.text();
    const $$ = cheerio.load(patchHtml);

    // Extract the patch title and summary (first paragraph)
    const title = $$('h1').first().text().trim();
    const summary = $$('article p').first().text().trim();

    return NextResponse.json({ title, summary, url: fullPatchUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch patch summary', details: String(err) }, { status: 500 });
  }
} 