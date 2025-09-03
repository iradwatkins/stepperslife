import ModernEventCard from "@/components/ModernEventCard";
import HeroCarousel from "@/components/HeroCarousel";

export default function TestNewUI() {
  const testEvent = {
    _id: "test1",
    name: "Atlanta Salsa Festival",
    description: "Join us for an amazing night of salsa dancing",
    location: "Fox Theatre",
    eventDate: Date.now() + 86400000, // Tomorrow
    price: 45.00,
    imageUrl: "/placeholder-event.jpg",
    city: "Atlanta",
    state: "GA",
    availableTickets: 50
  };

  const testEvents = [
    { ...testEvent, totalTickets: 100 }, // Has tickets - shows "Buy Tickets"
    { ...testEvent, _id: "test2", name: "Comedy Night - Save the Date", price: 0, isSaveTheDate: true }, // Save the date - shows "View Details"
    { ...testEvent, _id: "test3", name: "Jazz Concert", price: 35.00, totalTickets: 50 }, // Has tickets - shows "Buy Tickets"
    { ...testEvent, _id: "test4", name: "Sold Out Workshop", price: 20.00, totalTickets: 0 }, // No tickets - shows "View Details"
    { ...testEvent, _id: "test5", name: "Free Community Event", price: 0, totalTickets: 200 } // Free event with tickets
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center py-4">Test: New UI Components</h1>
        
        {/* Test Carousel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold px-4 mb-4">Hero Carousel:</h2>
          <HeroCarousel events={testEvents} />
        </div>
        
        {/* Test Event Cards */}
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">Event Cards (4-column grid):</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testEvents.slice(0, 4).map(event => (
              <ModernEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}