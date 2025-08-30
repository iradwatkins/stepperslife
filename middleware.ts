import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/my-tables") ||
    pathname.startsWith("/tickets/purchase");
  
  // Define public routes (always accessible)
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/events") && !pathname.includes("/edit") ||
    pathname.startsWith("/event/") && !pathname.includes("/edit") ||
    pathname.startsWith("/ticket/") ||
    pathname.startsWith("/scan") ||
    pathname.startsWith("/quick-signin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".");
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, LoggedIn: ${isLoggedIn}, Protected: ${isProtectedRoute}`);
  }
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Redirect to signin if trying to access protected routes while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  
  // For authenticated users, add session refresh header
  if (isLoggedIn) {
    const response = NextResponse.next();
    // Add cache control headers to prevent aggressive caching
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images, css, js files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};