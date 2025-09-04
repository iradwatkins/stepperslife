// Common type definitions to replace 'any' types

export interface EventData {
  _id: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  price?: number;
  imageUrl?: string;
  category?: string[];
  organizerId?: string;
  [key: string]: unknown; // For additional properties
}

export interface TicketData {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity?: number;
  earlyBird?: boolean;
  [key: string]: unknown;
}

export interface UserData {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface PurchaseData {
  id: string;
  eventId: string;
  userId?: string;
  tickets?: TicketData[];
  totalAmount: number;
  status?: string;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface FormErrors {
  [fieldName: string]: string | undefined;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}