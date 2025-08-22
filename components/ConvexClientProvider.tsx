"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Use a dummy URL during build time or when env var is missing
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud";

// Only create the client if we have a URL (even if it's dummy)
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Show warning in development if Convex URL is missing
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.warn(
      "⚠️ NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work. " +
      "Please set this environment variable in your .env.local file or deployment settings."
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
