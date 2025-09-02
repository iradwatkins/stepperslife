// Shared event types - centralized to prevent import errors

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  hasEarlyBird: boolean;  // Made required with default false
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  maxPerOrder?: number;
}

export interface TableConfig {
  id: string;
  name: string;
  seatCount: number;
  price: number;
  quantity?: number;  // Made optional since not always used
  description?: string;
  sourceTicketTypeId: string;  // Made required for proper linking
  sourceTicketTypeName: string;  // Made required for display
}

export interface EventData {
  // Basic info
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  eventDate: string;
  eventTime: string;
  endTime?: string;
  
  // Geolocation and timezone
  latitude?: number;
  longitude?: number;
  eventTimezone?: string;
  
  // Images
  mainImage?: string;
  galleryImages?: string[];
  
  // Ticketing
  isTicketed: boolean;
  doorPrice?: number;
  isSaveTheDate?: boolean;
  
  // Capacity
  totalCapacity?: number;
  
  // Categories
  categories: string[];
}