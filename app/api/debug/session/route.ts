import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get session from auth
    const session = await auth();
    
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Get specific session cookie
    const sessionToken = cookieStore.get("next-auth.session-token") || 
                        cookieStore.get("__Secure-next-auth.session-token");
    
    return NextResponse.json({
      session,
      sessionToken: sessionToken?.value ? "Present" : "Missing",
      allCookies: allCookies.map(c => ({
        name: c.name,
        value: c.value.substring(0, 20) + "...",
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
      })),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to get session", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}