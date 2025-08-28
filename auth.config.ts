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
        
        // For local development, use test credentials
        if (process.env.NODE_ENV !== 'production') {
          const { validateTestUser } = await import('./lib/test-users');
          const user = validateTestUser(credentials.email as string, credentials.password as string);
          if (user) {
            return user;
          }
        }
        
        // TODO: Add production database validation here
        return null;
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