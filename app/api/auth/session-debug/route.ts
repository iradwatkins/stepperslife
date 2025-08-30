import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get the session using auth
    const session = await auth();
    
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Filter for auth-related cookies
    const authCookies = allCookies.filter(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('auth')
    );
    
    // Prepare debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
      },
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: (session.user as any)?.role,
          provider: (session.user as any)?.provider,
        },
        expires: session.expires,
      } : null,
      cookies: {
        count: authCookies.length,
        names: authCookies.map(c => c.name),
        details: authCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite,
          path: c.path,
          domain: c.domain,
        })),
      },
      isAuthenticated: !!session,
      hasUserName: !!session?.user?.name,
    };
    
    // Log to server console for debugging
    console.log("[Session Debug]", JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error("[Session Debug] Error:", error);
    return NextResponse.json({
      error: "Failed to get session debug info",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}