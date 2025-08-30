import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Simplified auth configuration with minimal cookie customization
export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-not-for-production',
  
  // Simplified cookie configuration - let Next-Auth handle most of it
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Trust the host header (important for proxy setups)
  trustHost: true,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
});