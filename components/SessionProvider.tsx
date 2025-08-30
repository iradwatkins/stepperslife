"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Keep session alive by checking it periodically
    const interval = setInterval(() => {
      // This will trigger a session check
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <NextAuthSessionProvider
      // Re-fetch session every minute (60 seconds) for better persistence
      refetchInterval={60}
      // Re-fetch session on window focus
      refetchOnWindowFocus={true}
      // Base URL for auth
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}