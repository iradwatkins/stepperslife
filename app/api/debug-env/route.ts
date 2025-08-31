import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || "NOT SET",
    clerkKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "SET" : "NOT SET",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith("NEXT_PUBLIC")),
  });
}