import { NextResponse } from 'next/server';

export async function GET() {
  // Force dynamic rendering - no cache
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  return NextResponse.json({
    version: "3.1.0",
    buildDate: "2025-08-24T20:45:00Z",
    deploymentTimestamp: Date.now(),
    deploymentDate: "2025-08-24T20:45:00Z",
    lastCommit: "docker-cache-break",
    features: {
      eventDiscovery: true,
      displayModes: ["grid", "masonry", "list", "map"],
      paymentMethods: ["square", "stripe", "paypal", "zelle"],
      platformFee: "$1.50 per ticket",
      cashAppSupport: "via Square",
      eventTypes: [
        "workshop",
        "sets", 
        "in_the_park",
        "trip",
        "cruise",
        "holiday",
        "competition",
        "class"
      ],
      geolocation: true,
      googleMaps: true,
      zellePayouts: true
    },
    deployment: {
      repository: "https://github.com/iradwatkins/stepperslife",
      branch: "main",
      environment: process.env.NODE_ENV || "production"
    }
  }, { headers });
}