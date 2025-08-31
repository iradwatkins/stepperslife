// Comprehensive data validator for Convex integration
// Ensures all data is properly typed and validated before sending to Convex

import { z } from "zod";

// Define the exact schema that matches Convex
const EventCategorySchema = z.enum([
  "workshop",
  "sets",
  "in_the_park",
  "trip",
  "cruise",
  "holiday",
  "competition",
  "class",
  "social_dance",
  "lounge_bar",
  "other"
]);

const EventModeSchema = z.enum([
  "single",
  "multi_day",
  "save_the_date"
]);

// Complete event data schema matching Convex exactly
export const ConvexEventSchema = z.object({
  // Required fields
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string(),
  eventDate: z.number().positive("Event date must be a valid timestamp"),
  price: z.number().min(0, "Price cannot be negative"),
  totalTickets: z.number().min(0, "Total tickets cannot be negative"),
  userId: z.string().min(1, "User ID is required"),
  
  // Optional image fields
  imageStorageId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  
  // Event categorization
  eventType: EventCategorySchema.optional(),
  eventCategories: z.array(EventCategorySchema).optional(),
  
  // Ticketing fields
  isTicketed: z.boolean().optional(),
  doorPrice: z.number().min(0).optional(),
  
  // Location fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Multi-day event support
  endDate: z.number().positive().optional(),
  isMultiDay: z.boolean().optional(),
  isSaveTheDate: z.boolean().optional(),
  sameLocation: z.boolean().optional(),
  eventMode: EventModeSchema.optional(),
  
  // Capacity management
  totalCapacity: z.number().min(0).optional(),
  capacityBreakdown: z.string().optional(),
  
  // Admin posting fields
  postedByAdmin: z.boolean().optional(),
  adminUserId: z.string().optional(),
  claimable: z.boolean().optional(),
  claimToken: z.string().optional(),
});

export type ConvexEventData = z.infer<typeof ConvexEventSchema>;

// Validation function with detailed error reporting
export function validateEventDataForConvex(data: any): {
  isValid: boolean;
  data?: ConvexEventData;
  errors?: string[];
} {
  try {
    // Parse and validate the data
    const validatedData = ConvexEventSchema.parse(data);
    
    // Additional business logic validations
    const errors: string[] = [];
    
    // If it's a multi-day event, endDate should be provided and after eventDate
    if (validatedData.isMultiDay && validatedData.endDate) {
      if (validatedData.endDate <= validatedData.eventDate) {
        errors.push("End date must be after the start date for multi-day events");
      }
    }
    
    // If ticketed, ensure proper ticket configuration
    if (validatedData.isTicketed && validatedData.totalTickets === 0) {
      errors.push("Ticketed events must have at least 1 ticket available");
    }
    
    // Location validation for non-save-the-date events
    if (!validatedData.isSaveTheDate) {
      if (!validatedData.location || validatedData.location.trim() === "") {
        errors.push("Location is required for non-save-the-date events");
      }
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });
      return { isValid: false, errors };
    }
    
    return { 
      isValid: false, 
      errors: ["Unknown validation error occurred"] 
    };
  }
}

// Function to sanitize and prepare raw data for Convex
export function sanitizeEventData(rawData: any): Partial<ConvexEventData> {
  const sanitized: any = {};
  
  // Process each field with proper type conversion
  if (rawData.name) sanitized.name = String(rawData.name).trim();
  if (rawData.description) sanitized.description = String(rawData.description).trim();
  if (rawData.location !== undefined) sanitized.location = String(rawData.location || "").trim();
  
  // Convert dates to timestamps
  if (rawData.eventDate) {
    if (typeof rawData.eventDate === "string") {
      sanitized.eventDate = new Date(rawData.eventDate).getTime();
    } else if (typeof rawData.eventDate === "number") {
      sanitized.eventDate = rawData.eventDate;
    }
  }
  
  if (rawData.endDate) {
    if (typeof rawData.endDate === "string") {
      sanitized.endDate = new Date(rawData.endDate).getTime();
    } else if (typeof rawData.endDate === "number") {
      sanitized.endDate = rawData.endDate;
    }
  }
  
  // Convert numeric fields
  if (rawData.price !== undefined) sanitized.price = Number(rawData.price) || 0;
  if (rawData.totalTickets !== undefined) sanitized.totalTickets = Number(rawData.totalTickets) || 0;
  if (rawData.doorPrice !== undefined) sanitized.doorPrice = Number(rawData.doorPrice) || 0;
  if (rawData.totalCapacity !== undefined) sanitized.totalCapacity = Number(rawData.totalCapacity) || 0;
  
  // Convert boolean fields
  if (rawData.isTicketed !== undefined) sanitized.isTicketed = Boolean(rawData.isTicketed);
  if (rawData.isMultiDay !== undefined) sanitized.isMultiDay = Boolean(rawData.isMultiDay);
  if (rawData.isSaveTheDate !== undefined) sanitized.isSaveTheDate = Boolean(rawData.isSaveTheDate);
  if (rawData.sameLocation !== undefined) sanitized.sameLocation = Boolean(rawData.sameLocation);
  if (rawData.postedByAdmin !== undefined) sanitized.postedByAdmin = Boolean(rawData.postedByAdmin);
  if (rawData.claimable !== undefined) sanitized.claimable = Boolean(rawData.claimable);
  
  // Copy string fields
  if (rawData.userId) sanitized.userId = String(rawData.userId);
  if (rawData.imageStorageId) sanitized.imageStorageId = String(rawData.imageStorageId);
  if (rawData.imageUrl) sanitized.imageUrl = String(rawData.imageUrl);
  if (rawData.address) sanitized.address = String(rawData.address).trim();
  if (rawData.city) sanitized.city = String(rawData.city).trim();
  if (rawData.state) sanitized.state = String(rawData.state).trim();
  if (rawData.postalCode) sanitized.postalCode = String(rawData.postalCode).trim();
  if (rawData.country) sanitized.country = String(rawData.country).trim();
  if (rawData.capacityBreakdown) sanitized.capacityBreakdown = String(rawData.capacityBreakdown);
  if (rawData.adminUserId) sanitized.adminUserId = String(rawData.adminUserId);
  if (rawData.claimToken) sanitized.claimToken = String(rawData.claimToken);
  
  // Convert location coordinates
  if (rawData.latitude !== undefined) sanitized.latitude = Number(rawData.latitude) || undefined;
  if (rawData.longitude !== undefined) sanitized.longitude = Number(rawData.longitude) || undefined;
  
  // Handle enums
  if (rawData.eventType) sanitized.eventType = rawData.eventType;
  if (rawData.eventCategories) sanitized.eventCategories = rawData.eventCategories;
  if (rawData.eventMode) sanitized.eventMode = rawData.eventMode;
  
  return sanitized;
}

// Export validation utilities
export const EventValidation = {
  schema: ConvexEventSchema,
  validate: validateEventDataForConvex,
  sanitize: sanitizeEventData,
  categories: EventCategorySchema.options,
  modes: EventModeSchema.options,
};