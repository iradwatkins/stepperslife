import { MagazineArticle } from "../types/aggregated-content";
import { API_CONFIG, apiFetch, USE_MOCK_DATA } from "./config";
import { mockMagazineArticles } from "../mock-data/magazine";

export interface GetArticlesParams {
  category?: string;
  featured?: boolean;
  authorId?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface GetArticlesResponse {
  articles: MagazineArticle[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const magazineAPI = {
  /**
   * Get all articles with optional filters
   */
  getArticles: async (
    params?: GetArticlesParams
  ): Promise<GetArticlesResponse> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const filtered = params?.featured
        ? mockMagazineArticles.filter((a) => a.isFeatured)
        : mockMagazineArticles;

      return {
        articles: filtered.slice(0, params?.limit || 10),
        pagination: {
          total: filtered.length,
          limit: params?.limit || 10,
          offset: params?.offset || 0,
          hasMore: false,
        },
      };
    }

    // Real API call
    const url = new URL(
      `${API_CONFIG.magazine.baseUrl}${API_CONFIG.magazine.endpoints.articles}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiFetch<GetArticlesResponse>(url.toString());
  },

  /**
   * Get single article by slug
   */
  getArticle: async (slug: string): Promise<{ article: MagazineArticle }> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const article = mockMagazineArticles.find((a) => a.slug === slug);
      if (!article) {
        throw new Error("Article not found");
      }
      return { article };
    }

    // Real API call
    const url = `${API_CONFIG.magazine.baseUrl}${API_CONFIG.magazine.endpoints.article(slug)}`;
    return apiFetch<{ article: MagazineArticle }>(url);
  },
};
