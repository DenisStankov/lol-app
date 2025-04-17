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
  
  // Log debugging information
  console.log('Exchanging code for token:');
  console.log('- Client ID available:', !!clientId);
  console.log('- Redirect URI:', redirectUri);
  
  // If we don't have a client ID, throw an error
  if (!clientId) {
    console.error('Missing Riot Client ID. Please set NEXT_PUBLIC_RIOT_CLIENT_ID environment variable.');
    throw new Error('Missing Riot Client ID. Please set NEXT_PUBLIC_RIOT_CLIENT_ID environment variable.');
  }
  
  try {
    // Prepare the request body
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
    }).toString();
    
    console.log('Token request body:', requestBody);
    
    // Make the request to the token endpoint
    const tokenResponse = await fetch(RIOT_AUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });
    
    // Log the response status
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error exchanging code for token:', errorData);
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} - ${errorData}`);
    }
    
    // Parse and return the token response
    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');
    return tokenData;
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
    console.log('Decoding ID token');
    
    // ID tokens are JWTs which consist of three parts: header.payload.signature
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_header, payload, _signature] = idToken.split('.');
    
    if (!payload) {
      console.error('Invalid ID token format');
      return null;
    }
    
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    console.log('ID token decoded successfully');
    
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
  console.log('Getting user info from token');
  
  const decodedToken = decodeIdToken(idToken);
  if (!decodedToken) {
    console.error('Failed to decode ID token');
    return null;
  }
  
  console.log('User info extracted from token');
  
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