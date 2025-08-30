import { NextResponse } from "next/server";
import { getSquareClient } from "@/lib/square";

export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.DEPLOYMENT_VERSION || "3.1.1",
    checks: {
      app: "unknown",
      square: "unknown",
      auth: "unknown",
      environment: "unknown"
    }
  };
  
  // Check app status
  try {
    checks.checks.app = "healthy";
  } catch (error) {
    checks.checks.app = "error";
    checks.status = "unhealthy";
  }
  
  // Check Square SDK
  try {
    const client = await getSquareClient();
    checks.checks.square = client ? "healthy" : "error";
  } catch (error) {
    console.error("Square health check failed:", error);
    checks.checks.square = "error";
  }
  
  // Check Auth configuration
  try {
    const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasAuthUrl = !!process.env.NEXTAUTH_URL;
    const hasGoogleCreds = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
    
    if (hasAuthSecret && hasAuthUrl) {
      checks.checks.auth = hasGoogleCreds ? "healthy" : "partial";
    } else {
      checks.checks.auth = "misconfigured";
      checks.status = "unhealthy";
    }
  } catch (error) {
    checks.checks.auth = "error";
    checks.status = "unhealthy";
  }
  
  // Check environment
  checks.checks.environment = {
    NODE_ENV: process.env.NODE_ENV || "not set",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "not set",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "not set",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "set" : "not set",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "set" : "not set",
    CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ? "set" : "not set",
    DISABLE_SQUARE: process.env.DISABLE_SQUARE || "false",
    PORT: process.env.PORT || "3000"
  } as any;
  
  // Return with appropriate status code
  const statusCode = checks.status === "healthy" ? 200 : 503;
  
  return NextResponse.json(checks, { status: statusCode });
}