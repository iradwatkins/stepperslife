import { Service } from "../types/aggregated-content";
import { API_CONFIG, apiFetch, USE_MOCK_DATA } from "./config";
import { mockServices } from "../mock-data/services";

export interface GetServicesParams {
  category?: string;
  location?: string;
  search?: string;
  rating?: number;
  premium?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetServicesResponse {
  providers: Service[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface InquiryData {
  providerId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate?: string;
  eventType?: string;
  message: string;
}

export const servicesAPI = {
  /**
   * Get all service providers with optional filters
   */
  getServices: async (
    params?: GetServicesParams
  ): Promise<GetServicesResponse> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      let filtered = mockServices;

      if (params?.premium !== undefined) {
        filtered = filtered.filter((s) => s.isPriority === params.premium);
      }

      if (params?.category) {
        filtered = filtered.filter(
          (s) =>
            s.category.toLowerCase() === params.category!.toLowerCase()
        );
      }

      if (params?.rating) {
        filtered = filtered.filter((s) => s.averageRating >= params.rating!);
      }

      return {
        providers: filtered.slice(0, params?.limit || 20),
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
      `${API_CONFIG.services.baseUrl}${API_CONFIG.services.endpoints.services}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiFetch<GetServicesResponse>(url.toString());
  },

  /**
   * Get single service provider by slug
   */
  getService: async (slug: string): Promise<{ provider: Service }> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const provider = mockServices.find((s) => s.slug === slug);
      if (!provider) {
        throw new Error("Service provider not found");
      }
      return { provider };
    }

    // Real API call
    const url = `${API_CONFIG.services.baseUrl}${API_CONFIG.services.endpoints.service(slug)}`;
    return apiFetch<{ provider: Service }>(url);
  },

  /**
   * Submit an inquiry to a service provider
   */
  submitInquiry: async (data: InquiryData) => {
    if (USE_MOCK_DATA) {
      return {
        inquiry: {
          id: `inquiry_${Date.now()}`,
          ...data,
          status: "NEW",
          createdAt: new Date().toISOString(),
        },
        message: "Your inquiry has been sent! The provider will contact you soon.",
      };
    }

    // Real API call
    const url = `${API_CONFIG.services.baseUrl}${API_CONFIG.services.endpoints.inquiries}`;
    return apiFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
