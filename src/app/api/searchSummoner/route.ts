import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "API key missing in environment variables" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const summonerName = searchParams.get("query")?.trim() || "";
  const region = searchParams.get("region")?.trim() || "";

  console.log("🛠 DEBUG: Received Query:", summonerName, "Region:", region);

  if (!summonerName || !region) {
    return NextResponse.json({ error: "Summoner name and region are required." }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching Summoner: ${summonerName} in ${region}`);

    // ✅ Step 1: Get Summoner PUUID using Summoner V4 API
    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!summonerResponse.data.puuid) {
      return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
    }

    const puuid = summonerResponse.data.puuid;

    // ✅ Step 2: Use PUUID to fetch Account Information (GameName + TagLine)
    const accountResponse = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!accountResponse.data.gameName || !accountResponse.data.tagLine) {
      return NextResponse.json({ error: "Could not retrieve full summoner details." }, { status: 500 });
    }

    return NextResponse.json({
      summonerName: accountResponse.data.gameName,
      tagLine: accountResponse.data.tagLine,
      puuid,
      profileIconId: summonerResponse.data.profileIconId,
      summonerLevel: summonerResponse.data.summonerLevel,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Riot API Error:", error.response?.data || error.message);
      return NextResponse.json({ error: "Summoner not found or unauthorized." }, { status: 403 });
    } else {
      console.error("❌ Unexpected Error:", error);
      return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
  }
}