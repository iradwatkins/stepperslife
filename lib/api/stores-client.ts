import { StoreProduct } from "../types/aggregated-content";
import { API_CONFIG, apiFetch, USE_MOCK_DATA } from "./config";
import { mockStoreProducts } from "../mock-data/stores";

export interface GetProductsParams {
  category?: string;
  storeId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
  limit?: number;
  offset?: number;
}

export interface GetProductsResponse {
  products: StoreProduct[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateOrderData {
  storeId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    variantId?: string;
    name: string;
    variantName?: string;
    sku: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    subtotal: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: string;
  paymentProcessor: "STRIPE" | "PAYPAL";
  paymentIntentId: string;
  customerNotes?: string;
}

export const storesAPI = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (
    params?: GetProductsParams
  ): Promise<GetProductsResponse> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      let filtered = [...mockStoreProducts];

      if (params?.category) {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params?.inStock !== undefined) {
        filtered = filtered.filter((p) => p.inStock === params.inStock);
      }

      return {
        products: filtered.slice(0, params?.limit || 20),
        pagination: {
          total: mockStoreProducts.length,
          limit: params?.limit || 20,
          offset: params?.offset || 0,
          hasMore: false,
        },
      };
    }

    // Real API call
    const url = new URL(
      `${API_CONFIG.stores.baseUrl}${API_CONFIG.stores.endpoints.products}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiFetch<GetProductsResponse>(url.toString());
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<{ product: StoreProduct }> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const product = mockStoreProducts.find((p) => p.id === id);
      if (!product) {
        throw new Error("Product not found");
      }
      return { product };
    }

    // Real API call
    const url = `${API_CONFIG.stores.baseUrl}${API_CONFIG.stores.endpoints.product(id)}`;
    return apiFetch<{ product: StoreProduct }>(url);
  },

  /**
   * Create an order
   */
  createOrder: async (data: CreateOrderData) => {
    if (USE_MOCK_DATA) {
      return {
        order: {
          id: `order_${Date.now()}`,
          orderNumber: `SL-ORD-${Math.floor(Math.random() * 100000)}`,
          ...data,
          status: "PAID",
          fulfillmentStatus: "UNFULFILLED",
          placedAt: new Date().toISOString(),
        },
      };
    }

    // Real API call
    const url = `${API_CONFIG.stores.baseUrl}${API_CONFIG.stores.endpoints.orders}`;
    return apiFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
