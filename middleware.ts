import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/auth/error',
    '/about',
    '/contact',
  ]

  // Check if path is public or public browsing
  if (
    publicRoutes.some(route => path === route) ||
    path.startsWith('/api/auth') ||
    path.startsWith('/restaurants') ||
    path.startsWith('/events') ||
    path.startsWith('/store') ||
    path.startsWith('/classes') ||
    path.startsWith('/services') ||
    path.startsWith('/magazine')
  ) {
    return NextResponse.next()
  }

  // For protected routes, NextAuth will handle authentication
  // Role-based access control will be handled in individual pages
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
