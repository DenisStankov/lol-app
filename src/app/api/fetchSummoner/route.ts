import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
console.log(RIOT_API_KEY); // ✅ Backend Only API Key

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

    // 1️⃣ **Get Summoner Info (PUUID, Level, Profile Icon)**
    const summonerResponse = await axios.get(
      `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!summonerResponse.data.puuid) {
      return NextResponse.json({ error: "Summoner not found in Riot API." }, { status: 404 });
    }

    const { puuid } = summonerResponse.data;

    // 2️⃣ **Get Summoner Stats (Profile Icon, Level, Summoner ID)**
    const summonerDataResponse = await axios.get(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const summonerId = summonerDataResponse.data.id;

    // 3️⃣ **Get Ranked Stats (Tier, LP, Win/Loss)**
    const rankedStatsResponse = await axios.get(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const rankedStats = rankedStatsResponse.data.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || {};

    // 4️⃣ **Get Recent Matches**
    const matchIdsResponse = await axios.get(
      `https://${riotRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const recentMatches = await Promise.all(
      matchIdsResponse.data.map(async (matchId: string) => {
        const matchResponse = await axios.get(
          `https://${riotRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          { headers: { "X-Riot-Token": RIOT_API_KEY } }
        );
        return {
          matchId,
          champion: matchResponse.data.info.participants.find((p: any) => p.puuid === puuid)?.championName || "Unknown",
          result: matchResponse.data.info.participants.find((p: any) => p.puuid === puuid)?.win ? "Victory" : "Defeat",
          kills: matchResponse.data.info.participants.find((p: any) => p.puuid === puuid)?.kills,
          deaths: matchResponse.data.info.participants.find((p: any) => p.puuid === puuid)?.deaths,
          assists: matchResponse.data.info.participants.find((p: any) => p.puuid === puuid)?.assists,
        };
      })
    );

    // **Return Full Summoner Data**
    return NextResponse.json({
      summonerName: summonerResponse.data.gameName,
      tagLine: summonerResponse.data.tagLine,
      summonerLevel: summonerDataResponse.data.summonerLevel || 0,
      profileIconId: summonerDataResponse.data.profileIconId || 0,
      rank: rankedStats.tier || "Unranked",
      division: rankedStats.rank || "",
      leaguePoints: rankedStats.leaguePoints || 0,
      winRate: rankedStats.wins && rankedStats.losses
        ? Math.round((rankedStats.wins / (rankedStats.wins + rankedStats.losses)) * 100)
        : "N/A",
      matchHistory: recentMatches,
    });
  } catch (error: any) {
    console.error("Riot API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
  }
}
