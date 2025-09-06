/**
 * Date utility functions for Convex backend
 * Ensures dates are handled consistently in local timezone
 */

/**
 * Parse a date string as a local date, not UTC
 * CRITICAL: This prevents timezone shifting issues
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateStr: string): Date {
  // Split the date string to get year, month, day
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Create date in local timezone (month is 0-indexed in JS)
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Convert a local date string to a timestamp
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Timestamp in milliseconds
 */
export function localDateToTimestamp(dateStr: string): number {
  return parseLocalDate(dateStr).getTime();
}

/**
 * Format a timestamp for display
 * @param timestamp - Timestamp in milliseconds
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', options);
}