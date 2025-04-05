import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfoFromToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * OAuth callback route - this is the route that Riot redirects to after login
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  
  // Handle errors from the OAuth provider
  if (error) {
    console.error('Error from Riot OAuth:', error);
    return NextResponse.redirect(new URL('/?error=auth_error', request.url));
  }
  
  // Ensure we have an authorization code
  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }
  
  // Verify state parameter (in a production app, you should store the state in the session and verify it)
  
  try {
    // Exchange the authorization code for tokens
    const tokenData = await exchangeCodeForToken(code);
    
    // Extract user info from the ID token
    const userInfo = getUserInfoFromToken(tokenData.id_token);
    
    if (!userInfo) {
      console.error('Failed to extract user info from token');
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }
    
    // Set cookies to maintain user session
    const cookieStore = cookies();
    
    // Store the access token (short-lived)
    cookieStore.set('auth_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    // Store refresh token (long-lived) if available
    if (tokenData.refresh_token) {
      cookieStore.set('refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    // Store basic user info in a session cookie
    cookieStore.set('user_info', JSON.stringify({
      sub: userInfo.sub,
      name: userInfo.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    // Redirect to the home page or a dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
} 