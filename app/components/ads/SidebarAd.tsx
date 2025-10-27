"use client";

import { AdPlacement } from "./AdPlacement";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
  className?: string;
  sticky?: boolean;
}

/**
 * Sidebar Ad (300x250) - Desktop only
 * Typically placed in sidebar on content pages
 */
export function SidebarAd({ className, sticky = true }: SidebarAdProps) {
  return (
    <div
      className={cn(
        "hidden w-full lg:block",
        sticky && "sticky top-20",
        className
      )}
    >
      <AdPlacement slot="sidebar" />
    </div>
  );
}
