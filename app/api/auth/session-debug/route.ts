import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Get cookies from request
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").map(c => {
      const [name, value] = c.trim().split("=");
      return { name, value: value ? value.substring(0, 20) + "..." : "" };
    });
    
    // Check for session-related cookies
    const sessionCookies = cookies.filter(c => 
      c.name && (
        c.name.includes("next-auth") || 
        c.name.includes("session") ||
        c.name.includes("csrf")
      )
    );
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        } : null,
        expires: session?.expires,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
      },
      cookies: {
        total: cookies.length,
        sessionCookies: sessionCookies,
      },
      headers: {
        host: request.headers.get("host"),
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      }
    }, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}