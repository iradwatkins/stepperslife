"use client";

import { AdPlacement } from "./AdPlacement";
import { cn } from "@/lib/utils";

interface FooterBannerAdProps {
  className?: string;
}

/**
 * Footer Banner Ad (728x90) - Desktop only
 * Placed at the bottom of pages before footer
 */
export function FooterBannerAd({ className }: FooterBannerAdProps) {
  return (
    <div
      className={cn(
        "hidden w-full items-center justify-center border-t py-6 md:flex",
        className
      )}
    >
      <AdPlacement slot="footer" />
    </div>
  );
}
