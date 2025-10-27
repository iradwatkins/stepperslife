// Export all API clients
export * from "./config";
export { magazineAPI } from "./magazine-client";
export { eventsAPI } from "./events-client";
export { storesAPI } from "./stores-client";
export { restaurantsAPI } from "./restaurants-client";
export { classesAPI } from "./classes-client";
export { servicesAPI } from "./services-client";

// Export types with prefixes to avoid conflicts
export type {
  GetArticlesParams,
  GetArticlesResponse,
} from "./magazine-client";

export type {
  GetEventsParams,
  GetEventsResponse,
} from "./events-client";

export type {
  GetProductsParams as StoresGetProductsParams,
  GetProductsResponse as StoresGetProductsResponse,
  CreateOrderData as StoresCreateOrderData,
} from "./stores-client";

export type {
  GetRestaurantsParams,
  GetRestaurantsResponse,
  CreateOrderData as RestaurantCreateOrderData,
} from "./restaurants-client";

export type {
  GetCoursesParams,
  GetCoursesResponse,
  EnrollmentData,
} from "./classes-client";

export type {
  GetServicesParams,
  GetServicesResponse,
  InquiryData,
} from "./services-client";
