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
  
  // Clean and prepare the data
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    location: data.isSaveTheDate ? "" : (data.location || "").trim(),
    address: data.isSaveTheDate ? "" : (data.address || "").trim(),
    city: data.isSaveTheDate ? "" : (data.city || "").trim(),
    state: data.isSaveTheDate ? "" : (data.state || "").trim(),
    postalCode: data.isSaveTheDate ? "" : (data.postalCode || "").trim(),
    eventDate: data.eventDate,
    price: data.doorPrice || 0,
    totalTickets: data.totalTickets || 0,
    eventType: eventType,
    eventCategories: normalizedCategories,
    userId: data.userId,
    isTicketed: data.isTicketed,
    doorPrice: data.doorPrice,
    isSaveTheDate: data.isSaveTheDate || false,
    imageStorageId: data.imageStorageId || null,
    imageUrl: data.imageUrl || null,
    latitude: data.latitude,
    longitude: data.longitude,
    country: data.country
  };
}
