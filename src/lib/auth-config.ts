/**
 * Riot Games OAuth authentication configuration
 */

export const RIOT_AUTH_CONFIG = {
  // The client ID from your Riot Developer Portal application
  clientId: process.env.NEXT_PUBLIC_RIOT_CLIENT_ID || '',
  
  // Auth endpoints
  authEndpoint: 'https://auth.riotgames.com/authorize',
  tokenEndpoint: 'https://auth.riotgames.com/token',
  
  // Redirect URI (must match what's registered in Riot Developer Portal)
  redirectUri: process.env.NODE_ENV === 'production' 
    ? 'https://lol-app-green.vercel.app/api/auth/callback'
    : 'http://localhost:3000/api/auth/callback',
    
  // Scopes to request (openid is required at minimum)
  scope: 'openid offline_access lol',
  
  // Post-logout redirect
  postLogoutRedirectUri: process.env.NODE_ENV === 'production'
    ? 'https://lol-app-green.vercel.app'
    : 'http://localhost:3000',
};

/**
 * Generates the Riot OAuth login URL with all necessary parameters
 */
export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: RIOT_AUTH_CONFIG.clientId,
    redirect_uri: RIOT_AUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: RIOT_AUTH_CONFIG.scope,
    state: generateRandomState(),
  });
  
  return `${RIOT_AUTH_CONFIG.authEndpoint}?${params.toString()}`;
}

/**
 * Generates a random state string for OAuth security
 */
function generateRandomState() {
  // Generate a random string to prevent CSRF attacks
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 