import { NextResponse } from 'next/server';

// Define types for KV store to avoid 'any'
interface KVStore {
  get: (key: string) => Promise<CacheEntry | null>;
  set: (key: string, value: CacheEntry) => Promise<void>;
}

// Cache entry type
interface CacheEntry {
  data: ChampionMetaData;
  timestamp: number;
}

// Champion meta data types
interface ChampionMetaData {
  championId: string;
  winRate: string;
  pickRate: string;
  banRate: string;
  roleSpecificData: RoleSpecificData;
}

interface RoleSpecificData {
  runes: RuneData;
  build: BuildData;
  counters: CounterData[];
  skillOrder: SkillOrderData;
}

interface RuneData {
  primary: {
    name: string;
    keystone: string;
    row1: string;
    row2: string;
    row3: string;
  };
  secondary: {
    name: string;
    row1: string;
    row2: string;
  };
  shards: string[];
  winRate?: string;
}

interface BuildData {
  starter: ItemData[];
  core: ItemData[];
  situational: ItemData[];
  boots: BootData[];
}

interface ItemData {
  name: string;
  image: string;
  cost?: number;
  condition?: string;
  order?: number;
}

interface BootData {
  name: string;
  image: string;
  pickRate: string;
}

interface CounterData {
  name: string;
  winRate: string;
  image: string;
}

interface SkillOrderData {
  maxPriority: string[];
  order: { level: number; skill: string }[];
}

// Optional KV import
let kv: KVStore | null = null;

// Try to import KV at runtime with dynamic import
const initKV = async (): Promise<void> => {
  try {
    // Dynamic import of @vercel/kv
    const kvModule = await import('@vercel/kv').catch(() => null);
    if (kvModule) {
      kv = kvModule.kv as KVStore;
    }
  } catch {
    // Silence the error - we'll use memory cache
    console.log('Vercel KV not available, using in-memory cache');
  }
};

// Simple in-memory cache as fallback
const memoryCache: Record<string, CacheEntry> = {};

// Cache duration (24 hours in seconds)
const CACHE_DURATION = 86400;

// Helper function to determine if champion data is stale
function isDataStale(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_DURATION * 1000;
}

export async function GET(request: Request): Promise<NextResponse> {
  // Initialize KV if not already done
  if (kv === null) {
    await initKV();
  }

  const { searchParams } = new URL(request.url);
  const rawChampionId = searchParams.get('id');
  
  if (!rawChampionId) {
    return NextResponse.json(
      { error: 'Champion ID is required' },
      { status: 400 }
    );
  }
  
  // Normalize champion ID to handle case sensitivity
  const championId = normalizeChampionId(rawChampionId);
  console.log(`Processing champion request: ${rawChampionId} (normalized to: ${championId})`);
  
  try {
    // Check if we have cached data
    let cachedData: CacheEntry | null = null;
    
    if (kv) {
      // Try Vercel KV first
      try {
        cachedData = await kv.get(`champion-meta:${championId}`);
      } catch {
        console.log('KV store error, falling back to in-memory cache');
      }
    } else {
      // Use in-memory cache
      cachedData = memoryCache[`champion-meta:${championId}`] || null;
    }

    if (cachedData && !isDataStale(cachedData.timestamp)) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch data from the primary meta source
    const metaData = await fetchChampionMetaData(championId);
    
    // Store in cache
    const cacheEntry: CacheEntry = {
      data: metaData,
      timestamp: Date.now()
    };
    
    if (kv) {
      try {
        await kv.set(`champion-meta:${championId}`, cacheEntry);
      } catch {
        console.log('Failed to cache data in KV');
      }
    } 
    
    // Always update memory cache as fallback
    memoryCache[`champion-meta:${championId}`] = cacheEntry;

    return NextResponse.json(metaData);
  } catch (error) {
    console.error('Error fetching champion meta data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion data' },
      { status: 500 }
    );
  }
}

// This would be replaced with a real implementation
async function fetchChampionMetaData(championId: string): Promise<ChampionMetaData> {
  try {
    // Use a specific version instead of 'latest'
    const version = "14.8.1"; // Specify a known working version
    console.log(`Fetching data for champion: ${championId} with version ${version}`);
    
    // Get basic champion data to determine role
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${championId}.json`);
    
    // Check if response is ok before parsing
    if (!response.ok) {
      console.error(`Error fetching champion data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch champion data: ${response.status}`);
    }
    
    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      console.error("Failed to parse JSON response:", textData.substring(0, 100) + "...");
      throw new Error("Invalid JSON response from Data Dragon API");
    }
    
    if (!data.data || !data.data[championId]) {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from Data Dragon API");
    }
    
    const champion = data.data[championId];
    const tags = champion.tags || [];
    const role = determineChampionRole(tags, championId);
    console.log(`Champion ${championId} has role: ${role}`);
    
    // Generate champion-specific metadata
    const winRate = (45 + Math.random() * 10).toFixed(1) + '%';
    const pickRate = (2 + Math.random() * 20).toFixed(1) + '%';
    const banRate = (1 + Math.random() * 10).toFixed(1) + '%';
    
    // Get champion-specific builds, counters, and skill orders
    const roleSpecificData = {
      runes: generateChampionSpecificRunes(championId, role, version),
      build: generateChampionSpecificBuilds(championId, role, version),
      counters: generateChampionCounters(championId, role, version),
      skillOrder: generateChampionSkillOrder(championId, champion.spells)
    };
    
    return {
      championId,
      winRate,
      pickRate,
      banRate,
      roleSpecificData
    };
  } catch (error) {
    console.error(`Error processing champion ${championId}:`, error);
    // Return a default fallback data to prevent page crashes
    return {
      championId,
      winRate: "50.0%",
      pickRate: "10.0%",
      banRate: "5.0%",
      roleSpecificData: getRoleBasedMetaData("Fighter", "14.8.1") // Default to Fighter build as fallback
    };
  }
}

// Helper function to determine the most appropriate role for a champion
function determineChampionRole(tags: string[], championId: string): string {
  // Champion-specific role overrides
  const roleOverrides: Record<string, string> = {
    'Yasuo': 'Fighter',
    'Yone': 'Fighter',
    'Graves': 'Marksman',
    'Thresh': 'Support',
    'Teemo': 'Marksman',
    'Gnar': 'Fighter',
    'Urgot': 'Fighter',
    'Shyvana': 'Fighter',
    'Kayle': 'Fighter',
    'Jayce': 'Fighter'
  };

  // Check for override
  if (roleOverrides[championId]) {
    return roleOverrides[championId];
  }

  // Default to first tag
  return tags[0] || 'Fighter';
}

// Function to generate champion-specific runes
function generateChampionSpecificRunes(championId: string, role: string, version: string): RuneData {
  // Champion-specific rune overrides
  const runeOverrides: Record<string, RuneData> = {
    'Yasuo': {
      primary: {
        name: 'Precision',
        keystone: 'Lethal Tempo',
        row1: 'Triumph',
        row2: 'Legend: Alacrity',
        row3: 'Last Stand'
      },
      secondary: {
        name: 'Domination',
        row1: 'Taste of Blood',
        row2: 'Treasure Hunter'
      },
      shards: ['Adaptive', 'Adaptive', 'Armor'],
      winRate: '52.3%'
    },
    'Darius': {
      primary: {
        name: 'Precision',
        keystone: 'Conqueror',
        row1: 'Triumph',
        row2: 'Legend: Tenacity',
        row3: 'Last Stand'
      },
      secondary: {
        name: 'Resolve',
        row1: 'Bone Plating',
        row2: 'Unflinching'
      },
      shards: ['Adaptive', 'Adaptive', 'Armor'],
      winRate: '54.1%'
    },
    'Zed': {
      primary: {
        name: 'Domination',
        keystone: 'Electrocute',
        row1: 'Sudden Impact',
        row2: 'Eyeball Collection',
        row3: 'Ultimate Hunter'
      },
      secondary: {
        name: 'Precision',
        row1: 'Presence of Mind',
        row2: 'Coup de Grace'
      },
      shards: ['Adaptive', 'Adaptive', 'Armor'],
      winRate: '53.7%'
    }
    // Add more champion-specific runes as needed
  };

  // Check for override
  if (runeOverrides[championId]) {
    return runeOverrides[championId];
  }

  // Get base runes from role-based data
  const roleBased = getRoleBasedMetaData(role, version);
  return roleBased.runes;
}

// Function to generate champion-specific builds
function generateChampionSpecificBuilds(championId: string, role: string, version: string): BuildData {
  // Champion-specific build overrides
  const buildOverrides: Record<string, BuildData> = {
    'Yasuo': {
      starter: [
        { name: "Doran's Blade", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1055.png`, cost: 450 },
        { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
      ],
      core: [
        { name: "Immortal Shieldbow", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6673.png`, cost: 3400, order: 1 },
        { name: "Infinity Edge", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3031.png`, cost: 3400, order: 2 },
        { name: "Bloodthirster", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3072.png`, cost: 3400, order: 3 }
      ],
      situational: [
        { name: "Guardian Angel", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3026.png`, condition: "Safety", cost: 2800 },
        { name: "Death's Dance", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6333.png`, condition: "vs AD", cost: 3300 },
        { name: "Spirit Visage", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3065.png`, condition: "vs AP", cost: 2900 }
      ],
      boots: [
        { name: "Berserker's Greaves", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3006.png`, pickRate: "85.2%" },
        { name: "Mercury's Treads", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3111.png`, pickRate: "14.8%" }
      ]
    },
    'Darius': {
      starter: [
        { name: "Doran's Blade", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1055.png`, cost: 450 },
        { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
      ],
      core: [
        { name: "Stridebreaker", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6631.png`, cost: 3300, order: 1 },
        { name: "Dead Man's Plate", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3742.png`, cost: 2900, order: 2 },
        { name: "Sterak's Gage", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3053.png`, cost: 3100, order: 3 }
      ],
      situational: [
        { name: "Force of Nature", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/4401.png`, condition: "vs AP", cost: 2900 },
        { name: "Thornmail", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3075.png`, condition: "vs Healing", cost: 2700 },
        { name: "Death's Dance", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6333.png`, condition: "vs AD", cost: 3300 }
      ],
      boots: [
        { name: "Plated Steelcaps", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3047.png`, pickRate: "65.3%" },
        { name: "Mercury's Treads", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3111.png`, pickRate: "34.7%" }
      ]
    },
    'Zed': {
      starter: [
        { name: "Long Sword", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1036.png`, cost: 350 },
        { name: "Refillable Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2031.png`, cost: 150 }
      ],
      core: [
        { name: "Duskblade of Draktharr", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6691.png`, cost: 3100, order: 1 },
        { name: "Youmuu's Ghostblade", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3142.png`, cost: 2900, order: 2 },
        { name: "Edge of Night", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3814.png`, cost: 2900, order: 3 }
      ],
      situational: [
        { name: "Serylda's Grudge", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6694.png`, condition: "vs Armor", cost: 3200 },
        { name: "Black Cleaver", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3071.png`, condition: "vs Tanks", cost: 3100 },
        { name: "Guardian Angel", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3026.png`, condition: "Safety", cost: 2800 }
      ],
      boots: [
        { name: "Ionian Boots of Lucidity", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3158.png`, pickRate: "70.1%" },
        { name: "Mobility Boots", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3117.png`, pickRate: "29.9%" }
      ]
    }
    // Add more champion-specific builds as needed
  };

  // Check for override
  if (buildOverrides[championId]) {
    return buildOverrides[championId];
  }

  // Get base build from role-based data
  const roleBased = getRoleBasedMetaData(role, version);
  return roleBased.build;
}

// Function to generate champion-specific counters
function generateChampionCounters(championId: string, role: string, version: string): CounterData[] {
  // Champion-specific counter overrides
  const counterOverrides: Record<string, CounterData[]> = {
    'Yasuo': [
      { name: 'Malphite', winRate: '58.2%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Malphite.png` },
      { name: 'Pantheon', winRate: '56.9%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Pantheon.png` },
      { name: 'Renekton', winRate: '55.3%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Renekton.png` }
    ],
    'Darius': [
      { name: 'Quinn', winRate: '56.8%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Quinn.png` },
      { name: 'Vayne', winRate: '55.4%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Vayne.png` },
      { name: 'Kayle', winRate: '54.1%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Kayle.png` }
    ],
    'Zed': [
      { name: 'Lissandra', winRate: '57.3%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Lissandra.png` },
      { name: 'Malphite', winRate: '56.1%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Malphite.png` },
      { name: 'Diana', winRate: '54.8%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Diana.png` }
    ]
    // Add more champion-specific counters as needed
  };

  // Check for override
  if (counterOverrides[championId]) {
    return counterOverrides[championId];
  }

  // Get base counters from role-based data
  const roleBased = getRoleBasedMetaData(role, version);
  return roleBased.counters;
}

// Function to generate champion-specific skill orders
function generateChampionSkillOrder(championId: string, spells: any[]): SkillOrderData {
  // Champion-specific skill order overrides
  const skillOrderOverrides: Record<string, SkillOrderData> = {
    'Yasuo': {
      maxPriority: ['Q', 'E', 'W'],
      order: [
        { level: 1, skill: 'Q' },
        { level: 2, skill: 'E' },
        { level: 3, skill: 'W' },
        { level: 4, skill: 'Q' },
        { level: 5, skill: 'Q' },
        { level: 6, skill: 'R' },
        { level: 7, skill: 'Q' },
        { level: 8, skill: 'E' },
        { level: 9, skill: 'Q' },
        { level: 10, skill: 'E' },
        { level: 11, skill: 'R' },
        { level: 12, skill: 'E' },
        { level: 13, skill: 'E' },
        { level: 14, skill: 'W' },
        { level: 15, skill: 'W' },
        { level: 16, skill: 'R' },
        { level: 17, skill: 'W' },
        { level: 18, skill: 'W' }
      ]
    },
    'Darius': {
      maxPriority: ['Q', 'W', 'E'],
      order: [
        { level: 1, skill: 'Q' },
        { level: 2, skill: 'W' },
        { level: 3, skill: 'E' },
        { level: 4, skill: 'Q' },
        { level: 5, skill: 'Q' },
        { level: 6, skill: 'R' },
        { level: 7, skill: 'Q' },
        { level: 8, skill: 'W' },
        { level: 9, skill: 'Q' },
        { level: 10, skill: 'W' },
        { level: 11, skill: 'R' },
        { level: 12, skill: 'W' },
        { level: 13, skill: 'W' },
        { level: 14, skill: 'E' },
        { level: 15, skill: 'E' },
        { level: 16, skill: 'R' },
        { level: 17, skill: 'E' },
        { level: 18, skill: 'E' }
      ]
    },
    'Zed': {
      maxPriority: ['Q', 'E', 'W'],
      order: [
        { level: 1, skill: 'Q' },
        { level: 2, skill: 'W' },
        { level: 3, skill: 'E' },
        { level: 4, skill: 'Q' },
        { level: 5, skill: 'Q' },
        { level: 6, skill: 'R' },
        { level: 7, skill: 'Q' },
        { level: 8, skill: 'E' },
        { level: 9, skill: 'Q' },
        { level: 10, skill: 'E' },
        { level: 11, skill: 'R' },
        { level: 12, skill: 'E' },
        { level: 13, skill: 'E' },
        { level: 14, skill: 'W' },
        { level: 15, skill: 'W' },
        { level: 16, skill: 'R' },
        { level: 17, skill: 'W' },
        { level: 18, skill: 'W' }
      ]
    }
    // Add more champion-specific skill orders as needed
  };

  // Check for override
  if (skillOrderOverrides[championId]) {
    return skillOrderOverrides[championId];
  }

  // Default skill order based on champion role
  return {
    maxPriority: ['Q', 'W', 'E'],
    order: [
      { level: 1, skill: 'Q' },
      { level: 2, skill: 'W' },
      { level: 3, skill: 'E' },
      { level: 4, skill: 'Q' },
      { level: 5, skill: 'Q' },
      { level: 6, skill: 'R' },
      { level: 7, skill: 'Q' },
      { level: 8, skill: 'W' },
      { level: 9, skill: 'Q' },
      { level: 10, skill: 'W' },
      { level: 11, skill: 'R' },
      { level: 12, skill: 'W' },
      { level: 13, skill: 'W' },
      { level: 14, skill: 'E' },
      { level: 15, skill: 'E' },
      { level: 16, skill: 'R' },
      { level: 17, skill: 'E' },
      { level: 18, skill: 'E' }
    ]
  };
}

// Helper function to normalize champion IDs
function normalizeChampionId(championId: string): string {
  // Special case mappings for champions with unusual capitalization
  const specialCases: Record<string, string> = {
    'khazix': 'Khazix', 
    'chogath': 'Chogath',
    'drmundo': 'DrMundo',
    'velkoz': 'Velkoz',
    'kogmaw': 'KogMaw',
    'reksai': 'RekSai',
    'tahmkench': 'TahmKench',
    'aurelionsol': 'AurelionSol',
    'leesin': 'LeeSin',
    'masteryi': 'MasterYi',
    'missfortune': 'MissFortune',
    'twistedfate': 'TwistedFate',
    'xinzhao': 'XinZhao',
    'jarvaniv': 'JarvanIV',
    'wukong': 'MonkeyKing' // Special case: Wukong is called MonkeyKing in the API
  };

  // Convert to lowercase for comparison
  const lowercasedId = championId.toLowerCase();
  
  // Check for special cases
  if (specialCases[lowercasedId]) {
    return specialCases[lowercasedId];
  }
  
  // Standard case: Capitalize first letter
  return championId.charAt(0).toUpperCase() + championId.slice(1);
} 

