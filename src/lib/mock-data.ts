/**
 * Mock data for champion details when real data isn't available
 */

export interface ChampionDetail {
  id: string;
  name: string;
  title: string;
  lore: string;
  tags: string[];
  stats: Record<string, number>;
  itemBuilds: {
    startingItems: ItemBuild[];
    coreItems: ItemBuild[];
    boots: ItemBuild[];
    situationalItems: ItemBuild[];
  };
  runeBuilds: RuneBuild[];
  counters: CounterChampion[];
  synergies: CounterChampion[];
  winRate: number;
  pickRate: number;
  banRate: number;
  skillOrder: string[];
}

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

export interface CounterChampion {
  id: string;
  name: string;
  image: string;
  winRate: number;
  role: string;
}

// Sample mock data for some popular champions
export const mockChampionDetailsData: ChampionDetail[] = [
  {
    id: "Ahri",
    name: "Ahri",
    title: "the Nine-Tailed Fox",
    lore: "Innately connected to the latent power of Runeterra, Ahri is a vastaya who can reshape magic into orbs of raw energy. She revels in toying with her prey by manipulating their emotions before devouring their life essence. Despite her predatory nature, Ahri retains a sense of empathy as she receives flashes of memory from each soul she consumes.",
    tags: ["Mage", "Assassin"],
    stats: {
      hp: 570,
      hpperlevel: 92,
      mp: 418,
      mpperlevel: 25,
      movespeed: 330,
      armor: 18,
      armorperlevel: 3.5,
      spellblock: 30,
      spellblockperlevel: 0.5,
      attackrange: 550,
      hpregen: 5.5,
      hpregenperlevel: 0.6,
      mpregen: 8,
      mpregenperlevel: 0.8,
      crit: 0,
      critperlevel: 0,
      attackdamage: 53,
      attackdamageperlevel: 3,
      attackspeedperlevel: 2,
      attackspeed: 0.668
    },
    itemBuilds: {
      startingItems: [
        {
          id: "1056",
          name: "Doran's Ring",
          description: "Good starting item for mages",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/1056.png",
          gold: 400,
          winRate: 53.2,
          pickRate: 82.4
        },
        {
          id: "2003",
          name: "Health Potion",
          description: "Consume to restore health over time",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/2003.png",
          gold: 50,
          winRate: 52.8,
          pickRate: 78.6
        }
      ],
      coreItems: [
        {
          id: "6655",
          name: "Luden's Tempest",
          description: "High burst damage and movement speed",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/6655.png",
          gold: 3200,
          winRate: 54.3,
          pickRate: 65.7
        },
        {
          id: "4645",
          name: "Shadowflame",
          description: "Magic penetration against shields",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/4645.png",
          gold: 3000,
          winRate: 53.8,
          pickRate: 58.2
        },
        {
          id: "3089",
          name: "Rabadon's Deathcap",
          description: "Massively increases ability power",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3089.png",
          gold: 3600,
          winRate: 56.1,
          pickRate: 45.9
        }
      ],
      boots: [
        {
          id: "3020",
          name: "Sorcerer's Shoes",
          description: "Enhances movement and magic penetration",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3020.png",
          gold: 1100,
          winRate: 53.5,
          pickRate: 93.2
        }
      ],
      situationalItems: [
        {
          id: "3157",
          name: "Zhonya's Hourglass",
          description: "Stasis effect to avoid damage",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3157.png",
          gold: 2600,
          winRate: 52.8,
          pickRate: 62.4
        },
        {
          id: "3102",
          name: "Banshee's Veil",
          description: "Spellshield against enemy abilities",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3102.png",
          gold: 2600,
          winRate: 51.7,
          pickRate: 25.3
        },
        {
          id: "3165",
          name: "Morellonomicon",
          description: "Applies Grievous Wounds to enemies",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3165.png",
          gold: 2500,
          winRate: 52.1,
          pickRate: 38.9
        }
      ]
    },
    runeBuilds: [
      {
        primaryPath: {
          id: "8200",
          name: "Sorcery",
          image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7202_Sorcery.png",
          runes: [
            {
              id: "8214",
              name: "Summon Aery",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
              winRate: 54.2,
              pickRate: 72.6
            },
            {
              id: "8226",
              name: "Manaflow Band",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png",
              winRate: 53.8,
              pickRate: 85.3
            },
            {
              id: "8210",
              name: "Transcendence",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Transcendence/Transcendence.png",
              winRate: 53.6,
              pickRate: 76.8
            },
            {
              id: "8237",
              name: "Scorch",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Scorch/Scorch.png",
              winRate: 53.2,
              pickRate: 62.4
            }
          ]
        },
        secondaryPath: {
          id: "8300",
          name: "Inspiration",
          image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/8300_Inspiration.png",
          runes: [
            {
              id: "8321",
              name: "Perfect Timing",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/PerfectTiming/PerfectTiming.png",
              winRate: 52.7,
              pickRate: 58.3
            },
            {
              id: "8347",
              name: "Cosmic Insight",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png",
              winRate: 53.1,
              pickRate: 76.2
            }
          ]
        },
        shards: {
          offense: "Adaptive Force",
          flex: "Adaptive Force",
          defense: "Magic Resist"
        },
        winRate: 54.6,
        pickRate: 68.3
      }
    ],
    counters: [
      {
        id: "238",
        name: "Zed",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Zed.png",
        winRate: 56.8,
        role: "MIDDLE"
      },
      {
        id: "91",
        name: "Talon",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Talon.png",
        winRate: 55.3,
        role: "MIDDLE"
      },
      {
        id: "55",
        name: "Katarina",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Katarina.png",
        winRate: 54.7,
        role: "MIDDLE"
      }
    ],
    synergies: [
      {
        id: "78",
        name: "Poppy",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Poppy.png",
        winRate: 53.6,
        role: "JUNGLE"
      },
      {
        id: "875",
        name: "Sett",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Sett.png",
        winRate: 52.9,
        role: "TOP"
      },
      {
        id: "17",
        name: "Teemo",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Teemo.png",
        winRate: 52.1,
        role: "TOP"
      }
    ],
    winRate: 51.4,
    pickRate: 8.2,
    banRate: 4.7,
    skillOrder: ["Q", "E", "W", "Q", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W", "R", "W", "W"]
  },
  {
    id: "Yasuo",
    name: "Yasuo",
    title: "the Unforgiven",
    lore: "An Ionian of deep resolve, Yasuo is an agile swordsman who wields the air itself against his enemies. As a proud young man, he was falsely accused of murdering his master—unable to prove his innocence, he was forced to slay his own brother in self-defense. Even after his master's true killer was revealed, Yasuo still could not forgive himself for all he had done, and now wanders his homeland with only the wind to guide his blade.",
    tags: ["Fighter", "Assassin"],
    stats: {
      hp: 590,
      hpperlevel: 87,
      mp: 100,
      mpperlevel: 0,
      movespeed: 345,
      armor: 30,
      armorperlevel: 3.4,
      spellblock: 32,
      spellblockperlevel: 1.25,
      attackrange: 175,
      hpregen: 6.5,
      hpregenperlevel: 0.9,
      mpregen: 0,
      mpregenperlevel: 0,
      crit: 0,
      critperlevel: 0,
      attackdamage: 60,
      attackdamageperlevel: 3.2,
      attackspeedperlevel: 2.5,
      attackspeed: 0.697
    },
    itemBuilds: {
      startingItems: [
        {
          id: "1055",
          name: "Doran's Blade",
          description: "Good starting item for AD champions",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/1055.png",
          gold: 450,
          winRate: 52.7,
          pickRate: 88.3
        },
        {
          id: "2003",
          name: "Health Potion",
          description: "Consume to restore health over time",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/2003.png",
          gold: 50,
          winRate: 52.3,
          pickRate: 86.7
        }
      ],
      coreItems: [
        {
          id: "3031",
          name: "Infinity Edge",
          description: "Massively increases critical strike damage",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3031.png",
          gold: 3400,
          winRate: 55.6,
          pickRate: 92.8
        },
        {
          id: "3036",
          name: "Lord Dominik's Regards",
          description: "Armor penetration against high-health targets",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3036.png",
          gold: 3000,
          winRate: 54.2,
          pickRate: 65.4
        },
        {
          id: "3072",
          name: "Bloodthirster",
          description: "Life steal and shield",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3072.png",
          gold: 3400,
          winRate: 53.8,
          pickRate: 58.2
        }
      ],
      boots: [
        {
          id: "3006",
          name: "Berserker's Greaves",
          description: "Enhances movement and attack speed",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3006.png",
          gold: 1100,
          winRate: 53.4,
          pickRate: 82.7
        }
      ],
      situationalItems: [
        {
          id: "3139",
          name: "Mercurial Scimitar",
          description: "Cleanse crowd control effects",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3139.png",
          gold: 3000,
          winRate: 51.8,
          pickRate: 32.5
        },
        {
          id: "3156",
          name: "Maw of Malmortius",
          description: "Magic damage shield",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3156.png",
          gold: 2800,
          winRate: 52.3,
          pickRate: 27.8
        },
        {
          id: "3026",
          name: "Guardian Angel",
          description: "Revive upon death",
          image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/3026.png",
          gold: 2800,
          winRate: 53.6,
          pickRate: 45.9
        }
      ]
    },
    runeBuilds: [
      {
        primaryPath: {
          id: "8000",
          name: "Precision",
          image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png",
          runes: [
            {
              id: "8008",
              name: "Lethal Tempo",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
              winRate: 54.8,
              pickRate: 76.3
            },
            {
              id: "9101",
              name: "Overheal",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Overheal.png",
              winRate: 53.5,
              pickRate: 62.7
            },
            {
              id: "9104",
              name: "Legend: Alacrity",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png",
              winRate: 54.2,
              pickRate: 82.9
            },
            {
              id: "8014",
              name: "Coup de Grace",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png",
              winRate: 53.7,
              pickRate: 78.4
            }
          ]
        },
        secondaryPath: {
          id: "8400",
          name: "Resolve",
          image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png",
          runes: [
            {
              id: "8446",
              name: "Second Wind",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/SecondWind/SecondWind.png",
              winRate: 52.9,
              pickRate: 56.3
            },
            {
              id: "8451",
              name: "Unflinching",
              image: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Unflinching/Unflinching.png",
              winRate: 53.2,
              pickRate: 62.8
            }
          ]
        },
        shards: {
          offense: "Attack Speed",
          flex: "Adaptive Force",
          defense: "Armor"
        },
        winRate: 53.8,
        pickRate: 71.6
      }
    ],
    counters: [
      {
        id: "82",
        name: "Mordekaiser",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Mordekaiser.png",
        winRate: 57.2,
        role: "TOP"
      },
      {
        id: "122",
        name: "Darius",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Darius.png",
        winRate: 55.8,
        role: "TOP"
      },
      {
        id: "54",
        name: "Malphite",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Malphite.png",
        winRate: 54.3,
        role: "TOP"
      }
    ],
    synergies: [
      {
        id: "11",
        name: "Master Yi",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/MasterYi.png",
        winRate: 53.2,
        role: "JUNGLE"
      },
      {
        id: "254",
        name: "Vi",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Vi.png",
        winRate: 52.6,
        role: "JUNGLE"
      },
      {
        id: "154",
        name: "Zac",
        image: "https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/Zac.png",
        winRate: 52.1,
        role: "JUNGLE"
      }
    ],
    winRate: 48.5,
    pickRate: 12.6,
    banRate: 18.3,
    skillOrder: ["Q", "E", "W", "Q", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W", "R", "W", "W"]
  }
]; 