// Types for aggregated content from all subdomains

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  cuisine: string[];
  logoUrl: string;
  coverImageUrl: string;
  acceptingOrders: boolean;
  estimatedPickupTime: number;
  averageRating: number;
  totalReviews: number;
}

// Event types from Convex (events.stepperslife.com)
export type EventType = "TICKETED_EVENT" | "FREE_EVENT" | "SAVE_THE_DATE";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface EventLocation {
  venueName?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface Event {
  _id: string; // Convex ID
  name: string;
  description: string;
  eventType: EventType;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  eventDateLiteral: string; // Display format: "March 15, 2025"
  eventTimeLiteral: string; // Display format: "8:00 PM - 2:00 AM"
  eventTimezone: string;
  location: EventLocation;
  status: EventStatus;
  categories: string[];
  imageUrl?: string; // Primary image URL
  organizerName: string;
  organizerId?: string;
  ticketsVisible?: boolean;
  isFeatured?: boolean;
  _creationTime?: number;
}

// Search and filter types
export interface EventFilters {
  searchTerm?: string;
  category?: string;
  city?: string;
  state?: string;
  startDate?: number;
  endDate?: number;
  eventType?: EventType;
  includePast?: boolean;
}

export interface EventCategory {
  name: string;
  count: number;
}

export interface MagazineArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  authorName: string;
  authorPhoto: string;
  publishedAt: string;
  readTime: number;
  isFeatured: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string;
  instructorName: string;
  instructorPhoto: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  totalLessons: number;
  enrollmentCount: number;
  averageRating: number;
  isFeatured: boolean;
}

export interface Service {
  id: string;
  slug: string;
  businessName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  startingPrice: number;
  isPriority: boolean;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  vendorName: string;
  vendorSlug: string;
  category: string;
  inStock: boolean;
}
