import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

const authConfig: NextAuthConfig = {
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // GitHub OAuth (optional)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    
    // Credentials provider for email/password
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          console.log("[Auth] Missing email or password");
          return null;
        }

        try {
          // Import dependencies dynamically
          const { ConvexHttpClient } = await import("convex/browser");
          const { api } = await import("@/convex/_generated/api");
          const bcrypt = await import("bcryptjs");
          
          // Connect to Convex
          const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
          
          // Fetch user from database
          console.log("[Auth] Looking up user:", email);
          const user = await convex.query(api.users.getUserByEmail, { email });
          
          if (!user) {
            console.log("[Auth] User not found:", email);
            return null;
          }
          
          // Verify password
          if (user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
              console.log("[Auth] Invalid password for:", email);
              return null;
            }
          } else {
            console.log("[Auth] User has no password hash:", email);
            return null;
          }
          
          // Return user data with all fields
          console.log("[Auth] Login successful for:", email, "Name:", user.name);
          return {
            id: user.userId || user.email,
            email: user.email,
            name: user.name, // Ensure name is included
            role: "user",
          };
        } catch (error) {
          console.error("[Auth] Error during authentication:", error);
          return null;
        }
      }
    }),
  ],
  
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in - persist all user data
      if (user) {
        console.log("[JWT Callback] New sign in, user data:", user);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name; // Ensure name is persisted
        token.role = (user as any).role || "user";
        
        // Store OAuth account info if available
        if (account) {
          token.provider = account.provider;
          token.accessToken = account.access_token;
        }
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        console.log("[JWT Callback] Session update:", session);
        token = { ...token, ...session };
      }
      
      console.log("[JWT Callback] Returning token with name:", token.name);
      return token;
    },
    
    async session({ session, token }) {
      // Ensure all user data is in the session
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string; // Ensure name is in session
        (session.user as any).role = token.role || "user";
        (session.user as any).provider = token.provider;
      }
      
      console.log("[Session Callback] Returning session with name:", session.user?.name);
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Ensure proper redirects
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Allow callback URLs from the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url;
        }
      } catch {
        // Invalid URL, return to base
        return baseUrl;
      }
      
      return baseUrl;
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
};

export default authConfig;