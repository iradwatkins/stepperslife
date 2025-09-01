/**
 * Smart authentication redirect utility
 * Determines where users should go after login based on their role
 */

export function getPostLoginRedirect(user: any): string {
  // Check if user has specific email for admin
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === "iradwalkins@gmail.com";
  
  if (isAdmin) {
    return "/admin";
  }
  
  // Check if user has organizer/seller role (based on having events or seller status)
  // For now, we'll check if they have any seller-related metadata
  const isOrganizer = user?.publicMetadata?.isOrganizer || 
                      user?.publicMetadata?.isSeller ||
                      user?.unsafeMetadata?.role === "organizer";
  
  if (isOrganizer) {
    return "/organizer";
  }
  
  // Default to profile page for regular customers
  return "/profile";
}

export function getDefaultRedirect(): string {
  // Default redirect when no user context
  return "/profile";
}