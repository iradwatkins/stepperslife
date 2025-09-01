import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Removed useStorageUrl - we now use MinIO URLs directly from imageUrl field
// No more Convex storage dependencies!
