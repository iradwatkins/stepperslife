import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call Convex API directly
    const response = await fetch("https://youthful-porcupine-760.convex.cloud/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "events:get",
        args: {}
      })
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      eventCount: data.value ? data.value.length : 0,
      events: data.value ? data.value.slice(0, 5) : [],
      raw: data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}