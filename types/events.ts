// Shared event types

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  hasEarlyBird?: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
}

export interface TableConfig {
  id: string;
  name: string;
  seatCount: number;
  price: number;
  quantity: number;
  description?: string;
  sourceTicketTypeId?: string;
  sourceTicketTypeName?: string;
}