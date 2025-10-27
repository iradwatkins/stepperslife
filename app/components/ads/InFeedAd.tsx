"use client";

import { AdPlacement } from "./AdPlacement";
import { cn } from "@/lib/utils";

interface InFeedAdProps {
  className?: string;
}

/**
 * In-Feed Ad (300x250) - Responsive
 * Placed between content items in grids or lists
 */
export function InFeedAd({ className }: InFeedAdProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center py-4",
        className
      )}
    >
      <AdPlacement slot="in-feed" />
    </div>
  );
}
