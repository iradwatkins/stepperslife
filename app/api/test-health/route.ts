import { NextResponse } from "next/server";

export async function GET() {
  console.log("Health check endpoint called");
  
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "not set",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "not set",
    }
  });
}