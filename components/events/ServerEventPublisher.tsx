"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishEvent } from "@/app/actions/publishEvent";
import { toast } from "@/hooks/use-toast";

interface ServerEventPublisherProps {
  eventData: any;
  ticketTypes: any[];
  tables: any[];
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
}

export default function ServerEventPublisher({ 
  eventData, 
  ticketTypes, 
  tables,
  onSuccess,
  onError 
}: ServerEventPublisherProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      const result = await publishEvent({
        ...eventData,
        ticketTypes,
        tables
      });

      if (result.success && result.eventId) {
        toast({
          title: "Success!",
          description: "Your event has been published successfully.",
        });
        
        if (onSuccess) {
          onSuccess(result.eventId);
        } else {
          router.push(`/event/${result.eventId}`);
        }
      } else {
        throw new Error(result.error || "Failed to publish event");
      }
    } catch (error: any) {
      console.error("Publishing error:", error);
      toast({
        variant: "destructive",
        title: "Publishing Failed",
        description: error.message || "Failed to publish event. Please try again.",
      });
      
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPublishing ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Publishing Event...</span>
        </div>
      ) : (
        "Publish Event"
      )}
    </button>
  );
}