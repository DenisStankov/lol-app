import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { fetchChampionData } from '@/lib/riot'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rank = searchParams.get('rank') || 'ALL'
    const region = searchParams.get('region') || 'global'
    const role = searchParams.get('role') || 'all'

    // Check cache first
    const { data: cachedStats, error: cacheError } = await supabase
      .from('champion_stats')
      .select('*')
      .eq('rank', rank)
      .eq('region', region)
      .single()

    if (cacheError) {
      console.error('Error fetching from cache:', cacheError)
    }

    // If we have valid cached data that's not too old, use it
    if (cachedStats) {
      const cacheAge = Date.now() - new Date(cachedStats.updated_at).getTime()
      const sixHours = 6 * 60 * 60 * 1000

      if (cacheAge < sixHours) {
        // Filter by role if specified
        if (role !== 'all') {
          const filteredStats = Object.fromEntries(
            Object.entries(cachedStats.stats).map(([champId, champData]: [string, any]) => {
              if (!champData.roles || !champData.roles[role.toUpperCase()]) {
                return [champId, null]
              }
              return [champId, {
                ...champData,
                roles: {
                  [role.toUpperCase()]: champData.roles[role.toUpperCase()]
                }
              }]
            }).filter(([_, data]) => data !== null)
          )
          return NextResponse.json(filteredStats)
        }
        
        return NextResponse.json(cachedStats.stats)
      }
    }

    // If cache miss or stale, fetch fresh data
    const freshData = await fetchChampionData(rank, region)
    
    // Update cache with fresh data
    const { error: updateError } = await supabase
      .from('champion_stats')
      .upsert({
        rank,
        region,
        stats: freshData,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('Error updating cache:', updateError)
    }

    // Filter by role if specified
    if (role !== 'all') {
      const filteredStats = Object.fromEntries(
        Object.entries(freshData).map(([champId, champData]: [string, any]) => {
          if (!champData.roles || !champData.roles[role.toUpperCase()]) {
            return [champId, null]
          }
          return [champId, {
            ...champData,
            roles: {
              [role.toUpperCase()]: champData.roles[role.toUpperCase()]
            }
          }]
        }).filter(([_, data]) => data !== null)
      )
      return NextResponse.json(filteredStats)
    }

    return NextResponse.json(freshData)
  } catch (error) {
    console.error('Error in champion-stats API:', error)
    return NextResponse.json({ error: 'Failed to fetch champion stats' }, { status: 500 })
  }
}