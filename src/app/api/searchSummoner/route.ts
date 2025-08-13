import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Mappings between platform routing (for Summoner-V4) and regional routing (for Account-V1)
const PLATFORM_TO_REGIONAL: Record<string, "americas" | "europe" | "asia"> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "americas", // closest for League endpoints
};

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

  // If the user provided a Riot ID (name#tag), do a direct lookup across account regions
  if (query.includes("#")) {
    const [gameNameRaw, tagLineRaw] = query.split("#");
    const gameName = (gameNameRaw || "").trim();
    const tagLine = (tagLineRaw || "").trim();
    if (!gameName || !tagLine) {
      return NextResponse.json({ error: "Invalid Riot ID format" }, { status: 400 });
    }

    // Try the three regional routes; return first hit with its platform data (by probing platforms)
    const regionalBases: Array<"americas" | "europe" | "asia"> = ["europe", "americas", "asia"];
    try {
      const account = await fetchWith429Retry(async () => {
        for (const reg of regionalBases) {
          try {
            const res = await axios.get(
              `https://${reg}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
              { headers: { "X-Riot-Token": RIOT_API_KEY } }
            );
            return res.data;
          } catch (e: any) {
            if (e?.response?.status === 404) continue;
            if (e?.response?.status === 429) throw e; // handled by retry wrapper
          }
        }
        throw new Error("Not found");
      });

      // Probe platforms to find a matching Summoner profile to attach platform and icon info
      const platformsToTry = preferredRegion ? [preferredRegion, ...PLATFORMS.filter(p => p !== preferredRegion)] : PLATFORMS;
      for (const platform of platformsToTry) {
        try {
          const summ = await fetchWith429Retry(() =>
            axios.get(
              `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
              { headers: { "X-Riot-Token": RIOT_API_KEY } }
            )
          );
          return NextResponse.json([
            {
              summonerName: account.gameName,
              tagLine: account.tagLine,
              puuid: account.puuid,
              profileIconId: summ.data.profileIconId,
              summonerLevel: summ.data.summonerLevel,
              region: platform,
            },
          ]);
        } catch {}
      }

      // If we cannot resolve a platform profile, still return the account
      return NextResponse.json([
        {
          summonerName: account.gameName,
          tagLine: account.tagLine,
          puuid: account.puuid,
          profileIconId: 29,
          summonerLevel: 0,
          region: preferredRegion || "euw1",
        },
      ]);
    } catch (e) {
      return NextResponse.json({ error: "Summoner not found" }, { status: 404 });
    }
  }

  // Name-only search: probe all platforms for an exact name match, then enrich with Riot ID via Account-V1
  const platforms = preferredRegion ? [preferredRegion, ...PLATFORMS.filter(p => p !== preferredRegion)] : PLATFORMS;

  // Search all platforms concurrently
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const summonerRes = await fetchWith429Retry(() =>
        axios.get(
          `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(query!)}`,
          { headers: { "X-Riot-Token": RIOT_API_KEY } }
        )
      );
      const summ = summonerRes.data;
      const regional = PLATFORM_TO_REGIONAL[platform as keyof typeof PLATFORM_TO_REGIONAL];
      const accountRes = await fetchWith429Retry(() =>
        axios.get(
          `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(summ.puuid)}`,
          { headers: { "X-Riot-Token": RIOT_API_KEY } }
        )
      );
      const acc = accountRes.data;
      return {
        summonerName: acc.gameName,
        tagLine: acc.tagLine,
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