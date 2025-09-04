"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Plus, Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

function Header() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24 lg:h-28 py-2">
          {/* Left Section: Logo and Primary Nav */}
          <div className="flex items-center gap-6">
            {/* Logo - Theme-aware with proper sizing */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              {mounted && (
                <Image 
                  src={resolvedTheme === 'dark' ? "/stepperslife-logo-light.svg" : "/stepperslife-logo-dark.svg"} 
                  alt="Stepper's Life" 
                  width={280}
                  height={70}
                  className="h-12 sm:h-14 md:h-16 lg:h-[70px] w-auto object-contain"
                  priority
                />
              )}
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
                {/* Create Event Button - Primary CTA (Desktop Only) */}
                <Link 
                  href="/organizer/new-event"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
                
                {/* Profile Dropdown */}
                <ProfileDropdown />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}

            {/* Mobile Menu Button - Improved touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced with animation and overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Slide-out menu */}
            <div className="md:hidden fixed right-0 top-16 bottom-0 w-[280px] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-out">
              <nav className="p-4 space-y-3 overflow-y-auto h-full">
              <Link 
                href="/events" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Events
              </Link>
              <Link 
                href="/classes" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Classes
              </Link>
              <Link 
                href="/magazine" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Magazine
              </Link>
              <Link 
                href="/community" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Community
              </Link>
              <Link 
                href="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                About Us
              </Link>
              {isSignedIn && (
                <>
                  <Link 
                    href="/organizer/new-event" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-center"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Event
                  </Link>
                  <Link 
                    href="/organizer" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Organizer Dashboard
                  </Link>
                </>
              )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;