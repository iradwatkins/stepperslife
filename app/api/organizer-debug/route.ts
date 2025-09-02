import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Diagnostic endpoint for organizer dashboard
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";

export async function GET() {
  console.log("🔍 Organizer Debug API: Starting diagnostic");
  
  try {
    // Get current user from Clerk
    const { userId } = await auth();
    console.log("👤 Current Clerk userId:", userId);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
        debug: {
          userId: null,
          timestamp: new Date().toISOString()
        }
      }, { status: 401 });
    }
    
    // Create HTTP client
    const client = new ConvexHttpClient(CONVEX_URL);
    
    // Test 1: Get all events to verify database connection
    console.log("📊 Test 1: Fetching all events...");
    const allEvents = await client.query(api.events.get);
    const eventCount = allEvents?.length || 0;
    
    // Test 2: Get events for current user
    console.log("📊 Test 2: Fetching user's events...");
    let userEvents = [];
    try {
      userEvents = await client.query(api.events.getEventsByUser, { userId });
    } catch (error) {
      console.error("Error fetching user events:", error);
    }
    
    // Test 3: Get organizer stats
    console.log("📊 Test 3: Fetching organizer stats...");
    let organizerStats = null;
    let statsError = null;
    try {
      organizerStats = await client.query(api.events.getOrganizerStats, { 
        organizerId: userId 
      });
    } catch (error) {
      console.error("Error fetching organizer stats:", error);
      statsError = error instanceof Error ? error.message : String(error);
    }
    
    // Test 4: Debug query to see all events with userIds
    console.log("📊 Test 4: Debug query for all events with userIds...");
    let debugEvents = [];
    try {
      debugEvents = await client.query(api.events.debugGetAllEventsWithUsers, {});
    } catch (error) {
      console.error("Error in debug query:", error);
    }
    
    // Analyze userId format issues
    const userIdAnalysis = {
      currentUserId: userId,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      userIdFormat: userId?.startsWith('user_') ? 'Clerk format' : 'Unknown format',
      eventsWithMatchingUserId: debugEvents.filter((e: any) => e.userId === userId).length,
      uniqueUserIdsInDatabase: [...new Set(debugEvents.map((e: any) => e.userId))].slice(0, 5)
    };
    
    // Check both ticket systems
    const ticketSystemAnalysis = {
      hasSimpleTickets: false,
      hasLegacyTickets: false,
      hasPurchases: false
    };
    
    // Summary
    const summary = {
      authenticated: true,
      userId: userId,
      totalEventsInDatabase: eventCount,
      userOwnedEvents: userEvents.length,
      organizerStatsWorking: !!organizerStats && !statsError,
      statsError: statsError,
      stats: organizerStats || {
        totalRevenue: 0,
        ticketsSold: 0,
        activeEvents: 0,
        totalEvents: 0,
        upcomingEvents: [],
        recentActivity: []
      }
    };
    
    return NextResponse.json({
      success: true,
      message: "Diagnostic completed",
      summary,
      details: {
        userIdAnalysis,
        ticketSystemAnalysis,
        sampleEvents: userEvents.slice(0, 3).map((e: any) => ({
          id: e._id,
          name: e.name,
          userId: e.userId,
          eventDate: e.eventDate
        })),
        debugEvents: debugEvents.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Organizer Debug API Error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Diagnostic failed",
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}