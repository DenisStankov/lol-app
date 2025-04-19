/**
 * Utility functions for Riot Games API and Data Dragon
 */

// Current Data Dragon version - update this when Riot releases new patches
export const CURRENT_DDRAGON_VERSION = "15.8.1";

// Get the URL for a profile icon by ID
export function getProfileIconUrl(profileIconId: number | string): string {
  // Provide a default icon if none is provided
  if (!profileIconId) {
    profileIconId = 29; // Default profile icon ID
  }
  
  return `https://ddragon.leagueoflegends.com/cdn/${CURRENT_DDRAGON_VERSION}/img/profileicon/${profileIconId}.png`;
}

// Get the URL for a champion icon by champion name
export function getChampionIconUrl(championName: string): string {
  if (!championName) {
    return `https://ddragon.leagueoflegends.com/cdn/${CURRENT_DDRAGON_VERSION}/img/champion/Aatrox.png`;
  }
  
  return `https://ddragon.leagueoflegends.com/cdn/${CURRENT_DDRAGON_VERSION}/img/champion/${championName}.png`;
}

// Helper function to get routing value for Riot API based on region
export function getRoutingValue(region: string): string {
  const routingMap: Record<string, string> = { 
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    na1: "americas",
    br1: "americas",
    la1: "americas",
    la2: "americas",
    kr: "asia",
    jp1: "asia",
  };
  
  return routingMap[region] || "europe";
} 