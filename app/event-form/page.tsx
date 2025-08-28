"use client";

import dynamic from 'next/dynamic';

const SingleEventFlow = dynamic(
  () => import('@/components/events/SingleEventFlow'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading event form...</div>
  }
);

export default function EventFormPage() {
  const handleComplete = (data: any) => {
    console.log("Event created:", data);
    alert("Event created successfully! Check console for details.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <p className="text-blue-100">Fill in the details for your event</p>
          </div>
          
          <div className="p-6">
            <SingleEventFlow
              onComplete={handleComplete}
              onCancel={() => console.log("Cancelled")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}