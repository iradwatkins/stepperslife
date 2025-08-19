"use client";

import { createSquareCheckoutSession } from "@/app/actions/createSquareCheckoutSession";
import { createSquareCheckoutWithSplit } from "@/app/actions/createSquareCheckoutWithSplit";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import { Ticket } from "lucide-react";

export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id || user?.email || "",
  });
  
  // Check if event seller has Square OAuth connected
  const event = useQuery(api.events.getById, { eventId });
  const sellerAccount = useQuery(api.users.getSquareAccount, { 
    userId: event?.userId || "" 
  });

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
            seconds === 1 ? "" : "s"
          }`
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

  const handlePurchase = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Use OAuth checkout if seller has connected Square, otherwise use platform account
      const { sessionUrl } = sellerAccount?.isConnected 
        ? await createSquareCheckoutWithSplit({ eventId })
        : await createSquareCheckoutSession({ eventId });

      if (sessionUrl) {
        router.push(sessionUrl);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !queuePosition || queuePosition.status !== "offered") {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket Reserved
                </h3>
                <p className="text-sm text-gray-500">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed">
              A ticket has been reserved for you. Complete your purchase before
              the timer expires to secure your spot at this event.
            </div>

            {/* Payment Methods */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Accepted Payment Methods:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">💳 Credit/Debit</span>
                <span className="px-2 py-1 bg-green-100 rounded text-xs">💵 Cash App</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">🍎 Apple Pay</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">🤖 Google Pay</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isExpired || isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
        >
          {isLoading
            ? "Redirecting to checkout..."
            : "Purchase Your Ticket Now →"}
        </button>

        <div className="mt-4">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>
    </div>
  );
}
