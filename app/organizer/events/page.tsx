"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
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
    </div>
  );
}