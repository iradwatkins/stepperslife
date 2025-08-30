"use client";

import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { useState } from "react";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return { name, href, isLast: index === paths.length - 1 };
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar />
      
      {/* Main content area with integrated header */}
      <div className="xl:pl-64">
        {/* Unified Header - Combines site header with dashboard header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and Breadcrumbs */}
              <div className="flex items-center space-x-6 flex-1">
                <Link href="/" className="xl:hidden">
                  <img
                    src="/logo.png"
                    alt="SteppersLife"
                    className="h-8 w-auto"
                  />
                </Link>
                
                {/* Breadcrumbs */}
                <nav className="hidden sm:flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={crumb.href} className="flex items-center">
                        {index > 0 && (
                          <span className="mx-2 text-gray-400">/</span>
                        )}
                        {crumb.isLast ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {crumb.name}
                          </span>
                        ) : (
                          <Link
                            href={crumb.href}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {crumb.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              {/* Right side - Search and User Actions */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Quick Actions */}
                <Link
                  href="/seller/new-event"
                  className="hidden md:inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  Sell Tickets
                </Link>

                <Link
                  href="/tickets"
                  className="hidden md:inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  My Tickets
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                {isSignedIn && user && (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {user.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || user.firstName?.[0].toUpperCase() || "U"}
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0]}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-soft-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <UserIcon className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                          <SignOutButton>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                              Sign Out
                            </button>
                          </SignOutButton>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}