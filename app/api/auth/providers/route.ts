import { NextResponse } from 'next/server';

export async function GET() {
  // Check if Google OAuth is configured
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  
  return NextResponse.json({
    providers: {
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        configured: googleConfigured,
        signinUrl: '/api/auth/signin/google',
        callbackUrl: '/api/auth/callback/google',
        clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
        status: googleConfigured ? 'ready' : 'error: missing credentials'
      },
      email: {
        id: 'email',
        name: 'Email',
        type: 'email',
        configured: true,
        signinUrl: '/api/auth/signin/email'
      },
      credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        configured: true,
        signinUrl: '/api/auth/signin'
      }
    },
    authUrl: process.env.NEXTAUTH_URL || 'not set',
    environment: process.env.NODE_ENV || 'development'
  });
}