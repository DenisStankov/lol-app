import { NextResponse } from 'next/server';
import axios from 'axios';

interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionData {
  id: string;
  key: string;
  name: string;
  image: ChampionImage;
  tags: string[];  // Champion tags from Data Dragon (Fighter, Mage, etc.)
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
}

interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

interface ChampionDataResponse {
  type: string;
  version: string;
  data: Record<string, ChampionData>;
}

// Tier type follows standard tier list format
type TierType = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

interface RoleStats {
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: TierType;
}

interface ChampionStats {
  id: string;
  name: string;
  image: ChampionImage;
  roles: Record<string, RoleStats>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
}

// Calculate tier based on win rate, pick rate, and ban rate
function calculateTier(winRate: number, pickRate: number, banRate: number): TierType {
  // Score based on statistical significance and performance
  const score = (winRate - 50) * 2.5 + pickRate * 0.8 + banRate * 0.4;
  
  if (score > 12) return 'S+';
  if (score > 8) return 'S';
  if (score > 4) return 'A';
  if (score > 0) return 'B';
  if (score > -4) return 'C';
  return 'D';
}

// Function to get the current patch version
async function getCurrentPatch(): Promise<string> {
  // Return a fixed patch version for consistency
  return '14.11.1';
  
  // Commented out dynamic patch fetching to ensure stable version
  /*
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!response.ok) {
      throw new Error('Failed to fetch versions');
    }
    const versions = await response.json();
    return versions[0]; // Return the latest version
  } catch (error) {
    console.error('Error fetching current patch:', error);
    return '14.11.1'; // Fallback to a known version
  }
  */
}

// Map Data Dragon tags to damage type
function getDamageType(tags: string[], info: ChampionInfo): 'AP' | 'AD' | 'Hybrid' {
  if (tags.includes('Assassin') && tags.includes('Mage')) return 'Hybrid';
  if (tags.includes('Marksman') && tags.includes('Mage')) return 'Hybrid';
  
  // Champions with high magic damage are typically AP
  if (info.magic > 7) return 'AP';
  if (tags.includes('Mage')) return 'AP';
  if (tags.includes('Support') && !tags.includes('Fighter') && !tags.includes('Tank')) return 'AP';
  
  // Certain tags usually indicate AD champions
  if (tags.includes('Marksman')) return 'AD';
  if (tags.includes('Fighter') && !tags.includes('Mage')) return 'AD';
  if (tags.includes('Assassin') && !tags.includes('Mage')) return 'AD';
  
  // Hybrid champions
  if (info.attack > 5 && info.magic > 5) return 'Hybrid';
  
  // Default to AD if unsure
  return 'AD';
}

// Map Data Dragon info to difficulty
function getDifficulty(info: ChampionInfo): 'Easy' | 'Medium' | 'Hard' {
  const difficultyRating = info.difficulty;
  
  if (difficultyRating <= 3) return 'Easy';
  if (difficultyRating <= 7) return 'Medium';
  return 'Hard';
}

// Map role preferences for champions based on Data Dragon tags
function getPrimaryRoles(tags: string[], championName: string): string[] {
  const roles: string[] = [];
  
  // Role mappings based on champion tags
  if (tags.includes('Fighter') || tags.includes('Tank')) {
    roles.push('top');
  }
  
  if (tags.includes('Assassin') || tags.includes('Mage')) {
    roles.push('mid');
  }
  
  if (tags.includes('Marksman')) {
    roles.push('bot');
  }
  
  if (tags.includes('Support')) {
    roles.push('support');
  }
  
  // Special cases for jungle
  const junglers = ['Amumu', 'Elise', 'Hecarim', 'Ivern', 'Jarvan IV', 'Karthus', 'Kayn', 
    'Kha\'Zix', 'Kindred', 'Lee Sin', 'Master Yi', 'Nunu & Willump', 'Rammus', 'Rek\'Sai', 
    'Rengar', 'Sejuani', 'Shaco', 'Udyr', 'Vi', 'Warwick', 'Xin Zhao', 'Zac', 'Evelynn',
    'Fiddlesticks', 'Graves', 'Nidalee', 'Nocturne', 'Olaf', 'Trundle', 'Volibear'];
  
  if (junglers.includes(championName) || tags.includes('Tank') && Math.random() > 0.5) {
    roles.push('jungle');
  }
  
  // If no roles assigned, give default role based on tags
  if (roles.length === 0) {
    if (tags.includes('Tank')) {
      roles.push('top');
      roles.push('support');
    } else if (tags.includes('Fighter')) {
      roles.push('top');
      roles.push('jungle');
    } else if (tags.includes('Assassin')) {
      roles.push('mid');
      roles.push('jungle');
    } else if (tags.includes('Mage')) {
      roles.push('mid');
      roles.push('support');
    } else {
      roles.push('mid'); // Default role
    }
  }
  
  return roles;
}

// Generate champion statistics based on Data Dragon data
async function generateChampionStats(champion: ChampionData): Promise<{
  roles: Record<string, RoleStats>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  damageType: 'AP' | 'AD' | 'Hybrid';
  range: 'Melee' | 'Ranged';
}> {
  // Get champion attributes
  const difficulty = getDifficulty(champion.info);
  const damageType = getDamageType(champion.tags, champion.info);
  const range = champion.tags.includes('Marksman') ? 'Ranged' : (Math.random() > 0.7 ? 'Ranged' : 'Melee');
  
  // Determine roles
  const primaryRoles = getPrimaryRoles(champion.tags, champion.name);
  const roles: Record<string, RoleStats> = {};
  
  // Generate stats for each role
  primaryRoles.forEach(role => {
    // Base win rate influenced by champion's power in that role
    let baseWinRate = 50;
    
    // Adjust win rate based on champion difficulty
    if (difficulty === 'Easy') baseWinRate += 1;
    if (difficulty === 'Hard') baseWinRate -= 1;
    
    // Add some randomness (-3 to +3)
    baseWinRate += (Math.random() * 6) - 3;
    
    // Pick rate based on popularity and role
    let pickRate = 5 + (Math.random() * 15);
    if (role === 'mid' || role === 'bot') pickRate *= 1.2; // More popular roles
    
    // Ban rate based on power level
    const banRate = baseWinRate > 52 ? 10 + (Math.random() * 20) : 1 + (Math.random() * 8);
    
    // Total games
    const totalGames = Math.floor(pickRate * 10000);
    
    // Calculate tier
    const tier = calculateTier(baseWinRate, pickRate, banRate);
    
    roles[role] = {
      winRate: parseFloat(baseWinRate.toFixed(1)),
      pickRate: parseFloat(pickRate.toFixed(1)),
      banRate: parseFloat(banRate.toFixed(1)),
      totalGames,
      tier
    };
  });
  
  return {
    roles,
    difficulty,
    damageType,
    range
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || await getCurrentPatch();
    
    console.log(`Fetching champion data for patch ${patch}`);

    // Get the list of all champions from Data Dragon (Riot's official CDN)
    const championsResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    const champions = championsResponse.data.data;
    const champStats: Record<string, ChampionStats> = {};
    
    // Process each champion
    for (const champKey in champions) {
      const champion = champions[champKey];
      
      // Generate statistics for this champion
      const stats = await generateChampionStats(champion);
      
      champStats[champion.id] = {
        id: champion.id,
        name: champion.name,
        image: champion.image, // Direct from Data Dragon
        ...stats
      };
    }

    // Cache the results for 1 hour (for development/testing)
    const cacheControl = 'public, s-maxage=3600, stale-while-revalidate=1800';

    return NextResponse.json(champStats, {
      headers: {
        'Cache-Control': cacheControl
      }
    });
  } catch (error) {
    console.error('Error fetching champion stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion stats' },
      { status: 500 }
    );
  }
} 