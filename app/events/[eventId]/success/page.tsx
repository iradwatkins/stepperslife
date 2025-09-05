"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ShoppingBagIcon, CalendarIcon, ShareIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function EventSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const eventId = params.eventId as Id<"events">;
  const [showProducts, setShowProducts] = useState(false);
  
  const event = useQuery(api.events.getById, { eventId });

  useEffect(() => {
    // Show products section after a delay
    const timer = setTimeout(() => setShowProducts(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center mb-8">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold mb-4">Event Created Successfully!</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your event "{event.name}" has been created and is now live.
          </p>

          <div className="flex gap-4 justify-center mb-8">
            <Link href={`/events/${eventId}`}>
              <Button>
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Event
              </Button>
            </Link>
            <Button variant="outline">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share Event
            </Button>
          </div>
        </div>

        {/* Products Promotion */}
        {showProducts && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-1 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
              <div className="text-center mb-6">
                <ShoppingBagIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Need Custom Products for Your Event?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Make your event stand out with professional materials
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">Printed Materials</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✓ Business Cards - From $25</li>
                    <li>✓ Event Tickets - Numbered & Generic</li>
                    <li>✓ Postcards & Palm Cards</li>
                    <li>✓ Posters (12" × 18") - From $125</li>
                  </ul>
                  <div className="mt-4 text-cyan-600 font-semibold">
                    Design service available!
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">Custom T-Shirts</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✓ Custom designs - $35 each</li>
                    <li>✓ Multiple sizes available</li>
                    <li>✓ Upload your own design</li>
                    <li>✓ Professional design service</li>
                  </ul>
                  <div className="mt-4 text-cyan-600 font-semibold">
                    Bulk discounts available!
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
                  🎉 Special Offer: Get 10% off your first product order for this event!
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href={`/products?eventId=${eventId}`}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Order Products for This Event
                  </Button>
                </Link>
                <Link href="/organizer/events">
                  <Button size="lg" variant="outline">
                    Skip for Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}