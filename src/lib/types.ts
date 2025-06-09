export interface ChampionStats {
  attack: number
  defense: number
  magic: number
  difficulty: number
  mobility: number
  utility: number
  cc: number
}

export interface Matchup {
  championId: string
  championName: string
  championIconUrl: string
  difficulty: "Easy" | "Medium" | "Even" | "Hard" | "Severe"
  tips: string[]
}

export interface Counter {
  championId: string
  championName: string
  championIconUrl: string
  type: "strong" | "weak"
}

export interface Item {
  id: string
  name: string
  iconUrl: string
  cost: number
  description?: string
  stats: string[]
  type: "Starter" | "Boots" | "Core" | "Legendary" | "Mythic" | "Situational"
}

export interface Build {
  name: string
  starterItems: Item[]
  boots: Item
  coreItems: Item[]
  situationalItems: Array<{ item: Item; context: string }>
}

export interface ChampionData {
  id: string
  name: string
  title: string
  description: string
  lore: string
  abilities: Array<{
    id: string
    name: string
    description: string
    iconUrl: string
    keyBinding: string
    cost?: string
  }>
  stats: {
    winRate: number
    pickRate: number
    banRate: number
    matches: number
  }
  imageURLs: {
    splash: string
    loading: string
    square: string
  }
  particleType: string
  themeColorPrimary: string
  themeColorSecondary: string
  tags: string[]
  roles: {
    [key: string]: {
      winRate: number
      pickRate: number
      tier: string
    }
  }
  difficulty: {
    mechanical: number
    teamfight: number
  }
  matchups: Matchup[]
  counters: Counter[]
  recommendedBuilds: Build[]
} 