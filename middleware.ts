import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/events(.*)',
  '/event/(.*)',
  '/ticket/(.*)',
  '/api/webhooks(.*)',
  '/api/storage(.*)',  // Allow public storage access for viewing images
  '/api/health',
  '/api/version',
  '/manifest.json',
  '/sw.js',
  '/_next(.*)',
  '/static(.*)',
  '/favicon.ico',
  // Auth pages
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Coming soon pages
  '/classes',
  '/magazine', 
  '/community',
  '/about',
  // Test pages for development
  '/test-(.*)',
  // Sitemap page for route testing
  '/sitemap',
])

export default clerkMiddleware(async (auth, req) => {
  // Get auth state
  const { userId } = await auth()
  
  // Protect all routes except public ones
  if (!isPublicRoute(req) && !userId) {
    // Redirect to sign-in with the current URL as redirect_url
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
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