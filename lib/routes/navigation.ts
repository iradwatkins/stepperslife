/**
 * Navigation helper utilities for type-safe routing
 */

import { ROUTES, LEGACY_ROUTES, RouteParams } from './index';

/**
 * Build an event detail route
 */
export function buildEventRoute(eventId: string): string {
  return ROUTES.EVENT_DETAIL(eventId);
}

/**
 * Build an organizer event edit route
 */
export function buildOrganizerEventEditRoute(eventId: string): string {
  return ROUTES.ORGANIZER.EVENT_EDIT(eventId);
}

/**
 * Build a ticket view route
 */
export function buildTicketRoute(ticketId: string): string {
  return ROUTES.TICKET.VIEW(ticketId);
}

/**
 * Build a claim route with token
 */
export function buildClaimRoute(token: string): string {
  return ROUTES.CLAIM_TOKEN(token);
}

/**
 * Get redirect URL from query params
 */
export function getRedirectUrl(searchParams: URLSearchParams): string | null {
  return searchParams.get('redirect_url') || searchParams.get('redirectUrl') || searchParams.get('return_url');
}

/**
 * Build sign-in URL with redirect
 */
export function buildSignInUrl(redirectUrl?: string): string {
  const url = new URL(ROUTES.AUTH.SIGN_IN, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (redirectUrl) {
    url.searchParams.set('redirect_url', redirectUrl);
  }
  return url.pathname + url.search;
}

/**
 * Build sign-up URL with redirect
 */
export function buildSignUpUrl(redirectUrl?: string): string {
  const url = new URL(ROUTES.AUTH.SIGN_UP, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (redirectUrl) {
    url.searchParams.set('redirect_url', redirectUrl);
  }
  return url.pathname + url.search;
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/organizer') || 
         pathname.startsWith('/profile') || 
         pathname.startsWith('/admin');
}

/**
 * Check if a route is admin-only
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Get legacy route redirect if applicable
 */
export function getLegacyRedirect(pathname: string): string | null {
  return LEGACY_ROUTES[pathname as keyof typeof LEGACY_ROUTES] || null;
}

/**
 * Generate breadcrumb items from pathname
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Skip ID segments (UUIDs, numeric IDs)
    if (segment.match(/^[a-f0-9-]+$/i) && segment.length > 10) {
      return;
    }
    
    // Format segment label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: currentPath,
      current: isLast
    });
  });
  
  return breadcrumbs;
}

/**
 * Check if current path matches a route pattern
 */
export function isCurrentRoute(pathname: string, route: string): boolean {
  // Exact match
  if (pathname === route) return true;
  
  // Check if it's a subpath (for nested routes)
  if (route !== '/' && pathname.startsWith(route + '/')) return true;
  
  return false;
}

/**
 * Get the active section for sidebar navigation
 */
export function getActiveSection(pathname: string): 'organizer' | 'profile' | 'admin' | 'public' {
  if (pathname.startsWith('/organizer')) return 'organizer';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'public';
}

/**
 * Format route for display (removes hyphens, capitalizes)
 */
export function formatRouteLabel(route: string): string {
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Combine path with query params
 */
export function buildUrlWithParams(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return path;
  return path + buildQueryString(params);
}