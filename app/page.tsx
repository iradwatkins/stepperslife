import EventList from "@/components/EventList";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* TEST DEPLOYMENT BANNER - REMOVE AFTER VERIFICATION */}
      <div className="bg-green-500 text-white text-center py-4 font-bold text-xl">
        🚀 STEPPERSLIFE DEPLOYMENT TEST - {new Date().toLocaleString()}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to SteppersLife
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your Premium Event Ticketing Platform
        </p>
        <EventList />
      </div>
    </div>
  );
}
