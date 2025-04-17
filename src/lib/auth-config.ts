/**
 * Riot Games OAuth authentication configuration
 */

// Log the client ID for debugging (masked for security)
const clientId = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID || '';
console.log('OAuth Client ID available:', !!clientId);
if (clientId) {
  const maskedId = `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}`;
  console.log('Masked Client ID:', maskedId);
}

export const RIOT_AUTH_CONFIG = {
  // The client ID from your Riot Developer Portal application
  clientId: clientId,
  
  // Auth endpoints
  authEndpoint: 'https://auth.riotgames.com/authorize',
  tokenEndpoint: 'https://auth.riotgames.com/token',
  
  // Redirect URI (must match what's registered in Riot Developer Portal)
  redirectUri: process.env.NODE_ENV === 'production' 
    ? 'https://lol-app-green.vercel.app/api/auth/callback' // Updated with actual Vercel domain
    : 'http://localhost:3001/api/auth/callback',
    
  // Scopes to request (openid is required at minimum)
  scope: 'openid offline_access lol',
  
  // Post-logout redirect
  postLogoutRedirectUri: process.env.NODE_ENV === 'production'
    ? 'https://lol-app-green.vercel.app'
    : 'http://localhost:3001',
};

/**
 * Generates the Riot OAuth login URL with all necessary parameters
 */
export function getAuthUrl() {
  // Log the auth URL parameters for debugging
  console.log('Generating auth URL with:');
  console.log('- Client ID available:', !!RIOT_AUTH_CONFIG.clientId);
  console.log('- Redirect URI:', RIOT_AUTH_CONFIG.redirectUri);
  console.log('- Scopes:', RIOT_AUTH_CONFIG.scope);
  
  const params = new URLSearchParams({
    client_id: RIOT_AUTH_CONFIG.clientId,
    redirect_uri: RIOT_AUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: RIOT_AUTH_CONFIG.scope,
    state: generateRandomState(),
  });
  
  const authUrl = `${RIOT_AUTH_CONFIG.authEndpoint}?${params.toString()}`;
  console.log('Generated auth URL:', authUrl);
  
  return authUrl;
}

/**
 * Generates a random state string for OAuth security
 */
function generateRandomState() {
  // Generate a random string to prevent CSRF attacks
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 