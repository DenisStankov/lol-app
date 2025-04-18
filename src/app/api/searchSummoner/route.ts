import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// ✅ Riot API Regions for Account & Summoner Data
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
    console.error("❌ API key is missing.");
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

    // ✅ Step 1: Split Summoner Name and Tagline
    const [gameName, tagLine] = query.includes("#") ? query.split("#") : [query, ""];
    if (!gameName || !tagLine) {
      return NextResponse.json({ error: "Summoner name must include tagline (e.g., ExampleUser#EUW)." }, { status: 400 });
    }

    // ✅ Step 2: Get Account Info from Riot API
    const accountResponse = await axios.get(
      `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const { puuid, gameName: returnedGameName, tagLine: returnedTagLine } = accountResponse.data;

    if (!puuid || !returnedGameName || !returnedTagLine) {
      return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
    }

    // ✅ Step 3: Get Summoner Profile Info (Profile Icon & Level)
    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const { profileIconId, summonerLevel } = summonerResponse.data;

    return NextResponse.json({
      summonerName: returnedGameName,
      tagLine: returnedTagLine,
      puuid,
      profileIconId,
      summonerLevel,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Riot API Error:", error.response?.data || error.message);
      return NextResponse.json({ error: error.response?.data?.status?.message || "Summoner not found or unauthorized." }, { status: error.response?.status || 403 });
    } else {
      console.error("❌ Unexpected Error:", error);
      return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
  }
}