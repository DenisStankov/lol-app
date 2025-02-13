import { NextResponse } from "next/server";
import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const region = searchParams.get("region");

  if (!query || !region) {
    return NextResponse.json({ error: "Summoner name and region are required." }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching for summoner: ${query} in ${region}`);

    // ✅ Fetch Summoner Data from Riot API
    const response = await axios.get(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(query)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!response.data.puuid) {
      return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
    }

    return NextResponse.json({
      summonerName: response.data.gameName,
      tagLine: response.data.tagLine,
      puuid: response.data.puuid,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Riot API Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
    return NextResponse.json({ error: "Summoner not found or unauthorized." }, { status: 403 });
  }
}