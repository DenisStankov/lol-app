import { NextResponse } from "next/server";
import axios from "axios";
import { searchSummonerIndex, upsertSummonerIndex } from "@/lib/summoner-index";

// Prefer a dedicated key for Summoner-V4 if available, fallback to generic key
const RIOT_API_KEY = process.env.RIOT_SUMMONER_V4_KEY || process.env.RIOT_API_KEY;

// Ensure Node.js runtime and disable caching for this endpoint
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORMS: string[] = [
  "euw1",
  "na1",
  "kr",
  "eun1",
  "br1",
  "jp1",
  "la1",
  "la2",
  "oc1",
  "tr1",
  "ru",
];

async function fetchWith429Retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.response?.status === 429 && retries > 0) {
      const retryAfter = parseInt(err.response.headers?.["retry-after"]) || 1;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return fetchWith429Retry(fn, retries - 1);
    }
    throw err;
  }
}

export async function GET(req: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "Server misconfiguration: RIOT_API_KEY missing" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const preferredRegion = searchParams.get("region")?.trim() || undefined; // optional hint

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // If Riot ID provided, resolve via Account-V1 and seed index for future name-only search
  if (query.includes('#')) {
    const [namePart, tagPart] = query.split('#');
    const gameName = (namePart || '').trim();
    const tagLine = (tagPart || '').trim();
    if (!gameName || !tagLine) {
      return NextResponse.json({ error: 'Invalid Riot ID' }, { status: 400 });
    }

    const regionalBases: Array<'europe' | 'americas' | 'asia'> = ['europe', 'americas', 'asia'];
    let account: any = null;
    for (const reg of regionalBases) {
      try {
        const res = await fetchWith429Retry(() =>
          axios.get(
            `https://${reg}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            { headers: { 'X-Riot-Token': RIOT_API_KEY } }
          )
        );
        account = (res as any).data || res;
        break;
      } catch (e: any) {
        if (e?.response?.status === 404) continue;
      }
    }
    if (!account?.puuid) {
      // Could not resolve via Account-V1 (e.g., key lacks permission). Return a minimal item
      // so the UI can still navigate using Riot ID (name#tag) and fetch on the profile page.
      return NextResponse.json([
        {
          summonerName: gameName,
          tagLine,
          puuid: `riotid:${gameName}#${tagLine}`,
          profileIconId: 29,
          summonerLevel: 0,
          region: preferredRegion || 'eun1',
        },
      ], { status: 200 });
    }

    const platforms = preferredRegion ? [preferredRegion, ...PLATFORMS.filter((p) => p !== preferredRegion)] : PLATFORMS;
    for (const platform of platforms) {
      try {
        const s = await fetchWith429Retry(() =>
          axios.get(
            `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
            { headers: { 'X-Riot-Token': RIOT_API_KEY } }
          )
        );

        await upsertSummonerIndex({
          puuid: account.puuid,
          region: platform,
          gameName: account.gameName || gameName,
          tagLine: account.tagLine || tagLine,
          profileIconId: s.data.profileIconId,
          summonerLevel: s.data.summonerLevel,
          source: 'riot-id-seed',
        });

        return NextResponse.json([
          {
            summonerName: (account.gameName || gameName || s.data?.name || '').trim(),
            tagLine: (account.tagLine || tagLine || '').trim(),
            puuid: account.puuid,
            profileIconId: s.data.profileIconId,
            summonerLevel: s.data.summonerLevel,
            region: platform,
          },
        ]);
      } catch {
        // try next platform
      }
    }

    // Seed minimal record if we couldn't get platform-specific data
    await upsertSummonerIndex({
      puuid: account.puuid,
      region: preferredRegion || 'euw1',
      gameName: account.gameName || gameName,
      tagLine: account.tagLine || tagLine,
      source: 'riot-id-seed',
    });
    return NextResponse.json([
      {
        summonerName: (account.gameName || gameName || '').trim(),
        tagLine: (account.tagLine || tagLine || '').trim(),
        puuid: account.puuid,
        profileIconId: 29,
        summonerLevel: 0,
        region: preferredRegion || 'euw1',
      },
    ]);
  }

  // Name-only: search our index (works after first seed with Riot ID)
  const hits = await searchSummonerIndex(query, preferredRegion, 10);
  const mapped = hits.map((r) => ({
    summonerName: r.gameName || r.summonerName || '',
    tagLine: r.tagLine || undefined,
    puuid: r.puuid,
    profileIconId: r.profileIconId ?? 29,
    summonerLevel: r.summonerLevel ?? 0,
    region: r.region,
  }));
  return NextResponse.json(mapped, { status: 200 });
}