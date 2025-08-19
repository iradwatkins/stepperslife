import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || 
                      path === "/auth/signin" || 
                      path === "/auth/signup" ||
                      path === "/auth/error" ||
                      path.startsWith("/api/auth") ||
                      path.startsWith("/api/webhooks");

  // Get the session
  const session = await auth();

  // Redirect to signin if accessing protected route without session
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect to home if accessing auth pages with active session
  if ((path === "/auth/signin" || path === "/auth/signup") && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
