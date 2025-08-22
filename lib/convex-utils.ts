/**
 * Utility functions for Convex configuration
 */

export function isConvexConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONVEX_URL && 
         process.env.NEXT_PUBLIC_CONVEX_URL !== "https://dummy.convex.cloud";
}

export function getConvexUrl(): string {
  return process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud";
}

export function getConvexStatus(): {
  configured: boolean;
  url: string | undefined;
  message: string;
} {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!url) {
    return {
      configured: false,
      url: undefined,
      message: "NEXT_PUBLIC_CONVEX_URL is not set. Database features will not work."
    };
  }
  
  if (url === "https://dummy.convex.cloud") {
    return {
      configured: false,
      url: url,
      message: "Using dummy Convex URL. Database features will not work."
    };
  }
  
  return {
    configured: true,
    url: url,
    message: "Convex is properly configured."
  };
}