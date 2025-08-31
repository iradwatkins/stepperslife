import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

// CRITICAL: Direct API test to bypass React client issues
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";

export async function GET() {
  console.log("🔍 Test API: Starting Convex connection test");
  console.log("📍 Using Convex URL:", CONVEX_URL);
  
  try {
    // Create HTTP client (bypasses WebSocket)
    const client = new ConvexHttpClient(CONVEX_URL);
    
    // Test 1: Fetch events
    console.log("📊 Fetching events from Convex...");
    const events = await client.query(api.events.get);
    
    // Test 2: Check database connection
    const eventCount = events?.length || 0;
    console.log(`✅ Successfully fetched ${eventCount} events`);
    
    // Test 3: Verify environment
    const environment = {
      convexUrl: CONVEX_URL,
      nodeEnv: process.env.NODE_ENV,
      hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      deployment: process.env.CONVEX_DEPLOYMENT,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: "Convex connection successful",
      data: {
        eventCount,
        events: events?.slice(0, 5) || [], // Return first 5 events as sample
        environment
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Test API Error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Failed to connect to Convex",
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        convexUrl: CONVEX_URL,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// Test WebSocket upgrade capability
export async function POST() {
  const headers = {
    'Connection': 'Upgrade',
    'Upgrade': 'websocket',
    'Sec-WebSocket-Version': '13',
    'Sec-WebSocket-Key': 'test-key-123'
  };
  
  return NextResponse.json({
    message: "WebSocket test endpoint",
    headers: Object.fromEntries(Object.entries(headers)),
    info: "Use GET to test Convex connection"
  });
}