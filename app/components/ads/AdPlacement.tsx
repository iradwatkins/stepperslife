"use client";

import { cn } from "@/lib/utils";

interface AdPlacementProps {
  slot: "leaderboard" | "sidebar" | "in-feed" | "footer" | "mobile-banner";
  className?: string;
}

/**
 * Ad Placement Component
 * This is a placeholder for actual ad network integration (Google AdSense, etc.)
 * Replace the mock content with actual ad network code when ready
 */
export function AdPlacement({ slot, className }: AdPlacementProps) {
  const adSizes = {
    leaderboard: { width: 728, height: 90, label: "728x90 Leaderboard" },
    sidebar: { width: 300, height: 250, label: "300x250 Medium Rectangle" },
    "in-feed": { width: 300, height: 250, label: "300x250 In-Feed" },
    footer: { width: 728, height: 90, label: "728x90 Footer Banner" },
    "mobile-banner": { width: 320, height: 50, label: "320x50 Mobile Banner" },
  };

  const config = adSizes[slot];

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20",
        className
      )}
      style={{
        minHeight: config.height,
        maxWidth: config.width,
      }}
    >
      <div className="text-center p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Advertisement
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          {config.label}
        </p>
        {/* Replace this div with actual ad network script */}
        <div
          className="mt-2 flex items-center justify-center text-muted-foreground/40"
          style={{ minHeight: Math.max(50, config.height - 40) }}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
