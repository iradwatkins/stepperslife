import { NextResponse } from 'next/server';

export async function GET() {
  // Dynamic version information
  const buildDate = new Date().toISOString();
  const version = "3.1.0"; // Updated for payment system deployment
  
  return NextResponse.json({
    version: version,
    buildDate: buildDate,
    deploymentDate: "2025-08-24T20:32:00Z",
    lastCommit: "c43c95a",
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
  });
}