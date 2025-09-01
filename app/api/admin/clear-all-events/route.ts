import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Verify the confirmation code
    if (body.confirmReset !== "RESET_ALL_DATA") {
      return NextResponse.json(
        { error: "Invalid confirmation code" },
        { status: 400 }
      );
    }

    // Call the Convex mutation to clear all events
    const result = await fetchMutation(api.adminReset.clearAllEvents, {
      confirmReset: "RESET_ALL_DATA"
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error clearing events:", error);
    return NextResponse.json(
      { error: "Failed to clear events", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current data counts
    const counts = await fetchMutation(api.adminReset.getDataCounts, {});
    
    return NextResponse.json({
      message: "Use POST with { confirmReset: 'RESET_ALL_DATA' } to clear all events",
      currentData: counts
    });
  } catch (error) {
    console.error("Error getting data counts:", error);
    return NextResponse.json(
      { error: "Failed to get data counts", details: error },
      { status: 500 }
    );
  }
}