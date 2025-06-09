import axios from 'axios';

// Get the base URL from environment or default to current origin
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  }
  // Client-side
  return window.location.origin;
};

export interface ChampionDetails {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  skins: Array<{
    id: string;
    num: number;
    name: string;
    chromas: boolean;
  }>;
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
  };
  spells: Array<{
    id: string;
    name: string;
    description: string;
    tooltip: string;
    maxrank: number;
    cooldown: number[];
    cost: number[];
    range: number[];
    image: {
      full: string;
      sprite: string;
      group: string;
    };
  }>;
  passive: {
    name: string;
    description: string;
    image: {
      full: string;
      sprite: string;
      group: string;
    };
  };
  imageURLs: {
    splash: string;
    loading: string;
    square: string;
    passive: string;
    spells: string[];
  };
  version: string;
}

export interface ChampionStats {
  rank: string;
  region: string;
  role: string;
  stats: {
    [championId: string]: {
      games: number;
      wins: number;
      kda: {
        kills: number;
        deaths: number;
        assists: number;
      };
      winRate: number;
      pickRate: number;
      banRate: number;
      tier: string;
    };
  };
}

export async function getChampionDetails(championId: string): Promise<ChampionDetails> {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/champion-details?id=${championId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch champion details:', error);
    throw error;
  }
}

export async function getChampionStats(
  championId: string,
  options: { rank?: string; region?: string; role?: string } = {}
): Promise<ChampionStats> {
  try {
    const baseUrl = getBaseUrl();
    const { rank = 'PLATINUM', region = 'global', role = 'all' } = options;
    const params = new URLSearchParams({
      rank,
      region,
      role,
    });
    const response = await axios.get(`${baseUrl}/api/champion-stats?${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch champion stats:', error);
    throw error;
  }
}

export async function getChampionMeta(championId: string): Promise<any> {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/champion-meta?id=${championId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch champion meta:', error);
    throw error;
  }
} 