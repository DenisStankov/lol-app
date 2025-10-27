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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

// Cache duration in milliseconds
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const rank = url.searchParams.get('rank') || 'PLATINUM'
    const region = url.searchParams.get('region') || 'global'
    const role = url.searchParams.get('role') || 'all'
    const championId = url.searchParams.get('championId')

    // Create a cache key that includes all parameters
    const cacheKey = `${rank}-${region}-${role}-${championId || 'all'}`.toLowerCase()

    if (supabase) {
      try {
        // Check cache first
        const { data: cachedStats, error: cacheError } = await supabase
          .from('champion_stats')
          .select('*')
          .eq('cache_key', cacheKey)
          .maybeSingle()

        if (cacheError) {
          console.error('Error fetching from cache:', cacheError)
          // Continue execution - we'll fetch fresh data
        } else if (cachedStats) {
          const cacheAge = Date.now() - new Date(cachedStats.updated_at).getTime()
          if (cacheAge < CACHE_DURATION) {
            return NextResponse.json(cachedStats.stats)
          }
        }
      } catch (cacheError) {
        console.error('Cache error:', cacheError)
        // Continue execution - we'll fetch fresh data
      }
    }

    // If cache miss or stale, fetch fresh data
    const freshData = await fetchChampionData(rank, region) as Record<string, ChampionData>
    
    // Filter data by role if specified
    let filteredData: Record<string, ChampionData> = freshData
    if (role !== 'all') {
      const roleKey = role.toUpperCase() as keyof ChampionRoles
      filteredData = Object.fromEntries(
        Object.entries(freshData)
          .filter(([_, champData]) => 
            champData.roles && 
            champData.roles[roleKey]
          )
          .map(([id, data]) => [
            id,
            {
              ...data,
              roles: {
                [roleKey]: data.roles[roleKey]
              }
            }
          ])
      ) as Record<string, ChampionData>
    }

    // Filter by champion ID if specified
    if (championId && championId in filteredData) {
      filteredData = {
        [championId]: filteredData[championId]
      }
    }

    if (supabase) {
      try {
        // Update cache with fresh data
        await supabase
          .from('champion_stats')
          .upsert({
            cache_key: cacheKey,
            rank,
            region,
            role,
            stats: filteredData,
            updated_at: new Date().toISOString()
          })
      } catch (updateError) {
        console.error('Cache update error:', updateError)
        // Continue execution - we'll return the fresh data anyway
      }
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error in champion-stats API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch champion stats' },
      { status: 500 }
    )
  }
}