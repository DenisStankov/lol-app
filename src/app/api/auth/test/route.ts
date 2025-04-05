import { NextResponse } from 'next/server';
import { RIOT_AUTH_CONFIG } from '@/lib/auth-config';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID || '';
  
  // Only show first and last 4 characters for security
  const maskedClientId = clientId.length > 8
    ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}`
    : 'Not set';
    
  return NextResponse.json({
    clientIdSet: Boolean(clientId),
    maskedClientId,
    environment: process.env.NODE_ENV,
    authConfig: {
      redirectUri: RIOT_AUTH_CONFIG.redirectUri,
      authEndpoint: RIOT_AUTH_CONFIG.authEndpoint,
      scope: RIOT_AUTH_CONFIG.scope,
    }
  });
} 