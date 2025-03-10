import { NextResponse } from 'next/server';
import axios from 'axios';

// NOTE: We'll use this in a future implementation when connecting to actual Riot API
// const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-your-api-key';

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

// const roleMapping: Record<string, string> = {
//   "TOP": "TOP",
//   "JUNGLE": "JUNGLE",
//   "MIDDLE": "MIDDLE",
//   "BOTTOM": "BOTTOM",
//   "UTILITY": "UTILITY",
//   "top": "TOP",
//   "jungle": "JUNGLE",
//   "mid": "MIDDLE",
// };

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

// const rankMapping: Record<string, string> = {
//   'CHALLENGER': 'CHALLENGER',
//   'GRANDMASTER': 'GRANDMASTER',
//   'MASTER': 'MASTER',
//   'DIAMOND': 'DIAMOND',
//   'EMERALD': 'EMERALD',
//   'PLATINUM': 'PLATINUM',
//   'GOLD': 'GOLD',
//   'SILVER': 'SILVER',
//   'BRONZE': 'BRONZE',
//   'IRON': 'IRON',
//   'ALL': '' // No specific tier
// };

// const regionMapping: Record<string, string> = {
//   'br': 'americas',
//   'na': 'americas',
//   'lan': 'americas',
//   'las': 'americas',
//   'euw': 'europe',
//   'eune': 'europe',
//   'tr': 'europe',
//   'ru': 'europe',
//   'kr': 'asia',
//   'jp': 'asia',
//   'global': '' // We'll need to query multiple regions for global
// };

// Add a module-level cache for champion statistics
// This cache will persist between requests
interface StatsCache {
  timestamp: number;
  expiry: number;
  data: {
    [rank: string]: {
      [region: string]: Record<string, Record<string, RoleStats>>;
    };
  };
}

const CACHE_DURATION = 3600000; // Cache duration in milliseconds (1 hour)
const statsCache: StatsCache = {
  timestamp: 0,
  expiry: 0,
  data: {} // Structure: {rank: {region: {championId: {role: stats}}}}
};

// Seedable random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1 (same range as Math.random())
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a random number within a range
  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Calculate tier based on win rate, pick rate, and ban rate
function calculateTier(winRate: number, pickRate: number, banRate: number): TierType {
  // More accurate formula based on dpm.lol's approach
  // First, calculate adjusted win rate (more weight to win rate when it deviates from 50%)
  const winRateDeviation = Math.abs(winRate - 50);
  const adjustedWinRate = winRate + (winRateDeviation * 0.4);
  
  // Calculate presence - this is pick rate + ban rate
  const presence = pickRate + banRate;
  
  // Calculate champion strength score
  // Higher win rates are exponentially more important
  // Higher presence also means more reliability in data
  const winRateScore = (adjustedWinRate - 45) * 3; // Win rates below 45% score 0
  const presenceScore = Math.min(20, presence) * 1.2; // Cap presence bonus at 20%
  
  // We calculate the score for debugging but use direct thresholds for tier assignment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const score = winRateScore + presenceScore;
  
  // Apply tier thresholds - using direct win rate and presence values is more accurate
  if (winRate >= 53.5 && presence >= 10) return 'S+';  // Exceptional champions need both high win rate and reasonable presence
  if (winRate >= 52.5 || (winRate >= 51 && presence >= 20)) return 'S';  // Very strong - high win rate or good win rate with high presence
  if (winRate >= 51 || (winRate >= 50 && presence >= 15)) return 'A';  // Strong champions
  if (winRate >= 49 && winRate < 51) return 'B';  // Balanced champions - close to 50% win rate
  if (winRate >= 47) return 'C';  // Below average champions
  return 'D';  // Weak champions - win rate below 47%
}

// Function to get the current patch version
async function getCurrentPatch(): Promise<string> {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data[0];  // Return the latest version
  } catch (error) {
    console.error('Error fetching current patch version:', error);
    return '13.24.1';  // Fallback to a recent version
  }
}

// Function to determine the damage type of a champion
function getDamageType(tags: string[], info: ChampionInfo): 'AP' | 'AD' | 'Hybrid' {
  if (tags.includes('Mage') || tags.includes('Assassin') && info.magic > info.attack) {
    return 'AP';
  } else if (tags.includes('Marksman') || (tags.includes('Fighter') && info.attack > info.magic)) {
    return 'AD';
  } else if (Math.abs(info.magic - info.attack) < 2) {
    return 'Hybrid';
  } else if (info.magic > info.attack) {
    return 'AP';
  } else {
  return 'AD';
  }
}

// Function to determine the difficulty of a champion
function getDifficulty(info: ChampionInfo): 'Easy' | 'Medium' | 'Hard' {
  const difficultyValue = info.difficulty;
  if (difficultyValue <= 3) {
    return 'Easy';
  } else if (difficultyValue <= 7) {
    return 'Medium';
  } else {
  return 'Hard';
}
}

// Function to normalize role names
function normalizeRoleName(role: string): string {
  return role.toUpperCase();
}

// Main function to fetch champion statistics
async function fetchChampionStats(rank: string = 'ALL', region: string = 'global'): Promise<Record<string, Record<string, RoleStats>>> {
  try {
    console.log(`Fetching champion stats for rank: ${rank}, region: ${region}`);
    
    // Check if we have cached data for this rank and region
    if (
      statsCache.timestamp > 0 && 
      Date.now() < statsCache.expiry &&
      statsCache.data[rank] && 
      statsCache.data[rank][region]
    ) {
      console.log(`Using cached data for rank: ${rank}, region: ${region}`);
      return statsCache.data[rank][region];
    }
    
    // Create a new stats object
    console.log(`Generating fresh data for rank: ${rank}, region: ${region}`);
    
    // Step 1: Get current patch version
    const patch = await getCurrentPatch();
    console.log(`Current patch: ${patch}`);
    
    // Step 2: Get champion data from Data Dragon (this part is correct)
    const champResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    // Initialize our champion stats object
    const champStats: Record<string, Record<string, RoleStats>> = {};
    
    // Create a deterministic random number generator
    // Seed based on patch version and rank to ensure consistency
    const patchSeed = patch.split('.').map(n => parseInt(n)).reduce((a, b) => a * 100 + b, 0);
    const rankSeed = rank.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const regionSeed = region.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const seed = patchSeed * 10000 + rankSeed * 100 + regionSeed;
    // We don't need a global random instance since we use champion-specific ones
    // const random = new SeededRandom(seed);
    
    // WARNING: In a real-world app, this would need to be done through a separate 
    // background process collecting match data over time. For demonstration purposes,
    // we're using a deterministic simulation approach.
    
    // Step 3: In a real application, you would:
    // 1. Query thousands of matches from Riot API and store them in a database
    // 2. Analyze those matches to calculate statistics
    // 3. Cache the results to avoid hitting API limits
    
    // Since we can't do that in this demo, we'll use our robust simulation system
    // This simulation is based on actual champion performance patterns across ranks
    for (const champKey in champResponse.data.data) {
      const champion = champResponse.data.data[champKey];
      const champId = champion.id;
      
      if (!champStats[champId]) {
        champStats[champId] = {};
      }
      
      // Generate a champion-specific seed to ensure each champion has unique but consistent stats
      const champSeed = champId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const champRandom = new SeededRandom(seed + champSeed);
      
      // Determine roles for this champion
      const roles = determineRolesFromTags(champion.tags, champion.info);
      
      // Process each role
      roles.forEach((role, index) => {
        const normalizedRole = normalizeRoleName(role);
        const isSecondaryRole = index > 0;
        
        // Create simulated stats that follow realistic patterns based on rank
        const adjustments = calculateRankAdjustments(
          champId, 
          getDifficulty(champion.info), 
          rank
        );
        
        // Base stats adjusted for role - using our seeded random for consistency
        let baseWinRate = 50 + champRandom.nextInRange(-3, 3);
        if (isSecondaryRole) baseWinRate -= 1.5;
        
        const pickRate = isSecondaryRole 
          ? champRandom.nextInRange(2, 7) 
          : champRandom.nextInRange(5, 15);
        
        const banRate = baseWinRate > 52 
          ? champRandom.nextInRange(5, 20) 
          : champRandom.nextInRange(1, 6);
        
        // Apply rank adjustments
        let winRate = baseWinRate + adjustments.winRate;
        let pickRateAdjusted = pickRate + adjustments.pickRate;
        let banRateAdjusted = banRate + adjustments.banRate;
        
        // Calculate total games
        const totalGames = Math.floor(pickRateAdjusted * 10000 * adjustments.gamesMultiplier);
        
        // Ensure rates stay within reasonable bounds
        winRate = Math.max(40, Math.min(62, winRate));
        pickRateAdjusted = Math.max(0.1, Math.min(30, pickRateAdjusted));
        banRateAdjusted = Math.max(0, Math.min(40, banRateAdjusted));
        
        // Calculate tier
        const tier = calculateTier(winRate, pickRateAdjusted, banRateAdjusted);
        
        // Store the processed stats
        champStats[champId][normalizedRole] = {
          winRate: parseFloat(winRate.toFixed(1)),
          pickRate: parseFloat(pickRateAdjusted.toFixed(1)),
          banRate: parseFloat(banRateAdjusted.toFixed(1)),
          totalGames,
          tier
        };
      });
    }
    
    // Update the cache with the new data
    if (!statsCache.data[rank]) {
      statsCache.data[rank] = {};
    }
    statsCache.data[rank][region] = champStats;
    statsCache.timestamp = Date.now();
    statsCache.expiry = Date.now() + CACHE_DURATION;
    
    return champStats;
  } catch (error) {
    console.error('Error fetching champion stats:', error);
    return {};  // Return empty object on error
  }
}

// Helper function to determine roles from champion tags
function determineRolesFromTags(tags: string[], info: ChampionInfo): string[] {
  const roles: string[] = [];
  
  // Logic to determine roles based on tags
  if (tags.includes('Marksman')) {
    roles.push('BOTTOM');
  }
  
  if (tags.includes('Support') || (tags.includes('Tank') && info.attack < 5)) {
    roles.push('UTILITY');
  }
  
  if (tags.includes('Mage') || tags.includes('Assassin')) {
    roles.push('MIDDLE');
  }
  
  if (tags.includes('Fighter') || (tags.includes('Tank') && info.attack >= 5)) {
    roles.push('TOP');
  }
  
  if (tags.includes('Fighter') && info.attack >= 6 && info.defense >= 5) {
    roles.push('JUNGLE');
  }
  
  // Ensure at least one role
  if (roles.length === 0) {
    roles.push('TOP');
  }
  
  return roles;
}

// Helper function to calculate rank-based adjustments
function calculateRankAdjustments(champId: string, difficulty: string, rank: string): { 
  winRate: number; 
  pickRate: number; 
  banRate: number; 
  gamesMultiplier: number; 
} {
  // Default adjustments
  const adjustments = {
    winRate: 0,
    pickRate: 0,
    banRate: 0,
    gamesMultiplier: 1
  };
  
  // Champion archetype classification
  const highSkillChampions = ['Akali', 'Aphelios', 'Azir', 'Camille', 'Fiora', 'Irelia', 'Jayce', 'Kalista', 'LeBlanc', 'LeeSin', 'Nidalee', 'Qiyana', 'Riven', 'Ryze', 'Sylas', 'Thresh', 'TwistedFate', 'Vayne', 'Yasuo', 'Yone', 'Zed', 'Zoe'];
  const easyToPlayChampions = ['Amumu', 'Annie', 'Ashe', 'Garen', 'Janna', 'Leona', 'Lux', 'Malphite', 'MasterYi', 'MissFortune', 'Morgana', 'Nasus', 'Nautilus', 'Sona', 'Soraka', 'Volibear', 'Warwick'];
  const lateGameScalingChampions = ['Kayle', 'Kassadin', 'Nasus', 'Veigar', 'Vladimir', 'Vayne', 'Jinx', 'Kog\'Maw', 'Twitch', 'Senna'];
  const earlyGameChampions = ['Draven', 'Elise', 'LeeSin', 'Pantheon', 'Renekton', 'Talon', 'Udyr', 'Xin\'Zhao'];
  
  const isHighSkill = highSkillChampions.includes(champId);
  const isEasyToPlay = easyToPlayChampions.includes(champId);
  const isLateGameScaling = lateGameScalingChampions.includes(champId);
  const isEarlyGame = earlyGameChampions.includes(champId);
  
  // Apply rank-based adjustments
  if (rank !== 'ALL') {
    switch(rank) {
      case 'CHALLENGER':
      case 'GRANDMASTER':
      case 'MASTER':
        // High ELO adjustments
        if (isHighSkill || difficulty === 'Hard') {
          adjustments.winRate = 3.5;
          adjustments.pickRate = 8.0;
          adjustments.banRate = 6.0;
          adjustments.gamesMultiplier = 1.6;
        } else if (isEasyToPlay || difficulty === 'Easy') {
          adjustments.winRate = -3.0;
          adjustments.pickRate = -6.0;
          adjustments.banRate = -3.0;
          adjustments.gamesMultiplier = 0.4;
        }
        
        if (isLateGameScaling) {
          adjustments.winRate -= 1.0;
        } else if (isEarlyGame) {
          adjustments.winRate += 1.5;
        }
        break;
        
      case 'DIAMOND':
      case 'EMERALD':
        // Upper-mid ELO
        if (isHighSkill) {
          adjustments.winRate = 2.0;
          adjustments.pickRate = 5.0;
          adjustments.banRate = 4.0;
          adjustments.gamesMultiplier = 1.4;
        } else if (isEasyToPlay) {
          adjustments.winRate = -1.5;
          adjustments.pickRate = -3.0;
          adjustments.banRate = -1.5;
          adjustments.gamesMultiplier = 0.6;
        }
        break;
        
      case 'PLATINUM':
      case 'GOLD':
        // Mid ELO - baseline with slight adjustments
        if (isHighSkill) {
          adjustments.winRate = 0.5;
          adjustments.pickRate = 2.0;
          adjustments.banRate = 1.0;
          adjustments.gamesMultiplier = 1.2;
        } else if (isEasyToPlay) {
          adjustments.winRate = 0.5;
          adjustments.pickRate = 1.0;
          adjustments.banRate = 0.0;
          adjustments.gamesMultiplier = 1.0;
        }
        break;
        
      case 'SILVER':
      case 'BRONZE':
      case 'IRON':
        // Low ELO
        if (isHighSkill) {
          // High skill champions perform worse in low ELO
          adjustments.winRate = -4.0;
          adjustments.pickRate = -1.0; // Still popular despite lower win rates
          adjustments.banRate = 2.0; // Often banned from perception rather than effectiveness
          adjustments.gamesMultiplier = 0.9;
        } else if (isEasyToPlay) {
          // Easy champions dominate low ELO
          adjustments.winRate = 4.5;
          adjustments.pickRate = 7.0;
          adjustments.banRate = 5.0;
          adjustments.gamesMultiplier = 1.5;
        }
        
        // Early/late game dynamics in low ELO
        if (isLateGameScaling) {
          adjustments.winRate += 3.0; // Games drag out in low ELO
        } else if (isEarlyGame) {
          adjustments.winRate += -1.0; // Early advantages often thrown
        }
        break;
    }
  }
  
  return adjustments;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rank = searchParams.get('rank') || 'ALL';
    const region = searchParams.get('region') || 'global';
    
    // Fetch champion data from Data Dragon
    const patch = await getCurrentPatch();
    const champDataResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    // Fetch champion stats
    const champStats = await fetchChampionStats(rank, region);
    
    // Build the complete champion stats with all required data
    const fullChampStats: ChampionStats[] = [];
    
    for (const champId in champStats) {
      const champion = champDataResponse.data.data[champId];
      
      if (champion) {
        // Find the primary role (highest pick rate)
        let highestPickRate = -1;
        
        // We're finding the highest pick rate, but not using the primaryRole yet
        // Will be useful for future enhancements
        for (const role in champStats[champId]) {
          if (champStats[champId][role].pickRate > highestPickRate) {
            highestPickRate = champStats[champId][role].pickRate;
          }
        }
        
        fullChampStats.push({
          id: champId,
        name: champion.name,
          image: champion.image,
          roles: champStats[champId],
          difficulty: getDifficulty(champion.info),
          damageType: getDamageType(champion.tags, champion.info),
          range: champion.tags.includes('Melee') ? 'Melee' : 'Ranged'
        });
      }
    }
    
    // Add cache control headers to let browsers cache for 1 hour
    return NextResponse.json(fullChampStats, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion data' },
      { status: 500 }
    );
  }
} 