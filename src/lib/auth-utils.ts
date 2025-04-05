import { RIOT_AUTH_CONFIG } from './auth-config';

/**
 * Authentication utilities for handling Riot OAuth flows
 */

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Exchange authorization code for access token
 * This should be called by the callback route after successful login
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const clientId = RIOT_AUTH_CONFIG.clientId;
  const redirectUri = RIOT_AUTH_CONFIG.redirectUri;
  
  // If we don't have a client ID or client secret, throw an error
  if (!clientId) {
    throw new Error('Missing Riot Client ID. Please set NEXT_PUBLIC_RIOT_CLIENT_ID environment variable.');
  }
  
  try {
    const tokenResponse = await fetch(RIOT_AUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error exchanging code for token:', errorData);
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
    }
    
    return await tokenResponse.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Verify and decode the ID token to get user info
 * In a production app, you would want to verify the token signature
 */
export function decodeIdToken(idToken: string) {
  try {
    // ID tokens are JWTs which consist of three parts: header.payload.signature
    const [_header, payload, _signature] = idToken.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return null;
  }
}

/**
 * Get basic user info from the ID token
 */
export function getUserInfoFromToken(idToken: string) {
  const decodedToken = decodeIdToken(idToken);
  if (!decodedToken) return null;
  
  return {
    sub: decodedToken.sub, // Unique user identifier
    name: decodedToken.name,
    picture: decodedToken.picture,
    // Add other fields you need
  };
}

/**
 * Create a logout URL
 */
export function getLogoutUrl() {
  return `/api/auth/logout`;
} 