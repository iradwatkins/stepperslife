import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for constructing className strings conditionally
 * Combines clsx for conditional classes and tailwind-merge to avoid conflicts
 * 
 * @example
 * cn("base-class", isActive && "active-class", { "conditional-class": someCondition })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common button style variants using the cn utility
 */
export const buttonVariants = {
  primary: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors",
  secondary: "px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors",
  danger: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
  ghost: "px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
  link: "text-purple-600 hover:text-purple-700 underline transition-colors",
} as const;

/**
 * Common card style variants
 */
export const cardVariants = {
  default: "bg-white rounded-lg shadow-md p-6 border border-gray-200",
  elevated: "bg-white rounded-lg shadow-lg p-6",
  flat: "bg-white rounded-lg p-6 border border-gray-200",
  dark: "bg-gray-900 text-white rounded-lg shadow-md p-6 border border-gray-700",
} as const;

/**
 * Status color variants for badges and indicators
 */
export const statusColors = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  neutral: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

/**
 * Helper to get button classes with variant
 */
export function getButtonClass(variant: keyof typeof buttonVariants = "primary", className?: string) {
  return cn(buttonVariants[variant], className);
}

/**
 * Helper to get card classes with variant
 */
export function getCardClass(variant: keyof typeof cardVariants = "default", className?: string) {
  return cn(cardVariants[variant], className);
}

/**
 * Helper to get status classes
 */
export function getStatusClass(status: keyof typeof statusColors, className?: string) {
  return cn(statusColors[status], "px-2 py-1 rounded-md border", className);
}