import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnSeller = req.nextUrl.pathname.startsWith("/seller");
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");
  
  // Allow API routes and auth pages
  if (isOnApi || isOnAuth) {
    return NextResponse.next();
  }
  
  // Redirect to signin if trying to access protected routes while not logged in
  if ((isOnDashboard || isOnSeller) && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};