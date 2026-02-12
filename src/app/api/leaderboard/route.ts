import { NextRequest, NextResponse } from 'next/server'

const REGION_TO_PLATFORM: Record<string, string> = {
  NA: 'na1',
  EUW: 'euw1',
  EUNE: 'eun1',
  KR: 'kr',
  JP: 'jp1',
  BR: 'br1',
  OCE: 'oc1',
  TR: 'tr1',
  RU: 'ru',
  LAN: 'la1',
  LAS: 'la2',
  PH: 'ph2',
  SG: 'sg2',
  TH: 'th2',
  TW: 'tw2',
  VN: 'vn2',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const region = (searchParams.get('region') || 'KR').toUpperCase()
  const platform = REGION_TO_PLATFORM[region as keyof typeof REGION_TO_PLATFORM] || 'kr'
  const RIOT_API_KEY = process.env.RIOT_API_KEY || process.env.NEXT_PUBLIC_RIOT_API_KEY

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'Missing Riot API key' }, { status: 500 })
  }

  try {
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`
    const res = await fetch(url, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
      next: { revalidate: 60 }, // cache for 1 minute
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }
    const data = await res.json()
    // Map Riot API data to leaderboard format
    const players = (data.entries || [])
      .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
      .map((entry: any, i: number) => ({
        id: entry.summonerId,
        rank: i + 1,
        summonerName: entry.summonerName,
        region,
        tier: data.tier,
        lp: entry.leaguePoints,
        winrate: entry.wins + entry.losses > 0 ? Number(((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(1)) : null,
        gamesPlayed: entry.wins + entry.losses,
        mainChampion: '', // Not available from this endpoint
        winStreak: entry.hotStreak ? entry.wins : 0, // Not accurate, but shows streak if hotStreak is true
      }))
    return NextResponse.json(players)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
} 