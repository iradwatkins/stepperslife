"use client";

import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { CalendarDays, Plus, DollarSign, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Spinner from "./Spinner";
import { createSquareOAuthLink } from "@/app/actions/createSquareOAuthLink";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function SellerDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.email || "";
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get Square account status
  const squareAccount = useQuery(api.users.getSquareAccount, { userId });
  
  // Get seller's events
  const events = useQuery(api.events.getSellerEvents, { userId });

  const handleConnectSquare = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const oauthUrl = await createSquareOAuthLink();
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error creating Square OAuth link:", error);
      setError("Failed to connect to Square. Please try again.");
      setIsConnecting(false);
    }
  };

  if (!session) {
    return <Spinner />;
  }

  const isConnected = squareAccount?.isConnected;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">
          Manage your events and track your earnings
        </p>
      </div>

      {/* Square Account Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Square Account Connected</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Merchant ID: {squareAccount.merchantId}</p>
                <p>Location ID: {squareAccount.locationId}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ Ready to accept payments
                </p>
                <p className="text-sm text-green-600 mt-1">
                  • Payments go directly to your Square account<br/>
                  • Automatic daily payouts to your bank<br/>
                  • 1% platform fee automatically deducted
                </p>
              </div>
              <Link href="/seller/earnings">
                <Button variant="outline" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Earnings & Payouts
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Square Account Not Connected</span>
              </div>
              <p className="text-gray-600">
                Connect your Square account to start selling tickets and receive automatic payouts.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Benefits of connecting Square:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Direct payments to your Square account</li>
                  <li>• Automatic daily bank deposits</li>
                  <li>• Professional payment processing</li>
                  <li>• Instant refund capabilities</li>
                  <li>• Only 1% platform fee per sale</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnectSquare}
                disabled={isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect Square Account
                  </>
                )}
              </Button>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/seller/new-event">
          <Button className="w-full" disabled={!isConnected}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </Link>
        <Link href="/seller/events">
          <Button variant="outline" className="w-full">
            <CalendarDays className="w-4 h-4 mr-2" />
            Manage Events
          </Button>
        </Link>
        <Link href="/seller/earnings">
          <Button variant="outline" className="w-full" disabled={!isConnected}>
            <DollarSign className="w-4 h-4 mr-2" />
            View Earnings
          </Button>
        </Link>
      </div>

      {/* Events Overview */}
      {events && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event._id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${event.price}</p>
                    <p className="text-sm text-gray-600">
                      {event.totalTickets - (event.purchasedCount || 0)} available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isConnected && (
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">
            ⚠️ Action Required: Connect Square Account
          </h3>
          <p className="text-yellow-800">
            You need to connect your Square account before you can create events and sell tickets. 
            This ensures you receive payments directly and securely.
          </p>
        </div>
      )}
    </div>
  );
}