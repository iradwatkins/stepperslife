"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { User, Ticket, Store, DollarSign } from "lucide-react";

function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Check if Clerk is disabled
  const skipClerk = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'false' || 
                    process.env.NODE_ENV === 'development';
  
  // Mock user for development when Clerk is disabled
  let user: any = null;
  let isSignedIn = false;
  let SignInButton: any = null;
  let UserButton: any = null;
  
  if (skipClerk) {
    // Mock user for development
    user = {
      id: "dev_user_123",
      emailAddresses: [{ emailAddress: "test@example.com" }]
    };
    isSignedIn = true;
    
    // Mock components
    SignInButton = ({ children }: any) => children;
    UserButton = () => (
      <button className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
        T
      </button>
    );
  } else {
    try {
      const clerk = require("@clerk/nextjs");
      const clerkData = clerk.useUser();
      user = clerkData.user;
      isSignedIn = clerkData.isSignedIn;
      SignInButton = clerk.SignInButton;
      UserButton = clerk.UserButton;
    } catch (e) {
      console.log("Clerk not available");
      // Provide fallback components
      SignInButton = ({ children }: any) => children;
      UserButton = () => null;
    }
  }

  return (
    <div className="border-b">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <img
              src="/logo.png"
              alt="SteppersLife Logo"
              width={100}
              height={100}
              className="w-24 lg:w-28"
            />
          </Link>

          <div className="lg:hidden">
            {isSignedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.emailAddresses[0]?.emailAddress?.split('@')[0]}</span>
                </button>
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <Link href="/tickets" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      My Tickets
                    </Link>
                    <Link href="/seller" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Seller Dashboard
                    </Link>
                    <Link href="/seller/earnings" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      My Earnings
                    </Link>
                    <Link href="/admin/revenue" className="block px-4 py-2 text-sm hover:bg-gray-100 text-purple-600 font-semibold">
                      Admin: Platform Revenue
                    </Link>
                    <Link href="/admin/events" className="block px-4 py-2 text-sm hover:bg-gray-100 text-purple-600 font-semibold">
                      Admin: Event Management
                    </Link>
                    <div className="border-t mt-2 pt-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        <div className="hidden lg:block ml-auto">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isSignedIn && user ? (
              <>
              
              <Link href="/seller">
                <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition">
                  Sell Tickets
                </button>
              </Link>

              <Link href="/tickets">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  My Tickets
                </button>
              </Link>
              
              <Link href="/admin/revenue">
                <button className="bg-purple-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-purple-700 transition">
                  Admin
                </button>
              </Link>

              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: '36px',
                      height: '36px',
                    }
                  }
                }}
              />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;