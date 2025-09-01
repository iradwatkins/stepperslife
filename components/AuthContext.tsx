"use client";

import React, { createContext, useContext } from 'react';
import { useUser, SignInButton as ClerkSignInButton, UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  
  // Convert Clerk user to our User format
  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    emailAddresses: clerkUser.emailAddresses.map(email => ({
      emailAddress: email.emailAddress
    })),
    firstName: clerkUser.firstName || undefined,
    lastName: clerkUser.lastName || undefined,
    imageUrl: clerkUser.imageUrl
  } : null;
  
  const value: AuthContextType = {
    user,
    isSignedIn: !!isSignedIn,
    isLoaded,
    signOut: async () => {
      const { signOut } = await import('@clerk/nextjs');
      await signOut();
      router.push('/');
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

// SignInButton component for compatibility
export function SignInButton({ 
  children, 
  mode = "modal",
  afterSignInUrl,
  fallbackRedirectUrl
}: { 
  children: React.ReactNode; 
  mode?: "modal" | "redirect";
  afterSignInUrl?: string;
  fallbackRedirectUrl?: string;
}) {
  // Preserve the current path for redirect after sign-in
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/profile';
  const finalSignInUrl = afterSignInUrl || currentPath;
  const finalFallbackUrl = fallbackRedirectUrl || finalSignInUrl;
  
  return (
    <ClerkSignInButton 
      mode={mode} 
      fallbackRedirectUrl={finalFallbackUrl}
      afterSignInUrl={finalSignInUrl}
    >
      {children}
    </ClerkSignInButton>
  );
}

// UserButton component for compatibility
export function UserButton() {
  return <ClerkUserButton afterSignOutUrl="/" />;
}