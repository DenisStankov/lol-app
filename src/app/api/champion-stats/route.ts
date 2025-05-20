// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// Debug logging for API key (safely)
console.log("API KEY AVAILABLE:", process.env.RIOT_API_KEY ? "YES (Key exists)" : "NO (Key not found)");
console.log("API KEY LOOKS VALID:", process.env.RIOT_API_KEY && !process.env.RIOT_API_KEY.includes('your-api-key-here') ? "YES" : "NO");

// Uncomment the RIOT_API_KEY constant for actual implementation
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-your-api-key-here';

// At the top of the file
let generatedStatsCache: any = null;

// Interfaces for champion data from Data Dragon
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
  stats?: {
    attackrange: number;
    [key: string]: number;
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

type TierType = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

interface RoleStats {
  games: number;
  wins: number;
  kda: {
    kills: number;
    deaths: number;
    assists: number;
  };
  damage: {
    dealt: number;
    taken: number;
  };
  gold: number;
  cs: number;
  vision: number;
  objectives: {
    dragons: number;
    barons: number;
    towers: number;
  };
  winRate: number;
  pickRate: number;
  banRate: number;
  totalGames: number;
  tier: TierType;
}

interface ChampionStats {
  id?: string;
  name?: string;
  image?: ChampionImage;
  games?: number;
  wins?: number;
  bans?: number;
  roles?: Record<string, RoleStats>;
  counters?: Record<string, {
    games: number;
    wins: number;
    losses: number;
  }>;
  synergies?: Record<string, {
    games: number;
    wins: number;
    losses: number;
  }>;
  items?: Record<string, {
    games: number;
    wins: number;
  }>;
  runes?: Record<string, {
    games: number;
    wins: number;
  }>;
  skillOrders?: Record<string, {
    games: number;
    wins: number;
  }>;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  damageType?: 'AP' | 'AD' | 'Hybrid';
  range?: 'Melee' | 'Ranged';
}

// League Entry interface for Riot API
interface LeagueEntry {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

// Mapping from regional API endpoints to routing values for match v5 API
const regionToRoutingValue: Record<string, string> = {
  'br1': 'americas',
  'eun1': 'europe',
  'euw1': 'europe',
  'jp1': 'asia',
  'kr': 'asia',
  'la1': 'americas',
  'la2': 'americas',
  'na1': 'americas',
  'oc1': 'americas',
  'tr1': 'europe',
  'ru': 'europe',
  'ph2': 'asia',
  'sg2': 'asia',
  'th2': 'asia',
  'tw2': 'asia',
  'vn2': 'asia'
};

// Map for rank tiers to API values
const rankToApiValue: Record<string, string> = {
  'CHALLENGER': 'CHALLENGER',
  'GRANDMASTER': 'GRANDMASTER',
  'MASTER': 'MASTER',
  'DIAMOND': 'DIAMOND',
  'EMERALD': 'EMERALD',
  'PLATINUM': 'PLATINUM',
  'GOLD': 'GOLD',
  'SILVER': 'SILVER',
  'BRONZE': 'BRONZE',
  'IRON': 'IRON',
  'ALL': 'PLATINUM' // Default to Platinum for "ALL"
};

// Add a map for display regions to actual API regions
const displayRegionToApiRegion: Record<string, string> = {
  'global': 'na1', // Map "global" display region to North America API
  'na': 'na1',
  'euw': 'euw1',
  'eune': 'eun1',
  'kr': 'kr',
  'br': 'br1',
  'jp': 'jp1',
  'lan': 'la1',
  'las': 'la2',
  'oce': 'oc1',
  'tr': 'tr1',
  'ru': 'ru'
};

// Interfaces for Riot's Match API responses
interface RiotMatch {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameVersion: string;
    queueId: number;
    participants: RiotParticipant[];
    teams: RiotTeam[];
  };
}

interface RiotParticipant {
  championId: number;
  championName: string;
  teamPosition: string; // POSITION (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
  teamId: number;      // Added teamId property
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  dragonKills: number;
  baronKills: number;
  turretKills: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  perks: {
    perkIds: number[];
  };
  challenges: {
    skillOrder: string;
  };
}

interface RiotTeam {
  teamId: number;
  win: boolean;
  bans: {
    championId: number;
    pickTurn: number;
  }[];
}

// Add this type for error responses from Riot API
interface RiotApiErrorResponse {
  status?: {
    message?: string;
    status_code?: number;
  }
}

// Cache for champion statistics
interface StatsCache {
  timestamp: number;
  expiry: number;
  data: {
    [rank: string]: {
      [region: string]: Record<string, Record<string, RoleStats>>;
    };
  };
}

// Cache settings
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const statsCache: StatsCache = {
  timestamp: 0,
  expiry: 0,
  data: {}
};

// Get the current patch version from Data Dragon
async function getCurrentPatch(): Promise<string> {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data[0];  // Return the latest version
  } catch (error) {
    console.error('Error fetching current patch version:', error);
    return '13.24.1';  // Fallback to a recent version
  }
}

// Determine the damage type from champion data
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

// Determine champion difficulty from champion data
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

// Helper function to normalize role names from Riot API to our format
function normalizeRoleName(role: string): string {
  if (!role) return 'TOP';
  
  const normalized = role.toUpperCase();
  switch (normalized) {
    case 'TOP':
    case 'JUNGLE':
    case 'MIDDLE':
    case 'BOTTOM':
    case 'UTILITY':
      return normalized;
    case 'MID':
      return 'MIDDLE';
    case 'BOT':
    case 'ADC':
      return 'BOTTOM';
    case 'SUPPORT':
      return 'UTILITY';
    default:
      return 'TOP';
  }
}

// Main function to fetch and calculate champion statistics
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchChampionStats(rank: string = 'ALL', region: string = 'global'): Promise<Record<string, ChampionStats>> {
  try {
    console.log(`Fetching champion stats for rank=${rank}, region=${region}`);
    
    // Map display region to API region
    const apiRegion = displayRegionToApiRegion[region.toLowerCase()] || 'na1';
    const apiRank = rankToApiValue[rank] || 'PLATINUM';
    const apiDivision = rank === 'CHALLENGER' || rank === 'GRANDMASTER' || rank === 'MASTER' ? 'I' : 'I';
    
    // Step 1: Get the current patch version from Data Dragon
    const latestVersion = await getCurrentPatch();
    console.log(`Using patch version: ${latestVersion}`);
    
    // Step 2: Fetch champion data from Data Dragon
    const champResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    if (!champResponse.ok) throw new Error(`Champion data fetch failed: ${champResponse.statusText}`);
    const champData: ChampionDataResponse = await champResponse.json();

    console.log(`Fetched champion data for ${Object.keys(champData.data).length} champions`);
    
    // Step 3: Get match IDs for real data (if using Riot API)
    let matchIds: string[] = [];
    if (RIOT_API_KEY && !RIOT_API_KEY.includes('your-api-key-here')) {
      try {
        matchIds = await getMatchIds(apiRegion, apiRank, apiDivision, 50);
        console.log(`Fetched ${matchIds.length} match IDs from Riot API`);
      } catch (error) {
        console.error('Error fetching match IDs:', error);
        console.log('Falling back to simulated data due to match ID fetch error');
        return generateSimulatedStats(latestVersion);
      }
    }
    
    // Step 4: Create a result object with champions from Data Dragon
    const result: Record<string, ChampionStats> = {};
    
    // Initialize result with base champion data
    for (const [champId, champion] of Object.entries(champData.data)) {
      const damageType = getDamageType(champion.tags, champion.info);
      const difficulty = getDifficulty(champion.info);
      const roles = determineRolesFromTags(champion.tags, champion.info, champId);
      
      // Initialize with empty role stats
      const roleStats: Record<string, RoleStats> = {};
      
      // Initialize each potential role with zero values
      for (const role of roles) {
        roleStats[role] = {
          games: 0,
          wins: 0,
          kda: { kills: 0, deaths: 0, assists: 0 },
          damage: { dealt: 0, taken: 0 },
          gold: 0,
          cs: 0,
          vision: 0,
          objectives: { dragons: 0, barons: 0, towers: 0 },
          winRate: 50,
          pickRate: 0,
          banRate: 0,
          totalGames: 0,
          tier: 'C'
        };
      }
      
      // Store the champion with its base data
      result[champId] = {
        id: champId,
        name: champion.name,
        image: champion.image, // Ensure we store the complete image object
        games: 0,
        wins: 0,
        bans: 0,
        roles: roleStats,
        difficulty: difficulty,
        damageType: damageType,
        range: champion.stats?.attackrange && champion.stats.attackrange > 150 ? 'Ranged' : 'Melee'
      };
    }
    
    // If we don't have a valid API key or no match IDs, fall back to simulated stats
    if (!matchIds.length) {
      console.log('No match IDs available, using simulated stats');
      return generateSimulatedStats(latestVersion);
    }
    
    // Step 5: Fetch and process match data for each match ID
    const totalMatches = matchIds.length;
    let processedMatches = 0;
    const totalBansCounted: Record<string, number> = {};
    const totalGamesPerRole: Record<string, number> = {
      TOP: 0,
      JUNGLE: 0,
      MIDDLE: 0,
      BOTTOM: 0,
      UTILITY: 0
    };
    
    // Process match data
    for (const matchId of matchIds) {
      try {
        const matchData = await getMatchData(matchId, apiRegion);
        if (!matchData) continue;
        
        processedMatches++;
        
        // Process champion bans
        for (const team of matchData.info.teams) {
          for (const ban of team.bans) {
            if (ban.championId > 0) {
              // Find the champion ID from champion key
              const championKey = ban.championId.toString();
              const champion = Object.values(champData.data).find(c => c.key === championKey);
              if (champion) {
                if (!totalBansCounted[champion.id]) totalBansCounted[champion.id] = 0;
                totalBansCounted[champion.id]++;
                
                if (result[champion.id]) {
                  result[champion.id].bans = (result[champion.id].bans || 0) + 1;
                }
              }
            }
          }
        }
        
        // Process champion performance
        for (const participant of matchData.info.participants) {
          const championKey = participant.championId.toString();
          const champion = Object.values(champData.data).find(c => c.key === championKey);
          
          if (!champion) continue;
          
          const role = normalizeRoleName(participant.teamPosition);
          if (!role) continue;
          
          // Count total games for this role
          totalGamesPerRole[role] = (totalGamesPerRole[role] || 0) + 1;
          
          // Update champion stats
          if (result[champion.id]) {
            const champStats = result[champion.id];
            champStats.games = (champStats.games || 0) + 1;
            if (participant.win) {
              champStats.wins = (champStats.wins || 0) + 1;
            }
            
            // Update role-specific stats if this role exists
            if (champStats.roles && champStats.roles[role]) {
              const roleStats = champStats.roles[role];
              roleStats.games++;
              if (participant.win) roleStats.wins++;
              
              // Update KDA
              roleStats.kda.kills += participant.kills || 0;
              roleStats.kda.deaths += participant.deaths || 0;
              roleStats.kda.assists += participant.assists || 0;
              
              // Update damage
              roleStats.damage.dealt += participant.totalDamageDealtToChampions || 0;
              roleStats.damage.taken += participant.totalDamageTaken || 0;
              
              // Update other stats
              roleStats.gold += participant.goldEarned || 0;
              roleStats.cs += (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0);
              roleStats.vision += participant.visionScore || 0;
              
              // Update objectives
              roleStats.objectives.dragons += participant.dragonKills || 0;
              roleStats.objectives.barons += participant.baronKills || 0;
              roleStats.objectives.towers += participant.turretKills || 0;
            }
          }
        }
      } catch (error) {
        console.error(`Error processing match ${matchId}:`, error);
      }
    }
    
    // Step 6: Calculate final stats (win rates, pick rates, ban rates, tiers)
    if (processedMatches > 0) {
      const totalChampionsInMatches = processedMatches * 10; // 10 champions per match
      
      for (const [champId, champion] of Object.entries(result)) {
        if (!champion.roles) continue;
        
        let highestPickRate = 0;
        let primaryRole = "";
        
        // Process each role's statistics
        for (const [role, stats] of Object.entries(champion.roles)) {
          if (stats.games > 0) {
            // Calculate averages
            stats.kda.kills = stats.kda.kills / stats.games;
            stats.kda.deaths = stats.kda.deaths / stats.games;
            stats.kda.assists = stats.kda.assists / stats.games;
            
            stats.damage.dealt = stats.damage.dealt / stats.games;
            stats.damage.taken = stats.damage.taken / stats.games;
            
            stats.gold = stats.gold / stats.games;
            stats.cs = stats.cs / stats.games;
            stats.vision = stats.vision / stats.games;
            
            stats.objectives.dragons = stats.objectives.dragons / stats.games;
            stats.objectives.barons = stats.objectives.barons / stats.games;
            stats.objectives.towers = stats.objectives.towers / stats.games;
            
            // Calculate win rate, pick rate, and ban rate
            stats.winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 50;
            
            // Pick rate is calculated based on total games played in this role
            const gamesInRole = totalGamesPerRole[role] || 1; // Avoid division by zero
            stats.pickRate = (stats.games / gamesInRole) * 100;
            
            // Ban rate is the same for all roles of a champion
            stats.banRate = (totalBansCounted[champId] || 0) / processedMatches * 100;
            
            // Set the total games count
            stats.totalGames = stats.games;
            
            // Calculate tier based on win rate, pick rate, and ban rate
            stats.tier = calculateSimulatedTier(stats.winRate, stats.pickRate, stats.banRate);
            
            // Track the primary role (highest pick rate)
            if (stats.pickRate > highestPickRate) {
              highestPickRate = stats.pickRate;
              primaryRole = role;
            }
          }
        }
        
        // If no games found for this champion, generate simulated stats for its roles
        if (champion.games === 0) {
          // Apply simulated stats for each role
          for (const [role, stats] of Object.entries(champion.roles)) {
            const adjustments = calculateRankBasedAdjustments(champId, champion.difficulty || 'Medium', rank);
            
            stats.winRate = 48 + (Math.random() * 6) + adjustments.winRate;
            stats.pickRate = 0.5 + (Math.random() * 5) + adjustments.pickRate;
            stats.banRate = Math.random() * 8 + adjustments.banRate;
            stats.totalGames = 500 + Math.floor(Math.random() * 1500) * adjustments.gamesMultiplier;
            stats.tier = calculateSimulatedTier(stats.winRate, stats.pickRate, stats.banRate);
            
            // Ensure values are within realistic bounds
            stats.winRate = Math.max(46, Math.min(54, stats.winRate));
            stats.pickRate = Math.max(0.1, Math.min(15, stats.pickRate));
            stats.banRate = Math.max(0, Math.min(40, stats.banRate));
          }
        }
      }
    } else {
      // If no matches were processed, fall back to simulated data
      console.log('No matches were successfully processed, falling back to simulated data');
      return generateSimulatedStats(latestVersion);
    }
    
    // Step 7: Cache the results and return
    console.log(`Processed ${processedMatches} matches for champion stats`);
    return result;
  } catch (error) {
    console.error('Error in fetchChampionStats:', error);
    
    // Fall back to simulated data on error
    console.log('Falling back to simulated data due to error');
    const patch = await getCurrentPatch();
    return generateSimulatedStats(patch);
  }
}

// Determine champion roles based on their tags and attributes
function determineRolesFromTags(tags: string[], info: ChampionInfo, champId: string): string[] {
  // Explicit role assignments based on current meta and gameplay
  // These lists are based on actual gameplay data rather than just champion tags
  
  // Champions primarily played in TOP lane
  const topLaners = [
    'Aatrox', 'Camille', 'Cho\'Gath', 'Darius', 'Dr. Mundo', 'Fiora', 'Gangplank', 'Garen', 
    'Gnar', 'Gwen', 'Illaoi', 'Irelia', 'Jax', 'Jayce', 'K\'Sante', 'Kayle', 'Kennen', 
    'Kled', 'Malphite', 'Mordekaiser', 'Nasus', 'Olaf', 'Ornn', 'Pantheon', 'Poppy', 
    'Quinn', 'Renekton', 'Riven', 'Rumble', 'Sett', 'Shen', 'Singed', 'Sion', 
    'Teemo', 'Trundle', 'Tryndamere', 'Urgot', 'Vladimir', 'Volibear', 'Wukong', 'Yorick'
  ];
  
  // Champions primarily played in JUNGLE
  const junglers = [
    'Amumu', 'Bel\'Veth', 'Diana', 'Elise', 'Evelynn', 'Fiddlesticks', 'Gragas', 
    'Graves', 'Hecarim', 'Ivern', 'Jarvan IV', 'Karthus', 'Kayn', 'Kha\'Zix', 'Kindred', 
    'Lee Sin', 'Lillia', 'Master Yi', 'Nidalee', 'Nocturne', 'Nunu & Willump', 'Rammus', 
    'Rek\'Sai', 'Rengar', 'Sejuani', 'Shaco', 'Shyvana', 'Skarner', 'Taliyah', 'Udyr', 
    'Vi', 'Viego', 'Warwick', 'Xin Zhao', 'Zac'
  ];
  
  // Champions primarily played in MIDDLE lane
  const midLaners = [
    'Ahri', 'Akali', 'Akshan', 'Anivia', 'Annie', 'Aurelion Sol', 'Azir', 'Cassiopeia', 
    'Corki', 'Ekko', 'Fizz', 'Galio', 'Heimerdinger', 'Kassadin', 'Katarina', 'LeBlanc', 
    'Lissandra', 'Lux', 'Malzahar', 'Neeko', 'Orianna', 'Qiyana', 'Ryze', 'Sylas', 
    'Syndra', 'Talon', 'Twisted Fate', 'Veigar', 'Vex', 'Viktor', 'Xerath', 'Yasuo', 
    'Yone', 'Zed', 'Ziggs', 'Zoe'
  ];
  
  // Champions primarily played in BOTTOM lane (ADC role)
  const botLaners = [
    'Aphelios', 'Ashe', 'Caitlyn', 'Draven', 'Ezreal', 'Jhin', 'Jinx', 'Kai\'Sa', 
    'Kalista', 'Kog\'Maw', 'Lucian', 'Miss Fortune', 'Nilah', 'Samira', 'Senna', 
    'Sivir', 'Tristana', 'Twitch', 'Varus', 'Vayne', 'Xayah', 'Zeri'
  ];
  
  // Champions primarily played in UTILITY (Support) role
  const supports = [
    'Alistar', 'Bard', 'Blitzcrank', 'Brand', 'Braum', 'Janna', 'Karma', 'Leona', 
    'Lulu', 'Maokai', 'Morgana', 'Nami', 'Nautilus', 'Pyke', 'Rakan', 'Rell', 
    'Renata Glasc', 'Seraphine', 'Sona', 'Soraka', 'Swain', 'Tahm Kench', 'Taric', 
    'Thresh', 'Vel\'Koz', 'Yuumi', 'Zilean', 'Zyra'
  ];
  
  // Champions that can flex between multiple roles
  const flexPicks: Record<string, string[]> = {
    'Akshan': ['MIDDLE', 'TOP'],
    'Diana': ['JUNGLE', 'MIDDLE'],
    'Ekko': ['MIDDLE', 'JUNGLE'],
    'Gragas': ['TOP', 'JUNGLE', 'MIDDLE'],
    'Graves': ['JUNGLE', 'TOP'], // Graves should NOT be in bot
    'Jayce': ['TOP', 'MIDDLE'], // Jayce should NOT be in bot
    'Karma': ['UTILITY', 'MIDDLE'],
    'Kayle': ['TOP', 'MIDDLE'],
    'Lucian': ['BOTTOM', 'MIDDLE'],
    'Lux': ['UTILITY', 'MIDDLE'],
    'Pantheon': ['TOP', 'UTILITY', 'MIDDLE'],
    'Pyke': ['UTILITY', 'MIDDLE'],
    'Quinn': ['TOP'], // Quinn is primarily top, not bot
    'Seraphine': ['UTILITY', 'MIDDLE', 'BOTTOM'],
    'Swain': ['UTILITY', 'MIDDLE', 'BOTTOM'],
    'Sylas': ['MIDDLE', 'TOP'],
    'Tristana': ['BOTTOM', 'MIDDLE'],
    'Varus': ['BOTTOM', 'MIDDLE'],
    'Yasuo': ['MIDDLE', 'TOP'],
    'Yone': ['MIDDLE', 'TOP'],
    'Zac': ['JUNGLE', 'TOP']
  };
  
  // Initialize roles array
  const roles: string[] = [];
  
  // First check if this is a special flex pick with predefined roles
  if (flexPicks[champId]) {
    return flexPicks[champId];
  }
  
  // Check explicit role lists
  if (topLaners.includes(champId)) {
    roles.push('TOP');
  }
  
  if (junglers.includes(champId)) {
    roles.push('JUNGLE');
  }
  
  if (midLaners.includes(champId)) {
    roles.push('MIDDLE');
  }
  
  if (botLaners.includes(champId)) {
    roles.push('BOTTOM');
  }
  
  if (supports.includes(champId)) {
    roles.push('UTILITY');
  }
  
  // If no roles assigned yet, use the old tag-based logic as fallback
  if (roles.length === 0) {
    // Fallback to tag-based logic
    if (tags.includes('Marksman') && !['Graves', 'Quinn', 'Jayce', 'Kindred'].includes(champId)) {
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
  }
  
  // Ensure at least one role
  if (roles.length === 0) {
    roles.push('TOP'); // Default to top if we still have no roles
  }
  
  return roles;
}

// Calculate rank-based adjustments for champion statistics
function calculateRankBasedAdjustments(champId: string, difficulty: string, rank: string): { 
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
  
  // Champion archetype classification - based on real game knowledge
  const highSkillChampions = ['Akali', 'Aphelios', 'Azir', 'Camille', 'Fiora', 'Irelia', 'Jayce', 'Kalista', 'LeBlanc', 'LeeSin', 'Nidalee', 'Qiyana', 'Riven', 'Ryze', 'Sylas', 'Thresh', 'TwistedFate', 'Vayne', 'Yasuo', 'Yone', 'Zed', 'Zoe'];
  const easyToPlayChampions = ['Amumu', 'Annie', 'Ashe', 'Garen', 'Janna', 'Leona', 'Lux', 'Malphite', 'MasterYi', 'MissFortune', 'Morgana', 'Nasus', 'Nautilus', 'Sona', 'Soraka', 'Volibear', 'Warwick'];
  const lateGameScalingChampions = ['Kayle', 'Kassadin', 'Nasus', 'Veigar', 'Vladimir', 'Vayne', 'Jinx', 'Kog\'Maw', 'Twitch', 'Senna'];
  const earlyGameChampions = ['Draven', 'Elise', 'LeeSin', 'Pantheon', 'Renekton', 'Talon', 'Udyr', 'Xin\'Zhao'];
  
  // Current meta champions for high ELO (based on real data)
  const highEloMetaChampions = ['Aatrox', 'Ahri', 'Akali', 'Camille', 'Fiora', 'Jhin', 'Kai\'Sa', 'KogMaw', 'LeeSin', 'Lillia', 'Nidalee', 'Samira', 'Sylas', 'Thresh', 'Vayne', 'Yasuo', 'Yone', 'Zed', 'Zeri'];
  
  // Current meta champions for low ELO (based on real data)
  const lowEloMetaChampions = ['Amumu', 'Annie', 'Blitzcrank', 'Darius', 'Garen', 'Jinx', 'Katarina', 'MasterYi', 'Mordekaiser', 'Nasus', 'Pyke', 'Sett', 'Shaco', 'Tryndamere', 'Warwick', 'Yuumi'];
  
  const isHighSkill = highSkillChampions.includes(champId);
  const isEasyToPlay = easyToPlayChampions.includes(champId);
  const isLateGameScaling = lateGameScalingChampions.includes(champId);
  const isEarlyGame = earlyGameChampions.includes(champId);
  const isHighEloMeta = highEloMetaChampions.includes(champId);
  const isLowEloMeta = lowEloMetaChampions.includes(champId);
  
  // Apply rank-based adjustments
  if (rank !== 'ALL') {
    switch(rank) {
      case 'CHALLENGER':
      case 'GRANDMASTER':
      case 'MASTER':
        // High ELO adjustments
        if (isHighSkill || difficulty === 'Hard' || isHighEloMeta) {
          adjustments.winRate = 3.0;
          adjustments.pickRate = 7.0;
          adjustments.banRate = 5.0;
          adjustments.gamesMultiplier = 1.5;
        } else if (isEasyToPlay || difficulty === 'Easy') {
          adjustments.winRate = -2.5;
          adjustments.pickRate = -5.0;
          adjustments.banRate = -2.0;
          adjustments.gamesMultiplier = 0.5;
        }
        
        if (isLateGameScaling) {
          adjustments.winRate -= 1.0; // Games end faster in high ELO
        } else if (isEarlyGame) {
          adjustments.winRate += 1.5; // Early game advantage is better utilized
        }
        break;
        
      case 'DIAMOND':
      case 'EMERALD':
        // Upper-mid ELO
        if (isHighSkill || isHighEloMeta) {
          adjustments.winRate = 2.0;
          adjustments.pickRate = 4.0;
          adjustments.banRate = 3.0;
          adjustments.gamesMultiplier = 1.3;
        } else if (isEasyToPlay) {
          adjustments.winRate = -1.0;
          adjustments.pickRate = -2.0;
          adjustments.banRate = -1.0;
          adjustments.gamesMultiplier = 0.7;
        }
        break;
        
      case 'PLATINUM':
      case 'GOLD':
        // Mid ELO - baseline with slight adjustments
        if (isHighSkill) {
          adjustments.winRate = 0.5;
          adjustments.pickRate = 1.0;
          adjustments.banRate = 0.5;
          adjustments.gamesMultiplier = 1.1;
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
          adjustments.winRate = -3.5;
          adjustments.pickRate = -1.0; // Still popular despite lower win rates
          adjustments.banRate = 1.0; // Often banned from perception rather than effectiveness
          adjustments.gamesMultiplier = 0.8;
        } else if (isEasyToPlay || isLowEloMeta) {
          // Easy champions dominate low ELO
          adjustments.winRate = 4.0;
          adjustments.pickRate = 6.0;
          adjustments.banRate = 4.0;
          adjustments.gamesMultiplier = 1.4;
        }
        
        // Early/late game dynamics in low ELO
        if (isLateGameScaling) {
          adjustments.winRate += 2.5; // Games drag out in low ELO
        } else if (isEarlyGame) {
          adjustments.winRate += -1.0; // Early advantages often thrown
        }
        break;
    }
  }
  
  return adjustments;
}

// Function to get match data from Riot API
async function getMatchData(matchId: string, region: string): Promise<any> {
  try {
    const routingValue = regionToRoutingValue[region.toLowerCase()] || 'americas';
    const url = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    
    console.log(`Fetching match data for ${matchId}`);
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching match data for ${matchId}:`, error);
    return null;
  }
}

// API route handler
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const patch = searchParams.get('patch') || 'latest';
    const rank = searchParams.get('rank') || 'ALL';
    const region = searchParams.get('region') || 'global';
    
    console.log(`[API] Champion stats API called with params: patch=${patch}, rank=${rank}, region=${region}`);
    
    // Check if we have a valid Riot API key
    const hasValidApiKey = RIOT_API_KEY && !RIOT_API_KEY.includes('your-api-key-here');
    console.log(`[API] Using Riot API: ${hasValidApiKey ? 'YES' : 'NO'}`);
    
    if (hasValidApiKey) {
      try {
        console.log(`[API] Attempting to fetch real data from Riot API`);
        const realData = await fetchChampionStats(rank, region);
        console.log(`[API] Successfully fetched real data for ${Object.keys(realData).length} champions`);
        
        // Log some sample data
        const sampleChampionId = Object.keys(realData)[0];
        const sampleChampion = realData[sampleChampionId];
        console.log(`[API] Sample champion data for ${sampleChampionId}:`, {
          name: sampleChampion.name,
          roles: Object.keys(sampleChampion.roles || {}),
          stats: sampleChampion.roles ? 
            Object.entries(sampleChampion.roles).map(([role, stats]) => ({
              role,
              winRate: (stats as any).winRate,
              pickRate: (stats as any).pickRate,
              totalGames: (stats as any).totalGames
            })) : 'No role stats',
        });
        
        return NextResponse.json(realData);
      } catch (error) {
        console.error('[API] Error fetching real data:', error);
        console.log('[API] Falling back to simulated data due to error');
      }
    }
    
    console.log('[API] Using simulated data from Data Dragon');
    // Fetch data from Data Dragon as a fallback
    const versions = await fetchVersions();
    const currentPatch = patch === 'latest' ? versions[0] : patch;
    console.log(`[API] Using patch version: ${currentPatch}`);
    
    const champions = await fetchChampions(currentPatch);
    console.log(`[API] Fetched base data for ${Object.keys(champions).length} champions`);
    
    // Generate simulated stats with improved realism
    const response = await generateEnhancedStats(champions, currentPatch, rank, region);
    
    // Log sample simulated data
    const sampleChampionId = Object.keys(response)[0];
    const sampleChampion = response[sampleChampionId];
    console.log(`[API] Sample simulated data for ${sampleChampionId}:`, {
      name: sampleChampion.name,
      roles: Object.keys(sampleChampion.roles || {}),
      stats: sampleChampion.roles ? 
        Object.entries(sampleChampion.roles).map(([role, stats]) => ({
          role,
          winRate: stats.winRate,
          pickRate: stats.pickRate,
          totalGames: stats.totalGames,
          tier: stats.tier
        })) : 'No role stats',
    });
    
    // After generating stats (before returning):
    generatedStatsCache = response;
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Fatal error in champion-stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion stats', details: String(error) },
      { status: 500 }
    );
  }
}

// Add seeded random function at the top
function seededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h += h << 13; h ^= h >>> 7;
    h += h << 3; h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

// Enhanced stats generation with more realistic data based on actual meta trends
async function generateEnhancedStats(champions: any, version: string, rank: string, region: string) {
  console.log(`[API] Generating enhanced stats for patch ${version}, rank ${rank}, region ${region}`);
  
  // Define meta champion tiers based on current patch analysis
  // These represent the current meta state and should be updated between patches
  const metaTiers: Record<string, Record<string, TierType>> = {
    TOP: {
      "Aatrox": "A", "Camille": "A", "ChoGath": "B", "Darius": "S", "Fiora": "S+",
      "Gangplank": "A", "Garen": "B", "Gnar": "B", "Gwen": "S", "Illaoi": "B",
      "Irelia": "A", "Jax": "S+", "Jayce": "A", "Kayle": "B", "Kennen": "B",
      "Kled": "B", "Malphite": "B", "Maokai": "C", "Mordekaiser": "A", "Nasus": "B",
      "Ornn": "A", "Pantheon": "B", "Poppy": "A", "Quinn": "C", "Renekton": "C",
      "Riven": "A", "Sett": "A", "Shen": "A", "Singed": "B", "Sion": "B",
      "TahmKench": "C", "Teemo": "C", "Trundle": "B", "Tryndamere": "B", "Urgot": "B",
      "Vladimir": "A", "Volibear": "B", "Wukong": "A", "Yorick": "B", "Zac": "B",
      "Yone": "A", "Yasuo": "B", "KSante": "A", "Briar": "S", "Sett": "A"
    },
    JUNGLE: {
      "Amumu": "B", "Belveth": "A", "Diana": "A", "Ekko": "A", "Elise": "B",
      "Evelynn": "A", "Fiddlesticks": "S", "Gragas": "B", "Graves": "A", "Hecarim": "S",
      "Ivern": "C", "JarvanIV": "B", "Jax": "A", "Karthus": "A", "Kayn": "S",
      "Khazix": "S", "Kindred": "A", "LeeSin": "A", "Lillia": "B", "MasterYi": "B",
      "Nidalee": "B", "Nocturne": "B", "Nunu": "A", "Olaf": "B", "Poppy": "B",
      "Rammus": "B", "RekSai": "A", "Rengar": "B", "Sejuani": "B", "Shaco": "B",
      "Shyvana": "S", "Skarner": "C", "Taliyah": "B", "Trundle": "B", "Udyr": "B",
      "Vi": "B", "Viego": "A", "Volibear": "B", "Warwick": "B", "XinZhao": "B",
      "Zac": "A", "Briar": "S+", "Fiddlesticks": "S"
    },
    MIDDLE: {
      "Ahri": "A", "Akali": "A", "Akshan": "B", "Anivia": "A", "Annie": "B",
      "AurelionSol": "A", "Azir": "B", "Brand": "C", "Cassiopeia": "A", "Corki": "C",
      "Diana": "B", "Ekko": "A", "Fizz": "B", "Galio": "B", "Heimerdinger": "B",
      "Irelia": "B", "Kassadin": "B", "Katarina": "A", "LeBlanc": "B", "Lissandra": "A",
      "Lux": "C", "Malzahar": "B", "Neeko": "C", "Orianna": "B", "Qiyana": "B",
      "Ryze": "C", "Sylas": "S", "Syndra": "A", "Taliyah": "B", "Talon": "B",
      "TwistedFate": "C", "Veigar": "B", "Viktor": "S", "Vladimir": "B", "Xerath": "B",
      "Yasuo": "B", "Yone": "A", "Zed": "A", "Ziggs": "C", "Zoe": "B",
      "Hwei": "S+", "Smolder": "S"
    },
    BOTTOM: {
      "Aphelios": "A", "Ashe": "B", "Caitlyn": "A", "Draven": "B", "Ezreal": "A",
      "Jhin": "S", "Jinx": "S", "Kaisa": "S+", "Kalista": "B", "KogMaw": "B",
      "Lucian": "B", "MissFortune": "B", "Nilah": "C", "Samira": "A", "Senna": "B",
      "Sivir": "C", "Twitch": "B", "Tristana": "A", "Varus": "B", "Vayne": "A",
      "Xayah": "A", "Zeri": "B", "Smolder": "S"
    },
    UTILITY: {
      "Alistar": "B", "Bard": "B", "Blitzcrank": "B", "Brand": "C", "Braum": "B",
      "Janna": "A", "Karma": "A", "Leona": "B", "Lulu": "S", "Lux": "C",
      "Maokai": "B", "Morgana": "A", "Nami": "A", "Nautilus": "B", "Pantheon": "C",
      "Pyke": "B", "Rakan": "B", "RenataGlasc": "A", "Senna": "B", "Seraphine": "B",
      "Sona": "B", "Soraka": "A", "Swain": "B", "TahmKench": "C", "Taric": "B",
      "Thresh": "A", "VelKoz": "C", "Xerath": "B", "Yuumi": "A", "Zilean": "B",
      "Zyra": "B", "Milio": "S", "Hwei": "A", "Neeko": "A"
    }
  };

  // Define popularity tiers (pick rates) for different champion archetypes
  const popularityTiers: Record<string, number> = {
    "S+": 10 + Math.random() * 5,     // 10-15% pick rate
    "S": 7 + Math.random() * 3,       // 7-10% pick rate
    "A": 4 + Math.random() * 3,       // 4-7% pick rate
    "B": 2 + Math.random() * 2,       // 2-4% pick rate
    "C": 1 + Math.random() * 1,       // 1-2% pick rate
    "D": 0.5 + Math.random() * 0.5    // 0.5-1% pick rate
  };

  // Define ban rate tiers
  const banRateTiers: Record<string, number> = {
    "S+": 30 + Math.random() * 20,    // 30-50% ban rate
    "S": 15 + Math.random() * 15,     // 15-30% ban rate
    "A": 5 + Math.random() * 10,      // 5-15% ban rate
    "B": 1 + Math.random() * 4,       // 1-5% ban rate
    "C": 0.5 + Math.random() * 0.5,   // 0.5-1% ban rate
    "D": 0.1 + Math.random() * 0.4    // 0.1-0.5% ban rate
  };
  
  // Define win rate adjustments based on tier and difficulty
  const winRateAdjustments: Record<string, Record<string, number>> = {
    "S+": { "Easy": 53.5, "Medium": 52.5, "Hard": 51.5 },
    "S": { "Easy": 52.0, "Medium": 51.0, "Hard": 50.5 },
    "A": { "Easy": 51.0, "Medium": 50.5, "Hard": 50.0 },
    "B": { "Easy": 50.5, "Medium": 50.0, "Hard": 49.5 },
    "C": { "Easy": 49.0, "Medium": 48.5, "Hard": 48.0 },
    "D": { "Easy": 47.5, "Medium": 47.0, "Hard": 46.5 }
  };
  
  const response: Record<string, any> = {};
  let championsProcessed = 0;
  
  for (const [id, data] of Object.entries(champions)) {
    championsProcessed++;
    const possibleRoles = getRolesFromTags(data.tags, data.info);
    if (possibleRoles.length === 0) {
      possibleRoles.push('TOP');
    }
    const difficulty = getDifficulty(data.info);
    const roles: Record<string, any> = {};
    for (const roleRaw of possibleRoles) {
      const role = String(roleRaw);
      const rand = seededRandom(id + role + version + rank + region);
      let tier: TierType = 'C';
      if (metaTiers[role] && metaTiers[role][id]) {
        tier = metaTiers[role][id];
      } else {
        const score = (
          data.info.attack * 0.2 + 
          data.info.defense * 0.2 + 
          data.info.magic * 0.2 + 
          (10 - data.info.difficulty) * 0.4
        );
        if (score > 8) tier = 'S+';
        else if (score > 7) tier = 'S';
        else if (score > 6) tier = 'A';
        else if (score > 5) tier = 'B';
        else if (score > 4) tier = 'C';
      else tier = 'D';
      }
      const pickRate = popularityTiers[tier] + rand() * 0.5;
      const banRate = banRateTiers[tier] + rand() * 0.5;
      const baseWinRate = winRateAdjustments[tier][difficulty];
      const winRate = baseWinRate + (rand() * 2 - 1);
      const totalGames = Math.floor(10000 + (pickRate * 2000));
      const winRateDelta = (rand() * 4 - 2).toFixed(2);
      roles[role] = {
        winRate: parseFloat(winRate.toFixed(2)),
        pickRate: parseFloat(pickRate.toFixed(2)),
        banRate: parseFloat(banRate.toFixed(2)),
        totalGames: totalGames,
        tier: tier,
        winRateDelta: parseFloat(winRateDelta),
        kda: {
          kills: parseFloat((tier === 'S+' || tier === 'S' ? 6 + rand() * 2 : 4 + rand() * 2).toFixed(1)),
          deaths: parseFloat((3 + rand() * 2).toFixed(1)),
          assists: parseFloat((tier === 'S+' || tier === 'S' ? 7 + rand() * 3 : 5 + rand() * 3).toFixed(1))
        }
      };
    }
    const damageType = getDamageType(data.tags, data.info);
    const range = data.stats?.attackrange > 150 ? "Ranged" : "Melee";
    response[id] = {
      id: String(id),
      name: String(data.name),
      image: {
        full: String(data.image.full),
        icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${data.image.full}`,
        splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`,
        loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`,
        sprite: String(data.image.sprite)
      },
      roles,
      difficulty: String(difficulty),
      damageType: String(damageType),
      range: String(range),
      role: String(possibleRoles[0] || 'TOP')
    };
    if (championsProcessed % 50 === 0 || championsProcessed === Object.keys(champions).length) {
      console.log(`[API] Generated stats for ${championsProcessed}/${Object.keys(champions).length} champions`);
    }
  }
  
  console.log(`[API] Completed generating enhanced stats for ${championsProcessed} champions`);
  return response;
}

// Fetch version data from Data Dragon
async function fetchVersions() {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching versions:', error);
    return ['14.14.1', '14.13.1', '14.12.1']; // Fallback versions
  }
}

// Fetch champion data from Data Dragon
async function fetchChampions(version: string) {
  try {
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching champions for version ${version}:`, error);
    throw new Error(`Failed to fetch champion data for version ${version}`);
  }
}

// Generate simulated champion statistics as a fallback when API is unavailable
async function generateSimulatedStats(patch: string): Promise<Record<string, ChampionStats>> {
  try {
    console.log(`Generating simulated champion stats for patch ${patch}`);
    
    // Fetch champion data from Data Dragon
    const champResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`);
    if (!champResponse.ok) throw new Error(`Champion data fetch failed: ${champResponse.statusText}`);
    const champData: ChampionDataResponse = await champResponse.json();
    
    const result: Record<string, ChampionStats> = {};
    
    // Generate simulated stats for each champion
    for (const [champId, champion] of Object.entries(champData.data)) {
      const damageType = getDamageType(champion.tags, champion.info);
      const difficulty = getDifficulty(champion.info);
      const roles = determineRolesFromTags(champion.tags, champion.info, champId);
      
      // Base values for simulation
      const isStrong = Math.random() < 0.3; // 30% chance to be considered "strong meta"
      const isPopular = Math.random() < 0.25; // 25% chance to be considered "popular"
      const isFrustrating = Math.random() < 0.15; // 15% chance to be considered "frustrating to play against"
      
      // Generate base game count (higher for popular champions)
      let baseGameCount = 1000 + Math.floor(Math.random() * 2000);
      if (isPopular) baseGameCount += 1000 + Math.floor(Math.random() * 2000);
      if (isStrong) baseGameCount += 500 + Math.floor(Math.random() * 500);
      
      // Generate base rates
      let baseWinRate = 48 + Math.random() * 4; // 48-52% win rate base
      if (isStrong) baseWinRate += 2 + Math.random() * 2; // Strong champions get 50-54%
      if (difficulty === 'Hard') baseWinRate -= 1; // Hard champions have slightly lower win rates
      
      let basePickRate = 0.5 + Math.random() * 5.5; // 0.5-6% pick rate base
      if (isPopular) basePickRate += 3 + Math.random() * 6; // Popular champions get 3.5-12% extra
      if (isStrong) basePickRate += 2 + Math.random() * 3; // Strong champions get 2.5-5% extra
      
      let baseBanRate = Math.random() * 5; // 0-5% ban rate base
      if (isFrustrating) baseBanRate += 10 + Math.random() * 25; // Frustrating champions get 10-35% extra
      if (isStrong) baseBanRate += 5 + Math.random() * 10; // Strong champions get 5-15% extra
      
      // Apply minor adjustments based on champion attributes
      baseWinRate += (champion.info.attack / 20) - 0.25; // Small adjustment based on attack
      baseWinRate += (champion.info.defense / 25); // Small adjustment based on defense
      baseWinRate -= (champion.info.difficulty / 30); // Higher difficulty slightly lowers win rate
      
      // Ensure rates are within realistic bounds
      baseWinRate = Math.max(46, Math.min(54, baseWinRate));
      basePickRate = Math.max(0.5, Math.min(15, basePickRate));
      baseBanRate = Math.max(0, Math.min(40, baseBanRate));
      
      // Generate role-specific stats
      const roleStats: Record<string, RoleStats> = {};
      
      for (const role of roles) {
        // Role-specific adjustments
        let roleGameCount = baseGameCount;
        let roleWinRate = baseWinRate;
        let rolePickRate = basePickRate;
        let roleBanRate = baseBanRate;
        
        // Primary role gets more games
        if (role === roles[0]) {
          roleGameCount *= 1.5;
          roleWinRate += 0.5;
        }
        
        // Add some random variation
        roleGameCount *= 0.8 + Math.random() * 0.4; // 80-120% of base
        roleWinRate += (Math.random() * 2) - 1; // ±1%
        rolePickRate += (Math.random() * 1) - 0.5; // ±0.5%
        
        // Ensure at least 500 games minimum
        roleGameCount = Math.max(500, Math.floor(roleGameCount));
        
        // Calculate wins from win rate
        const wins = Math.floor(roleGameCount * (roleWinRate / 100));
        
        // Determine tier based on win and pick rates
        const tier = calculateSimulatedTier(roleWinRate, rolePickRate, roleBanRate);
        
        roleStats[role] = {
          games: roleGameCount,
          wins: wins,
          kda: {
            kills: 5 + Math.random() * 5,
            deaths: 3 + Math.random() * 3,
            assists: 4 + Math.random() * 6
          },
          damage: {
            dealt: 15000 + Math.random() * 10000,
            taken: 12000 + Math.random() * 10000
          },
          gold: 10000 + Math.random() * 5000,
          cs: 150 + Math.random() * 100,
          vision: 10 + Math.random() * 20,
          objectives: {
            dragons: 1 + Math.random() * 1,
            barons: 0.5 + Math.random() * 0.5,
            towers: 1 + Math.random() * 2
          },
          winRate: roleWinRate,
          pickRate: rolePickRate,
          banRate: roleBanRate,
          totalGames: 100000 + Math.floor(Math.random() * 50000),
          tier: tier
        };
      }
      
      // Create the final champion stats object
      result[champId] = {
        id: champId,
        name: champion.name,
        image: champion.image,
        games: Object.values(roleStats).reduce((sum, role) => sum + role.games, 0),
        wins: Object.values(roleStats).reduce((sum, role) => sum + role.wins, 0),
        bans: Math.floor(10000 * (baseBanRate / 100)),
        roles: roleStats,
        difficulty: difficulty,
        damageType: damageType,
        range: champion.stats?.attackrange && champion.stats.attackrange > 150 ? 'Ranged' : 'Melee'
      };
    }
    
    console.log(`Generated simulated stats for ${Object.keys(result).length} champions`);
    return result;
  } catch (error) {
    console.error('Error generating simulated stats:', error);
    // Return a minimal object to avoid breaking the client
    return {};
  }
}

// Helper functions to determine roles, damage type, etc.
function getRolesFromTags(tags: string[], info: any): string[] {
  const roles: string[] = [];
  
  // Assign roles based on champion tags
  if (tags.includes('Marksman')) {
    roles.push('BOTTOM');
  }
  
  if (tags.includes('Support')) {
    roles.push('UTILITY');
  }
  
  if (tags.includes('Mage')) {
    roles.push('MIDDLE');
    // Some mages can be support
    if (info.difficulty < 7) {
      roles.push('UTILITY');
    }
  }
  
  if (tags.includes('Assassin')) {
    roles.push('MIDDLE');
    // Some assassins can jungle
    if (info.attack > 5) {
      roles.push('JUNGLE');
    }
  }
  
  if (tags.includes('Fighter')) {
    roles.push('TOP');
    // Fighters often can jungle
    roles.push('JUNGLE');
  }
  
  if (tags.includes('Tank')) {
    roles.push('TOP');
    // Some tanks support or jungle
    if (info.attack < 5) {
      roles.push('UTILITY');
    } else {
      roles.push('JUNGLE');
    }
  }
  
  // Ensure at least one role and remove duplicates
  if (roles.length === 0) {
    roles.push('TOP');
  }
  
  // Remove duplicates and ensure all roles are strings
  return [...new Set(roles.map(role => String(role)))];
}

// Helper function to calculate simulated tier
function calculateSimulatedTier(winRate: number, pickRate: number, banRate: number): TierType {
  // Calculate performance score that weighs win rate most heavily, then pick rate, then ban rate
  const performanceScore = (winRate - 45) * 1.5 + pickRate * 0.8 + banRate * 0.3;
  
  // Determine tier based on performance score
  if (performanceScore >= 15) return 'S+';
  if (performanceScore >= 11) return 'S';
  if (performanceScore >= 8) return 'A';
  if (performanceScore >= 5) return 'B';
  if (performanceScore >= 2) return 'C';
  return 'D';
}