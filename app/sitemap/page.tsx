"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SitemapPage() {
  const { user, isSignedIn } = useUser();

  const publicRoutes = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
    { name: "Classes", path: "/classes" },
    { name: "Magazine", path: "/magazine" },
    { name: "Community", path: "/community" },
  ];

  const authenticatedRoutes = [
    { section: "Profile", routes: [
      { name: "Profile", path: "/profile" },
      { name: "Help & Support", path: "/profile/help" },
      { name: "History", path: "/profile/history" },
      { name: "Notifications", path: "/profile/notifications" },
      { name: "Payment Methods", path: "/profile/payment-methods" },
      { name: "Settings", path: "/profile/settings" },
      { name: "Tickets", path: "/profile/tickets" },
      { name: "Wishlist", path: "/profile/wishlist" },
    ]},
    { section: "Organizer", routes: [
      { name: "Dashboard", path: "/organizer" },
      { name: "My Events", path: "/organizer/events" },
      { name: "Create Event", path: "/organizer/new-event" },
      { name: "Payment Settings", path: "/organizer/payment-settings" },
      { name: "Affiliates", path: "/organizer/affiliates" },
      { name: "Analytics", path: "/organizer/analytics" },
      { name: "Customers", path: "/organizer/customers" },
      { name: "Earnings", path: "/organizer/earnings" },
      { name: "Reports", path: "/organizer/reports" },
      { name: "Settings", path: "/organizer/settings" },
      { name: "Tickets", path: "/organizer/tickets" },
    ]},
    { section: "Products", routes: [
      { name: "Products Marketplace", path: "/products" },
      { name: "Product Checkout", path: "/products/checkout" },
      { name: "Product Success", path: "/products/success" },
    ]},
    { section: "Seller (Legacy)", routes: [
      { name: "Dashboard", path: "/seller/dashboard" },
      { name: "Events", path: "/seller/events" },
      { name: "New Event", path: "/seller/new-event" },
      { name: "Payment Settings", path: "/seller/payment-settings" },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Site Map & Route Testing</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isSignedIn ? (
              <span className="text-green-600">✅ Signed in as {user?.primaryEmailAddress?.emailAddress}</span>
            ) : (
              <span className="text-amber-600">⚠️ Not signed in - Protected routes will require authentication</span>
            )}
          </p>

          {/* Public Routes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Public Routes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {publicRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  {route.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Authenticated Routes */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Protected Routes (Requires Sign In)</h2>
            
            {authenticatedRoutes.map((section) => (
              <div key={section.section}>
                <h3 className="text-lg font-medium mb-3 text-cyan-600 dark:text-cyan-400">
                  {section.section}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    >
                      {route.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Testing Info */}
          <div className="mt-12 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Testing Information</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Click any link to test if it's working</li>
              <li>• 404 errors indicate missing pages</li>
              <li>• Protected routes will redirect to sign-in if not authenticated</li>
              <li>• Some routes may be intentionally disabled or under development</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}