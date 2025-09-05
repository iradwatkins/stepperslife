"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Shield, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ClaimEventButtonProps {
  eventId: Id<"events">;
  eventName: string;
  claimToken?: string;
  userId: string;
  userEmail: string;
}

export default function ClaimEventButton({
  eventId,
  eventName,
  claimToken,
  userId,
  userEmail,
}: ClaimEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAdminEvent, setDeleteAdminEvent] = useState(true);
  const [organizerMessage, setOrganizerMessage] = useState("");
  
  const claimEvent = useMutation(api.adminEvents.claimEvent);
  const requestClaim = useMutation(api.adminEvents.requestEventClaim);

  const handleClaim = async () => {
    if (!claimToken) {
      handleRequestClaim();
      return;
    }

    setIsLoading(true);
    try {
      await claimEvent({
        eventId,
        claimToken,
        userId,
        userEmail,
        deleteAdminEvent,
      });
      
      toast.success("Event claimed successfully!", {
        description: "You can now manage this event from your dashboard.",
      });
      
      setIsOpen(false);
      // Refresh the page to show updated ownership
      window.location.reload();
    } catch (error) {
      console.error("Failed to claim event:", error);
      toast.error("Failed to claim event", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClaim = async () => {
    setIsLoading(true);
    try {
      await requestClaim({
        eventId,
        userId,
        userEmail,
        organizerMessage,
      });
      
      toast.success("Claim request submitted!", {
        description: "An admin will review your request shortly.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request claim:", error);
      toast.error("Failed to submit claim request", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-md"
      >
        <Shield className="w-5 h-5" />
        Claim Your Event
      </button>

      {/* Claim Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Claim Event Ownership
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Confirm that you are the organizer of "{eventName}"
                </p>
              </div>
            </div>

            {claimToken ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">What happens when you claim:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>You become the owner of this event</li>
                        <li>You can edit and manage all event details</li>
                        <li>Admin will be notified of the claim</li>
                        {deleteAdminEvent && (
                          <li>Admin's duplicate posting will be removed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deleteAdminEvent}
                      onChange={(e) => setDeleteAdminEvent(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Remove admin's duplicate event after claiming
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Manual Review Required</p>
                      <p>This event requires admin approval to claim. Please provide a message to help verify your ownership.</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message to Admin (Optional)
                  </label>
                  <textarea
                    value={organizerMessage}
                    onChange={(e) => setOrganizerMessage(e.target.value)}
                    placeholder="Explain why you should own this event..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={claimToken ? handleClaim : handleRequestClaim}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : claimToken ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Claim Event
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Request Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}