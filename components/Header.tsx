"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth, SignInButton } from "@/hooks/useAuth";
import { Plus, Bell, Menu } from "lucide-react";
import { useState } from "react";

function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 py-2">
          {/* Left Section: Logo and Primary Nav */}
          <div className="flex items-center gap-6">
            {/* Logo - Standard website size */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/stepperslife-logo.png" 
                alt="Stepper's Life" 
                width={200}
                height={50}
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Primary Navigation - Desktop Only */}
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/events" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Events
              </Link>
              <Link 
                href="/classes" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Classes
              </Link>
              <Link 
                href="/magazine" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Magazine
              </Link>
              <Link 
                href="/community" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Community
              </Link>
              <Link 
                href="/about" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Right Section: User Actions - Removed search bar */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign In / Profile */}
            {isSignedIn && user ? (
              <div className="flex items-center gap-3">
                {/* Create Event Button - Primary CTA */}
                <Link 
                  href="/organizer/new-event"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
                {/* Organizer Dashboard Link */}
                <Link 
                  href="/organizer"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
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
              <SignInButton 
                mode="modal"
                fallbackRedirectUrl="/"
              >
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

        {/* Mobile Menu - Removed search bar */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3">
            <nav className="space-y-2">
              <Link 
                href="/events" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Events
              </Link>
              <Link 
                href="/classes" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Classes
              </Link>
              <Link 
                href="/magazine" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Magazine
              </Link>
              <Link 
                href="/community" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Community
              </Link>
              <Link 
                href="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About Us
              </Link>
              {isSignedIn && (
                <>
                  <Link 
                    href="/organizer/new-event" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-3 text-center"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Event
                  </Link>
                  <Link 
                    href="/organizer" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Organizer Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/sign-out" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Sign Out
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