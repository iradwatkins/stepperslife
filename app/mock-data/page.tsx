"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, User, Check, X, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// Visual representation of venue with tables and seats
const VenueLayout = ({ tables, onSeatClick }: any) => {
  return (
    <div className="bg-gray-900 p-8 rounded-lg">
      {/* Stage */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-4 rounded-lg mb-8">
        <h3 className="text-xl font-bold">STAGE</h3>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-4 gap-6">
        {tables.map((table: any, tableIndex: number) => (
          <div
            key={tableIndex}
            className={`bg-gray-800 p-4 rounded-lg border-2 ${
              table.status === 'sold' ? 'border-red-500' : 
              table.status === 'partial' ? 'border-yellow-500' : 
              'border-green-500'
            }`}
          >
            <div className="text-center mb-2">
              <span className="text-white font-bold">{table.name}</span>
              <div className="text-xs text-gray-400">{table.type}</div>
            </div>
            
            {/* Seats around table */}
            <div className="grid grid-cols-3 gap-1">
              {table.seats.map((seat: any, seatIndex: number) => (
                <button
                  key={seatIndex}
                  onClick={() => onSeatClick(tableIndex, seatIndex)}
                  disabled={seat.sold}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs
                    ${seat.sold 
                      ? 'bg-red-500 text-white cursor-not-allowed' 
                      : seat.selected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }
                  `}
                >
                  {seat.sold ? '✓' : seatIndex + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-2 text-center">
              <span className={`text-xs ${
                table.status === 'sold' ? 'text-red-400' :
                table.status === 'partial' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {table.soldSeats}/{table.totalSeats} sold
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          <span className="text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-gray-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-400">Sold</span>
        </div>
      </div>
    </div>
  );
};

// Mock events data
const mockEvents = [
  {
    name: "New Year's Eve Gala 2025",
    description: "Exclusive black-tie event with live orchestra, gourmet dining, and champagne toast at midnight. Tables of 10 available.",
    location: "The Grand Ballroom, Manhattan",
    eventDate: new Date("2025-12-31T20:00:00").getTime(),
    price: 250,
    totalTickets: 200,
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    eventType: "holiday",
  },
  {
    name: "Summer Jazz Festival",
    description: "Three days of smooth jazz under the stars. VIP tables include bottle service and exclusive artist meet & greets.",
    location: "Central Park Amphitheater",
    eventDate: new Date("2025-07-15T18:00:00").getTime(),
    price: 85,
    totalTickets: 500,
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    eventType: "sets",
  },
  {
    name: "Tech Summit 2025",
    description: "Network with industry leaders. Corporate tables include premium catering and priority workshop access.",
    location: "Convention Center, San Francisco",
    eventDate: new Date("2025-09-20T09:00:00").getTime(),
    price: 399,
    totalTickets: 1000,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    eventType: "workshop",
  },
  {
    name: "Comedy Night Spectacular",
    description: "Top comedians, great atmosphere. Book a table for your group and enjoy bottle service!",
    location: "The Laugh Track, Downtown",
    eventDate: new Date("2025-06-08T20:00:00").getTime(),
    price: 65,
    totalTickets: 300,
    imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800",
    eventType: "other",
  },
];

export default function MockDataPage() {
  const createEvent = useMutation(api.events.create);
  const sellTable = useMutation(api.tableSales.sellTable);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [venueView, setVenueView] = useState(false);
  
  // Initialize tables with seats
  const [tables, setTables] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      name: `Table ${String.fromCharCode(65 + i)}`,
      type: i < 4 ? 'VIP' : i < 8 ? 'Premium' : 'Standard',
      totalSeats: i < 4 ? 10 : 8,
      soldSeats: Math.floor(Math.random() * (i < 4 ? 10 : 8)),
      status: 'available',
      seats: Array.from({ length: i < 4 ? 10 : 8 }, (_, j) => ({
        sold: Math.random() > 0.7,
        selected: false,
      })),
    })).map(table => ({
      ...table,
      status: table.soldSeats === table.totalSeats ? 'sold' : 
              table.soldSeats > 0 ? 'partial' : 'available'
    }))
  );

  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  const handleSeatClick = (tableIndex: number, seatIndex: number) => {
    const newTables = [...tables];
    const seat = newTables[tableIndex].seats[seatIndex];
    
    if (!seat.sold) {
      seat.selected = !seat.selected;
      
      if (seat.selected) {
        setSelectedSeats([...selectedSeats, { tableIndex, seatIndex }]);
      } else {
        setSelectedSeats(selectedSeats.filter(
          s => !(s.tableIndex === tableIndex && s.seatIndex === seatIndex)
        ));
      }
      
      setTables(newTables);
    }
  };

  const createMockEvents = async () => {
    setLoading(true);
    const results = [];
    
    try {
      for (const event of mockEvents) {
        const id = await createEvent({
          ...event,
          userId: "mock-organizer",
        });
        
        results.push({
          id,
          ...event,
          tablesAvailable: Math.floor(event.totalTickets / 10),
          tablesSold: Math.floor(Math.random() * Math.floor(event.totalTickets / 10)),
        });
        
        // Add some mock table sales
        if (Math.random() > 0.5) {
          await sellTable({
            eventId: id,
            buyerEmail: `buyer${Math.floor(Math.random() * 100)}@example.com`,
            buyerName: `Mock Buyer ${Math.floor(Math.random() * 100)}`,
            companyName: Math.random() > 0.5 ? "Tech Corp" : undefined,
            tableConfig: {
              tableName: "VIP Table A",
              seatCount: 10,
              pricePerSeat: event.price * 1.5,
              ticketType: "VIP",
            },
            paymentReference: `MOCK-${Date.now()}`,
            paymentMethod: "square",
            sellerId: "mock-organizer",
          });
        }
      }
      
      setCreatedEvents(results);
    } catch (error) {
      console.error("Error creating mock events:", error);
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseSelectedSeats = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    
    // Update tables to mark seats as sold
    const newTables = [...tables];
    selectedSeats.forEach(({ tableIndex, seatIndex }) => {
      newTables[tableIndex].seats[seatIndex].sold = true;
      newTables[tableIndex].seats[seatIndex].selected = false;
      newTables[tableIndex].soldSeats++;
    });
    
    // Update table status
    newTables.forEach(table => {
      table.status = table.soldSeats === table.totalSeats ? 'sold' : 
                    table.soldSeats > 0 ? 'partial' : 'available';
    });
    
    setTables(newTables);
    setSelectedSeats([]);
    alert(`Successfully purchased ${selectedSeats.length} seat(s)!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">Mock Event & Table Sales System</h1>
          <p className="text-gray-600 mb-6">
            Create realistic events with table and seat visualization
          </p>

          {!venueView ? (
            <>
              {/* Create Events Section */}
              <div className="mb-8">
                <button
                  onClick={createMockEvents}
                  disabled={loading || createdEvents.length > 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Events...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create {mockEvents.length} Mock Events
                    </>
                  )}
                </button>
              </div>

              {/* Created Events Grid */}
              {createdEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Created Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {createdEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                          src={event.imageUrl} 
                          alt={event.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{event.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{event.location}</p>
                          <div className="mt-3 flex justify-between items-center">
                            <div>
                              <span className="text-2xl font-bold">${event.price}</span>
                              <span className="text-gray-500 text-sm ml-1">per seat</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Tables</div>
                              <div className="font-bold">
                                {event.tablesSold}/{event.tablesAvailable} sold
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => router.push(`/event/${event.id}`)}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
                            >
                              View Event
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setVenueView(true);
                              }}
                              className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                            >
                              View Venue
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">Quick Links:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => router.push("/")}
                        className="bg-white px-4 py-2 rounded hover:bg-gray-50"
                      >
                        🏠 Homepage
                      </button>
                      <button
                        onClick={() => router.push("/my-tables")}
                        className="bg-white px-4 py-2 rounded hover:bg-gray-50"
                      >
                        🎫 My Tables
                      </button>
                      <button
                        onClick={() => router.push("/seller")}
                        className="bg-white px-4 py-2 rounded hover:bg-gray-50"
                      >
                        💼 Seller Dashboard
                      </button>
                      <button
                        onClick={() => setVenueView(true)}
                        className="bg-white px-4 py-2 rounded hover:bg-gray-50"
                      >
                        🎭 Venue View
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Venue View with Visual Tables */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedEvent ? selectedEvent.name : 'Venue Layout'}
                  </h2>
                  <p className="text-gray-600">Interactive seating chart - click seats to select</p>
                </div>
                <button
                  onClick={() => setVenueView(false)}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  ← Back to Events
                </button>
              </div>

              <VenueLayout tables={tables} onSeatClick={handleSeatClick} />

              {/* Purchase Section */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">
                      {selectedSeats.length} seat(s) selected
                    </p>
                    <p className="text-gray-600">
                      Total: ${selectedSeats.length * (selectedEvent?.price || 100)}
                    </p>
                  </div>
                  <button
                    onClick={purchaseSelectedSeats}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Purchase Selected Seats
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {tables.filter(t => t.status === 'available').length}
                  </div>
                  <div className="text-gray-600">Available Tables</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {tables.filter(t => t.status === 'partial').length}
                  </div>
                  <div className="text-gray-600">Partial Tables</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {tables.filter(t => t.status === 'sold').length}
                  </div>
                  <div className="text-gray-600">Sold Out Tables</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}