"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, MapPin, DollarSign, Users, Plus, Trash2 } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createEvent = useMutation(api.events.create);
  const createTableConfig = useMutation(api.tables.createTableConfig);
  
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    location: "",
    eventDate: "",
    eventTime: "",
    isTicketed: true, // Default to ticketed event
    doorPrice: 0,
    price: 0, // Base ticket price (not used for table-only events)
    totalTickets: 100,
  });
  
  const [tableConfigs, setTableConfigs] = useState([
    { name: "VIP Table", seatCount: 10, price: 1000, description: "Premium seating with best view" },
    { name: "Standard Table", seatCount: 8, price: 600, description: "Regular table seating" },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleTableConfigChange = (index: number, field: string, value: any) => {
    setTableConfigs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  const addTableConfig = () => {
    setTableConfigs(prev => [
      ...prev,
      { name: "", seatCount: 8, price: 0, description: "" },
    ]);
  };
  
  const removeTableConfig = (index: number) => {
    setTableConfigs(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert("Please sign in to create an event");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const eventDateTime = new Date(`${eventData.eventDate}T${eventData.eventTime}`);
      
      // Create the event
      const eventId = await createEvent({
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        eventDate: eventDateTime.getTime(),
        price: eventData.price,
        totalTickets: eventData.totalTickets,
        userId: session.user.id,
        isTicketed: eventData.isTicketed,
        doorPrice: eventData.isTicketed ? undefined : eventData.doorPrice,
        eventType: "other",
      });
      
      // Create table configurations if it's a ticketed event
      if (eventData.isTicketed && tableConfigs.length > 0) {
        for (const config of tableConfigs) {
          if (config.name && config.price > 0) {
            await createTableConfig({
              eventId,
              name: config.name,
              seatCount: config.seatCount,
              price: config.price,
              description: config.description,
            });
          }
        }
      }
      
      // Redirect to event management page
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Event Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={eventData.name}
                  onChange={handleEventChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Summer Dance Workshop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleEventChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Join us for an amazing evening of..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleEventChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={eventData.eventDate}
                    onChange={handleEventChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={eventData.eventTime}
                    onChange={handleEventChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Ticketing Type */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Ticketing Type</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="isTicketed"
                    checked={eventData.isTicketed}
                    onChange={() => setEventData(prev => ({ ...prev, isTicketed: true }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Online Ticketed Event</div>
                    <div className="text-sm text-gray-600">
                      Sell tickets online with table/group purchase options
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="isTicketed"
                    checked={!eventData.isTicketed}
                    onChange={() => setEventData(prev => ({ ...prev, isTicketed: false }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Door Price Only</div>
                    <div className="text-sm text-gray-600">
                      Display event info with door pricing (no online sales)
                    </div>
                  </div>
                </label>
              </div>
              
              {!eventData.isTicketed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Door Price
                  </label>
                  <input
                    type="number"
                    name="doorPrice"
                    value={eventData.doorPrice}
                    onChange={handleEventChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25.00"
                  />
                </div>
              )}
            </div>
            
            {/* Table Configurations (for ticketed events) */}
            {eventData.isTicketed && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Table Configurations</h2>
                  <button
                    type="button"
                    onClick={addTableConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Table Type
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tableConfigs.map((config, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">Table Type {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeTableConfig(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Table Name
                          </label>
                          <input
                            type="text"
                            value={config.name}
                            onChange={(e) => handleTableConfigChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VIP Table"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Seats
                          </label>
                          <input
                            type="number"
                            value={config.seatCount}
                            onChange={(e) => handleTableConfigChange(index, "seatCount", parseInt(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Table Price
                          </label>
                          <input
                            type="number"
                            value={config.price}
                            onChange={(e) => handleTableConfigChange(index, "price", parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="1000.00"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={config.description}
                            onChange={(e) => handleTableConfigChange(index, "description", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Premium seating with best view"
                          />
                        </div>
                      </div>
                      
                      {config.seatCount > 0 && config.price > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Price per seat: ${(config.price / config.seatCount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}