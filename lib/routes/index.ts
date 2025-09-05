/**
 * Centralized route constants for type-safe navigation
 * All routes in the application should be defined here
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/event/${id}` as const,
  ABOUT: '/about',
  CLASSES: '/classes',
  MAGAZINE: '/magazine',
  COMMUNITY: '/community',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Auth routes
  AUTH: {
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    CALLBACK: '/auth-callback',
  },
  
  // Ticket routes
  TICKET: {
    VIEW: (ticketId: string) => `/ticket/${ticketId}` as const,
    PURCHASE_SUCCESS: '/tickets/purchase-success',
    MY_TICKETS: '/tickets',
  },
  
  // Organizer routes
  ORGANIZER: {
    DASHBOARD: '/organizer',
    NEW_EVENT: '/organizer/new-event',
    EVENTS: '/organizer/events',
    EVENT_EDIT: (id: string) => `/organizer/events/${id}/edit` as const,
    EVENT_STAFF: (id: string) => `/organizer/events/${id}/staff` as const,
    EVENT_AFFILIATES: (id: string) => `/organizer/events/${id}/affiliates` as const,
    TICKETS: '/organizer/tickets',
    ANALYTICS: '/organizer/analytics',
    EARNINGS: '/organizer/earnings',
    CUSTOMERS: '/organizer/customers',
    AFFILIATES: '/organizer/affiliates',
    PAYMENT_SETTINGS: '/organizer/payment-settings',
    PAYMENT_SPLIT_SETUP: '/organizer/payment-settings/split-setup',
    REPORTS: '/organizer/reports',
    SETTINGS: '/organizer/settings',
    ONBOARDING: '/organizer/onboarding',
  },
  
  // Profile routes
  PROFILE: {
    HOME: '/profile',
    TICKETS: '/profile/tickets',
    HISTORY: '/profile/history',
    SETTINGS: '/profile/settings',
    NOTIFICATIONS: '/profile/notifications',
    PAYMENT_METHODS: '/profile/payment-methods',
    WISHLIST: '/profile/wishlist',
    HELP: '/profile/help',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    EVENTS: '/admin/events',
    ALL_EVENTS: '/admin/all-events',
    MANAGE_EVENTS: '/admin/events/manage',
    USERS: '/admin/users',
    ORGANIZERS: '/admin/organizers',
    PAYMENTS: '/admin/payments',
    REVENUE: '/admin/revenue',
    FINANCE: '/admin/finance',
    REPORTS: '/admin/reports',
    TICKETS: '/admin/tickets',
    SETTINGS: '/admin/settings',
    CLEAR_EVENTS: '/admin/clear-events',
    RESET_DATA: '/admin/reset-data',
  },
  
  // Product routes
  PRODUCTS: {
    MARKETPLACE: '/products',
    CHECKOUT: '/products/checkout',
    SUCCESS: '/products/success',
  },
  
  // Event specific routes
  EVENT: {
    CREATE: '/events/create',
    CREATE_NEW: '/events/create-new',
    DETAILS: (eventId: string) => `/events/${eventId}` as const,
    SCAN: (eventId: string) => `/events/${eventId}/scan` as const,
    CLAIM: (eventId: string) => `/events/${eventId}/claim` as const,
    SUCCESS: (eventId: string) => `/events/${eventId}/success` as const,
  },
  
  // API routes (for reference)
  API: {
    HEALTH: '/api/health',
    VERSION: '/api/version',
    UPLOAD: '/api/upload',
    UPLOAD_MINIO: '/api/upload/minio',
    WEBHOOKS: {
      SQUARE: '/api/webhooks/square',
      PAYMENT: '/api/webhooks/payment',
    },
    OAUTH: {
      SQUARE_CALLBACK: '/api/oauth/square/callback',
      STRIPE_CALLBACK: '/api/oauth/stripe/callback',
    },
  },
  
  // Affiliate routes
  AFFILIATE: {
    DASHBOARD: '/affiliate',
    COMMISSIONS: '/affiliate/commissions',
    REFERRALS: '/affiliate/referrals',
    PAYOUTS: '/affiliate/payouts',
  },
  
  // Staff routes
  STAFF: {
    PORTAL: '/staff',
    SCANNER: (eventId: string) => `/staff/scanner/${eventId}` as const,
    EVENTS: '/staff/events',
  },
  
  // Utility routes
  SITEMAP: '/sitemap',
  SCAN: '/scan',
  MY_TABLES: '/my-tables',
  DEMO: '/demo',
  
  // Claim routes
  CLAIM_TOKEN: (token: string) => `/claim/${token}` as const,
} as const;

// Type exports
export type RouteKey = keyof typeof ROUTES;
export type OrganizerRouteKey = keyof typeof ROUTES.ORGANIZER;
export type ProfileRouteKey = keyof typeof ROUTES.PROFILE;
export type AdminRouteKey = keyof typeof ROUTES.ADMIN;
export type EventRouteKey = keyof typeof ROUTES.EVENT;

// Route parameter types
export interface RouteParams {
  eventId?: string;
  ticketId?: string;
  token?: string;
}

// Legacy route mappings (for redirects)
export const LEGACY_ROUTES = {
  '/seller': ROUTES.ORGANIZER.DASHBOARD,
  '/seller/dashboard': ROUTES.ORGANIZER.DASHBOARD,
  '/seller/events': ROUTES.ORGANIZER.EVENTS,
  '/seller/new-event': ROUTES.ORGANIZER.NEW_EVENT,
  '/seller/payment-settings': ROUTES.ORGANIZER.PAYMENT_SETTINGS,
  '/seller/analytics': ROUTES.ORGANIZER.ANALYTICS,
  '/seller/customers': ROUTES.ORGANIZER.CUSTOMERS,
  '/seller/earnings': ROUTES.ORGANIZER.EARNINGS,
  '/seller/reports': ROUTES.ORGANIZER.REPORTS,
  '/seller/settings': ROUTES.ORGANIZER.SETTINGS,
  '/dashboard': ROUTES.ORGANIZER.DASHBOARD,
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.ORGANIZER.DASHBOARD,
  ROUTES.ORGANIZER.NEW_EVENT,
  ROUTES.ORGANIZER.EVENTS,
  ROUTES.ORGANIZER.TICKETS,
  ROUTES.ORGANIZER.ANALYTICS,
  ROUTES.ORGANIZER.EARNINGS,
  ROUTES.ORGANIZER.CUSTOMERS,
  ROUTES.ORGANIZER.AFFILIATES,
  ROUTES.ORGANIZER.PAYMENT_SETTINGS,
  ROUTES.ORGANIZER.REPORTS,
  ROUTES.ORGANIZER.SETTINGS,
  ROUTES.PROFILE.HOME,
  ROUTES.PROFILE.TICKETS,
  ROUTES.PROFILE.HISTORY,
  ROUTES.PROFILE.SETTINGS,
  ROUTES.PROFILE.NOTIFICATIONS,
  ROUTES.PROFILE.PAYMENT_METHODS,
  ROUTES.PROFILE.WISHLIST,
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.ADMIN.EVENTS,
  ROUTES.ADMIN.USERS,
  ROUTES.ADMIN.PAYMENTS,
  ROUTES.ADMIN.REVENUE,
  ROUTES.ADMIN.REPORTS,
  ROUTES.ADMIN.SETTINGS,
];

// Admin-only routes
export const ADMIN_ONLY_ROUTES = Object.values(ROUTES.ADMIN);

// Default redirects after authentication
export const DEFAULT_REDIRECTS = {
  AFTER_SIGN_IN: ROUTES.ORGANIZER.DASHBOARD,
  AFTER_SIGN_UP: ROUTES.ORGANIZER.ONBOARDING,
  AFTER_SIGN_OUT: ROUTES.HOME,
} as const;