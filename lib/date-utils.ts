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