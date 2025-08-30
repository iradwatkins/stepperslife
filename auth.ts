import NextAuth from "next-auth";
import authConfigSimple from "./auth.config.simple";
import authConfigProduction from "./auth.config.production";

// Determine if we're in production (deployed) environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.includes('https://');

// Use production config with OAuth in production, simple config in development
const authConfig = isProduction ? authConfigProduction : authConfigSimple;

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
  debug: process.env.NODE_ENV === 'development',
  
  // CRITICAL FIX: Proper cookie configuration for production HTTPS
  cookies: {
    sessionToken: {
      name: isProduction ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction, // TRUE in production for HTTPS
        domain: isProduction ? '.stepperslife.com' : undefined, // Allow subdomain sharing
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProduction, // TRUE in production
      }
    },
    csrfToken: {
      name: isProduction ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction, // TRUE in production
      }
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 60 * 15 // 15 minutes
      }
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 60 * 15 // 15 minutes
      }
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    },
  },
  
  // Use HTTPS URLs in production
  useSecureCookies: isProduction,
  
  // Trust the host header (important for proxy setups)
  trustHost: true,
});