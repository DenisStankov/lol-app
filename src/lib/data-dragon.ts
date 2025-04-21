/**
 * Utility functions for Riot's Data Dragon API
 * Data Dragon is Riot's static data CDN that hosts game assets and data
 */

import axios from 'axios';

// Cache for recently fetched data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const dataCache: Record<string, CacheEntry<unknown>> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Data Dragon interfaces
export interface DataDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  lore: string;
  blurb: string;
  tags: string[];
  stats: Record<string, number>;
  passive: {
    name: string;
    description: string;
    image: {
      full: string;
    };
  };
  spells: Array<{
    id: string;
    name: string;
    description: string;
    tooltip: string;
    image: {
      full: string;
    };
  }>;
}

export interface DataDragonItemData {
  name: string;
  description: string;
  gold: {
    total: number;
  };
  image: {
    full: string;
  };
}

export interface DataDragonRunePath {
  id: number;
  key: string;
  name: string;
  slots: Array<{
    runes: Array<{
      id: number;
      key: string;
      name: string;
      icon: string;
    }>;
  }>;
}

/**
 * Fetches the current patch version
 */
export async function getCurrentPatch(): Promise<string> {
  try {
    // Check cache first
    const cachedVersions = dataCache['versions'] as CacheEntry<string[]> | undefined;
    if (cachedVersions && Date.now() - cachedVersions.timestamp < CACHE_DURATION) {
      return cachedVersions.data[0];
    }
    
    const response = await axios.get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json');
    dataCache['versions'] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data[0];
  } catch (error) {
    console.error("Error fetching current patch:", error);
    return '14.16.1'; // Fallback to a recent patch
  }
}

/**
 * Fetches champion data for all champions
 */
export async function getChampionsList(patch: string): Promise<Record<string, DataDragonChampion>> {
  try {
    const cacheKey = `champions-${patch}`;
    const cachedChampions = dataCache[cacheKey] as CacheEntry<Record<string, DataDragonChampion>> | undefined;
    if (cachedChampions && Date.now() - cachedChampions.timestamp < CACHE_DURATION) {
      return cachedChampions.data;
    }
    
    const response = await axios.get<{ data: Record<string, DataDragonChampion> }>(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`);
    dataCache[cacheKey] = {
      data: response.data.data,
      timestamp: Date.now()
    };
    
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching champion list for patch ${patch}:`, error);
    throw new Error(`Failed to fetch champion list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches detailed data for a specific champion
 */
export async function getChampionDetails(champId: string, patch: string): Promise<DataDragonChampion> {
  try {
    const cacheKey = `champion-${champId}-${patch}`;
    const cachedChampion = dataCache[cacheKey] as CacheEntry<DataDragonChampion> | undefined;
    if (cachedChampion && Date.now() - cachedChampion.timestamp < CACHE_DURATION) {
      return cachedChampion.data;
    }
    
    const response = await axios.get<{ data: Record<string, DataDragonChampion> }>(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champId}.json`);
    
    if (!response.data.data || !response.data.data[champId]) {
      throw new Error(`Invalid response format for champion ${champId}`);
    }
    
    dataCache[cacheKey] = {
      data: response.data.data[champId],
      timestamp: Date.now()
    };
    
    return response.data.data[champId];
  } catch (error) {
    console.error(`Error fetching champion details for ${champId}:`, error);
    throw new Error(`Failed to fetch champion details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches item data for the current patch
 */
export async function getItemsData(patch: string): Promise<Record<string, DataDragonItemData>> {
  try {
    const cacheKey = `items-${patch}`;
    const cachedItems = dataCache[cacheKey] as CacheEntry<Record<string, DataDragonItemData>> | undefined;
    if (cachedItems && Date.now() - cachedItems.timestamp < CACHE_DURATION) {
      return cachedItems.data;
    }
    
    const response = await axios.get<{ data: Record<string, DataDragonItemData> }>(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/item.json`);
    dataCache[cacheKey] = {
      data: response.data.data,
      timestamp: Date.now()
    };
    
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching items data for patch ${patch}:`, error);
    throw new Error(`Failed to fetch items data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches rune data for the current patch
 */
export async function getRunesData(patch: string): Promise<DataDragonRunePath[]> {
  try {
    const cacheKey = `runes-${patch}`;
    const cachedRunes = dataCache[cacheKey] as CacheEntry<DataDragonRunePath[]> | undefined;
    if (cachedRunes && Date.now() - cachedRunes.timestamp < CACHE_DURATION) {
      return cachedRunes.data;
    }
    
    const response = await axios.get<DataDragonRunePath[]>(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`);
    dataCache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    
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
      (champ) => champ.id.toLowerCase() === champId.toLowerCase()
    );
    
    if (championEntry) {
      return championEntry.key;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting numeric key for ${champId}:`, error);
    return null;
  }
} 