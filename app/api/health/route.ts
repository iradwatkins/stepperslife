import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  
  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const memoryInMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };
  
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.DEPLOYMENT_VERSION || "3.2.0",
    platformFee: process.env.PLATFORM_FEE_PER_TICKET || "1.50",
    uptime: Math.round(process.uptime()),
    memory: memoryInMB,
    memoryThreshold: memoryInMB.heapUsed > 700 ? "warning" : "ok",
    checks: {
      app: "unknown",
      square: "disabled",
      clerk: "unknown",
      convex: "unknown",
      database: "unknown",
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
  
  // Square is temporarily disabled
  checks.checks.square = process.env.DISABLE_SQUARE === "true" ? "disabled" : "unknown";
  
  // Check Clerk configuration (updated from NextAuth)
  try {
    const hasClerkSecret = !!process.env.CLERK_SECRET_KEY;
    const hasClerkPublishable = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const hasClerkDomain = !!process.env.CLERK_DOMAIN;
    
    if (hasClerkSecret && hasClerkPublishable) {
      checks.checks.clerk = hasClerkDomain ? "healthy" : "partial";
    } else {
      checks.checks.clerk = "misconfigured";
      checks.status = "unhealthy";
    }
  } catch (error) {
    checks.checks.clerk = "error";
    checks.status = "unhealthy";
  }
  
  // Check Convex configuration
  try {
    const hasConvexUrl = !!process.env.NEXT_PUBLIC_CONVEX_URL;
    const hasConvexDeployment = !!process.env.CONVEX_DEPLOYMENT;
    
    if (hasConvexUrl && hasConvexDeployment) {
      checks.checks.convex = "healthy";
    } else {
      checks.checks.convex = "misconfigured";
      checks.status = "unhealthy";
    }
  } catch (error) {
    checks.checks.convex = "error";
    checks.status = "unhealthy";
  }
  
  // Check environment
  checks.checks.environment = {
    NODE_ENV: process.env.NODE_ENV || "not set",
    // Clerk Auth
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? "set" : "not set",
    CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "set" : "not set",
    CLERK_DOMAIN: process.env.CLERK_DOMAIN || "not set",
    // Clerk uses modal for sign-in, no redirect URL needed
    // Convex Database
    CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ? "set" : "not set",
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT ? "set" : "not set",
    // App Config
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "not set",
    GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "set" : "not set",
    // Payment
    DISABLE_SQUARE: process.env.DISABLE_SQUARE || "false",
    PLATFORM_FEE: process.env.PLATFORM_FEE_PER_TICKET || "1.50",
    PORT: process.env.PORT || "3000"
  } as any;
  
  // Check database (simple check if DATABASE_URL is set)
  try {
    checks.checks.database = process.env.DATABASE_URL ? "configured" : "not configured";
  } catch (error) {
    checks.checks.database = "error";
  }
  
  // If memory usage is too high, mark as unhealthy
  if (memoryInMB.heapUsed > 800) {
    checks.status = "unhealthy";
    checks.memoryThreshold = "critical";
  }
  
  // Calculate response time
  const responseTime = Date.now() - startTime;
  (checks as any).responseTimeMs = responseTime;
  
  // Return with appropriate status code
  const statusCode = checks.status === "healthy" ? 200 : 503;
  
  return NextResponse.json(checks, { status: statusCode });
}