import axios from 'axios'

export async function fetchChampionData(rank: string = 'ALL', region: string = 'global') {
  try {
    // Get current patch version
    const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    const currentPatch = patchResponse.data[0]

    // Fetch champion data from Riot's Data Dragon
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
    const champData = response.data.data

    // Get champion stats from your backend
    const statsResponse = await axios.get(`/api/riot/champion-stats?rank=${rank}&region=${region}`)
    const champStats = statsResponse.data || {}

    // Transform and combine the data
    return Object.fromEntries(
      Object.entries(champData).map(([id, champion]: [string, any]) => {
        const stats = champStats[champion.key] || {
          roles: {},
          winRate: 50,
          pickRate: 5,
          banRate: 2
        }

        return [id, {
          id,
          name: champion.name,
          image: champion.image,
          roles: stats.roles,
          winRate: stats.winRate,
          pickRate: stats.pickRate,
          banRate: stats.banRate,
          difficulty: champion.info.difficulty,
          damageType: champion.tags.includes('Assassin') ? 'Physical' : 
                     champion.tags.includes('Mage') ? 'Magic' : 'Mixed',
          range: champion.stats.attackrange > 300 ? 'Ranged' : 'Melee'
        }]
      })
    )
  } catch (error) {
    console.error('Error fetching champion data:', error)
    throw error
  }
} 