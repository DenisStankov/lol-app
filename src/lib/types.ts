export interface ChampionData {
  id: string
  name: string
  title: string
  tags: string[]
  imageURLs: {
    square: string
    splash: string
    loading: string
  }
  stats: {
    winRate: number
    pickRate: number
    banRate: number
    matches: number
  }
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
  abilities: {
    id: string
    name: string
    description: string
    iconUrl: string
    keyBinding: string
    cost?: string
  }[]
} 