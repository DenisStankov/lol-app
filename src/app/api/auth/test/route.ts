import { NextResponse } from 'next/server';
import { RIOT_AUTH_CONFIG } from '@/lib/auth-config';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID || '';
  
  // Only show first and last 4 characters for security
  const maskedClientId = clientId.length > 8
    ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}`
    : 'Not set';
    
  // Check if the client ID is valid
  const clientIdValid = clientId.length > 10; // Riot client IDs are typically longer
  
  return NextResponse.json({
    status: clientIdValid ? 'ready' : 'pending',
    message: clientIdValid 
      ? 'OAuth configuration appears valid' 
      : 'OAuth access is pending approval from Riot Games',
    clientIdSet: !!clientId,
    clientIdValid,
    maskedClientId,
    environment: process.env.NODE_ENV,
    authConfig: {
      redirectUri: RIOT_AUTH_CONFIG.redirectUri,
      authEndpoint: RIOT_AUTH_CONFIG.authEndpoint,
      scope: RIOT_AUTH_CONFIG.scope,
    },
    nextSteps: clientIdValid ? [
      'Click the Login with Riot button to test authentication',
      'Check the browser console for debugging information'
    ] : [
      'Request OAuth access from Riot Developer Support',
      'Update the client ID once approved',
      'Ensure redirect URIs match between your app and Riot Developer Portal'
    ]
  });
} 