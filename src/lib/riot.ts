import axios from 'axios'

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
const FALLBACK_VERSION = '13.24.1'; // Fallback to a known version

// Cache the version to avoid multiple calls
let cachedVersion: string | null = null;

async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  
  try {
    const response = await axios.get(`${DDRAGON_BASE_URL}/api/versions.json`);
    const version = response.data[0];
    if (typeof version !== 'string') {
      throw new Error('Invalid version format');
    }
    cachedVersion = version;
    return version;
  } catch (error) {
    console.error('Error fetching latest version:', error);
    return FALLBACK_VERSION;
  }
}

export async function fetchChampionData(rank = 'PLATINUM', region = 'global') {
  try {
    const version = await getLatestVersion();
    
    // First get the list of all champions
    const champListResponse = await axios.get(
      `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`
    );
    
    const champions = champListResponse.data.data;
    const championData: Record<string, any> = {};

    // For each champion, get their detailed data
    for (const [champKey, champInfo] of Object.entries<any>(champions)) {
      try {
        const detailResponse = await axios.get(
          `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion/${champKey}.json`
        );
        
        const champDetail = detailResponse.data.data[champKey];
        
        // Combine with mock stats data (replace with real API calls when available)
        championData[champKey] = {
          id: champDetail.id,
          name: champDetail.name,
          image: {
            icon: `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${champDetail.image.full}`,
            splash: `${DDRAGON_BASE_URL}/cdn/img/champion/splash/${champKey}_0.jpg`,
            loading: `${DDRAGON_BASE_URL}/cdn/img/champion/loading/${champKey}_0.jpg`
          },
          roles: {
            // Mock role data - replace with real API data
            ...(champDetail.tags.includes('Fighter') && {
              TOP: mockRoleStats(),
              JUNGLE: mockRoleStats()
            }),
            ...(champDetail.tags.includes('Mage') && {
              MIDDLE: mockRoleStats()
            }),
            ...(champDetail.tags.includes('Marksman') && {
              BOTTOM: mockRoleStats()
            }),
            ...(champDetail.tags.includes('Support') && {
              UTILITY: mockRoleStats()
            })
          },
          difficulty: getDifficultyLabel(champDetail.info.difficulty),
          damageType: getDamageType(champDetail),
          range: champDetail.stats.attackrange > 300 ? 'Ranged' : 'Melee'
        };
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`Error fetching details for ${champKey}:`, error);
      }
    }
    
    return championData;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    throw error;
  }
}

// Helper function to generate mock role stats
function mockRoleStats() {
  const winRate = 45 + Math.random() * 10;
  const pickRate = 2 + Math.random() * 8;
  const games = Math.floor(10000 + Math.random() * 90000);
  
  return {
    games,
    wins: Math.floor(games * (winRate / 100)),
    kda: {
      kills: 5 + Math.random() * 5,
      deaths: 3 + Math.random() * 3,
      assists: 4 + Math.random() * 6
    },
    winRate,
    pickRate,
    banRate: 1 + Math.random() * 5,
    tier: getTierFromWinRate(winRate)
  };
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return 'Low';
  if (difficulty <= 7) return 'Moderate';
  return 'High';
}

function getDamageType(champDetail: any): string {
  const { attackdamage, attackdamageperlevel, spelldamage, spelldamageperlevel } = champDetail.stats;
  if (attackdamage + attackdamageperlevel > spelldamage + spelldamageperlevel) {
    return 'Physical';
  }
  return 'Magic';
}

function getTierFromWinRate(winRate: number): string {
  if (winRate >= 53) return 'S';
  if (winRate >= 51) return 'A';
  if (winRate >= 49) return 'B';
  if (winRate >= 47) return 'C';
  return 'D';
} 