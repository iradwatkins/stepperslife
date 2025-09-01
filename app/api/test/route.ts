import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "SteppersLife API is running",
    timestamp: new Date().toISOString(),
    version: "emergency-fix-1.0"
  });
}