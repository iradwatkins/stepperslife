import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Clear any server-side session
    await auth();
    
    // Redirect to home with cache headers to prevent caching
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://stepperslife.com'), {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Set-Cookie': '__client-uat=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
      }
    });
  } catch (error) {
    console.error('Sign out error:', error);
    // Even on error, redirect to home
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://stepperslife.com'));
  }
}

export async function POST() {
  return GET();
}