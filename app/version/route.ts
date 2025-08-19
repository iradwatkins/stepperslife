import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: "2.0.0",
    buildDate: "2025-01-19T14:00:00-08:00",
    features: {
      eventDiscovery: true,
      displayModes: ["grid", "masonry", "list", "map"],
      paymentMethods: ["square", "paypal", "cashapp"],
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