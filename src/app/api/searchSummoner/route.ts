import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "API key missing in environment variables" }, { status: 500 });
  }

  // ✅ Extract query parameters correctly
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";
  const region = searchParams.get("region")?.trim() || "";

  console.log("🛠 DEBUG: Received Query:", query, "Region:", region);

  if (!query || !region) {
    return NextResponse.json({ error: "Query and region are required." }, { status: 400 });
  }

  // ✅ Ensure query contains "#"
  if (!query.includes("#")) {
    return NextResponse.json({ error: "Summoner name and tagline are required. Format: Name#Tag" }, { status: 400 });
  }

  const [gameName, tagLine] = query.split("#");

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Summoner name and tagline are required." }, { status: 400 });
  }

  // ✅ Map Riot API region correctly
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
  }[region];

  if (!riotRegion) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching: ${gameName}#${tagLine} in ${riotRegion}`);

    const response = await axios.get(
      `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    return NextResponse.json(response.data);
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