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
  '/organizer/onboarding',  // Allow public access to onboarding page
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
  // Test pages for development
  '/test-google-maps',
  '/test-google-address',
  '/test-google-direct',
  '/test-(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Skip auth protection for localhost in development if production keys are used
  const isLocalhost = req.url.includes('localhost') || req.url.includes('127.0.0.1')
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isLocalhost && isDevelopment) {
    console.log('⚠️ Localhost detected with production keys - skipping auth for development')
    // Allow all routes on localhost during development
    return NextResponse.next()
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()
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