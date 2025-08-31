"use client";

import { ReactNode } from "react";

export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  // We've migrated to Auth.js, so we no longer need ClerkProvider
  // This component now just passes through children
  return <>{children}</>;
}