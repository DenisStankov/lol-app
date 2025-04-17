import { NextResponse } from 'next/server';
import { RIOT_AUTH_CONFIG } from '@/lib/auth-config';

/**
 * Logout route that clears all auth cookies and redirects to home
 */
export async function GET() {
  console.log('Logout requested');
  
  // Create the response
  const response = NextResponse.redirect(RIOT_AUTH_CONFIG.postLogoutRedirectUri);
  
  // Clear all auth cookies
  response.cookies.delete('auth_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('user_info');
  
  console.log('Auth cookies cleared, redirecting to:', RIOT_AUTH_CONFIG.postLogoutRedirectUri);
  
  return response;
} 