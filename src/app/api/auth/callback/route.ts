import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfoFromToken } from '@/lib/auth-utils';

/**
 * OAuth callback route - this is the route that Riot redirects to after login
 */
export async function GET(request: NextRequest) {
  console.log('OAuth callback received');
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _state = searchParams.get('state');
  
  // Log the callback parameters
  console.log('Callback parameters:');
  console.log('- Code available:', !!code);
  console.log('- Error:', error);
  console.log('- Error description:', errorDescription);
  
  // Handle errors from the OAuth provider
  if (error) {
    console.error('Error from Riot OAuth:', error, errorDescription);
    return NextResponse.redirect(new URL(`/?error=auth_error&message=${encodeURIComponent(errorDescription || error)}`, request.url));
  }
  
  // Ensure we have an authorization code
  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }
  
  // Verify state parameter (in a production app, you should store the state in the session and verify it)
  
  try {
    console.log('Exchanging code for token');
    
    // Exchange the authorization code for tokens
    const tokenData = await exchangeCodeForToken(code);
    
    console.log('Token exchange successful, extracting user info');
    
    // Extract user info from the ID token
    const userInfo = getUserInfoFromToken(tokenData.id_token);
    
    if (!userInfo) {
      console.error('Failed to extract user info from token');
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }
    
    console.log('User info extracted, creating response');
    
    // Create the response with redirect
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Store the access token (short-lived)
    response.cookies.set('auth_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    // Store refresh token (long-lived) if available
    if (tokenData.refresh_token) {
      response.cookies.set('refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    // Store basic user info in a session cookie
    response.cookies.set('user_info', JSON.stringify({
      sub: userInfo.sub,
      name: userInfo.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    console.log('Auth flow completed successfully');
    
    // Return the response with cookies
    return response;
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url));
  }
} 