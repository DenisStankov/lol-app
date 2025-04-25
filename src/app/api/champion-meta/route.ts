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
    console.log(`Champion ${championId} has tags:`, tags);
    
    // Based on the champion's primary role, return appropriate data
    const roleSpecificData = getRoleBasedMetaData(tags[0], version);
    
    return {
      championId,
      winRate: (45 + Math.random() * 10).toFixed(1) + '%', // Simulated win rate
      pickRate: (2 + Math.random() * 20).toFixed(1) + '%', // Simulated pick rate
      banRate: (1 + Math.random() * 10).toFixed(1) + '%', // Simulated ban rate
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

// Get appropriate meta data based on champion role
function getRoleBasedMetaData(role: string, version: string): RoleSpecificData {
  switch(role) {
    case 'Marksman':
      return {
        runes: {
          primary: {
            name: 'Precision',
            keystone: 'Lethal Tempo',
            row1: 'Triumph',
            row2: 'Legend: Alacrity',
            row3: 'Coup de Grace'
          },
          secondary: {
            name: 'Domination',
            row1: 'Taste of Blood',
            row2: 'Treasure Hunter'
          },
          shards: ['Adaptive', 'Adaptive', 'Armor']
        },
        build: {
          starter: [
            { name: "Doran's Blade", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1055.png`, cost: 450 },
            { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
          ],
          core: [
            { name: "Kraken Slayer", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6672.png`, cost: 3400, order: 1 },
            { name: "Runaan's Hurricane", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3085.png`, cost: 2600, order: 2 },
            { name: "Infinity Edge", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3031.png`, cost: 3400, order: 3 }
          ],
          situational: [
            { name: "Bloodthirster", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3072.png`, condition: "vs Burst", cost: 3400 },
            { name: "Lord Dominik's", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3036.png`, condition: "vs Tanks", cost: 3000 },
            { name: "Guardian Angel", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3026.png`, condition: "Safety", cost: 2800 }
          ],
          boots: [
            { name: "Berserker's Greaves", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3006.png`, pickRate: "89.7%" }
          ]
        },
        counters: [
          { name: 'Draven', winRate: '54.8%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Draven.png` },
          { name: 'Samira', winRate: '53.2%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Samira.png` },
          { name: 'Lucian', winRate: '52.6%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Lucian.png` }
        ],
        skillOrder: {
          maxPriority: ['Q', 'W', 'E'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'W' },
            { level: 3, skill: 'E' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    case 'Fighter':
    case 'Juggernaut':
      return {
        runes: {
          primary: {
            name: 'Precision',
            keystone: 'Conqueror',
            row1: 'Triumph',
            row2: 'Legend: Tenacity',
            row3: 'Last Stand'
          },
          secondary: {
            name: 'Resolve',
            row1: 'Second Wind',
            row2: 'Unflinching'
          },
          shards: ['Adaptive', 'Adaptive', 'Armor']
        },
        build: {
          starter: [
            { name: "Doran's Blade", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1055.png`, cost: 450 },
            { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
          ],
          core: [
            { name: "Divine Sunderer", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6632.png`, cost: 3300, order: 1 },
            { name: "Death's Dance", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6333.png`, cost: 3300, order: 2 },
            { name: "Sterak's Gage", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3053.png`, cost: 3100, order: 3 }
          ],
          situational: [
            { name: "Thornmail", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3075.png`, condition: "vs AD", cost: 2700 },
            { name: "Force of Nature", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/4401.png`, condition: "vs AP", cost: 2900 },
            { name: "Black Cleaver", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3071.png`, condition: "vs Tanks", cost: 3100 }
          ],
          boots: [
            { name: "Plated Steelcaps", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3047.png`, pickRate: "65.7%" }
          ]
        },
        counters: [
          { name: 'Darius', winRate: '54.3%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Darius.png` },
          { name: 'Jax', winRate: '53.7%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Jax.png` },
          { name: 'Mordekaiser', winRate: '52.1%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Mordekaiser.png` }
        ],
        skillOrder: {
          maxPriority: ['Q', 'E', 'W'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'E' },
            { level: 3, skill: 'W' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    case 'Mage':
      return {
        runes: {
          primary: {
            name: 'Sorcery',
            keystone: 'Arcane Comet',
            row1: 'Manaflow Band',
            row2: 'Transcendence',
            row3: 'Scorch'
          },
          secondary: {
            name: 'Inspiration',
            row1: 'Biscuit Delivery',
            row2: 'Cosmic Insight'
          },
          shards: ['Adaptive', 'Adaptive', 'Magic Resist'],
          winRate: '55.2%'
        },
        build: {
          starter: [
            { name: "Doran's Ring", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1056.png`, cost: 400 },
            { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
          ],
          core: [
            { name: "Luden's Echo", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/6655.png`, cost: 3400, order: 1 },
            { name: "Shadowflame", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/4645.png`, cost: 3000, order: 2 },
            { name: "Rabadon's Deathcap", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3089.png`, cost: 3600, order: 3 }
          ],
          situational: [
            { name: "Zhonya's Hourglass", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3157.png`, condition: "vs AD", cost: 2600 },
            { name: "Banshee's Veil", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3102.png`, condition: "vs AP", cost: 2600 },
            { name: "Void Staff", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3135.png`, condition: "vs MR", cost: 2800 }
          ],
          boots: [
            { name: "Sorcerer's Shoes", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3020.png`, pickRate: "87.3%" }
          ]
        },
        counters: [
          { name: 'Zed', winRate: '55.2%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Zed.png` },
          { name: 'Fizz', winRate: '54.1%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Fizz.png` },
          { name: 'Kassadin', winRate: '53.6%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Kassadin.png` }
        ],
        skillOrder: {
          maxPriority: ['Q', 'W', 'E'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'W' },
            { level: 3, skill: 'E' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    case 'Assassin':
      return {
        runes: {
          primary: {
            name: 'Domination',
            keystone: 'Electrocute',
            row1: 'Sudden Impact',
            row2: 'Eyeball Collection',
            row3: 'Relentless Hunter'
          },
          secondary: {
            name: 'Precision',
            row1: 'Presence of Mind',
            row2: 'Coup de Grace'
          },
          shards: ['Adaptive', 'Adaptive', 'Armor']
        },
        build: {
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
            { name: "Guardian Angel", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3026.png`, condition: "Safety", cost: 2800 },
            { name: "Maw of Malmortius", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3156.png`, condition: "vs AP", cost: 2900 }
          ],
          boots: [
            { name: "Ionian Boots of Lucidity", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3158.png`, pickRate: "56.7%" }
          ]
        },
        counters: [
          { name: 'Malphite', winRate: '55.8%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Malphite.png` },
          { name: 'Diana', winRate: '54.3%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Diana.png` },
          { name: 'Lissandra', winRate: '53.9%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Lissandra.png` }
        ],
        skillOrder: {
          maxPriority: ['Q', 'W', 'E'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'W' },
            { level: 3, skill: 'E' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    case 'Tank':
      return {
        runes: {
          primary: {
            name: 'Resolve',
            keystone: 'Aftershock',
            row1: 'Font of Life',
            row2: 'Conditioning',
            row3: 'Overgrowth'
          },
          secondary: {
            name: 'Inspiration',
            row1: 'Biscuit Delivery',
            row2: 'Approach Velocity'
          },
          shards: ['Adaptive', 'Armor', 'Health']
        },
        build: {
          starter: [
            { name: "Doran's Shield", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/1054.png`, cost: 450 },
            { name: "Health Potion", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/2003.png`, cost: 50 }
          ],
          core: [
            { name: "Sunfire Aegis", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3068.png`, cost: 3200, order: 1 },
            { name: "Thornmail", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3075.png`, cost: 2700, order: 2 },
            { name: "Warmog's Armor", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3083.png`, cost: 3000, order: 3 }
          ],
          situational: [
            { name: "Force of Nature", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/4401.png`, condition: "vs AP", cost: 2900 },
            { name: "Randuin's Omen", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3143.png`, condition: "vs Crit", cost: 3000 },
            { name: "Gargoyle Stoneplate", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3193.png`, condition: "Teamfights", cost: 3200 }
          ],
          boots: [
            { name: "Plated Steelcaps", image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/3047.png`, pickRate: "68.3%" }
          ]
        },
        counters: [
          { name: 'Fiora', winRate: '56.2%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Fiora.png` },
          { name: 'Vayne', winRate: '55.7%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Vayne.png` },
          { name: 'Darius', winRate: '54.1%', image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/Darius.png` }
        ],
        skillOrder: {
          maxPriority: ['Q', 'E', 'W'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'E' },
            { level: 3, skill: 'W' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    case 'Support':
      return {
        runes: {
          primary: {
            name: 'Resolve',
            keystone: 'Guardian',
            row1: 'Font of Life',
            row2: 'Bone Plating',
            row3: 'Revitalize'
          },
          secondary: {
            name: 'Inspiration',
            row1: 'Magical Footwear',
            row2: 'Cosmic Insight'
          },
          shards: ['Adaptive', 'Armor', 'Health']
        },
        build: {
          starter: [
            { name: "Relic Shield", image: "3858.png", cost: 400 },
            { name: "Health Potion", image: "2003.png", cost: 50 }
          ],
          core: [
            { name: "Locket of the Iron Solari", image: "3190.png", cost: 2500 },
            { name: "Redemption", image: "3107.png", cost: 2300 },
            { name: "Knight's Vow", image: "3109.png", cost: 2300 }
          ],
          situational: [
            { name: "Mikael's Blessing", image: "3222.png", condition: "vs CC", cost: 2300 },
            { name: "Ardent Censer", image: "3504.png", condition: "with ADC", cost: 2300 },
            { name: "Chemtech Putrifier", image: "3011.png", condition: "vs Healing", cost: 2300 }
          ],
          boots: [
            { name: "Mobility Boots", image: "3117.png", pickRate: "58.3%" }
          ]
        },
        counters: [
          { name: 'Pyke', winRate: '54.7%', image: 'Pyke.png' },
          { name: 'Brand', winRate: '53.9%', image: 'Brand.png' },
          { name: 'Zyra', winRate: '52.8%', image: 'Zyra.png' }
        ],
        skillOrder: {
          maxPriority: ['Q', 'E', 'W'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'E' },
            { level: 3, skill: 'W' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
    default:
      // Default to a generic build if role is unknown
      return {
        runes: {
          primary: {
            name: 'Precision',
            keystone: 'Conqueror',
            row1: 'Triumph',
            row2: 'Legend: Alacrity',
            row3: 'Coup de Grace'
          },
          secondary: {
            name: 'Domination',
            row1: 'Taste of Blood',
            row2: 'Ravenous Hunter'
          },
          shards: ['Adaptive', 'Adaptive', 'Armor']
        },
        build: {
          starter: [
            { name: "Doran's Blade", image: "1055.png", cost: 450 },
            { name: "Health Potion", image: "2003.png", cost: 50 }
          ],
          core: [
            { name: "Goredrinker", image: "6630.png", cost: 3300 },
            { name: "Sterak's Gage", image: "3053.png", cost: 3100 },
            { name: "Black Cleaver", image: "3071.png", cost: 3100 }
          ],
          situational: [
            { name: "Death's Dance", image: "6333.png", condition: "vs AD", cost: 3300 },
            { name: "Maw of Malmortius", image: "3156.png", condition: "vs AP", cost: 2900 },
            { name: "Guardian Angel", image: "3026.png", condition: "Safety", cost: 2800 }
          ],
          boots: [
            { name: "Mercury's Treads", image: "3111.png", pickRate: "52.3%" }
          ]
        },
        counters: [
          { name: 'Teemo', winRate: '53.8%', image: 'Teemo.png' },
          { name: 'Jayce', winRate: '52.9%', image: 'Jayce.png' },
          { name: 'Quinn', winRate: '52.1%', image: 'Quinn.png' }
        ],
        skillOrder: {
          maxPriority: ['Q', 'E', 'W'],
          order: [
            { level: 1, skill: 'Q' },
            { level: 2, skill: 'E' },
            { level: 3, skill: 'W' },
            { level: 4, skill: 'Q' },
            { level: 5, skill: 'Q' },
            { level: 6, skill: 'R' }
            // Additional levels would be included in a real implementation
          ]
        }
      };
  }
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