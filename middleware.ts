import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/events(.*)',
  '/event/(.*)',
  '/ticket/(.*)',
  '/api/webhooks(.*)',
  '/api/health',
  '/api/version',
  '/manifest.json',
  '/sw.js',
  '/_next(.*)',
  '/static(.*)',
  '/favicon.ico',
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