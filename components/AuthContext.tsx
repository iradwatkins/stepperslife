"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser as useClerkUser, useClerk, SignInButton as ClerkSignInButton, UserButton as ClerkUserButton } from '@clerk/nextjs';

interface User {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isDevelopment = process.env.NODE_ENV === 'development';
const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED !== 'false' && !isDevelopment;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Only use Clerk hooks if Clerk is enabled
  const clerkUser = isClerkEnabled ? useClerkUser() : null;
  const clerk = isClerkEnabled ? useClerk() : null;
  
  useEffect(() => {
    if (!isClerkEnabled) {
      // In development mode, provide a mock user
      setMockUser({
        id: "dev_user_123",
        emailAddresses: [{ emailAddress: "test@example.com" }],
        firstName: "Test",
        lastName: "User",
        imageUrl: "/logo.png"
      });
      setIsLoaded(true);
    } else if (clerkUser) {
      setIsLoaded(clerkUser.isLoaded);
    }
  }, [clerkUser]);
  
  const value: AuthContextType = {
    user: isClerkEnabled && clerkUser?.user 
      ? {
          id: clerkUser.user.id,
          emailAddresses: clerkUser.user.emailAddresses.map((e: any) => ({ 
            emailAddress: e.emailAddress 
          })),
          firstName: clerkUser.user.firstName || undefined,
          lastName: clerkUser.user.lastName || undefined,
          imageUrl: clerkUser.user.imageUrl || undefined
        }
      : mockUser,
    isSignedIn: isClerkEnabled ? (clerkUser?.isSignedIn || false) : !!mockUser,
    isLoaded: isClerkEnabled ? (clerkUser?.isLoaded || false) : isLoaded,
    signOut: async () => {
      if (isClerkEnabled && clerk) {
        await clerk.signOut();
      } else {
        setMockUser(null);
      }
    }
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export mock components for development mode
export const SignInButton = isClerkEnabled ? ClerkSignInButton : 
  ({ children, mode }: any) => <>{children}</>;

export const UserButton = isClerkEnabled ? ClerkUserButton : 
  ({ afterSignOutUrl }: any) => (
    <button className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
      T
    </button>
  );