"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import ProfileMenu from "./ProfileMenu";
import ContextSwitcher from "./ContextSwitcher";
import { useAuth, SignInButton } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Calendar, Plus, Bell } from "lucide-react";

function Header() {
  const { user, isSignedIn } = useAuth();
  const { isOrganizer } = useUserRole();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Primary Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="SteppersLife"
                className="h-8 w-auto"
              />
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
              
              {/* Show Create Event button for organizers */}
              {isSignedIn && isOrganizer && (
                <Link 
                  href="/organizer/new-event" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
              )}
            </nav>
          </div>

          {/* Center Section: Search - Desktop Only */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right Section: User Actions */}
          <div className="flex items-center gap-3">
            {/* Context Switcher - Show for users with multiple roles */}
            {isSignedIn && <ContextSwitcher />}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications - Signed in users only */}
            {isSignedIn && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* Profile Menu or Sign In */}
            {isSignedIn && user ? (
              <ProfileMenu />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && isSignedIn && (
        <div className="absolute right-4 top-16 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;