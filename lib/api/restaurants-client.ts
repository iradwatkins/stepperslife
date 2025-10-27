import { Restaurant } from "../types/aggregated-content";
import { API_CONFIG, apiFetch, USE_MOCK_DATA } from "./config";
import { mockRestaurants } from "../mock-data/restaurants";

export interface GetRestaurantsParams {
  cuisine?: string;
  acceptingOrders?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetRestaurantsResponse {
  restaurants: Restaurant[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateOrderData {
  restaurantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    options?: Record<string, string | string[]>;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  pickupTime: string;
  specialInstructions?: string;
  paymentProcessor: "STRIPE" | "PAYPAL";
  paymentIntentId: string;
}

export const restaurantsAPI = {
  /**
   * Get all restaurants with optional filters
   */
  getRestaurants: async (
    params?: GetRestaurantsParams
  ): Promise<GetRestaurantsResponse> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      let filtered = mockRestaurants;

      if (params?.acceptingOrders !== undefined) {
        filtered = filtered.filter(
          (r) => r.acceptingOrders === params.acceptingOrders
        );
      }

      if (params?.cuisine) {
        filtered = filtered.filter((r) =>
          r.cuisine.some((c) =>
            c.toLowerCase().includes(params.cuisine!.toLowerCase())
          )
        );
      }

      return {
        restaurants: filtered.slice(0, params?.limit || 20),
        pagination: {
          total: filtered.length,
          limit: params?.limit || 20,
          offset: params?.offset || 0,
          hasMore: false,
        },
      };
    }

    // Real API call
    const url = new URL(
      `${API_CONFIG.restaurants.baseUrl}${API_CONFIG.restaurants.endpoints.restaurants}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiFetch<GetRestaurantsResponse>(url.toString());
  },

  /**
   * Get single restaurant by slug
   */
  getRestaurant: async (slug: string): Promise<{ restaurant: Restaurant }> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const restaurant = mockRestaurants.find((r) => r.slug === slug);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return { restaurant };
    }

    // Real API call
    const url = `${API_CONFIG.restaurants.baseUrl}${API_CONFIG.restaurants.endpoints.restaurant(slug)}`;
    return apiFetch<{ restaurant: Restaurant }>(url);
  },

  /**
   * Create an order
   */
  createOrder: async (data: CreateOrderData) => {
    if (USE_MOCK_DATA) {
      return {
        order: {
          id: `order_${Date.now()}`,
          orderNumber: `SL-REST-${Math.floor(Math.random() * 100000)}`,
          ...data,
          status: "PENDING",
          placedAt: new Date().toISOString(),
          estimatedReadyTime: new Date(
            Date.now() + 30 * 60 * 1000
          ).toISOString(),
        },
      };
    }

    // Real API call
    const url = `${API_CONFIG.restaurants.baseUrl}${API_CONFIG.restaurants.endpoints.orders}`;
    return apiFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get order status
   */
  getOrderStatus: async (orderId: string) => {
    if (USE_MOCK_DATA) {
      return {
        order: {
          id: orderId,
          orderNumber: `SL-REST-${Math.floor(Math.random() * 100000)}`,
          status: "CONFIRMED",
          placedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          confirmedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          estimatedReadyTime: new Date(
            Date.now() + 20 * 60 * 1000
          ).toISOString(),
        },
      };
    }

    // Real API call
    const url = `${API_CONFIG.restaurants.baseUrl}${API_CONFIG.restaurants.endpoints.orderStatus(orderId)}`;
    return apiFetch(url);
  },
};
