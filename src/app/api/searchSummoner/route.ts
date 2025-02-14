import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// ✅ Riot Account API requires specific regions for account lookup
const RIOT_ACCOUNT_REGIONS: Record<string, string> = {
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
};

export async function GET(req: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "API key missing in environment variables" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const region = searchParams.get("region")?.trim();

  console.log("🛠 DEBUG: Searching Summoner:", query, "Region:", region);

  if (!query || !region) {
    return NextResponse.json({ error: "Summoner name and region are required." }, { status: 400 });
  }

  const riotRegion = RIOT_ACCOUNT_REGIONS[region];

  if (!riotRegion) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching for: ${query} in ${region} (Riot API Region: ${riotRegion})`);

    // ✅ Step 1: Get Account Info from Riot Account-V1 API
    const accountResponse = await axios.get(
      `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(query)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const { puuid, gameName, tagLine } = accountResponse.data;

    if (!puuid || !gameName || !tagLine) {
      return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
    }

    return NextResponse.json({
      summonerName: gameName,
      tagLine: tagLine,
      puuid,
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