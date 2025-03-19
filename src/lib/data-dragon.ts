/**
 * Utility functions for Riot's Data Dragon API
 * Data Dragon is Riot's static data CDN that hosts game assets and data
 */

import axios from 'axios';

// Cache for recently fetched data
const dataCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetches the current patch version
 */
export async function getCurrentPatch(): Promise<string> {
  try {
    console.log("Fetching current patch version...");
    
    // Check cache first
    if (dataCache['versions'] && Date.now() - dataCache['versions'].timestamp < CACHE_DURATION) {
      console.log("Using cached version data");
      return dataCache['versions'].data[0];
    }
    
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    dataCache['versions'] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    console.log(`Current patch: ${response.data[0]}`);
    return response.data[0];
  } catch (error) {
    console.error("Error fetching current patch:", error);
    return '14.16.1'; // Fallback to a recent patch
  }
}

/**
 * Fetches champion data for all champions
 */
export async function getChampionsList(patch: string): Promise<any> {
  try {
    const cacheKey = `champions-${patch}`;
    if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Using cached champion list for patch ${patch}`);
      return dataCache[cacheKey].data;
    }
    
    console.log(`Fetching champion list for patch ${patch}...`);
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`);
    dataCache[cacheKey] = {
      data: response.data.data,
      timestamp: Date.now()
    };
    
    console.log(`Fetched ${Object.keys(response.data.data).length} champions`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching champion list for patch ${patch}:`, error);
    throw new Error(`Failed to fetch champion list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches detailed data for a specific champion
 */
export async function getChampionDetails(champId: string, patch: string): Promise<any> {
  try {
    const cacheKey = `champion-${champId}-${patch}`;
    if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Using cached details for ${champId}`);
      return dataCache[cacheKey].data;
    }
    
    console.log(`Fetching champion details for ${champId} on patch ${patch}...`);
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champId}.json`);
    
    if (!response.data.data || !response.data.data[champId]) {
      throw new Error(`Invalid response format for champion ${champId}`);
    }
    
    dataCache[cacheKey] = {
      data: response.data.data[champId],
      timestamp: Date.now()
    };
    
    console.log(`Successfully fetched details for ${champId}`);
    return response.data.data[champId];
  } catch (error) {
    console.error(`Error fetching champion details for ${champId}:`, error);
    throw new Error(`Failed to fetch champion details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches item data for the current patch
 */
export async function getItemsData(patch: string): Promise<any> {
  try {
    const cacheKey = `items-${patch}`;
    if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Using cached items data for patch ${patch}`);
      return dataCache[cacheKey].data;
    }
    
    console.log(`Fetching items data for patch ${patch}...`);
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/item.json`);
    dataCache[cacheKey] = {
      data: response.data.data,
      timestamp: Date.now()
    };
    
    console.log(`Fetched ${Object.keys(response.data.data).length} items`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching items data for patch ${patch}:`, error);
    throw new Error(`Failed to fetch items data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches rune data for the current patch
 */
export async function getRunesData(patch: string): Promise<any> {
  try {
    const cacheKey = `runes-${patch}`;
    if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Using cached runes data for patch ${patch}`);
      return dataCache[cacheKey].data;
    }
    
    console.log(`Fetching runes data for patch ${patch}...`);
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`);
    dataCache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    console.log(`Fetched ${response.data.length} rune paths`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching runes data for patch ${patch}:`, error);
    throw new Error(`Failed to fetch runes data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates URLs for champion images
 */
export function getChampionImageURLs(champId: string, patch: string) {
  return {
    icon: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champId}.png`,
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champId}_0.jpg`,
    loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champId}_0.jpg`,
  };
}

/**
 * Generates URLs for item images
 */
export function getItemImageURL(itemId: string, patch: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${itemId}.png`;
}

/**
 * Generates URLs for spell images
 */
export function getSpellImageURL(spellImage: string, patch: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${spellImage}`;
}

/**
 * Generates URLs for passive images
 */
export function getPassiveImageURL(passiveImage: string, patch: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/passive/${passiveImage}`;
}

/**
 * Maps a champion ID to its numeric key needed for the Riot API
 */
export async function getChampionNumericKey(champId: string, patch: string): Promise<string | null> {
  try {
    const championsData = await getChampionsList(patch);
    
    // Find the champion by ID (case insensitive)
    const championEntry = Object.values(championsData).find(
      (champ: any) => champ.id.toLowerCase() === champId.toLowerCase()
    );
    
    if (championEntry) {
      return (championEntry as any).key;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting numeric key for ${champId}:`, error);
    return null;
  }
} 