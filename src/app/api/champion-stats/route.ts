import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { fetchChampionData } from '@/lib/riot'

type RoleStats = {
  games: number
  wins: number
  kda: {
    kills: number
    deaths: number
    assists: number
  }
  winRate: number
  pickRate: number
  banRate: number
  tier: string
}

type ChampionRoles = {
  TOP?: RoleStats
  JUNGLE?: RoleStats
  MIDDLE?: RoleStats
  BOTTOM?: RoleStats
  UTILITY?: RoleStats
}

type ChampionData = {
  id: string
  name: string
  image: {
    icon: string
    splash: string
    loading: string
  }
  roles: ChampionRoles
  difficulty: string
  damageType: string
  range: string
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cache duration in milliseconds
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rank = searchParams.get('rank') || 'ALL'
    const region = searchParams.get('region') || 'global'
    const role = searchParams.get('role') || 'all'

    // Create a cache key that includes all parameters
    const cacheKey = `${rank}-${region}-${role}`.toLowerCase()

    // Check cache first
    const { data: cachedStats, error: cacheError } = await supabase
      .from('champion_stats')
      .select('*')
      .eq('cache_key', cacheKey)
      .single()

    if (cacheError) {
      console.error('Error fetching from cache:', cacheError)
    }

    // If we have valid cached data that's not too old, use it
    if (cachedStats) {
      const cacheAge = Date.now() - new Date(cachedStats.updated_at).getTime()
      
      if (cacheAge < CACHE_DURATION) {
        return NextResponse.json(cachedStats.stats)
      }
    }

    // If cache miss or stale, fetch fresh data
    const freshData = await fetchChampionData(rank, region)
    
    // Filter data by role if specified
    let filteredData: Record<string, ChampionData> = freshData
    if (role !== 'all') {
      const roleKey = role.toUpperCase() as keyof ChampionRoles
      filteredData = Object.fromEntries(
        Object.entries(freshData)
          .filter(([_, champData]) => 
            champData.roles && 
            champData.roles[roleKey] && 
            typeof champData.roles[roleKey] === 'object'
          )
          .map(([champId, champData]) => [
            champId,
            {
              ...champData,
              roles: {
                [roleKey]: champData.roles[roleKey]
              }
            }
          ])
      ) as Record<string, ChampionData>
    }
    
    // Update cache with fresh data
    const { error: updateError } = await supabase
      .from('champion_stats')
      .upsert({
        cache_key: cacheKey,
        rank,
        region,
        role,
        stats: filteredData,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('Error updating cache:', updateError)
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error in champion-stats API:', error)
    return NextResponse.json({ error: 'Failed to fetch champion stats' }, { status: 500 })
  }
}