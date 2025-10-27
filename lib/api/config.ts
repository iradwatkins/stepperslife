// API Configuration for all subdomains

export const API_CONFIG = {
  magazine: {
    baseUrl:
      process.env.NEXT_PUBLIC_MAGAZINE_API ||
      "http://localhost:3007/api",
    endpoints: {
      articles: "/articles",
      article: (slug: string) => `/articles/${slug}`,
    },
  },
  events: {
    baseUrl:
      process.env.NEXT_PUBLIC_EVENTS_API ||
      "http://localhost:3004/api",
    endpoints: {
      events: "/events",
      event: (slug: string) => `/events/${slug}`,
      tickets: "/tickets/purchase",
    },
  },
  stores: {
    baseUrl:
      process.env.NEXT_PUBLIC_STORES_API ||
      "http://localhost:3008/api",
    endpoints: {
      products: "/products",
      product: (id: string) => `/products/${id}`,
      orders: "/orders",
    },
  },
  restaurants: {
    baseUrl:
      process.env.NEXT_PUBLIC_RESTAURANTS_API ||
      "http://localhost:3010/api",
    endpoints: {
      restaurants: "/restaurants",
      restaurant: (slug: string) => `/restaurants/${slug}`,
      orders: "/orders",
      orderStatus: (id: string) => `/orders/${id}`,
    },
  },
  classes: {
    baseUrl:
      process.env.NEXT_PUBLIC_CLASSES_API ||
      "http://localhost:3009/api",
    endpoints: {
      courses: "/courses",
      course: (slug: string) => `/courses/${slug}`,
      enrollments: "/enrollments",
    },
  },
  services: {
    baseUrl:
      process.env.NEXT_PUBLIC_SERVICES_API ||
      "http://localhost:3011/api",
    endpoints: {
      services: "/services",
      service: (slug: string) => `/services/${slug}`,
      inquiries: "/inquiries",
    },
  },
} as const;

// Feature flag to use mock data or real APIs
// Hardcoded to true for production with mock data
export const USE_MOCK_DATA = true; // process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// Generic API error handler
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Generic fetch wrapper with error handling
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || "API request failed",
        response.status,
        errorData.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Network error occurred");
  }
}
