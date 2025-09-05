"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import PaymentSetupModal from "@/components/payments/PaymentSetupModal";
import { 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  FileText, 
  Image, 
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function CompleteSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const eventId = params.id as Id<"events">;
  
  // Query event details
  const event = useQuery(api.events.getById, { eventId });
  const updateEventStatus = useMutation(api.events.updateEventStatus);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Please sign in to continue</p>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }
  
  // Check if event belongs to user
  if (event.userId !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl">You don't have permission to edit this event</p>
        </div>
      </div>
    );
  }
  
  // Setup requirements
  const requirements = [
    {
      id: "basic_info",
      label: "Basic Information",
      completed: event.name && event.description && event.location,
      icon: FileText,
      message: "Event name, description, and location are required"
    },
    {
      id: "date_time",
      label: "Date & Time",
      completed: event.eventDate,
      icon: Calendar,
      message: "Event date and time must be set"
    },
    {
      id: "location",
      label: "Location Details",
      completed: event.location,
      icon: MapPin,
      message: "Complete venue address is required"
    },
    {
      id: "payment",
      label: "Payment Method",
      completed: !!event.paymentModel,
      icon: CreditCard,
      message: event.isTicketed ? "Select how you'll process ticket payments" : "Not required for non-ticketed events"
    },
    {
      id: "image",
      label: "Event Image",
      completed: !!event.imageUrl,
      icon: Image,
      message: "Add an eye-catching event image (optional but recommended)"
    }
  ];
  
  const requiredItems = event.isTicketed 
    ? requirements.filter(r => r.id !== "image")
    : requirements.filter(r => r.id !== "payment" && r.id !== "image");
  
  const allRequiredComplete = requiredItems.every(r => r.completed);
  
  const handlePaymentComplete = async (model: string) => {
    setShowPaymentModal(false);
    // The payment modal already updates the event status
    router.push(`/organizer/events`);
  };
  
  const handlePublish = async () => {
    if (!allRequiredComplete) {
      alert("Please complete all required items before publishing");
      return;
    }
    
    setIsPublishing(true);
    try {
      await updateEventStatus({
        eventId,
        status: "published",
      });
      router.push(`/organizer/events`);
    } catch (error) {
      console.error("Error publishing event:", error);
      alert("Failed to publish event. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Complete Event Setup</h1>
          <p className="text-gray-600">
            Your event "{event.name}" is in draft mode. Complete the requirements below to publish it.
          </p>
        </div>
        
        {/* Status Alert */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Event Status: Draft</p>
              <p className="text-sm text-amber-800 mt-1">
                {event.draftReason || "This event is not visible to customers until you complete setup and publish it."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Requirements Checklist */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Setup Requirements</h2>
          
          <div className="space-y-4">
            {requirements.map((req) => {
              const Icon = req.icon;
              const isRequired = req.id !== "image" && (event.isTicketed || req.id !== "payment");
              
              return (
                <div
                  key={req.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    req.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="mt-0.5">
                    {req.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">{req.label}</span>
                      {isRequired && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                    
                    {/* Action buttons for incomplete items */}
                    {!req.completed && req.id === "payment" && event.isTicketed && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        Configure Payment Method
                      </button>
                    )}
                    
                    {!req.completed && req.id !== "payment" && (
                      <button
                        onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
                        className="mt-3 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                      >
                        Edit Event Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit Event Details
          </button>
          
          <button
            onClick={handlePublish}
            disabled={!allRequiredComplete || isPublishing}
            className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 ${
              allRequiredComplete
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Publish Event
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Payment Setup Modal */}
      {showPaymentModal && (
        <PaymentSetupModal
          eventId={eventId}
          organizerId={user.id}
          expectedTickets={event.totalTickets || 100}
          averageTicketPrice={event.price || 0}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}