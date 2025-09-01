"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";

interface DeleteEventButtonProps {
  eventId: Id<"events">;
  eventName: string;
  hasTickets: boolean;
  isPastEvent: boolean;
}

export default function DeleteEventButton({
  eventId,
  eventName,
  hasTickets,
  isPastEvent,
}: DeleteEventButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const deleteEvent = useMutation(api.events.deleteEvent);
  const { user } = useAuth();

  // Only show delete button for past events or events with no tickets
  if (hasTickets && !isPastEvent) {
    return null;
  }

  const handleDelete = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to delete events.",
      });
      return;
    }

    const confirmMessage = isPastEvent
      ? `Are you sure you want to permanently delete "${eventName}"? This is a past event and cannot be recovered.`
      : `Are you sure you want to permanently delete "${eventName}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEvent({ eventId, userId: user.id });
      toast({
        title: "Event deleted",
        description: `"${eventName}" has been permanently deleted.`,
      });
      router.push("/organizer/events");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      title={isPastEvent ? "Delete past event" : "Delete event (no tickets sold)"}
    >
      <Trash2 className="w-4 h-4" />
      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
    </button>
  );
}