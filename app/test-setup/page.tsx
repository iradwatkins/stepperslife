"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestSetupPage() {
  const [eventId] = useState("test-event-123");
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">SteppersLife - All Available Pages</h1>
          
          <div className="grid gap-6">
            {/* Main Pages */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-blue-600">Main Pages</h2>
              <div className="space-y-2">
                <Link href="/" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  🏠 Home - View all events
                </Link>
                <Link href="/auth/signin" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  🔐 Sign In
                </Link>
                <Link href="/tickets" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  🎫 My Tickets
                </Link>
                <Link href="/scan" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  📱 QR Scanner (for staff)
                </Link>
              </div>
            </div>

            {/* Seller Pages */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-green-600">Event Organizer Pages</h2>
              <div className="space-y-2">
                <Link href="/seller" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  💼 Seller Dashboard
                </Link>
                <Link href="/seller/new-event" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  ➕ Create New Event
                </Link>
                <Link href="/seller/events" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  📊 Manage My Events
                </Link>
              </div>
            </div>

            {/* Affiliate System */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-purple-600">Affiliate System</h2>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded">
                  <p className="font-medium">How to use affiliate features:</p>
                  <ol className="mt-2 text-sm space-y-1">
                    <li>1. Create an event first</li>
                    <li>2. Share event link with ?ref=YOUR_CODE</li>
                    <li>3. Track sales in Affiliate Dashboard component</li>
                  </ol>
                </div>
                <a href="/?ref=TESTCODE" className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  🔗 Test Referral Link (adds ref code to session)
                </a>
              </div>
            </div>

            {/* Table Sales */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-orange-600">Table/Group Sales</h2>
              <div className="space-y-2">
                <div className="p-3 bg-orange-50 rounded">
                  <p className="font-medium">How to sell tables:</p>
                  <ol className="mt-2 text-sm space-y-1">
                    <li>1. Create an event</li>
                    <li>2. When purchasing, select multiple tickets</li>
                    <li>3. System generates bulk tickets</li>
                    <li>4. Use Table Distribution Dashboard to share</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Components Available */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-indigo-600">Available Components</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">✅ AffiliateDashboard.tsx</div>
                <div className="p-2 bg-gray-50 rounded">✅ TableDistributionDashboard.tsx</div>
                <div className="p-2 bg-gray-50 rounded">✅ EnhancedTicket.tsx</div>
                <div className="p-2 bg-gray-50 rounded">✅ PWAInstallButton.tsx</div>
                <div className="p-2 bg-gray-50 rounded">✅ EventCard.tsx</div>
                <div className="p-2 bg-gray-50 rounded">✅ PurchaseTicket.tsx</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 Quick Start:</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Go to <Link href="/seller/new-event" className="text-blue-600 underline">Create New Event</Link></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Fill in event details and submit</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Go to <Link href="/" className="text-blue-600 underline">Home</Link> to see your event</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Click on the event to purchase tickets</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>For tables: purchase multiple tickets at once</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}