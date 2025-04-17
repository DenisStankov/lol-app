import { NextResponse } from 'next/server';
import { RIOT_AUTH_CONFIG } from '@/lib/auth-config';

/**
 * Debug endpoint to check OAuth configuration
 */
export async function GET() {
  // Get environment variables
  const clientId = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID || '';
  const maskedClientId = clientId 
    ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}` 
    : 'Not set';
  
  // Generate auth URL
  const authUrl = new URL(RIOT_AUTH_CONFIG.authEndpoint);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', RIOT_AUTH_CONFIG.redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', RIOT_AUTH_CONFIG.scope);
  authUrl.searchParams.append('state', 'test-state');
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clientId: {
      set: !!clientId,
      masked: maskedClientId,
      length: clientId.length,
    },
    authConfig: {
      authEndpoint: RIOT_AUTH_CONFIG.authEndpoint,
      tokenEndpoint: RIOT_AUTH_CONFIG.tokenEndpoint,
      redirectUri: RIOT_AUTH_CONFIG.redirectUri,
      scope: RIOT_AUTH_CONFIG.scope,
      postLogoutRedirectUri: RIOT_AUTH_CONFIG.postLogoutRedirectUri,
    },
    generatedAuthUrl: authUrl.toString(),
    howToTest: "Visit /api/auth/test and click the login link to test the full OAuth flow",
    cookies: {
      note: "After login, check for these cookies:",
      expectedCookies: ["auth_token", "refresh_token", "user_info"]
    }
  });
} 