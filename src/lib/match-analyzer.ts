/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// This file contains implementations for the Riot API integration

import axios from 'axios';
import * as dataDragon from './data-dragon';

// Interfaces for champion details data
export interface ItemBuild {
  id: string;
  name: string;
  description: string;
  image: string;
  gold: number;
  winRate: number;
  pickRate: number;
}

export interface RuneBuild {
  primaryPath: {
    id: string;
    name: string;
    image: string;
    runes: Array<{
      id: string;
      name: string;
      image: string;
      winRate: number;
      pickRate: number;
    }>;
  };
  secondaryPath: {
    id: string;
    name: string;
    image: string;
    runes: Array<{
      id: string;
      name: string;
      image: string;
      winRate: number;
      pickRate: number;
    }>;
  };
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
  winRate: number;
  pickRate: number;
}

export interface CounterChampion {
  id: string;
  name: string;
  image: string;
  winRate: number;
  role: string;
}

export interface MatchAnalysisResult {
  itemBuilds: {
    startingItems: ItemBuild[];
    coreItems: ItemBuild[];
    boots: ItemBuild[];
    situationalItems: ItemBuild[];
  } | null;
  runeBuilds: RuneBuild[] | null;
  winRate: number;
  pickRate: number;
  banRate: number;
  skillOrder: string[];
  counters: CounterChampion[];
  synergies: CounterChampion[];
}

// Map regions to platform identifiers (e.g. na -> na1)
const REGION_TO_PLATFORM: Record<string, string> = {
  'na': 'na1',
  'euw': 'euw1',
  'eune': 'eun1',
  'kr': 'kr',
  'jp': 'jp1',
  'br': 'br1',
  'lan': 'la1',
  'las': 'la2',
  'tr': 'tr1',
  'ru': 'ru',
  'oce': 'oc1'
};

// Map regions to regional routing values (e.g. na -> americas)
const REGION_TO_REGIONAL: Record<string, string> = {
  'na': 'americas',
  'br': 'americas',
  'lan': 'americas',
  'las': 'americas',
  'euw': 'europe',
  'eune': 'europe',
  'tr': 'europe',
  'ru': 'europe',
  'kr': 'asia',
  'jp': 'asia',
  'oce': 'sea'
};

/**
 * Makes a request to the Riot API with retries for rate limits
 */
async function riotApiRequest(url: string, apiKey: string, retries = 3): Promise<any> {
  try {
    console.log(`[Riot API] Request to: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': apiKey
      }
    });
    
    console.log(`[Riot API] Success: ${url}`);
    return response.data;
  } catch (error: any) {
    // Handle rate limiting
    if (error.response && error.response.status === 429) {
      if (retries <= 0) {
        throw new Error('Rate limit exceeded and out of retries');
      }
      
      // Get retry-after header or default to 5 seconds
      const retryAfter = parseInt(error.response.headers['retry-after']) || 5;
      console.log(`[Riot API] Rate limited. Retrying after ${retryAfter}s`);
      
      // Wait for the retry-after period
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry the request
      return riotApiRequest(url, apiKey, retries - 1);
    }
    
    console.error(`[Riot API] Error: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

/**
 * Fetches high ELO matches for analysis
 */
export async function fetchHighEloMatches(
  championId: string,
  region: string = 'na',
  limit: number = 10
): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY || '';
  
  // Validate API key
  if (!apiKey || apiKey.includes('YOUR_API_KEY') || apiKey.length < 20) {
    console.error('[Match Analyzer] Invalid or missing API key');
    return [];
  }
  
  try {
    const platform = REGION_TO_PLATFORM[region] || 'na1';
    const regionalRouting = REGION_TO_REGIONAL[region] || 'americas';
    
    console.log(`[Match Analyzer] Fetching high ELO matches for champion ${championId} in ${region}`);
    
    // Get challenger, grandmaster, and master tier players
    const leagueQueues = ['challenger', 'grandmaster', 'master'];
    let players: string[] = [];
    
    for (const queue of leagueQueues) {
      try {
        console.log(`[Match Analyzer] Fetching ${queue} league players`);
        const leagueUrl = `https://${platform}.api.riotgames.com/lol/league/v4/${queue}leagues/by-queue/RANKED_SOLO_5x5`;
        const leagueData = await riotApiRequest(leagueUrl, apiKey);
        
        const entries = leagueData.entries || [];
        console.log(`[Match Analyzer] Found ${entries.length} ${queue} players`);
        
        // Get summoner IDs from highest LP players
        const topPlayers = entries
          .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
          .slice(0, 20)
          .map((entry: any) => entry.summonerId);
          
        players = [...players, ...topPlayers];
      } catch (error) {
        console.error(`[Match Analyzer] Error fetching ${queue} players:`, error);
        // Continue with next queue
      }
    }
    
    if (players.length === 0) {
      console.error('[Match Analyzer] Could not find any high ELO players');
      return [];
    }
    
    console.log(`[Match Analyzer] Found ${players.length} high ELO players for analysis`);
    
    // Get puuids for these players
    const puuids: string[] = [];
    
    for (const summonerId of players.slice(0, 10)) { // Limit to 10 to avoid too many requests
      try {
        const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`;
        const summonerData = await riotApiRequest(summonerUrl, apiKey);
        puuids.push(summonerData.puuid);
      } catch (error) {
        console.error(`[Match Analyzer] Error fetching summoner data:`, error);
      }
    }
    
    if (puuids.length === 0) {
      console.error('[Match Analyzer] Could not find any puuids');
      return [];
    }
    
    // Get recent matches for these players
    const matchIds: string[] = [];
    
    for (const puuid of puuids) {
      try {
        const matchesUrl = `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=5`; // Ranked games only
        const matches = await riotApiRequest(matchesUrl, apiKey);
        
        // Add unique match IDs
        for (const matchId of matches) {
          if (!matchIds.includes(matchId)) {
            matchIds.push(matchId);
          }
        }
      } catch (error) {
        console.error(`[Match Analyzer] Error fetching matches:`, error);
      }
    }
    
    console.log(`[Match Analyzer] Found ${matchIds.length} unique matches`);
    
    // Return a subset of matches based on limit
    return matchIds.slice(0, limit);
  } catch (error) {
    console.error('[Match Analyzer] Error fetching high ELO matches:', error);
    return [];
  }
}

/**
 * Analyzes match data for a specific champion
 * Returns item builds, rune builds, counters, synergies, and other stats
 */
export async function analyzeMatchData(
  championId: string,
  region: string = 'na',
  matchLimit: number = 10,
  useCache: boolean = true,
  debugMode: boolean = false
): Promise<MatchAnalysisResult> {
  // Initialize the result object
  const result: MatchAnalysisResult = {
    itemBuilds: null,
    runeBuilds: null,
    winRate: 0,
    pickRate: 0,
    banRate: 0,
    skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W'],
    counters: [],
    synergies: []
  };
  
  // Get API key
  const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY || '';
  
  // Validate API key
  if (!apiKey || apiKey.includes('YOUR_API_KEY') || apiKey.includes('RGAPI') || apiKey.length < 20) {
    console.error('[Match Analyzer] Invalid or missing API key');
    return result;
  }
  
  console.log(`[Match Analyzer] Analyzing matches for champion ${championId} in ${region}`);
  
  try {
    // Get current patch version
    const currentPatch = await dataDragon.getCurrentPatch();
    console.log(`[Match Analyzer] Using patch: ${currentPatch}`);
    
    // Fetch game data from Data Dragon
    const [itemsData, runesData, championsData] = await Promise.all([
      dataDragon.getItemsData(currentPatch),
      dataDragon.getRunesData(currentPatch),
      dataDragon.getChampionsList(currentPatch)
    ]);
    
    // Build a map of champion IDs to champion keys (numeric IDs)
    const championKeyToId: Record<string, string> = {};
    const championIdToKey: Record<string, string> = {};
    
    Object.values(championsData).forEach((champion: any) => {
      championKeyToId[champion.key] = champion.id;
      championIdToKey[champion.id.toLowerCase()] = champion.key;
    });
    
    // Make sure we have the correct champion key (numeric ID)
    let championKey = championId;
    if (!championKeyToId[championId]) {
      // This might be the champion name, not the key
      championKey = championIdToKey[championId.toLowerCase()] || championId;
    }
    
    console.log(`[Match Analyzer] Champion key for analysis: ${championKey}`);
    
    // Fetch high ELO matches
    const matchIds = await fetchHighEloMatches(championKey, region, matchLimit);
    
    if (matchIds.length === 0) {
      console.error('[Match Analyzer] No matches found for analysis');
      return result;
    }
    
    console.log(`[Match Analyzer] Analyzing ${matchIds.length} matches`);
    
    // Get regional routing value for match endpoints
    const regionalRouting = REGION_TO_REGIONAL[region] || 'americas';
    
    // Stats for analysis
    let picks = 0;
    let wins = 0;
    let bans = 0;
    
    // Item statistics
    const startingItems: Record<string, { picks: number, wins: number }> = {};
    const coreItems: Record<string, { picks: number, wins: number }> = {};
    const bootsItems: Record<string, { picks: number, wins: number }> = {};
    const itemFrequency: Record<string, number> = {};
    
    // Rune statistics
    const primaryRunes: Record<string, { picks: number, wins: number }> = {};
    const secondaryRunes: Record<string, { picks: number, wins: number }> = {};
    const runeShards: Record<string, { picks: number, wins: number }> = {};
    
    // Counter statistics
    const counters: Record<string, { wins: number, losses: number, role: string }> = {};
    
    // Synergy statistics
    const synergies: Record<string, { wins: number, losses: number, role: string }> = {};
    
    // Skill order statistics
    const skillOrders: Record<string, number> = {};
    
    // Analyze each match
    for (const matchId of matchIds) {
      try {
        const matchUrl = `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchData = await riotApiRequest(matchUrl, apiKey);
        
        if (debugMode) {
          console.log(`[Match Analyzer] Analyzing match: ${matchId}`);
        }
        
        // Check for bans
        const bannedChampions = matchData.info.participants.reduce((bans: string[], participant: any) => {
          if (participant.championId === parseInt(championKey)) {
            bans.push(participant.championId.toString());
          }
          return bans;
        }, []);
        
        bans += bannedChampions.length;
        
        // Find the player using our champion
        const targetPlayer = matchData.info.participants.find(
          (participant: any) => participant.championId === parseInt(championKey)
        );
        
        if (!targetPlayer) {
          if (debugMode) {
            console.log(`[Match Analyzer] Champion ${championKey} not found in match ${matchId}`);
          }
          continue;
        }
        
        picks++;
        const won = targetPlayer.win;
        if (won) wins++;
        
        const targetTeam = targetPlayer.teamId;
        const targetRole = targetPlayer.teamPosition || targetPlayer.role || 'UNKNOWN';
        
        // Process items
        const playerItems = [
          targetPlayer.item0,
          targetPlayer.item1,
          targetPlayer.item2,
          targetPlayer.item3,
          targetPlayer.item4,
          targetPlayer.item5,
          targetPlayer.item6 // Trinket
        ].filter(itemId => itemId > 0);
        
        // Increment item frequency
        playerItems.forEach(itemId => {
          const itemIdStr = itemId.toString();
          itemFrequency[itemIdStr] = (itemFrequency[itemIdStr] || 0) + 1;
          
          // Categorize items
          const item = itemsData[itemIdStr];
          if (item) {
            if (item.gold.total <= 500) {
              // Starting item
              startingItems[itemIdStr] = startingItems[itemIdStr] || { picks: 0, wins: 0 };
              startingItems[itemIdStr].picks++;
              if (won) startingItems[itemIdStr].wins++;
            } else if (item.name.toLowerCase().includes('boots') || itemIdStr === '3006' || itemIdStr === '3009' || itemIdStr === '3020' || itemIdStr === '3047' || itemIdStr === '3111' || itemIdStr === '3117' || itemIdStr === '3158') {
              // Boots
              bootsItems[itemIdStr] = bootsItems[itemIdStr] || { picks: 0, wins: 0 };
              bootsItems[itemIdStr].picks++;
              if (won) bootsItems[itemIdStr].wins++;
            } else if (item.gold.total >= 2500) {
              // Core items (expensive items)
              coreItems[itemIdStr] = coreItems[itemIdStr] || { picks: 0, wins: 0 };
              coreItems[itemIdStr].picks++;
              if (won) coreItems[itemIdStr].wins++;
            }
          }
        });
        
        // Process runes
        if (targetPlayer.perks) {
          const primaryStyle = targetPlayer.perks.styles[0]?.style.toString();
          const secondaryStyle = targetPlayer.perks.styles[1]?.style.toString();
          
          if (primaryStyle) {
            primaryRunes[primaryStyle] = primaryRunes[primaryStyle] || { picks: 0, wins: 0 };
            primaryRunes[primaryStyle].picks++;
            if (won) primaryRunes[primaryStyle].wins++;
            
            targetPlayer.perks.styles[0]?.selections.forEach((selection: any) => {
              const runeId = selection.perk.toString();
              primaryRunes[runeId] = primaryRunes[runeId] || { picks: 0, wins: 0 };
              primaryRunes[runeId].picks++;
              if (won) primaryRunes[runeId].wins++;
            });
          }
          
          if (secondaryStyle) {
            secondaryRunes[secondaryStyle] = secondaryRunes[secondaryStyle] || { picks: 0, wins: 0 };
            secondaryRunes[secondaryStyle].picks++;
            if (won) secondaryRunes[secondaryStyle].wins++;
            
            targetPlayer.perks.styles[1]?.selections.forEach((selection: any) => {
              const runeId = selection.perk.toString();
              secondaryRunes[runeId] = secondaryRunes[runeId] || { picks: 0, wins: 0 };
              secondaryRunes[runeId].picks++;
              if (won) secondaryRunes[runeId].wins++;
            });
          }
          
          // Stat shards
          if (targetPlayer.perks.statPerks) {
            Object.entries(targetPlayer.perks.statPerks).forEach(([key, value]) => {
              const shardId = `${key}_${value}`;
              runeShards[shardId] = runeShards[shardId] || { picks: 0, wins: 0 };
              runeShards[shardId].picks++;
              if (won) runeShards[shardId].wins++;
            });
          }
        }
        
        // Process counters and synergies
        matchData.info.participants.forEach((participant: any) => {
          const participantChampKey = participant.championId.toString();
          const participantTeam = participant.teamId;
          const participantRole = participant.teamPosition || participant.role || 'UNKNOWN';
          
          // Skip self
          if (participantChampKey === championKey) return;
          
          // Enemy champion - potential counter
          if (participantTeam !== targetTeam) {
            if (!counters[participantChampKey]) {
              counters[participantChampKey] = { wins: 0, losses: 0, role: participantRole };
            }
            
            // If our champion lost, this enemy champion won (counter)
            if (!won) {
              counters[participantChampKey].wins++;
            } else {
              counters[participantChampKey].losses++;
            }
          } 
          // Allied champion - potential synergy
          else {
            if (!synergies[participantChampKey]) {
              synergies[participantChampKey] = { wins: 0, losses: 0, role: participantRole };
            }
            
            if (won) {
              synergies[participantChampKey].wins++;
            } else {
              synergies[participantChampKey].losses++;
            }
          }
        });
        
        // Process skill order
        if (targetPlayer.timeline && targetPlayer.timeline.skillSlots) {
          const skillOrder = targetPlayer.timeline.skillSlots
            .slice(0, 18) // First 18 levels
            .map((skill: number) => ['Q', 'W', 'E', 'R'][skill - 1] || 'Unknown');
            
          const skillOrderKey = skillOrder.join('');
          skillOrders[skillOrderKey] = (skillOrders[skillOrderKey] || 0) + 1;
        }
      } catch (error) {
        console.error(`[Match Analyzer] Error analyzing match ${matchId}:`, error);
      }
    }
    
    // Calculate win rate
    result.winRate = picks > 0 ? (wins / picks) * 100 : 0;
    console.log(`[Match Analyzer] Champion ${championKey} win rate: ${result.winRate.toFixed(2)}%`);
    
    // Processing and calculating results
    // Most popular starting items
    const startingItemsArray = Object.entries(startingItems)
      .map(([itemId, stats]) => ({
        id: itemId,
        name: itemsData[itemId]?.name || 'Unknown Item',
        description: itemsData[itemId]?.description || '',
        image: dataDragon.getItemImageURL(itemId, currentPatch),
        gold: itemsData[itemId]?.gold.total || 0,
        winRate: stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0,
        pickRate: picks > 0 ? (stats.picks / picks) * 100 : 0
      }))
      .sort((a, b) => b.pickRate - a.pickRate)
      .slice(0, 4);
    
    // Most popular boots
    const bootsItemsArray = Object.entries(bootsItems)
      .map(([itemId, stats]) => ({
        id: itemId,
        name: itemsData[itemId]?.name || 'Unknown Item',
        description: itemsData[itemId]?.description || '',
        image: dataDragon.getItemImageURL(itemId, currentPatch),
        gold: itemsData[itemId]?.gold.total || 0,
        winRate: stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0,
        pickRate: picks > 0 ? (stats.picks / picks) * 100 : 0
      }))
      .sort((a, b) => b.pickRate - a.pickRate)
      .slice(0, 2);
    
    // Most popular core items
    const coreItemsArray = Object.entries(coreItems)
      .map(([itemId, stats]) => ({
        id: itemId,
        name: itemsData[itemId]?.name || 'Unknown Item',
        description: itemsData[itemId]?.description || '',
        image: dataDragon.getItemImageURL(itemId, currentPatch),
        gold: itemsData[itemId]?.gold.total || 0,
        winRate: stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0,
        pickRate: picks > 0 ? (stats.picks / picks) * 100 : 0
      }))
      .sort((a, b) => b.pickRate - a.pickRate)
      .slice(0, 6);
      
    // Situational items (items with good win rate but lower pick rate)
    const situationalItemsArray = Object.entries(coreItems)
      .map(([itemId, stats]) => ({
        id: itemId,
        name: itemsData[itemId]?.name || 'Unknown Item',
        description: itemsData[itemId]?.description || '',
        image: dataDragon.getItemImageURL(itemId, currentPatch),
        gold: itemsData[itemId]?.gold.total || 0,
        winRate: stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0,
        pickRate: picks > 0 ? (stats.picks / picks) * 100 : 0
      }))
      .filter(item => !coreItemsArray.some(coreItem => coreItem.id === item.id))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 6);
    
    // Set item builds
    result.itemBuilds = {
      startingItems: startingItemsArray,
      coreItems: coreItemsArray,
      boots: bootsItemsArray,
      situationalItems: situationalItemsArray
    };
    
    // Process counters
    result.counters = Object.entries(counters)
      .map(([champKey, stats]) => {
        const champId = championKeyToId[champKey] || '';
        const totalGames = stats.wins + stats.losses;
        const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        
        return {
          id: champId,
          name: championsData[champId]?.name || 'Unknown Champion',
          image: dataDragon.getChampionImageURLs(champId, currentPatch).icon,
          winRate,
          role: stats.role
        };
      })
      .filter(counter => counter.id && counter.winRate > 50)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
    
    // Process synergies
    result.synergies = Object.entries(synergies)
      .map(([champKey, stats]) => {
        const champId = championKeyToId[champKey] || '';
        const totalGames = stats.wins + stats.losses;
        const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        
        return {
          id: champId,
          name: championsData[champId]?.name || 'Unknown Champion',
          image: dataDragon.getChampionImageURLs(champId, currentPatch).icon,
          winRate,
          role: stats.role
        };
      })
      .filter(synergy => synergy.id && synergy.winRate > 50)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
    
    // Process skill orders
    if (Object.keys(skillOrders).length > 0) {
      const mostPopularSkillOrder = Object.entries(skillOrders)
        .sort(([, countA], [, countB]) => countB - countA)[0][0]
        .split('');
        
      result.skillOrder = mostPopularSkillOrder;
    }
    
    console.log(`[Match Analyzer] Analysis complete for champion ${championKey}`);
    return result;
  } catch (error) {
    console.error('[Match Analyzer] Error in match analysis:', error);
    return result;
  }
}

// Map role names to lane/role combinations in match data
const ROLE_TO_POSITION: Record<string, { lane: string, role: string }[]> = {
  'TOP': [{ lane: 'TOP', role: 'SOLO' }],
  'JUNGLE': [{ lane: 'JUNGLE', role: 'NONE' }],
  'MID': [{ lane: 'MIDDLE', role: 'SOLO' }],
  'ADC': [{ lane: 'BOTTOM', role: 'CARRY' }],
  'SUPPORT': [{ lane: 'BOTTOM', role: 'SUPPORT' }],
};

/**
 * Analyzes match data to extract item builds, rune choices, win rates, etc.
 */
export async function analyzeMatchDataOld(
  matchIds: string[], 
  champId: string, 
  role: string, 
  region: string = 'na',
  apiKey: string,
  patch: string
): Promise<MatchAnalysisResult> {
  if (matchIds.length === 0 || !apiKey || apiKey === 'RGAPI-your-api-key-here' || apiKey.includes('xxxxxxxx') || !apiKey.startsWith('RGAPI-')) {
    console.log('No matches to analyze or no valid API key, returning default data');
    return {
      itemBuilds: null,
      runeBuilds: null,
      winRate: 51.5, 
      pickRate: 12.3,
      banRate: 5.8,
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'],
      counters: [],
      synergies: []
    };
  }
  
  console.log(`Analyzing ${matchIds.length} matches for ${champId} in ${role} role`);
  const regionalRoute = REGION_TO_REGIONAL[region] || 'americas';
  
  try {
    // Get item data for the current patch
    console.log(`Fetching item data for patch ${patch}`);
    const itemsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/item.json`);
    const itemsData = itemsResponse.data.data;
    
    // Get rune data
    console.log(`Fetching rune data for patch ${patch}`);
    const runesResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`);
    const runesData = runesResponse.data;
    
    // Get all champions data for looking up counter/synergy info
    console.log(`Fetching champion data for patch ${patch}`);
    const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`);
    const championsData = championsResponse.data.data;
    
    // Map champion id to key (needed for Riot API match data)
    const championKeyMap: Record<string, string> = {};
    const championIdByKey: Record<string, string> = {};
    Object.values(championsData).forEach((champ: any) => {
      championKeyMap[champ.key] = champ.id;
      championIdByKey[champ.id] = champ.key;
    });
    
    // Get champion numeric key for match data
    const champNumericKey = Object.entries(championKeyMap).find(
      ([key, id]) => id.toLowerCase() === champId.toLowerCase()
    )?.[0];
    
    if (!champNumericKey) {
      console.error(`Could not find numeric key for champion ${champId}`);
      return {
        itemBuilds: null,
        runeBuilds: null,
        winRate: 51.5,
        pickRate: 12.3,
        banRate: 5.8,
        skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'],
        counters: [],
        synergies: []
      };
    }
    
    console.log(`Champion ${champId} has numeric key: ${champNumericKey}`);
    
    // Data collection structures
    const matchesAnalyzed: number = Math.min(matchIds.length, 20); // Limit to 20 matches to avoid rate limits
    let champWins = 0;
    let champPicks = 0;
    let champBans = 0;
    
    // Item tracking
    const startingItems: Record<string, { count: number, wins: number }> = {};
    const coreItems: Record<string, { count: number, wins: number }> = {};
    const boots: Record<string, { count: number, wins: number }> = {};
    const situationalItems: Record<string, { count: number, wins: number }> = {};
    
    // Rune tracking
    const runeChoices: Record<string, {
      primaryPath: string,
      keystoneId: string,
      primaryRunes: string[],
      secondaryPath: string,
      secondaryRunes: string[],
      shards: string[],
      count: number,
      wins: number
    }[]> = {};
    
    // Counter and synergy tracking
    const counters: Record<string, { wins: number, count: number }> = {};
    const synergies: Record<string, { wins: number, count: number }> = {};
    
    // Skill order tracking
    const skillOrders: Record<string, { count: number, wins: number }> = {};
    
    // Target positions for the given role
    const targetPositions = ROLE_TO_POSITION[role.toUpperCase()] || ROLE_TO_POSITION['MID'];
    
    // Analyze each match
    for (let i = 0; i < matchesAnalyzed; i++) {
      const matchId = matchIds[i];
      console.log(`Analyzing match ${i+1}/${matchesAnalyzed}: ${matchId}`);
      
      try {
        // Use regional routing for match data
        const matchUrl = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchData = await riotApiRequest(matchUrl, apiKey);
        
        if (!matchData || !matchData.info) {
          console.log(`No valid data for match ${matchId}, skipping`);
          continue;
        }
        
        // Check for champion bans
        if (matchData.info.teams) {
          for (const team of matchData.info.teams) {
            for (const ban of team.bans || []) {
              if (ban.championId && ban.championId.toString() === champNumericKey) {
                champBans++;
                console.log(`Found ban for ${champId} in match ${matchId}`);
                break;
              }
            }
          }
        }
        
        // Find our champion in this match
        const targetPlayer = matchData.info.participants.find((p: any) => {
          const isTargetChamp = p.championId && p.championId.toString() === champNumericKey;
          const isTargetPosition = targetPositions.some(pos => 
            p.individualPosition === pos.lane || 
            (p.lane === pos.lane && p.role === pos.role)
          );
          return isTargetChamp && isTargetPosition;
        });
        
        if (!targetPlayer) {
          console.log(`Champion ${champId} not found in match ${matchId} with the right role, skipping`);
          continue; // Champion not in this match with the right role
        }
        
        console.log(`Found ${champId} in match ${matchId} in role ${targetPlayer.lane || targetPlayer.individualPosition}`);
        champPicks++;
        const won = targetPlayer.win;
        if (won) {
          champWins++;
          console.log(`${champId} won this match`);
        } else {
          console.log(`${champId} lost this match`);
        }
        
        // Parse items
        // Starting items (first 5 minutes)
        const earlyItems: string[] = [];
        if (targetPlayer.timeline && targetPlayer.timeline.itemPurchases) {
          earlyItems.push(...targetPlayer.timeline.itemPurchases
            .filter((purchase: any) => purchase.timestamp <= 5 * 60 * 1000)
            .map((purchase: any) => purchase.itemId.toString()));
        } else {
          // Fallback - count items like Doran's Blade, potions, etc
          const likelyStarterItems = ['1055', '1056', '1054', '1082', '1083', '2003'];
          for (const itemId of likelyStarterItems) {
            if (targetPlayer[`item0`] === parseInt(itemId) || 
                targetPlayer[`item1`] === parseInt(itemId) ||
                targetPlayer[`item2`] === parseInt(itemId) ||
                targetPlayer[`item3`] === parseInt(itemId) ||
                targetPlayer[`item4`] === parseInt(itemId) ||
                targetPlayer[`item5`] === parseInt(itemId)) {
              earlyItems.push(itemId);
            }
          }
        }
        
        console.log(`Found ${earlyItems.length} starting items for ${champId}`);
        for (const itemId of earlyItems) {
          if (!startingItems[itemId]) {
            startingItems[itemId] = { count: 0, wins: 0 };
          }
          startingItems[itemId].count++;
          if (won) startingItems[itemId].wins++;
        }
        
        // Core & situational items
        const mainItems = [];
        for (let slot = 0; slot <= 6; slot++) {
          const itemId = targetPlayer[`item${slot}`];
          if (itemId && itemId > 0) {
            const itemIdStr = itemId.toString();
            
            // Categorize boots
            if (itemsData[itemIdStr] && itemsData[itemIdStr].tags && 
                itemsData[itemIdStr].tags.includes('Boots')) {
              if (!boots[itemIdStr]) {
                boots[itemIdStr] = { count: 0, wins: 0 };
              }
              boots[itemIdStr].count++;
              if (won) boots[itemIdStr].wins++;
            } 
            // Core items (non-consumables)
            else if (itemsData[itemIdStr] && 
                     (!itemsData[itemIdStr].consumed) && 
                     itemsData[itemIdStr].gold && 
                     itemsData[itemIdStr].gold.total >= 1000) {
              
              mainItems.push(itemIdStr);
            }
          }
        }
        
        // Process core items (first 3) and situational items (rest)
        const coreItemsList = mainItems.slice(0, 3);
        const situationalItemsList = mainItems.slice(3);
        
        console.log(`Found ${coreItemsList.length} core items and ${situationalItemsList.length} situational items`);
        
        for (const itemId of coreItemsList) {
          if (!coreItems[itemId]) {
            coreItems[itemId] = { count: 0, wins: 0 };
          }
          coreItems[itemId].count++;
          if (won) coreItems[itemId].wins++;
        }
        
        for (const itemId of situationalItemsList) {
          if (!situationalItems[itemId]) {
            situationalItems[itemId] = { count: 0, wins: 0 };
          }
          situationalItems[itemId].count++;
          if (won) situationalItems[itemId].wins++;
        }
        
        // Process runes
        if (targetPlayer.perks) {
          const primaryStyleId = targetPlayer.perks.styles && targetPlayer.perks.styles[0]?.style ? 
            targetPlayer.perks.styles[0].style.toString() : null;
          const secondaryStyleId = targetPlayer.perks.styles && targetPlayer.perks.styles[1]?.style ? 
            targetPlayer.perks.styles[1].style.toString() : null;
          
          if (primaryStyleId && secondaryStyleId) {
            const primaryRunes = targetPlayer.perks.styles[0].selections.map((s: any) => s.perk.toString());
            const secondaryRunes = targetPlayer.perks.styles[1].selections.map((s: any) => s.perk.toString());
            const statShards = [
              targetPlayer.perks.statPerks?.offense,
              targetPlayer.perks.statPerks?.flex,
              targetPlayer.perks.statPerks?.defense
            ].map(s => s?.toString() || '');
            
            const runeKey = `${primaryStyleId}-${primaryRunes.join(',')}-${secondaryStyleId}-${secondaryRunes.join(',')}`;
            
            if (!runeChoices[runeKey]) {
              runeChoices[runeKey] = [{
                primaryPath: primaryStyleId,
                keystoneId: primaryRunes[0],
                primaryRunes: primaryRunes.slice(1),
                secondaryPath: secondaryStyleId,
                secondaryRunes: secondaryRunes,
                shards: statShards,
                count: 0,
                wins: 0
              }];
            }
            
            runeChoices[runeKey][0].count++;
            if (won) runeChoices[runeKey][0].wins++;
            console.log(`Recorded rune choices with primary path: ${primaryStyleId}`);
          } else {
            console.log(`No valid rune data found for ${champId} in match ${matchId}`);
          }
        } else {
          console.log(`No perks data found for ${champId} in match ${matchId}`);
        }
        
        // Process skill order
        if (targetPlayer.timeline && targetPlayer.timeline.skillSlotUp) {
          const skillOrder = targetPlayer.timeline.skillSlotUp
            .filter((skill: any) => skill.skillSlot <= 4) // Only consider Q,W,E,R
            .map((skill: any) => {
              return ['Q', 'W', 'E', 'R'][skill.skillSlot - 1];
            })
            .slice(0, 15)
            .join('');
          
          if (skillOrder) {
            if (!skillOrders[skillOrder]) {
              skillOrders[skillOrder] = { count: 0, wins: 0 };
            }
            skillOrders[skillOrder].count++;
            if (won) skillOrders[skillOrder].wins++;
            console.log(`Recorded skill order: ${skillOrder}`);
          }
        }
        
        // Process counter matchups and synergies
        for (const player of matchData.info.participants) {
          // Skip if it's our champion
          if (player.championId && player.championId.toString() === champNumericKey) continue;
          
          const enemyChampId = player.championId ? player.championId.toString() : null;
          if (!enemyChampId) continue;
          
          const enemyChampName = championKeyMap[enemyChampId];
          
          if (!enemyChampName) {
            console.log(`Could not find champion name for ID: ${enemyChampId}`);
            continue;
          }
          
          // Check if opponent is in same lane/opposite team (counter)
          if (player.teamId !== targetPlayer.teamId && 
              ((player.lane === targetPlayer.lane && player.role !== targetPlayer.role) ||
              (player.individualPosition === targetPlayer.individualPosition))) {
            
            if (!counters[enemyChampId]) {
              counters[enemyChampId] = { wins: 0, count: 0 };
            }
            counters[enemyChampId].count++;
            if (won) counters[enemyChampId].wins++;
            console.log(`Recorded counter matchup with ${enemyChampName}`);
          }
          
          // Check for synergies (same team, complementary roles)
          if (player.teamId === targetPlayer.teamId) {
            // For ADC-Support synergy
            if ((role.toUpperCase() === 'ADC' && player.role === 'SUPPORT' && player.lane === 'BOTTOM') ||
                (role.toUpperCase() === 'SUPPORT' && player.role === 'CARRY' && player.lane === 'BOTTOM')) {
              
              if (!synergies[enemyChampId]) {
                synergies[enemyChampId] = { wins: 0, count: 0 };
              }
              synergies[enemyChampId].count++;
              if (won) synergies[enemyChampId].wins++;
              console.log(`Recorded synergy with ${enemyChampName}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error analyzing match ${matchId}:`, error);
        continue;
      }
    }
    
    // Calculate win rates
    const winRate = champPicks > 0 ? (champWins / champPicks) * 100 : 50;
    console.log(`Overall win rate for ${champId}: ${winRate.toFixed(2)}% (${champWins}/${champPicks})`);
    
    // Sort items by popularity
    const sortItemsByPopularity = (items: Record<string, { count: number, wins: number }>) => {
      return Object.entries(items)
        .map(([id, data]) => ({
          id,
          winRate: data.count > 0 ? (data.wins / data.count) * 100 : 50,
          pickRate: (data.count / champPicks) * 100,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count);
    };
    
    const startingItemsSorted = sortItemsByPopularity(startingItems);
    const coreItemsSorted = sortItemsByPopularity(coreItems);
    const bootsSorted = sortItemsByPopularity(boots);
    const situationalItemsSorted = sortItemsByPopularity(situationalItems);
    
    // Transform item data to include names and images
    const transformItems = (items: any[]): ItemBuild[] => {
      return items.slice(0, 5).map(item => {
        const itemData = itemsData[item.id] || {
          name: 'Unknown Item',
          description: '',
          gold: { total: 0 }
        };
        
        return {
          id: item.id,
          name: itemData.name,
          description: itemData.description || '',
          image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item.id}.png`,
          gold: itemData.gold ? itemData.gold.total : 0,
          winRate: item.winRate,
          pickRate: item.pickRate
        };
      });
    };
    
    const startingItemsProcessed = transformItems(startingItemsSorted);
    const coreItemsProcessed = transformItems(coreItemsSorted);
    const bootsProcessed = transformItems(bootsSorted);
    const situationalItemsProcessed = transformItems(situationalItemsSorted);
    
    console.log(`Processed ${startingItemsProcessed.length} starting items, ${coreItemsProcessed.length} core items, ${bootsProcessed.length} boots, and ${situationalItemsProcessed.length} situational items`);
    
    // Process rune data
    const runeBuildsProcessed: RuneBuild[] = Object.values(runeChoices)
      .flatMap(runeSet => runeSet)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2) // Get top 2 rune builds
      .map(runeBuild => {
        const primaryPathData = runesData.find((path: any) => path.id.toString() === runeBuild.primaryPath);
        const secondaryPathData = runesData.find((path: any) => path.id.toString() === runeBuild.secondaryPath);
        
        // Helper to find rune data
        const findRuneInPath = (pathData: any, runeId: string) => {
          for (const slotRunes of pathData.slots) {
            const rune = slotRunes.runes.find((r: any) => r.id.toString() === runeId);
            if (rune) return rune;
          }
          return null;
        };
        
        // Map shard IDs to human-readable names
        const shardNames: Record<string, string> = {
          '5008': 'Adaptive Force',
          '5005': 'Attack Speed',
          '5007': 'Ability Haste',
          '5002': 'Armor',
          '5003': 'Magic Resist',
          '5001': 'Health'
        };
        
        // Transform primary runes
        const primaryRunesProcessed = [runeBuild.keystoneId, ...runeBuild.primaryRunes].map(runeId => {
          const runeData = findRuneInPath(primaryPathData, runeId);
          return {
            id: runeId,
            name: runeData ? runeData.name : 'Unknown Rune',
            image: runeData ? runeData.icon : '',
            winRate: runeBuild.count > 0 ? (runeBuild.wins / runeBuild.count) * 100 : 50,
            pickRate: (runeBuild.count / champPicks) * 100
          };
        });
        
        // Transform secondary runes
        const secondaryRunesProcessed = runeBuild.secondaryRunes.map(runeId => {
          const runeData = findRuneInPath(secondaryPathData, runeId);
          return {
            id: runeId,
            name: runeData ? runeData.name : 'Unknown Rune',
            image: runeData ? runeData.icon : '',
            winRate: runeBuild.count > 0 ? (runeBuild.wins / runeBuild.count) * 100 : 50,
            pickRate: (runeBuild.count / champPicks) * 100
          };
        });
        
        return {
          primaryPath: {
            id: runeBuild.primaryPath,
            name: primaryPathData ? primaryPathData.name : 'Unknown Path',
            image: primaryPathData ? primaryPathData.icon : '',
            runes: primaryRunesProcessed
          },
          secondaryPath: {
            id: runeBuild.secondaryPath,
            name: secondaryPathData ? secondaryPathData.name : 'Unknown Path',
            image: secondaryPathData ? secondaryPathData.icon : '',
            runes: secondaryRunesProcessed
          },
          shards: {
            offense: shardNames[runeBuild.shards[0]] || 'Adaptive Force',
            flex: shardNames[runeBuild.shards[1]] || 'Adaptive Force',
            defense: shardNames[runeBuild.shards[2]] || 'Health'
          },
          winRate: runeBuild.count > 0 ? (runeBuild.wins / runeBuild.count) * 100 : 50,
          pickRate: (runeBuild.count / champPicks) * 100
        };
      });
    
    console.log(`Processed ${runeBuildsProcessed.length} rune builds`);
    
    // Process counters
    const counterChampions: CounterChampion[] = Object.entries(counters)
      .filter(([_, data]) => data.count >= 2)
      .map(([champId, data]) => {
        const counterWinRate = data.count > 0 ? ((data.count - data.wins) / data.count) * 100 : 50;
        const champName = championKeyMap[champId] || 'Unknown';
        
        return {
          id: champId,
          name: champName,
          image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champName}.png`,
          winRate: counterWinRate,
          role: role
        };
      })
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
    
    console.log(`Processed ${counterChampions.length} counter champions`);
    
    // Process synergies
    const synergyChampions: CounterChampion[] = Object.entries(synergies)
      .filter(([_, data]) => data.count >= 2)
      .map(([champId, data]) => {
        const synergyWinRate = data.count > 0 ? (data.wins / data.count) * 100 : 50;
        const champName = championKeyMap[champId] || 'Unknown';
        const synergyRole = role.toUpperCase() === 'ADC' ? 'SUPPORT' : 'ADC';
        
        return {
          id: champId,
          name: champName,
          image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champName}.png`,
          winRate: synergyWinRate,
          role: synergyRole
        };
      })
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
    
    console.log(`Processed ${synergyChampions.length} synergy champions`);
    
    // Get most popular skill order
    let skillOrder: string[] = ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'];
    
    if (Object.keys(skillOrders).length > 0) {
      const topSkillOrder = Object.entries(skillOrders)
        .sort((a, b) => b[1].count - a[1].count)[0][0];
      
      if (topSkillOrder) {
        skillOrder = topSkillOrder.split('');
        console.log(`Using most popular skill order: ${topSkillOrder}`);
      }
    }
    
    // Estimated pick rate based on data from high ELO
    const pickRate = champPicks / matchesAnalyzed * 10; // Approximate pick rate %
    const banRate = champBans / matchesAnalyzed * 10; // Approximate ban rate %
    
    // Create final result with transformed data
    const finalResult: MatchAnalysisResult = {
      itemBuilds: {
        startingItems: startingItemsProcessed,
        coreItems: coreItemsProcessed,
        boots: bootsProcessed,
        situationalItems: situationalItemsProcessed
      },
      runeBuilds: runeBuildsProcessed.length > 0 ? runeBuildsProcessed : null,
      winRate,
      pickRate,
      banRate,
      skillOrder,
      counters: counterChampions,
      synergies: synergyChampions
    };
    
    console.log(`Analysis complete for ${champId}. Got ${finalResult.itemBuilds?.coreItems?.length || 0} core items, ${finalResult.runeBuilds ? finalResult.runeBuilds.length : 0} rune builds, ${finalResult.counters.length} counters`);
    
    return finalResult;
  } catch (error) {
    console.error('Error analyzing match data:', error);
    return {
      itemBuilds: null,
      runeBuilds: null,
      winRate: 51.5,
      pickRate: 12.3,
      banRate: 5.8,
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'],
      counters: [],
      synergies: []
    };
  }
} 