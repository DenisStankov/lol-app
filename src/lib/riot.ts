import axios from 'axios'

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
          roles: generateRolesForTags(champDetail.tags || []),
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

// Generate role assignments based on champion tags
function generateRolesForTags(tags: string[]): Record<string, ReturnType<typeof mockRoleStats>> {
  const roles: Record<string, ReturnType<typeof mockRoleStats>> = {};

  if (tags.includes('Fighter')) {
    roles.TOP = mockRoleStats();
    roles.JUNGLE = mockRoleStats();
  }
  if (tags.includes('Tank')) {
    if (!roles.TOP) roles.TOP = mockRoleStats();
    roles.UTILITY = mockRoleStats();
  }
  if (tags.includes('Mage')) {
    roles.MIDDLE = mockRoleStats();
    if (!roles.UTILITY) roles.UTILITY = mockRoleStats();
  }
  if (tags.includes('Assassin')) {
    if (!roles.MIDDLE) roles.MIDDLE = mockRoleStats();
    if (!roles.JUNGLE) roles.JUNGLE = mockRoleStats();
  }
  if (tags.includes('Marksman')) {
    roles.BOTTOM = mockRoleStats();
  }
  if (tags.includes('Support')) {
    roles.UTILITY = mockRoleStats();
  }

  // Fallback: ensure every champion has at least one role
  if (Object.keys(roles).length === 0) {
    roles.MIDDLE = mockRoleStats();
  }

  return roles;
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
  const tags: string[] = champDetail.tags || [];
  // Mages deal primarily magic damage
  if (tags.includes('Mage')) return 'Magic';
  // Marksmen and Fighters deal primarily physical damage
  if (tags.includes('Marksman') || tags.includes('Fighter') || tags.includes('Assassin')) return 'Physical';
  // Tanks can be either; check if they have high AP scaling via info.magic
  if (champDetail.info?.magic > champDetail.info?.attack) return 'Magic';
  return 'Physical';
}

function getTierFromWinRate(winRate: number): string {
  if (winRate >= 53) return 'S';
  if (winRate >= 51) return 'A';
  if (winRate >= 49) return 'B';
  if (winRate >= 47) return 'C';
  return 'D';
} 