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
    return NextResponse.json({ error: "Summoner name is required." }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching Summoner: ${query} in ${region}`);

    // ✅ Riot does NOT have an endpoint for partial name search, so we use a workaround:
    // We assume a generic list of possible taglines and search each.
    const possibleTags = ["EUW", "EUNE", "NA", "KR", "JP", "BR", "TR", "RU", "LAN", "LAS"];
    const results = [];

    for (const tag of possibleTags) {
      try {
        const response = await axios.get(
          `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(query)}/${encodeURIComponent(tag)}`,
          { headers: { "X-Riot-Token": RIOT_API_KEY } }
        );

        if (response.data.puuid) {
          results.push({
            summonerName: response.data.gameName,
            tagLine: response.data.tagLine,
            puuid: response.data.puuid,
          });
        }
      } catch (error) {
        // Ignore errors for missing users
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          continue;
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No matching summoners found." }, { status: 404 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Riot API Error:", error);
    return NextResponse.json({ error: "Summoner not found or unauthorized." }, { status: 403 });
  }
}