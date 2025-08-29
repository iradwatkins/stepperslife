import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { getAuthCredentials } from "./lib/vault";

// Dynamic config function to fetch credentials from Vault
export default async function getAuthConfig(): Promise<NextAuthConfig> {
  let authCreds;
  
  try {
    // Try to get credentials from Vault
    authCreds = await getAuthCredentials();
  } catch (error) {
    console.warn('Vault not available, falling back to env vars');
    // Fallback to environment variables if Vault is not available
    authCreds = {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      githubClientId: process.env.GITHUB_CLIENT_ID || '',
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    };
  }

  return {
    providers: [
      Google({
        clientId: authCreds.googleClientId,
        clientSecret: authCreds.googleClientSecret,
      }),
      GitHub({
        clientId: authCreds.githubClientId,
        clientSecret: authCreds.githubClientSecret,
      }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Check test users first (works in all environments)
        const { validateTestUser } = await import('./lib/test-users');
        const testUser = validateTestUser(credentials.email as string, credentials.password as string);
        if (testUser) {
          return testUser;
        }
        
        // Production: Check Convex database
        try {
          const bcrypt = await import('bcryptjs');
          const { ConvexHttpClient } = await import('convex/browser');
          const { api } = await import('./convex/_generated/api');
          
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://mild-newt-621.convex.cloud";
          const convex = new ConvexHttpClient(convexUrl);
          
          // Get user from Convex
          const user = await convex.query(api.users.getUserByEmail, { 
            email: credentials.email as string 
          });
          
          if (!user || !user.passwordHash) {
            return null;
          }
          
          // Check password
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          
          if (!isValid) {
            return null;
          }
          
          // Return user object for session
          return {
            id: user._id,
            email: user.email,
            name: user.name || user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
    ],
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
    },
    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
    trustHost: true,
  };
}

// Export a static config for middleware
export const config: NextAuthConfig = {
  providers: [], // Will be overridden at runtime
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  trustHost: true,
};