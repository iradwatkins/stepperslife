import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";

// Production auth configuration with OAuth providers
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
    
    // Email Magic Link provider - Disabled until database adapter is configured
    // Email({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD
    //     }
    //   },
    //   from: process.env.EMAIL_FROM || "noreply@stepperslife.com",
    // }),
    
    // GitHub OAuth (optional - only if credentials are provided)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    
    // Credentials for demo/development
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Only allow demo accounts in development
        if (process.env.NODE_ENV === 'development') {
          const demoAccounts = [
            { email: "admin@stepperslife.com", password: "admin123", name: "Admin User", role: "admin" },
            { email: "test@example.com", password: "test123", name: "Test User", role: "user" },
            { email: "irawatkins@gmail.com", password: "demo123", name: "Ira Watkins", role: "admin" }
          ];

          const email = credentials?.email as string;
          const password = credentials?.password as string;

          const demoUser = demoAccounts.find(acc => acc.email === email && acc.password === password);
          
          if (demoUser) {
            return {
              id: demoUser.email,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role,
            };
          }
        }

        // In production, you would validate against your database here
        return null;
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role || "user";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure HTTPS in production
      if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://')) {
        baseUrl = baseUrl.replace('http://', 'https://');
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allow callback URLs from the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        // In production, force HTTPS
        if (process.env.NODE_ENV === 'production' && urlObj.protocol === 'http:') {
          urlObj.protocol = 'https:';
          url = urlObj.toString();
        }
        
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url;
        }
      } catch (error) {
        // If URL parsing fails, return baseUrl
        return baseUrl;
      }
      
      return baseUrl;
    },
  },
  trustHost: true,
  experimental: {
    enableWebAuthn: false,
  },
};

export default authConfig;