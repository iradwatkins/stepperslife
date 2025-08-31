"use client";

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

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
  const { data: session, status } = useSession();
  
  // Convert session to User format for compatibility
  const user: User | null = session?.user ? {
    id: session.user.email || 'unknown',
    emailAddresses: [{ emailAddress: session.user.email || '' }],
    firstName: session.user.name?.split(' ')[0],
    lastName: session.user.name?.split(' ')[1],
    imageUrl: session.user.image || undefined
  } : null;
  
  const value: AuthContextType = {
    user,
    isSignedIn: !!session,
    isLoaded: status !== 'loading',
    signOut: async () => {
      await signOut({ redirect: false });
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
export function SignInButton({ children, mode = "modal" }: { 
  children: React.ReactNode; 
  mode?: "modal" | "redirect" 
}) {
  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: '/seller/new-event' });
  };
  
  return (
    <button onClick={handleSignIn} className="w-full">
      {children}
    </button>
  );
}

// UserButton component for compatibility
export function UserButton() {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => signOut()}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
      >
        {user.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt={user.firstName || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
            {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
          </div>
        )}
        <span className="text-sm">Sign Out</span>
      </button>
    </div>
  );
}