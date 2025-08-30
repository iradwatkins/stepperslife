import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Simple logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${request.method} ${pathname}`);
  }
  
  // Allow all public routes
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/test") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/event/") ||
    pathname.startsWith("/ticket/") ||
    pathname.startsWith("/quick-signin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".");
  
  // For now, allow all routes to prevent crashes
  // We'll add auth checks back after confirming the app is stable
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, manifest.json
     * - Images and other static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};