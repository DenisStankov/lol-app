export interface ChampionStats {
  attack: number
  defense: number
  magic: number
  difficulty: number
  mobility: number
  utility: number
  cc: number
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
} 