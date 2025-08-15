import { getSupabaseAdmin } from './supabase-admin'

export type SummonerIndexRecord = {
  puuid: string
  region: string
  summonerId?: string
  summonerName?: string
  gameName?: string
  tagLine?: string
  profileIconId?: number
  summonerLevel?: number
  source?: string
  lastSeenAt?: string
}

const memory = new Map<string, SummonerIndexRecord>()

function normalize(name: string) {
  return name.replace(/\s+/g, '').toLowerCase()
}

export async function upsertSummonerIndex(record: SummonerIndexRecord): Promise<void> {
  if (!record.puuid || !record.region) return
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memory.set(record.puuid, { ...memory.get(record.puuid), ...record, lastSeenAt: new Date().toISOString() })
    return
  }

  const payload: any = {
    puuid: record.puuid,
    region: record.region,
    summoner_id: record.summonerId ?? null,
    summoner_name: record.summonerName ?? null,
    game_name: record.gameName ?? null,
    tag_line: record.tagLine ?? null,
    profile_icon_id: record.profileIconId ?? null,
    summoner_level: record.summonerLevel ?? null,
    normalized_name: normalize(record.gameName || record.summonerName || ''),
    source: record.source ?? 'unknown',
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await supabase.from('summoner_index').upsert(payload, { onConflict: 'puuid' })
}

export async function searchSummonerIndex(query: string, region?: string, limit = 10) {
  const supabase = getSupabaseAdmin()
  const needle = normalize(query)

  if (!supabase) {
    const rows = Array.from(memory.values()).filter((r) => {
      const base = normalize(r.gameName || r.summonerName || '')
      return base.startsWith(needle) && (!region || r.region === region)
    })
    return rows.slice(0, limit)
  }

  let q = supabase
    .from('summoner_index')
    .select('puuid, region, summoner_id, summoner_name, game_name, tag_line, profile_icon_id, summoner_level, last_seen_at')
    .ilike('normalized_name', `${needle}%`)
    .order('last_seen_at', { ascending: false })
    .limit(limit)

  if (region) q = q.eq('region', region)

  const { data, error } = await q
  if (error) return []
  return (data || []).map((r: any) => ({
    puuid: r.puuid,
    region: r.region,
    summonerId: r.summoner_id ?? undefined,
    summonerName: r.summoner_name ?? undefined,
    gameName: r.game_name ?? undefined,
    tagLine: r.tag_line ?? undefined,
    profileIconId: r.profile_icon_id ?? undefined,
    summonerLevel: r.summoner_level ?? undefined,
    lastSeenAt: r.last_seen_at ?? undefined,
  }))
}


