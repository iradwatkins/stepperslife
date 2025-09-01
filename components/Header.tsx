"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth, SignInButton } from "@/hooks/useAuth";
import { Calendar, Plus, Bell, Menu } from "lucide-react";
import { useState } from "react";

function Header() {
  const { user, isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Primary Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-purple-600">SteppersLife</span>
            </Link>

            {/* Primary Navigation - Desktop Only */}
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/events" 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Browse Events
              </Link>
            </nav>
          </div>

          {/* Center Section: Search - Desktop Only */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right Section: User Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign In / Profile */}
            {isSignedIn && user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Profile
                </Link>
                {/* Sign Out Link */}
                <Link
                  href="/sign-out"
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3">
            <nav className="space-y-2">
              <Link 
                href="/events" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Browse Events
              </Link>
              {isSignedIn && (
                <>
                  <Link 
                    href="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/organizer" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Organizer Dashboard
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;