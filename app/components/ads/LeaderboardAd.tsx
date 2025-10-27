"use client";

import { AdPlacement } from "./AdPlacement";
import { cn } from "@/lib/utils";

interface LeaderboardAdProps {
  className?: string;
}

/**
 * Leaderboard Ad (728x90) - Desktop only
 * Typically placed at the top of content sections
 */
export function LeaderboardAd({ className }: LeaderboardAdProps) {
  return (
    <div
      className={cn(
        "hidden w-full items-center justify-center py-4 md:flex",
        className
      )}
    >
      <AdPlacement slot="leaderboard" />
    </div>
  );
}
