/**
 * Date utilities for handling timezone-safe date operations
 * Ensures dates are handled consistently in local timezone
 */

/**
 * Creates a date from a value ensuring it's in local timezone
 * Handles timestamps, ISO strings, and Date objects
 */
export function ensureLocalDate(dateValue: number | string | Date | undefined | null): Date | null {
  if (!dateValue) return null;
  
  // If it's already a Date object, create a new instance
  if (dateValue instanceof Date) {
    return new Date(dateValue.getTime());
  }
  
  // If it's a number (timestamp), create date normally
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // If it's a string
  if (typeof dateValue === 'string') {
    // Check if it's an ISO date string with time (contains 'T')
    if (dateValue.includes('T')) {
      // Parse the date part only to avoid timezone conversion
      const [datePart] = dateValue.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    
    // If it's just a date string (YYYY-MM-DD), parse it as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    
    // Try to parse as timestamp if it's a numeric string
    const timestamp = Number(dateValue);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    
    // Fallback to Date constructor (might have timezone issues)
    return new Date(dateValue);
  }
  
  return null;
}

/**
 * Creates a date with specific time while preserving the date
 */
export function setDateTime(date: Date, hours: number, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

/**
 * Formats a date for display ensuring local timezone
 */
export function formatLocalDate(date: Date | number | string | undefined | null, format?: string): string {
  const localDate = ensureLocalDate(date);
  if (!localDate) return '';
  
  // Basic formatting - you can enhance this or use date-fns
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  
  return localDate.toLocaleString('en-US', options);
}

/**
 * Gets the date string for HTML date input (YYYY-MM-DD)
 */
export function getDateInputValue(date: Date | undefined | null): string {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets the time string for HTML time input (HH:MM)
 */
export function getTimeInputValue(date: Date | undefined | null): string {
  if (!date) return '00:00';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Creates a date from date and time inputs
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
}

/**
 * Safely converts a date to timestamp for storage
 */
export function toTimestamp(date: Date | undefined | null): number {
  if (!date) return Date.now();
  return date.getTime();
}

/**
 * Check if two dates are on the same day (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get start of day (midnight)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Format a date for display (date only, no time)
 * Handles timezone issues to prevent date shifting
 */
export function formatEventDate(
  date: number | string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const localDate = ensureLocalDate(date);
  if (!localDate) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return localDate.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Format a date with time for display
 * Handles timezone issues to prevent date shifting
 */
export function formatEventDateTimeDisplay(
  date: number | string | Date | undefined | null,
  includeTime: boolean = true,
  options?: Intl.DateTimeFormatOptions
): string {
  const localDate = ensureLocalDate(date);
  if (!localDate) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = includeTime ? {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  } : {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return localDate.toLocaleString('en-US', options || defaultOptions);
}

/**
 * Format a date in short format (MM/DD/YYYY)
 * Handles timezone issues to prevent date shifting
 */
export function formatEventDateShort(
  date: number | string | Date | undefined | null
): string {
  const localDate = ensureLocalDate(date);
  if (!localDate) return '';
  
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const year = localDate.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Parse a date string as a local date, not UTC
 * CRITICAL: This function is essential for preventing timezone shifts
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Optional time string in HH:MM format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateStr: string, timeStr?: string): Date {
  // Split the date string to get year, month, day
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Parse time if provided, default to midnight
  const [hours = 0, minutes = 0] = (timeStr || '00:00').split(':').map(Number);
  
  // Create date in local timezone (month is 0-indexed in JS)
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Convert a local date string to a timestamp
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Optional time string in HH:MM format
 * @returns Timestamp in milliseconds
 */
export function localDateToTimestamp(dateStr: string, timeStr?: string): number {
  return parseLocalDate(dateStr, timeStr).getTime();
}

/**
 * Format a date for display, handling both timestamps and date strings correctly
 * @param date - Date as string (YYYY-MM-DD), timestamp, or Date object
 * @returns Formatted date string for display
 */
export function formatDisplayDate(date: string | number | Date): string {
  // Handle YYYY-MM-DD format strings as local dates
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return parseLocalDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }
  
  // Handle timestamps and Date objects
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

/**
 * Format a date for HTML date input value
 * @param date - Date object, timestamp, or date string
 * @returns YYYY-MM-DD formatted string
 */
export function formatForDateInput(date: Date | number | string): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as is
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}