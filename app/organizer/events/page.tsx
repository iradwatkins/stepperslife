"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ShoppingBagIcon } from "lucide-react";
import SellerEventList from "@/components/SellerEventList";

export default function OrganizerEvents() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track your events</p>
        </div>
        <Link href="/organizer/new-event">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Use the actual SellerEventList component that queries events */}
      <SellerEventList />

      {/* Product Section */}
      <div className="mt-12 border-t pt-12">
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Custom Products for Your Events
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Order custom t-shirts and printed materials for your events
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                  Business Cards, Palm Cards, Postcards
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                  Event Tickets & Posters
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                  Custom T-Shirts with Your Design
                </li>
              </ul>
            </div>
            <div className="text-center">
              <ShoppingBagIcon className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
              <Link href="/products">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                  Order Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}