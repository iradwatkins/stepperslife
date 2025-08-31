"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn("Clerk publishable key not found. Running without authentication.");
    return <>{children}</>;
  }
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}