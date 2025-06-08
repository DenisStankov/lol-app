import axios from 'axios'

export async function fetchChampionData(rank: string = 'ALL', region: string = 'global') {
  try {
    // Get current patch version
    const patchResponse = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    const currentPatch = patchResponse.data[0]

    // Fetch champion data from Riot's Data Dragon
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`)
    const champData = response.data.data

    // Generate simulated stats for each champion
    return Object.fromEntries(
      Object.entries(champData).map(([id, champion]: [string, any]) => {
        // Generate role-specific stats
        const roles = {
          TOP: generateRoleStats(champion),
          JUNGLE: generateRoleStats(champion),
          MIDDLE: generateRoleStats(champion),
          BOTTOM: generateRoleStats(champion),
          UTILITY: generateRoleStats(champion)
        }

        return [id, {
          id,
          name: champion.name,
          image: {
            icon: `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/img/champion/${id}.png`,
            splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`,
            loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`
          },
          roles,
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

function generateRoleStats(champion: any) {
  // Base win rate between 48-52%
  const baseWinRate = 48 + Math.random() * 4

  // Adjust based on champion difficulty (easier champions tend to have higher win rates)
  const difficultyAdjustment = (10 - champion.info.difficulty) * 0.2
  const winRate = baseWinRate + difficultyAdjustment

  return {
    games: Math.floor(1000 + Math.random() * 9000),
    wins: 0, // Will be calculated from games and winRate
    kda: {
      kills: 5 + Math.random() * 5,
      deaths: 3 + Math.random() * 3,
      assists: 5 + Math.random() * 7
    },
    winRate: Math.min(55, Math.max(45, winRate)), // Cap between 45-55%
    pickRate: 2 + Math.random() * 8, // 2-10%
    banRate: 1 + Math.random() * 4, // 1-5%
    tier: calculateTier(winRate, 5) // Using average pickRate for now
  }
}

function calculateTier(winRate: number, pickRate: number): string {
  if (winRate >= 53 && pickRate >= 10) return 'S+'
  if (winRate >= 52 && pickRate >= 8) return 'S'
  if (winRate >= 51 && pickRate >= 5) return 'A'
  if (winRate >= 50 && pickRate >= 3) return 'B'
  if (winRate >= 48) return 'C'
  return 'D'
} 