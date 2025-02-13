import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(req: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "API key missing in environment variables" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const summonerName = searchParams.get("query");
  const region = searchParams.get("region");

  if (!summonerName || !region) {
    return NextResponse.json({ error: "Summoner name and region required." }, { status: 400 });
  }

  try {
    console.log(`🔍 Searching for summoner: ${summonerName} in ${region}`);

    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Riot API Error:", error.response?.data || error.message);

      if (error.response?.status === 403) {
        return NextResponse.json({ error: "Forbidden: API key may be invalid or expired." }, { status: 403 });
      }
    } else {
      console.error("❌ Unexpected Error:", error);
    }

    return NextResponse.json({ error: "Summoner not found." }, { status: 404 });
  }
}