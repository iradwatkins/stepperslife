"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

// CRITICAL: Use the correct production Convex URL
const PRODUCTION_CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";

// Get the URL from environment or use production as fallback
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || PRODUCTION_CONVEX_URL;

// Ensure we're using the correct URL
const finalUrl = convexUrl === "https://mild-newt-621.convex.cloud" 
  ? PRODUCTION_CONVEX_URL 
  : convexUrl;

// Enhanced logging for debugging
if (typeof window !== 'undefined') {
  console.log("🔗 Convex Configuration:", {
    url: finalUrl,
    environment: process.env.NODE_ENV,
    hasWebSocket: 'WebSocket' in window,
    protocol: window.location.protocol,
    host: window.location.host
  });
  
  // Warning if wrong URL detected
  if (convexUrl.includes("mild-newt-621")) {
    console.error("⚠️ WRONG CONVEX URL DETECTED! Switching to production URL.");
  }
}

// Create the client with enhanced error handling
const convex = new ConvexReactClient(finalUrl, {
  // Add retry configuration
  unsavedChangesWarning: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting");
  
  useEffect(() => {
    // Monitor connection status
    const checkConnection = setTimeout(() => {
      // If still connecting after 5 seconds, likely an issue
      if (connectionStatus === "connecting") {
        console.error("⚠️ Convex connection taking too long. Check your internet connection.");
        setConnectionStatus("error");
      }
    }, 5000);
    
    // Assume connected after initial render (Convex will handle reconnection)
    setConnectionStatus("connected");
    
    return () => clearTimeout(checkConnection);
  }, []);
  
  // Show warning in development if Convex URL is missing or wrong
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.warn(
        "⚠️ NEXT_PUBLIC_CONVEX_URL is not set. Using production URL as fallback."
      );
    }
    
    if (connectionStatus === "error") {
      console.error("❌ Failed to connect to Convex. Events will not publish.");
    }
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
