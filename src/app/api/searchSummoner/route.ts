import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

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

  // Unified name search (Summoner-V4 only). If query contains '#', ignore the tag and use the name part.
  const nameOnly = query.includes("#") ? query.split("#")[0].trim() : query;
  const platforms = preferredRegion ? [preferredRegion, ...PLATFORMS.filter(p => p !== preferredRegion)] : PLATFORMS;

  // Search all platforms concurrently and collect successful results
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const summonerRes = await fetchWith429Retry(() =>
        axios.get(
          `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(nameOnly!)}`,
          { headers: { "X-Riot-Token": RIOT_API_KEY } }
        )
      );
      const summ = (summonerRes as any).data || summonerRes;
      return {
        summonerName: summ.name,
        name: summ.name,
        tagLine: undefined,
        puuid: summ.puuid,
        profileIconId: summ.profileIconId,
        summonerLevel: summ.summonerLevel,
        region: platform,
      };
    })
  );

  const uniqueByPuuid: Record<string, any> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.puuid) {
      uniqueByPuuid[r.value.puuid] = r.value;
    }
  }
  const list = Object.values(uniqueByPuuid);

  if (list.length === 0) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(list);
}