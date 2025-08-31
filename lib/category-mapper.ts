// Category mapping between UI labels and Convex schema values
export const CATEGORY_MAP: Record<string, string> = {
  // UI Label -> Schema Value
  "Workshop": "workshop",
  "workshop": "workshop",
  "Sets/Performance": "sets",
  "sets": "sets",
  "In The Park": "in_the_park",
  "in_the_park": "in_the_park",
  "Trip/Travel": "trip",
  "trip": "trip",
  "Cruise": "cruise",
  "cruise": "cruise",
  "Holiday Event": "holiday",
  "holiday": "holiday",
  "Competition": "competition",
  "competition": "competition",
  "Class/Lesson": "class",
  "class": "class",
  "Social Dance": "social_dance",
  "social_dance": "social_dance",
  "Lounge/Bar": "lounge_bar",
  "lounge_bar": "lounge_bar",
  "Party": "other",
  "Other": "other",
  "Other/Party": "other",
  "other": "other"
};

// Normalize category from UI to schema format
export function normalizeCategory(category: string): string {
  return CATEGORY_MAP[category] || "other";
}

// Normalize array of categories
export function normalizeCategories(categories: string[]): string[] {
  return categories.map(normalizeCategory);
}

// Validate event data before sending to Convex
export function validateEventData(data: any) {
  const errors: string[] = [];
  
  // Required fields
  if (!data.name || data.name.trim() === "") {
    errors.push("Event name is required");
  }
  
  if (!data.description || data.description.trim() === "") {
    errors.push("Event description is required");
  }
  
  if (!data.isSaveTheDate) {
    if (!data.location || data.location.trim() === "") {
      errors.push("Event location is required");
    }
    
    if (!data.address || data.address.trim() === "") {
      errors.push("Event address is required");
    }
  }
  
  if (!data.eventDate) {
    errors.push("Event date is required");
  }
  
  if (!data.userId) {
    errors.push("User ID is required for event creation");
  }
  
  // Validate categories
  if (data.categories && data.categories.length > 0) {
    const normalized = normalizeCategories(data.categories);
    const validCategories = Object.values(CATEGORY_MAP);
    const invalid = normalized.filter(cat => !validCategories.includes(cat));
    if (invalid.length > 0) {
      errors.push(`Invalid categories: ${invalid.join(", ")}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Prepare event data for Convex
export function prepareEventDataForConvex(data: any) {
  // Normalize categories
  const categories = data.categories || [];
  const normalizedCategories = normalizeCategories(categories);
  
  // Select first category as eventType, default to "other"
  const eventType = normalizedCategories[0] || "other";
  
  // Determine event mode
  let eventMode: "single" | "multi_day" | "save_the_date" | undefined;
  if (data.isSaveTheDate) {
    eventMode = "save_the_date";
  } else if (data.isMultiDay) {
    eventMode = "multi_day";
  } else if (data.eventMode) {
    eventMode = data.eventMode;
  } else {
    eventMode = "single";
  }
  
  // Clean and prepare the data - include ALL fields from schema
  return {
    // Required fields
    name: data.name.trim(),
    description: data.description.trim(),
    location: data.isSaveTheDate ? "" : (data.location || "").trim(),
    eventDate: data.eventDate,
    price: data.price || data.doorPrice || 0,
    totalTickets: data.totalTickets || 0,
    userId: data.userId,
    
    // Optional fields - Images
    imageStorageId: data.imageStorageId || undefined,
    imageUrl: data.imageUrl || undefined,
    
    // Event categorization
    eventType: eventType as any,
    eventCategories: normalizedCategories as any[],
    
    // Ticketing fields
    isTicketed: data.isTicketed !== undefined ? data.isTicketed : true,
    doorPrice: data.doorPrice || undefined,
    
    // Location fields
    address: data.isSaveTheDate ? "" : (data.address || "").trim(),
    city: data.isSaveTheDate ? "" : (data.city || "").trim(),
    state: data.isSaveTheDate ? "" : (data.state || "").trim(),
    postalCode: data.isSaveTheDate ? "" : (data.postalCode || "").trim(),
    country: data.country || undefined,
    latitude: data.latitude || undefined,
    longitude: data.longitude || undefined,
    
    // Multi-day event support
    endDate: data.endDate || undefined,
    isMultiDay: data.isMultiDay || false,
    isSaveTheDate: data.isSaveTheDate || false,
    sameLocation: data.sameLocation !== undefined ? data.sameLocation : true,
    eventMode: eventMode as any,
    
    // Capacity management fields
    totalCapacity: data.totalCapacity || undefined,
    capacityBreakdown: data.capacityBreakdown || undefined,
    
    // Admin posting fields
    postedByAdmin: data.postedByAdmin || undefined,
    adminUserId: data.adminUserId || undefined,
    claimable: data.claimable || undefined,
    claimToken: data.claimToken || undefined,
  };
}
