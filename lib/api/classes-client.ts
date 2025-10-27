import { Course } from "../types/aggregated-content";
import { API_CONFIG, apiFetch, USE_MOCK_DATA } from "./config";
import { mockCourses } from "../mock-data/classes";

export interface GetCoursesParams {
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  instructorId?: string;
  featured?: boolean;
  priceType?: "FREE" | "ONE_TIME" | "SUBSCRIPTION";
  limit?: number;
  offset?: number;
}

export interface GetCoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface EnrollmentData {
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  amountPaid: number;
  paymentProcessor: "STRIPE" | "PAYPAL";
  paymentIntentId: string;
}

export const classesAPI = {
  /**
   * Get all courses with optional filters
   */
  getCourses: async (params?: GetCoursesParams): Promise<GetCoursesResponse> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      let filtered = mockCourses;

      if (params?.featured) {
        filtered = filtered.filter((c) => c.isFeatured);
      }

      if (params?.level) {
        filtered = filtered.filter((c) => c.level === params.level);
      }

      return {
        courses: filtered.slice(0, params?.limit || 20),
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
      `${API_CONFIG.classes.baseUrl}${API_CONFIG.classes.endpoints.courses}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiFetch<GetCoursesResponse>(url.toString());
  },

  /**
   * Get single course by slug
   */
  getCourse: async (slug: string): Promise<{ course: Course }> => {
    // Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const course = mockCourses.find((c) => c.slug === slug);
      if (!course) {
        throw new Error("Course not found");
      }
      return { course };
    }

    // Real API call
    const url = `${API_CONFIG.classes.baseUrl}${API_CONFIG.classes.endpoints.course(slug)}`;
    return apiFetch<{ course: Course }>(url);
  },

  /**
   * Enroll in a course
   */
  enrollInCourse: async (data: EnrollmentData) => {
    if (USE_MOCK_DATA) {
      return {
        enrollment: {
          id: `enroll_${Date.now()}`,
          ...data,
          hasAccess: true,
          completionPercent: 0,
          enrolledAt: new Date().toISOString(),
        },
        message: "Successfully enrolled! Check your email for access details.",
      };
    }

    // Real API call
    const url = `${API_CONFIG.classes.baseUrl}${API_CONFIG.classes.endpoints.enrollments}`;
    return apiFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
