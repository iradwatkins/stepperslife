"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  // Always use ClerkProvider if we have the publishable key
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!hasClerkKey) {
    // Return children without ClerkProvider if no key
    console.warn("No Clerk publishable key found, skipping ClerkProvider");
    return <>{children}</>;
  }

  // Use ClerkProvider when we have the key
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