export interface Event {
  _id: string;
  name: string;
  description: string;
  startDate?: number;
  timezone?: string;
  location?: {
    city?: string;
    state?: string;
    venueName?: string;
  };
  images?: string[];
  imageUrl?: string;
  eventType: string;
  categories?: string[];
  ticketsVisible?: boolean;
  organizerName?: string;
  isClaimable?: boolean;
}
