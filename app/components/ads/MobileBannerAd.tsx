"use client";

import { AdPlacement } from "./AdPlacement";
import { cn } from "@/lib/utils";

interface MobileBannerAdProps {
  className?: string;
}

/**
 * Mobile Banner Ad (320x50) - Mobile only
 * Typically placed at top or between sections on mobile
 */
export function MobileBannerAd({ className }: MobileBannerAdProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center py-2 md:hidden",
        className
      )}
    >
      <AdPlacement slot="mobile-banner" />
    </div>
  );
}
