import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Map of US state abbreviations to their primary IANA timezone identifiers
 * Note: Some states span multiple timezones, using the most populous timezone as default
 */
export const STATE_TIMEZONES: Record<string, string> = {
  // Pacific Time
  'CA': 'America/Los_Angeles',
  'WA': 'America/Los_Angeles',
  'OR': 'America/Los_Angeles',
  'NV': 'America/Los_Angeles',
  
  // Mountain Time (Arizona doesn't observe DST)
  'AZ': 'America/Phoenix',
  'UT': 'America/Denver',
  'CO': 'America/Denver',
  'NM': 'America/Denver',
  'MT': 'America/Denver',
  'WY': 'America/Denver',
  'ID': 'America/Denver', // Most of Idaho is Mountain Time
  
  // Central Time
  'TX': 'America/Chicago', // Most of Texas is Central
  'OK': 'America/Chicago',
  'KS': 'America/Chicago', // Most of Kansas is Central
  'NE': 'America/Chicago', // Most of Nebraska is Central
  'SD': 'America/Chicago', // Most of South Dakota is Central
  'ND': 'America/Chicago', // Most of North Dakota is Central
  'MN': 'America/Chicago',
  'IA': 'America/Chicago',
  'MO': 'America/Chicago',
  'AR': 'America/Chicago',
  'LA': 'America/Chicago',
  'MS': 'America/Chicago',
  'AL': 'America/Chicago',
  'TN': 'America/Chicago', // Most of Tennessee is Central
  'KY': 'America/Chicago', // Western Kentucky is Central
  'IL': 'America/Chicago',
  'WI': 'America/Chicago',
  'IN': 'America/Chicago', // Most of Indiana is Eastern, but northwest is Central
  
  // Eastern Time
  'MI': 'America/New_York',
  'OH': 'America/New_York',
  'PA': 'America/New_York',
  'NY': 'America/New_York',
  'VT': 'America/New_York',
  'NH': 'America/New_York',
  'ME': 'America/New_York',
  'MA': 'America/New_York',
  'RI': 'America/New_York',
  'CT': 'America/New_York',
  'NJ': 'America/New_York',
  'DE': 'America/New_York',
  'MD': 'America/New_York',
  'DC': 'America/New_York',
  'VA': 'America/New_York',
  'WV': 'America/New_York',
  'NC': 'America/New_York',
  'SC': 'America/New_York',
  'GA': 'America/New_York',
  'FL': 'America/New_York', // Most of Florida is Eastern
  
  // Alaska Time
  'AK': 'America/Anchorage',
  
  // Hawaii-Aleutian Time (Hawaii doesn't observe DST)
  'HI': 'Pacific/Honolulu',
  
  // US Territories
  'PR': 'America/Puerto_Rico', // Atlantic Time, no DST
  'VI': 'America/St_Thomas', // Atlantic Time, no DST
  'GU': 'Pacific/Guam', // Chamorro Time
  'MP': 'Pacific/Saipan', // Chamorro Time
  'AS': 'Pacific/Pago_Pago', // Samoa Time
};

/**
 * Get timezone from state abbreviation
 * @param state Two-letter state abbreviation (e.g., 'CA', 'NY')
 * @returns IANA timezone identifier or default to America/New_York
 */
export function getTimezoneFromState(state: string): string {
  const upperState = state?.toUpperCase()?.trim();
  return STATE_TIMEZONES[upperState] || 'America/New_York';
}

/**
 * Convert a local date/time to UTC timestamp
 * @param date Date object or date string in local time
 * @param time Time string in HH:mm format
 * @param timezone IANA timezone identifier
 * @returns UTC timestamp in milliseconds
 */
export function localToUTC(date: string, time: string, timezone: string): number {
  // Parse date components
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  
  // Create date in local timezone (month is 0-indexed in JavaScript)
  const localDate = new Date(year, month - 1, day, hours || 0, minutes || 0);
  
  // Convert from the specified timezone to UTC
  // fromZonedTime treats the input date as being in the specified timezone
  const utcDate = fromZonedTime(localDate, timezone);
  
  return utcDate.getTime();
}

/**
 * Convert UTC timestamp to local date in specified timezone
 * @param utcTimestamp UTC timestamp in milliseconds
 * @param timezone IANA timezone identifier
 * @returns Date object in the specified timezone
 */
export function utcToLocal(utcTimestamp: number, timezone: string): Date {
  return toZonedTime(new Date(utcTimestamp), timezone);
}

/**
 * Format a UTC timestamp for display in the event's timezone
 * @param utcTimestamp UTC timestamp in milliseconds
 * @param timezone IANA timezone identifier
 * @param formatString Optional format string (defaults to full date/time with timezone)
 * @returns Formatted date string
 */
export function formatEventDateTime(
  utcTimestamp: number, 
  timezone: string,
  formatString: string = 'EEEE, MMMM d, yyyy h:mm a zzz'
): string {
  return formatInTimeZone(new Date(utcTimestamp), timezone, formatString);
}

/**
 * Get a short timezone display name (e.g., 'PST', 'EDT')
 * @param utcTimestamp UTC timestamp to check for DST
 * @param timezone IANA timezone identifier
 * @returns Short timezone abbreviation
 */
export function getTimezoneAbbreviation(utcTimestamp: number, timezone: string): string {
  return formatInTimeZone(new Date(utcTimestamp), timezone, 'zzz');
}

/**
 * Check if a date falls within DST for a given timezone
 * @param utcTimestamp UTC timestamp to check
 * @param timezone IANA timezone identifier
 * @returns True if the date is in DST
 */
export function isDST(utcTimestamp: number, timezone: string): boolean {
  const date = new Date(utcTimestamp);
  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);
  
  const janOffset = toZonedTime(january, timezone).getTimezoneOffset();
  const julyOffset = toZonedTime(july, timezone).getTimezoneOffset();
  const currentOffset = toZonedTime(date, timezone).getTimezoneOffset();
  
  const standardOffset = Math.max(janOffset, julyOffset);
  return currentOffset < standardOffset;
}

/**
 * Get user's browser timezone
 * @returns IANA timezone identifier for the user's browser
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format date for display with optional "in your timezone" conversion
 * @param utcTimestamp UTC timestamp
 * @param eventTimezone Event's timezone
 * @param showUserTimezone Whether to show conversion to user's timezone
 * @returns Formatted string with optional timezone conversion
 */
export function formatWithUserTimezone(
  utcTimestamp: number,
  eventTimezone: string,
  showUserTimezone: boolean = false
): string {
  const eventTime = formatEventDateTime(utcTimestamp, eventTimezone, 'MMM d, yyyy h:mm a zzz');
  
  if (showUserTimezone) {
    const userTimezone = getUserTimezone();
    if (userTimezone !== eventTimezone) {
      const userTime = formatEventDateTime(utcTimestamp, userTimezone, 'h:mm a zzz');
      return `${eventTime} (${userTime} your time)`;
    }
  }
  
  return eventTime;
}

/**
 * Legacy support: Convert existing eventDate to UTC
 * Assumes the stored timestamp was meant to be in the event's local timezone
 * @param eventDate Existing eventDate timestamp
 * @param state State abbreviation to determine timezone
 * @returns UTC timestamp
 */
export function migrateEventDateToUTC(eventDate: number, state: string): number {
  // Get the timezone for this state
  const timezone = getTimezoneFromState(state);
  
  // The existing eventDate was stored as if it were local time
  // We need to interpret it as being in the event's timezone
  const localDate = new Date(eventDate);
  
  // Convert from the event's timezone to UTC
  const utcDate = fromZonedTime(localDate, timezone);
  
  return utcDate.getTime();
}

/**
 * Get timezone from latitude and longitude using Google Time Zone API
 * @param lat Latitude
 * @param lng Longitude
 * @param timestamp Optional timestamp for DST calculation (defaults to now)
 * @returns Promise with IANA timezone identifier
 */
export async function getTimezoneFromCoordinates(
  lat: number, 
  lng: number, 
  timestamp?: number
): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found, using state-based timezone');
      return 'America/New_York'; // Default fallback
    }
    
    const ts = timestamp ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.timeZoneId) {
      return data.timeZoneId;
    } else {
      console.warn('Google Timezone API error:', data.status);
      return 'America/New_York'; // Default fallback
    }
  } catch (error) {
    console.error('Error fetching timezone:', error);
    return 'America/New_York'; // Default fallback
  }
}