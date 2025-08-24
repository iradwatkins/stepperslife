"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Ticket, QrCode, Check } from "lucide-react";
import SimplifiedPurchaseFlow from "@/components/SimplifiedPurchaseFlow";

export default function TestTicketSystemPage() {
  const router = useRouter();
  const [testStatus, setTestStatus] = useState<string[]>([]);
  const [createdEventId, setCreatedEventId] = useState<any>(null);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  
  const createEvent = useMutation(api.events.create);
  const createTableConfig = useMutation(api.tables.createTableConfig);
  const purchaseTable = useMutation(api.purchases.purchaseTable);
  const events = useQuery(api.events.get);
  
  const runFullTest = async () => {
    setTestStatus(["🚀 Starting simplified ticket system test..."]);
    
    try {
      // Step 1: Create an event
      setTestStatus(prev => [...prev, "📅 Creating test event..."]);
      const eventId = await createEvent({
        name: "New Year's Eve Gala 2025 - Test",
        description: "Experience an unforgettable night with live music, gourmet dining, and champagne toast at midnight!",
        location: "Grand Ballroom, Manhattan",
        eventDate: new Date("2025-12-31T20:00:00").getTime(),
        price: 150,
        totalTickets: 200,
        userId: "test-organizer",
        isTicketed: true,
        eventType: "holiday",
      });
      
      setCreatedEventId(eventId);
      setTestStatus(prev => [...prev, `✅ Event created: ${eventId}`]);
      
      // Step 2: Create table configurations
      setTestStatus(prev => [...prev, "🪑 Creating table configurations..."]);
      
      const vipTableId = await createTableConfig({
        eventId,
        name: "VIP Table",
        seatCount: 10,
        price: 2000,
        description: "Premium table with champagne service and best view",
      });
      
      const standardTableId = await createTableConfig({
        eventId,
        name: "Standard Table",
        seatCount: 8,
        price: 1000,
        description: "Regular table seating",
      });
      
      setTestStatus(prev => [...prev, "✅ Table configurations created"]);
      
      // Step 3: Simulate a table purchase
      setTestStatus(prev => [...prev, "💳 Simulating table purchase..."]);
      
      const purchase = await purchaseTable({
        tableConfigId: vipTableId,
        buyerEmail: "john.doe@example.com",
        buyerName: "John Doe",
        buyerPhone: "555-0123",
        paymentMethod: "test",
        paymentReference: "TEST-" + Date.now(),
      });
      
      setPurchaseResult(purchase);
      setTestStatus(prev => [...prev, `✅ Purchase complete! Generated ${purchase.tickets.length} tickets`]);
      setTestStatus(prev => [...prev, "🎫 Sample ticket URLs:"]);
      
      // Show first 3 ticket URLs
      purchase.tickets.slice(0, 3).forEach((ticket: any, index: number) => {
        setTestStatus(prev => [...prev, `   Seat ${index + 1}: ${ticket.shareUrl}`]);
      });
      
      setTestStatus(prev => [...prev, "✨ Test completed successfully!"]);
      
    } catch (error: any) {
      setTestStatus(prev => [...prev, `❌ Error: ${error.message}`]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2">🎟️ Simplified Ticket System Demo</h1>
          <p className="text-gray-600 mb-8">
            Test the complete flow: Event → Tables → Purchase → Tickets
          </p>
          
          {/* Test Button */}
          <div className="mb-8">
            <button
              onClick={runFullTest}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-6 h-6" />
                <span className="font-semibold">Run Complete Test</span>
              </div>
            </button>
          </div>
          
          {/* Test Status */}
          {testStatus.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm mb-8">
              {testStatus.map((status, index) => (
                <div key={index} className="mb-1">{status}</div>
              ))}
            </div>
          )}
          
          {/* Results Display */}
          {purchaseResult && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-xl font-bold mb-4 text-green-800">✅ Purchase Successful!</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Table Type</p>
                    <p className="font-semibold">{purchaseResult.tableConfig.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seats</p>
                    <p className="font-semibold">{purchaseResult.tableConfig.seatCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-semibold">${purchaseResult.tableConfig.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tickets Generated</p>
                    <p className="font-semibold">{purchaseResult.tickets.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Ticket Links */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold mb-4">🎫 Generated Tickets (Click to View)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {purchaseResult.tickets.map((ticket: any, index: number) => (
                    <a
                      key={index}
                      href={ticket.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{ticket.seatLabel}</p>
                          <p className="text-xs text-gray-600">Code: {ticket.ticketCode}</p>
                        </div>
                        <Ticket className="w-5 h-5 text-blue-600" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push(`/events/${createdEventId}/scan`)}
                  className="p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <QrCode className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Scanner Page</p>
                </button>
                
                <button
                  onClick={() => setShowPurchaseFlow(!showPurchaseFlow)}
                  className="p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Ticket className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">
                    {showPurchaseFlow ? "Hide" : "Show"} Purchase Flow
                  </p>
                </button>
              </div>
              
              {/* Simplified Purchase Flow */}
              {showPurchaseFlow && createdEventId && (
                <div className="mt-6">
                  <SimplifiedPurchaseFlow eventId={createdEventId} />
                </div>
              )}
            </div>
          )}
          
          {/* Existing Events */}
          {events && events.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-bold mb-4">📅 Recent Events</h3>
              <div className="space-y-2">
                {events.slice(0, 5).map((event: any) => (
                  <div key={event._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{event.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/event/${event._id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/events/${event._id}/scan`)}
                        className="text-purple-600 hover:underline text-sm"
                      >
                        Scan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}