"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  // Check if we should skip Clerk (for local development)
  const skipClerk = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'false' || 
                    process.env.NODE_ENV === 'development';

  if (skipClerk) {
    // Return children without ClerkProvider in development
    return <>{children}</>;
  }

  // Use ClerkProvider in production
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          termsPageUrl: "https://stepperslife.com/terms",
          privacyPageUrl: "https://stepperslife.com/privacy",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}