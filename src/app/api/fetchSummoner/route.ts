import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

interface SummonerData {
  gameName: string;
  tagLine: string;
  puuid: string;
}

interface SummonerStats {
  id: string;
  summonerLevel: number;
  profileIconId: number;
}

interface RankedStats {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  queueType: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");
  const platform = searchParams.get("region");

  if (!gameName || !tagLine || !platform) {
    return NextResponse.json({ error: "Summoner name, tag, and region are required." }, { status: 400 });
  }

  try {
    const riotRegion = {
      euw1: "europe",
      eun1: "europe",
      tr1: "europe",
      ru: "europe",
      na1: "americas",
      br1: "americas",
      la1: "americas",
      la2: "americas",
      kr: "asia",
      jp1: "asia",
    }[platform] || "europe";

    // ✅ Get Summoner Info
    const summonerResponse: AxiosResponse<SummonerData> = await axios.get(
      `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY! } }
    );

    if (!summonerResponse.data.puuid) {
      return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
    }

    const { puuid } = summonerResponse.data;

    // ✅ Get Summoner Stats
    const summonerDataResponse: AxiosResponse<SummonerStats> = await axios.get(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY! } }
    );

    const summonerId = summonerDataResponse.data.id;

    // ✅ Get Ranked Stats
    const rankedStatsResponse: AxiosResponse<RankedStats[]> = await axios.get(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY! } }
    );

    const rankedStats = rankedStatsResponse.data.find((entry) => entry.queueType === "RANKED_SOLO_5x5");

    return NextResponse.json({
      summonerName: summonerResponse.data.gameName,
      tagLine: summonerResponse.data.tagLine,
      summonerLevel: summonerDataResponse.data.summonerLevel || 0,
      profileIconId: summonerDataResponse.data.profileIconId || 0,
      rank: rankedStats?.tier || "Unranked",
      division: rankedStats?.rank || "",
      leaguePoints: rankedStats?.leaguePoints || 0,
    });
  } catch (error) {
    console.error("Riot API Error:", error);
    return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
  }
}