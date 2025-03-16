import { NextResponse } from 'next/server';
import axios from 'axios';

// Constants
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Type definitions
interface ChampionAbility {
  id: string;
  name: string;
  description: string;
  image: string;
  cooldown: number[];
  cost: number[];
  range: number[];
  key: string; // Q, W, E, R, or P for passive
}

interface ItemBuild {
  id: string;
  name: string;
  description: string;
  image: string;
  gold: number;
  winRate: number;
  pickRate: number;
}

interface RuneBuild {
  primaryPath: {
    id: string;
    name: string;
    image: string;
    runes: {
      id: string;
      name: string;
      image: string;
      winRate: number;
      pickRate: number;
    }[];
  };
  secondaryPath: {
    id: string;
    name: string;
    image: string;
    runes: {
      id: string;
      name: string;
      image: string;
      winRate: number;
      pickRate: number;
    }[];
  };
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
  winRate: number;
  pickRate: number;
}

interface CounterChampion {
  id: string;
  name: string;
  image: string;
  winRate: number;
  role: string;
}

interface ChampionDetails {
  id: string;
  name: string;
  title: string;
  lore: string;
  image: string;
  splash: string;
  loading: string;
  role: string;
  damageType: 'AP' | 'AD' | 'Hybrid';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  range: 'Melee' | 'Ranged';
  winRate: number;
  pickRate: number;
  banRate: number;
  abilities: ChampionAbility[];
  itemBuilds: {
    startingItems: ItemBuild[];
    coreItems: ItemBuild[];
    boots: ItemBuild[];
    situationalItems: ItemBuild[];
  };
  runeBuilds: RuneBuild[];
  counters: CounterChampion[];
  synergies?: CounterChampion[]; // Only for ADC/Support
  skillOrder: string[];
  tips: {
    allies: string[];
    enemies: string[];
  };
}

// Data Dragon types
interface DDragonPassiveImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DDragonPassive {
  name: string;
  description: string;
  image: DDragonPassiveImage;
}

interface DDragonSpellImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DDragonSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  cooldown: number[];
  cost: number[];
  range: number[];
  image: DDragonSpellImage;
}

interface DDragonChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DDragonChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

interface DDragonChampionStats {
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
}

interface DDragonChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: DDragonChampionImage;
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: DDragonChampionInfo;
  stats: DDragonChampionStats;
  spells: DDragonSpell[];
  passive: DDragonPassive;
}

// Cache for storing champion details data
type ChampionDetailsCache = {
  [id: string]: {
    [role: string]: {
      data: ChampionDetails;
      timestamp: number;
    }
  }
};

const championDetailsCache: ChampionDetailsCache = {};

async function fetchCurrentPatch(): Promise<string> {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data[0]; // Return the latest patch version
  } catch (error) {
    console.error('Error fetching current patch:', error);
    return '14.5.1'; // Fallback version
  }
}

async function fetchChampionData(champId: string, patch: string): Promise<DDragonChampionData> {
  try {
    // Fetch basic champion data
    const champResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champId}.json`
    );
    
    return champResponse.data.data[champId];
  } catch (error) {
    console.error(`Error fetching champion data for ${champId}:`, error);
    throw new Error(`Failed to fetch champion data for ${champId}`);
  }
}

function getDamageType(tags: string[], info: DDragonChampionInfo): 'AP' | 'AD' | 'Hybrid' {
  // Logic to determine damage type based on champion tags and info
  if (tags.includes('Mage') || tags.includes('Assassin') && info.magic > info.attack) {
    return 'AP';
  } else if (info.magic > 7 && info.attack > 5) {
    return 'Hybrid';
  } else {
    return 'AD';
  }
}

function getDifficulty(info: DDragonChampionInfo): 'Easy' | 'Medium' | 'Hard' {
  const difficultyValue = info.difficulty;
  if (difficultyValue <= 3) return 'Easy';
  if (difficultyValue <= 7) return 'Medium';
  return 'Hard';
}

function getRange(attackRange: number): 'Melee' | 'Ranged' {
  return attackRange <= 175 ? 'Melee' : 'Ranged';
}

// Transform champion data from Data Dragon format to our ChampionDetails format
async function transformChampionData(champData: DDragonChampionData, role: string, patch: string): Promise<ChampionDetails> {
  // Extract abilities
  const passive = {
    id: 'passive',
    name: champData.passive.name,
    description: champData.passive.description,
    image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/passive/${champData.passive.image.full}`,
    cooldown: [0],
    cost: [0],
    range: [0],
    key: 'P'
  };
  
  const abilities = champData.spells.map((spell, index) => ({
    id: spell.id,
    name: spell.name,
    description: spell.description,
    image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${spell.image.full}`,
    cooldown: spell.cooldown,
    cost: spell.cost,
    range: spell.range,
    key: ['Q', 'W', 'E', 'R'][index]
  }));
  
  // Mock data for items, runes, counters, etc.
  // In a real application, you would fetch this data from a database or another API
  const mockItemBuilds = {
    startingItems: [
      {
        id: "1055",
        name: "Doran's Blade",
        description: "Good starting item for AD champions",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/1055.png`,
        gold: 450,
        winRate: 52.3,
        pickRate: 65.7
      },
      {
        id: "2003",
        name: "Health Potion",
        description: "Consume to restore health over time",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/2003.png`,
        gold: 50,
        winRate: 51.8,
        pickRate: 83.2
      }
    ],
    coreItems: [
      {
        id: "3031",
        name: "Infinity Edge",
        description: "Massively increases critical strike damage",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3031.png`,
        gold: 3400,
        winRate: 54.1,
        pickRate: 87.3
      },
      {
        id: "3085",
        name: "Runaan's Hurricane",
        description: "Ranged attacks fire bolts at nearby targets",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3085.png`,
        gold: 2600,
        winRate: 53.6,
        pickRate: 75.8
      },
      {
        id: "3094",
        name: "Rapid Firecannon",
        description: "Attack charges up to deal bonus damage",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3094.png`,
        gold: 2500,
        winRate: 52.9,
        pickRate: 68.4
      }
    ],
    boots: [
      {
        id: "3006",
        name: "Berserker's Greaves",
        description: "Enhances movement and attack speed",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3006.png`,
        gold: 1100,
        winRate: 53.2,
        pickRate: 91.7
      }
    ],
    situationalItems: [
      {
        id: "3036",
        name: "Lord Dominik's Regards",
        description: "Deals bonus damage to high-health enemies",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3036.png`,
        gold: 3000,
        winRate: 51.5,
        pickRate: 45.3
      },
      {
        id: "3139",
        name: "Mercurial Scimitar",
        description: "Activate to remove all crowd control effects",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3139.png`,
        gold: 3000,
        winRate: 50.8,
        pickRate: 12.6
      },
      {
        id: "3095",
        name: "Stormrazor",
        description: "First attack slows the target",
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/3095.png`,
        gold: 2700,
        winRate: 52.1,
        pickRate: 38.9
      }
    ]
  };
  
  const mockRuneBuilds = [
    {
      primaryPath: {
        id: "8000",
        name: "Precision",
        image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png`,
        runes: [
          {
            id: "8008",
            name: "Lethal Tempo",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png`,
            winRate: 53.7,
            pickRate: 85.2
          },
          {
            id: "8009",
            name: "Presence of Mind",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png`,
            winRate: 52.8,
            pickRate: 78.9
          },
          {
            id: "8017",
            name: "Legend: Alacrity",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png`,
            winRate: 53.1,
            pickRate: 92.3
          },
          {
            id: "8014",
            name: "Coup de Grace",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png`,
            winRate: 52.5,
            pickRate: 76.4
          }
        ]
      },
      secondaryPath: {
        id: "8400",
        name: "Resolve",
        image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png`,
        runes: [
          {
            id: "8446",
            name: "Conditioning",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Conditioning/Conditioning.png`,
            winRate: 51.9,
            pickRate: 65.8
          },
          {
            id: "8451",
            name: "Overgrowth",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Overgrowth/Overgrowth.png`,
            winRate: 52.2,
            pickRate: 68.7
          }
        ]
      },
      shards: {
        offense: "Attack Speed",
        flex: "Adaptive Force",
        defense: "Armor"
      },
      winRate: 53.4,
      pickRate: 45.7
    },
    {
      primaryPath: {
        id: "8100",
        name: "Domination",
        image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7200_Domination.png`,
        runes: [
          {
            id: "8112",
            name: "Electrocute",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png`,
            winRate: 51.8,
            pickRate: 35.6
          },
          {
            id: "8126",
            name: "Cheap Shot",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/CheapShot/CheapShot.png`,
            winRate: 51.4,
            pickRate: 32.7
          },
          {
            id: "8138",
            name: "Eyeball Collection",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/EyeballCollection/EyeballCollection.png`,
            winRate: 51.6,
            pickRate: 34.9
          },
          {
            id: "8135",
            name: "Treasure Hunter",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png`,
            winRate: 51.2,
            pickRate: 30.1
          }
        ]
      },
      secondaryPath: {
        id: "8000",
        name: "Precision",
        image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png`,
        runes: [
          {
            id: "8009",
            name: "Presence of Mind",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png`,
            winRate: 50.9,
            pickRate: 31.4
          },
          {
            id: "8014",
            name: "Coup de Grace",
            image: `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png`,
            winRate: 51.1,
            pickRate: 32.8
          }
        ]
      },
      shards: {
        offense: "Adaptive Force",
        flex: "Adaptive Force",
        defense: "Health"
      },
      winRate: 51.5,
      pickRate: 27.9
    }
  ];
  
  const mockCounters = [
    {
      id: "236",
      name: "Lucian",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/Lucian.png`,
      winRate: 54.3,
      role: "BOTTOM"
    },
    {
      id: "67",
      name: "Vayne",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/Vayne.png`,
      winRate: 53.8,
      role: "BOTTOM"
    },
    {
      id: "202",
      name: "Jhin",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/Jhin.png`,
      winRate: 52.9,
      role: "BOTTOM"
    }
  ];
  
  const mockSynergies = role === "BOTTOM" || role === "UTILITY" ? [
    {
      id: role === "BOTTOM" ? "412" : "22",
      name: role === "BOTTOM" ? "Thresh" : "Ashe",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${role === "BOTTOM" ? "Thresh" : "Ashe"}.png`,
      winRate: 56.2,
      role: role === "BOTTOM" ? "UTILITY" : "BOTTOM"
    },
    {
      id: role === "BOTTOM" ? "497" : "51",
      name: role === "BOTTOM" ? "Rakan" : "Caitlyn",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${role === "BOTTOM" ? "Rakan" : "Caitlyn"}.png`,
      winRate: 55.4,
      role: role === "BOTTOM" ? "UTILITY" : "BOTTOM"
    },
    {
      id: role === "BOTTOM" ? "267" : "81",
      name: role === "BOTTOM" ? "Nami" : "Ezreal",
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${role === "BOTTOM" ? "Nami" : "Ezreal"}.png`,
      winRate: 54.7,
      role: role === "BOTTOM" ? "UTILITY" : "BOTTOM"
    }
  ] : undefined;
  
  return {
    id: champData.id,
    name: champData.name,
    title: champData.title,
    lore: champData.lore,
    image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champData.image.full}`,
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champData.id}_0.jpg`,
    loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champData.id}_0.jpg`,
    role: role,
    damageType: getDamageType(champData.tags, champData.info),
    difficulty: getDifficulty(champData.info),
    range: getRange(parseInt(champData.stats.attackrange)),
    winRate: 51.5, // Mock data
    pickRate: 12.3, // Mock data
    banRate: 5.8,   // Mock data
    abilities: [passive, ...abilities],
    itemBuilds: mockItemBuilds,
    runeBuilds: mockRuneBuilds,
    counters: mockCounters,
    synergies: mockSynergies,
    skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'],
    tips: {
      allies: champData.allytips,
      enemies: champData.enemytips
    }
  };
}

export async function GET(request: Request) {
  try {
    // Parse query parameters from the request URL
    const url = new URL(request.url);
    const champId = url.searchParams.get('id');
    const role = url.searchParams.get('role') || 'MIDDLE'; // Default to MIDDLE if no role specified
    
    if (!champId) {
      return NextResponse.json({ error: 'Champion ID is required' }, { status: 400 });
    }
    
    // Check if we have cached data for this champion and role
    const cachedData = championDetailsCache[champId]?.[role];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      // Return cached data if it's still valid
      return NextResponse.json(cachedData.data);
    }
    
    // Fetch current patch version
    const patch = await fetchCurrentPatch();
    
    // Fetch champion data from Data Dragon
    const champData = await fetchChampionData(champId, patch);
    
    // Transform the data into our ChampionDetails format
    const transformedData = await transformChampionData(champData, role, patch);
    
    // Cache the data
    if (!championDetailsCache[champId]) {
      championDetailsCache[champId] = {};
    }
    
    championDetailsCache[champId][role] = {
      data: transformedData,
      timestamp: Date.now()
    };
    
    // Return the data
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error processing champion details request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch champion details' },
      { status: 500 }
    );
  }
} 