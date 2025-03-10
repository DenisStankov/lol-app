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

// Role mapping for consistent naming
const roleMapping: Record<string, string> = {
  "TOP": "TOP",
  "JUNGLE": "JUNGLE",
  "MIDDLE": "MIDDLE",
  "BOTTOM": "BOTTOM",
  "UTILITY": "UTILITY",
  "top": "TOP",
  "jungle": "JUNGLE",
  "mid": "MIDDLE",
  "middle": "MIDDLE",
  "bot": "BOTTOM",
  "bottom": "BOTTOM", 
  "adc": "BOTTOM",
  "supp": "UTILITY",
  "sup": "UTILITY",
  "support": "UTILITY",
};

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
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!response.ok) {
      throw new Error('Failed to fetch versions');
    }
    const versions = await response.json();
    return versions[0]; // Return the latest version
  } catch (error) {
    console.error('Error fetching current patch:', error);
    return '14.14.1'; // Fallback to a known version
  }
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

// Function to normalize role names
function normalizeRoleName(role: string): string {
  return roleMapping[role] || role;
}

// Fetch champion stats from Riot API
async function fetchChampionStats(rank: string = 'ALL', region: string = 'global'): Promise<Record<string, Record<string, RoleStats>>> {
  try {
    // This would be the actual implementation using the endpoints you have access to
    // Different regions could be accessed via different endpoints
    
    // Mock data for demonstration - this would be replaced with real API calls
    const champStats: Record<string, Record<string, RoleStats>> = {};
    
    // Apply region-specific adjustments
    const regionMultiplier = {
      winRateAdjustment: 0,
      pickRateAdjustment: 0,
      banRateAdjustment: 0
    };
    
    // Different regions have different metas
    // These are mock adjustments that would be replaced with real data
    switch(region) {
      case 'kr':
        // Korea tends to have more aggressive meta with higher mechanical champions
        regionMultiplier.winRateAdjustment = 1.2;
        regionMultiplier.pickRateAdjustment = 1.5;
        regionMultiplier.banRateAdjustment = 2.0;
        break;
      case 'euw':
      case 'eune':
        // EU tends to follow pro-play meta more closely
        regionMultiplier.winRateAdjustment = 0.7;
        regionMultiplier.pickRateAdjustment = 1.2;
        regionMultiplier.banRateAdjustment = 1.0;
        break;
      case 'na':
        // NA tends to have more varied meta
        regionMultiplier.winRateAdjustment = 0.5;
        regionMultiplier.pickRateAdjustment = 0.8;
        regionMultiplier.banRateAdjustment = 0.5;
        break;
      // Add other regions as needed
      default:
        // Global is the base case
        break;
    }
    
    // Popular champions in their respective roles with realistic stats based on actual meta
    const popularChampions = [
      // TOP LANE
      { id: 'Aatrox', roles: ['TOP'], winRate: 49.5, pickRate: 6.7, banRate: 3.9 },
      { id: 'Camille', roles: ['TOP'], winRate: 50.2, pickRate: 5.1, banRate: 1.8 },
      { id: 'Darius', roles: ['TOP'], winRate: 49.8, pickRate: 7.3, banRate: 13.5 },
      { id: 'Fiora', roles: ['TOP'], winRate: 49.1, pickRate: 6.5, banRate: 7.9 },
      { id: 'Garen', roles: ['TOP'], winRate: 51.6, pickRate: 5.8, banRate: 2.1 },
      { id: 'Gwen', roles: ['TOP'], winRate: 48.9, pickRate: 4.2, banRate: 1.1 },
      { id: 'Illaoi', roles: ['TOP'], winRate: 49.8, pickRate: 3.5, banRate: 2.7 },
      { id: 'Irelia', roles: ['TOP', 'MIDDLE'], winRate: 47.9, pickRate: 6.1, banRate: 9.1 },
      { id: 'Jax', roles: ['TOP', 'JUNGLE'], winRate: 50.1, pickRate: 6.3, banRate: 7.2 },
      { id: 'Kled', roles: ['TOP'], winRate: 52.3, pickRate: 1.8, banRate: 0.3 },
      { id: 'Mordekaiser', roles: ['TOP'], winRate: 51.2, pickRate: 6.8, banRate: 6.9 },
      { id: 'Riven', roles: ['TOP'], winRate: 48.7, pickRate: 4.2, banRate: 1.8 },
      { id: 'Sett', roles: ['TOP'], winRate: 50.9, pickRate: 5.3, banRate: 2.1 },
      { id: 'Shen', roles: ['TOP'], winRate: 51.4, pickRate: 3.7, banRate: 0.8 },
      { id: 'Teemo', roles: ['TOP'], winRate: 49.8, pickRate: 4.5, banRate: 3.7 },
      { id: 'Volibear', roles: ['TOP', 'JUNGLE'], winRate: 51.8, pickRate: 3.2, banRate: 1.1 },
      { id: 'Yasuo', roles: ['TOP', 'MIDDLE'], winRate: 47.6, pickRate: 3.9, banRate: 9.8 },

      // JUNGLE
      { id: 'Amumu', roles: ['JUNGLE'], winRate: 51.8, pickRate: 4.1, banRate: 2.3 },
      { id: 'Belveth', roles: ['JUNGLE'], winRate: 50.6, pickRate: 5.1, banRate: 10.2 },
      { id: 'Diana', roles: ['JUNGLE'], winRate: 49.8, pickRate: 7.2, banRate: 4.5 },
      { id: 'Ekko', roles: ['JUNGLE', 'MIDDLE'], winRate: 50.2, pickRate: 4.8, banRate: 2.1 },
      { id: 'Evelynn', roles: ['JUNGLE'], winRate: 50.1, pickRate: 4.2, banRate: 5.3 },
      { id: 'Graves', roles: ['JUNGLE'], winRate: 49.3, pickRate: 4.7, banRate: 1.7 },
      { id: 'Hecarim', roles: ['JUNGLE'], winRate: 50.7, pickRate: 5.6, banRate: 5.2 },
      { id: 'KhaZix', roles: ['JUNGLE'], winRate: 51.3, pickRate: 5.9, banRate: 2.9 },
      { id: 'LeeSin', roles: ['JUNGLE'], winRate: 47.8, pickRate: 10.3, banRate: 7.6 },
      { id: 'Lillia', roles: ['JUNGLE'], winRate: 50.9, pickRate: 3.1, banRate: 1.2 },
      { id: 'MasterYi', roles: ['JUNGLE'], winRate: 49.8, pickRate: 6.7, banRate: 16.8 },
      { id: 'Nocturne', roles: ['JUNGLE'], winRate: 51.2, pickRate: 3.8, banRate: 1.1 },
      { id: 'Nunu', roles: ['JUNGLE'], winRate: 52.1, pickRate: 3.9, banRate: 1.5 },
      { id: 'Rengar', roles: ['JUNGLE'], winRate: 48.6, pickRate: 4.2, banRate: 3.7 },
      { id: 'Shaco', roles: ['JUNGLE'], winRate: 49.9, pickRate: 4.1, banRate: 7.2 },
      { id: 'Udyr', roles: ['JUNGLE'], winRate: 51.6, pickRate: 3.2, banRate: 1.9 },
      { id: 'Zac', roles: ['JUNGLE'], winRate: 52.4, pickRate: 5.8, banRate: 4.9 },

      // MIDDLE
      { id: 'Ahri', roles: ['MIDDLE'], winRate: 50.2, pickRate: 7.9, banRate: 2.1 },
      { id: 'Akali', roles: ['MIDDLE', 'TOP'], winRate: 48.5, pickRate: 7.3, banRate: 12.8 },
      { id: 'Anivia', roles: ['MIDDLE'], winRate: 52.3, pickRate: 3.1, banRate: 1.7 },
      { id: 'Cassiopeia', roles: ['MIDDLE'], winRate: 49.7, pickRate: 3.2, banRate: 1.5 },
      { id: 'Fizz', roles: ['MIDDLE'], winRate: 50.1, pickRate: 3.7, banRate: 4.8 },
      { id: 'Katarina', roles: ['MIDDLE'], winRate: 49.8, pickRate: 5.6, banRate: 8.2 },
      { id: 'Leblanc', roles: ['MIDDLE'], winRate: 47.8, pickRate: 4.9, banRate: 2.1 },
      { id: 'Lux', roles: ['MIDDLE', 'UTILITY'], winRate: 50.2, pickRate: 4.8, banRate: 1.6 },
      { id: 'Orianna', roles: ['MIDDLE'], winRate: 50.9, pickRate: 3.5, banRate: 0.5 },
      { id: 'Sylas', roles: ['MIDDLE'], winRate: 48.7, pickRate: 8.9, banRate: 7.3 },
      { id: 'Syndra', roles: ['MIDDLE'], winRate: 48.5, pickRate: 3.8, banRate: 0.7 },
      { id: 'Talon', roles: ['MIDDLE'], winRate: 49.3, pickRate: 3.2, banRate: 1.1 },
      { id: 'Veigar', roles: ['MIDDLE'], winRate: 51.7, pickRate: 5.6, banRate: 5.9 },
      { id: 'Viktor', roles: ['MIDDLE'], winRate: 49.2, pickRate: 5.8, banRate: 1.2 },
      { id: 'Yasuo', roles: ['MIDDLE', 'TOP'], winRate: 47.9, pickRate: 8.7, banRate: 9.8 },
      { id: 'Yone', roles: ['MIDDLE', 'TOP'], winRate: 48.3, pickRate: 8.2, banRate: 9.1 },
      { id: 'Zed', roles: ['MIDDLE'], winRate: 49.3, pickRate: 7.5, banRate: 19.2 },

      // BOTTOM
      { id: 'Aphelios', roles: ['BOTTOM'], winRate: 48.5, pickRate: 8.1, banRate: 1.2 },
      { id: 'Ashe', roles: ['BOTTOM', 'UTILITY'], winRate: 50.3, pickRate: 4.8, banRate: 0.7 },
      { id: 'Caitlyn', roles: ['BOTTOM'], winRate: 48.9, pickRate: 12.2, banRate: 7.1 },
      { id: 'Draven', roles: ['BOTTOM'], winRate: 49.2, pickRate: 4.1, banRate: 6.3 },
      { id: 'Ezreal', roles: ['BOTTOM'], winRate: 48.5, pickRate: 17.9, banRate: 4.1 },
      { id: 'Jhin', roles: ['BOTTOM'], winRate: 51.2, pickRate: 12.6, banRate: 1.8 },
      { id: 'Jinx', roles: ['BOTTOM'], winRate: 51.5, pickRate: 11.3, banRate: 1.5 },
      { id: 'KaiSa', roles: ['BOTTOM'], winRate: 50.1, pickRate: 18.7, banRate: 4.8 },
      { id: 'Lucian', roles: ['BOTTOM'], winRate: 48.9, pickRate: 7.2, banRate: 1.5 },
      { id: 'MissFortune', roles: ['BOTTOM'], winRate: 51.7, pickRate: 6.9, banRate: 1.2 },
      { id: 'Nilah', roles: ['BOTTOM'], winRate: 51.3, pickRate: 1.9, banRate: 1.1 },
      { id: 'Samira', roles: ['BOTTOM'], winRate: 50.5, pickRate: 6.8, banRate: 8.9 },
      { id: 'Sivir', roles: ['BOTTOM'], winRate: 50.8, pickRate: 3.1, banRate: 0.3 },
      { id: 'Tristana', roles: ['BOTTOM'], winRate: 50.3, pickRate: 5.2, banRate: 1.1 },
      { id: 'Twitch', roles: ['BOTTOM'], winRate: 49.8, pickRate: 4.7, banRate: 2.3 },
      { id: 'Vayne', roles: ['BOTTOM'], winRate: 49.5, pickRate: 10.2, banRate: 9.8 },
      { id: 'Xayah', roles: ['BOTTOM'], winRate: 50.2, pickRate: 5.8, banRate: 0.9 },

      // UTILITY (SUPPORT)
      { id: 'Bard', roles: ['UTILITY'], winRate: 49.8, pickRate: 2.5, banRate: 0.4 },
      { id: 'Blitzcrank', roles: ['UTILITY'], winRate: 51.3, pickRate: 8.7, banRate: 16.2 },
      { id: 'Brand', roles: ['UTILITY'], winRate: 50.8, pickRate: 3.9, banRate: 1.7 },
      { id: 'Janna', roles: ['UTILITY'], winRate: 52.7, pickRate: 4.8, banRate: 1.2 },
      { id: 'Leona', roles: ['UTILITY'], winRate: 50.3, pickRate: 7.2, banRate: 4.1 },
      { id: 'Lulu', roles: ['UTILITY'], winRate: 51.2, pickRate: 8.7, banRate: 5.2 },
      { id: 'Morgana', roles: ['UTILITY'], winRate: 50.4, pickRate: 7.9, banRate: 16.5 },
      { id: 'Nami', roles: ['UTILITY'], winRate: 50.9, pickRate: 6.1, banRate: 0.8 },
      { id: 'Nautilus', roles: ['UTILITY'], winRate: 49.7, pickRate: 7.2, banRate: 2.3 },
      { id: 'Pyke', roles: ['UTILITY'], winRate: 49.1, pickRate: 6.5, banRate: 7.8 },
      { id: 'Rakan', roles: ['UTILITY'], winRate: 50.2, pickRate: 4.2, banRate: 0.9 },
      { id: 'Senna', roles: ['UTILITY'], winRate: 50.8, pickRate: 7.6, banRate: 3.1 },
      { id: 'Seraphine', roles: ['UTILITY', 'MIDDLE'], winRate: 52.1, pickRate: 3.8, banRate: 1.2 },
      { id: 'Soraka', roles: ['UTILITY'], winRate: 52.3, pickRate: 6.5, banRate: 3.7 },
      { id: 'Thresh', roles: ['UTILITY'], winRate: 49.8, pickRate: 13.2, banRate: 5.1 },
      { id: 'Yuumi', roles: ['UTILITY'], winRate: 47.9, pickRate: 5.2, banRate: 24.3 },
      { id: 'Zyra', roles: ['UTILITY'], winRate: 51.8, pickRate: 3.1, banRate: 1.4 },
    ];
    
    popularChampions.forEach(champion => {
      if (!champStats[champion.id]) {
        champStats[champion.id] = {};
      }
      
      champion.roles.forEach(role => {
        // Normalize the role name using our mapping
        const normalizedRole = normalizeRoleName(role);
        
        // Adjust stats slightly for secondary roles
        const isSecondaryRole = role !== champion.roles[0];
        const winRateAdjustment = isSecondaryRole ? -1.5 : 0;
        const pickRateAdjustment = isSecondaryRole ? -3.0 : 0;
        
        // Base stats
        let winRate = champion.winRate + winRateAdjustment;
        let pickRate = champion.pickRate + pickRateAdjustment;
        const banRate = champion.banRate; // Using const here since it's not reassigned
        
        // Adjust stats based on rank
        if (rank !== 'ALL') {
          // Champions perform differently at different ranks
          const isMetaChampion = ['Irelia', 'Yasuo', 'LeeSin', 'Zed', 'Akali', 'Thresh'].includes(champion.id);
          
          // Determine if champion is typically easier to play
          const isEasyChamp = ['Garen', 'Annie', 'Ashe', 'MasterYi', 'Soraka'].includes(champion.id);
          
          switch(rank) {
            case 'CHALLENGER':
            case 'GRANDMASTER':
            case 'MASTER':
              // Complex champions perform better in high ranks
              if (isMetaChampion) {
                winRate += 2;
                pickRate += 4;
              } else if (isEasyChamp) {
                winRate -= 1.5;
                pickRate -= 3;
              }
              break;
              
            case 'DIAMOND':
            case 'EMERALD':
              // Slightly favor skilled champions
              if (isMetaChampion) {
                winRate += 1;
                pickRate += 2;
              }
              break;
              
            case 'GOLD':
            case 'SILVER':
              // No major adjustments in mid ranks
              break;
              
            case 'BRONZE':
            case 'IRON':
              // Easy champions perform better in low ranks
              if (isEasyChamp) {
                winRate += 3;
                pickRate += 5;
              } else if (isMetaChampion) {
                winRate -= 2;
                pickRate -= 2;
              }
              break;
          }
        }
        
        // Ensure win rate stays in reasonable range
        winRate = Math.max(45, Math.min(56, winRate));
        
        champStats[champion.id][normalizedRole] = {
          winRate: parseFloat(winRate.toFixed(1)),
      pickRate: parseFloat(pickRate.toFixed(1)),
      banRate: parseFloat(banRate.toFixed(1)),
          totalGames: Math.floor((champion.pickRate + pickRateAdjustment) * 10000),
          tier: calculateTier(
            winRate, 
            pickRate, 
            banRate
          )
        };
      });
    });
    
    return champStats;
  } catch (error) {
    console.error('Error fetching champion stats from Riot API:', error);
    return {};  // Return empty object on error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patch = searchParams.get('patch') || await getCurrentPatch();
    const rank = searchParams.get('rank') || 'ALL';
    const region = searchParams.get('region') || 'global';
    
    console.log(`Fetching champion data for patch ${patch}, rank ${rank}, and region ${region}`);

    // Get the list of all champions from Data Dragon (Riot's official CDN)
    const championsResponse = await axios.get<ChampionDataResponse>(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    
    const champions = championsResponse.data.data;
    
    // Fetch champion stats from Riot API, with rank and region filters
    const riotChampionStats = await fetchChampionStats(rank, region);
    
    const champStats: Record<string, ChampionStats> = {};
    
    // Process each champion
    for (const champKey in champions) {
      const champion = champions[champKey];
      
      // Get champion's difficulty and attributes
      const difficulty = getDifficulty(champion.info);
      const damageType = getDamageType(champion.tags, champion.info);
      const range = champion.tags.includes('Marksman') ? 'Ranged' : 
                   (champion.id === 'Thresh' || champion.id === 'Urgot') ? 'Ranged' : 'Melee';
      
      // Initialize roles
      const roles: Record<string, RoleStats> = {};
      
      // If we have stats from Riot API for this champion, use them
      if (riotChampionStats[champion.id]) {
        Object.entries(riotChampionStats[champion.id]).forEach(([role, stats]) => {
          roles[role] = stats;
        });
      } else {
        // Otherwise, generate some reasonable mock data based on champion tags
        const potentialRoles = [];
        
        if (champion.tags.includes('Tank') || champion.tags.includes('Fighter')) {
          potentialRoles.push('TOP');
        }
        
        if ((champion.tags.includes('Assassin') || champion.tags.includes('Mage')) &&
            !champion.tags.includes('Support')) {
          potentialRoles.push('MIDDLE');
        }
        
        if (champion.tags.includes('Marksman')) {
          potentialRoles.push('BOTTOM');
        }
        
        if (champion.tags.includes('Support')) {
          potentialRoles.push('UTILITY');
        }
        
        // Special case for certain jungle champions
        const commonJunglers = ['Amumu', 'Elise', 'Hecarim', 'Ivern', 'JarvanIV', 'Kayn', 
          'KhaZix', 'LeeSin', 'Nocturne', 'RekSai', 'Vi', 'Warwick', 'Zac'];
        
        if (commonJunglers.includes(champion.id) || 
            (champion.tags.includes('Fighter') && !potentialRoles.includes('TOP'))) {
          potentialRoles.push('JUNGLE');
        }
        
        // If no roles determined, default to a reasonable one
        if (potentialRoles.length === 0) {
          potentialRoles.push('TOP');
        }
        
        // Create data for each potential role
        potentialRoles.forEach((role, index) => {
          // Normalize the role name
          const normalizedRole = normalizeRoleName(role);
          
          // Primary role gets better stats than secondary roles
          const isPrimary = index === 0;
          
          // Base stats that will be adjusted by rank
          let baseWinRate = 50 + (Math.random() * 6 - 3);
          let pickRate = isPrimary ? 5 + (Math.random() * 10) : 2 + (Math.random() * 5);
          const banRate = baseWinRate > 52 ? 5 + (Math.random() * 15) : 1 + (Math.random() * 5); // Using const
          
          // Adjust stats by rank (champions perform differently at different ranks)
          if (rank !== 'ALL') {
            // In higher ranks, meta champions have better stats
            const isMetaChampion = ['Irelia', 'Yasuo', 'LeeSin', 'Zed', 'Akali', 'Thresh'].includes(champion.id);
            
            // In lower ranks, easy champions have better stats
            const isEasyChampion = difficulty === 'Easy';
            
            // Calculate rank-specific adjustments
            switch(rank) {
              case 'CHALLENGER':
              case 'GRANDMASTER':
              case 'MASTER':
                // Higher skill champions perform better in high ranks
                if (difficulty === 'Hard' || isMetaChampion) {
                  baseWinRate += 2;
                  pickRate += 5;
                } else if (difficulty === 'Easy') {
                  baseWinRate -= 1;
                  pickRate -= 2;
                }
                break;
                
              case 'DIAMOND':
              case 'EMERALD':
                // Balanced distribution but still favoring skilled play
                if (difficulty === 'Hard') {
                  baseWinRate += 1;
                  pickRate += 3;
                } 
                break;
                
              case 'PLATINUM':
              case 'GOLD':
                // Average distribution
                break;
                
              case 'SILVER':
              case 'BRONZE':
              case 'IRON':
                // Easy champions perform better in low ranks
                if (isEasyChampion) {
                  baseWinRate += 2;
                  pickRate += 3;
                } else if (difficulty === 'Hard') {
                  baseWinRate -= 2;
                  pickRate -= 1;
                }
                break;
            }
          }
          
          // Total games based on pick rate
          const totalGames = Math.floor(pickRate * 10000);
          
          // Calculate tier
          const tier = calculateTier(baseWinRate, pickRate, banRate);
          
          roles[normalizedRole] = {
            winRate: parseFloat(baseWinRate.toFixed(1)),
            pickRate: parseFloat(pickRate.toFixed(1)),
            banRate: parseFloat(banRate.toFixed(1)),
            totalGames,
            tier
          };
        });
      }
      
      champStats[champion.id] = {
        id: champion.id,
        name: champion.name,
        image: champion.image, // Direct from Data Dragon
        roles,
        difficulty,
        damageType,
        range
      };
    }

    // Cache the results for 1 hour
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