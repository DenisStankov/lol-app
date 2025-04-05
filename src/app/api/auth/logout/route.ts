import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { RIOT_AUTH_CONFIG } from '@/lib/auth-config';

/**
 * Logout route that clears all auth cookies and redirects to home
 */
export async function GET(request: NextRequest) {
  // Clear all auth cookies
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('user_info');
  
  // Get post-logout redirect URI
  const redirectUri = RIOT_AUTH_CONFIG.postLogoutRedirectUri;
  
  // Redirect to the home page or specified logout redirect
  return NextResponse.redirect(redirectUri);
} 