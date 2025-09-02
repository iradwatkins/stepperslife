import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sign-out(.*)',
  '/auth-callback(.*)',
  '/events(.*)',
  '/event/(.*)',
  '/ticket/(.*)',
  '/organizer/onboarding',
  '/api/webhooks(.*)',
  '/api/storage(.*)',
  '/api/test-convex',
  '/api/debug-env',
  '/api/health',
  '/api/version',
  '/api/admin/clear-all-events',
  '/manifest.json',
  '/sw.js',
  '/_next(.*)',
  '/static(.*)',
  '/favicon.ico',
  // Add test pages for development
  '/test-google-maps',
  '/test-google-address',
  '/test-(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Check if we should bypass auth for local development
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    console.log('🔓 Auth bypassed for development');
    return NextResponse.next();
  }
  
  // Check if using development keys with localhost
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = req.url.includes('localhost');
  const hasTestKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_');
  
  if (isDevelopment && isLocalhost && !hasTestKeys) {
    console.warn('⚠️ Using production Clerk keys in local development. Consider using development keys.');
    // Allow access but show warning
    return NextResponse.next();
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    try {
      await auth.protect()
    } catch (error) {
      console.error('Clerk auth error:', error);
      // In development, allow access but log the error
      if (isDevelopment) {
        return NextResponse.next();
      }
      throw error;
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}