"use client";

import { createSquareCheckoutSession } from "@/app/actions/createSquareCheckoutSession";
import { createStripeCheckoutSession } from "@/app/actions/createStripeCheckoutSession";
import { createPayPalCheckoutSession } from "@/app/actions/createPayPalCheckoutSession";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import PaymentMethodSelector, { PaymentMethod } from "./PaymentMethodSelector";
import ZellePaymentFlow from "./ZellePaymentFlow";
import { Ticket, CreditCard, DollarSign, Smartphone, Wallet } from "lucide-react";

export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id || user?.email || "",
  });
  const event = useQuery(api.events.getById, { eventId });
  
  // Check if event seller has Square OAuth connected (disabled for now)
  // const event = useQuery(api.events.getById, { eventId });
  // const sellerAccount = useQuery(api.users.getSquareAccount, { 
  //   userId: event?.userId || "" 
  // });

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

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

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setIsLoading(true);
    
    try {
      if (method === "square") {
        await handleSquareCheckout();
      } else if (method === "stripe") {
        await handleStripeCheckout();
      } else if (method === "paypal") {
        await handlePayPalCheckout();
      } else if (method === "zelle") {
        // Zelle flow will be handled by ZellePaymentFlow component
        setShowPaymentSelector(false);
      } else if (method === "bank") {
        // Bank transfer will be similar to Zelle
        setShowPaymentSelector(false);
      }
    } catch (error) {
      console.error(`Failed to process ${method} payment:`, error);
      alert(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSquareCheckout = async () => {
    const { sessionUrl } = await createSquareCheckoutSession({ eventId });
    if (sessionUrl) {
      window.location.href = sessionUrl;
    } else {
      throw new Error("Failed to create Square checkout session");
    }
  };

  const handleStripeCheckout = async () => {
    const { sessionUrl } = await createStripeCheckoutSession({ eventId });
    if (sessionUrl) {
      window.location.href = sessionUrl;
    } else {
      throw new Error("Failed to create Stripe checkout session");
    }
  };

  const handlePayPalCheckout = async () => {
    const { sessionUrl } = await createPayPalCheckoutSession({ eventId });
    if (sessionUrl) {
      window.location.href = sessionUrl;
    } else {
      throw new Error("Failed to create PayPal checkout session");
    }
  };

  const handlePurchase = () => {
    setShowPaymentSelector(true);
  };

  if (!user || !queuePosition || queuePosition.status !== "offered" || !event) {
    return null;
  }

  // Show Zelle payment flow if selected
  if (selectedPaymentMethod === "zelle" && !showPaymentSelector) {
    return (
      <ZellePaymentFlow
        eventId={eventId}
        userId={user.id || user.email || ""}
        waitingListId={queuePosition._id}
        amount={event.price}
        eventName={event.name}
        onComplete={() => router.push("/tickets")}
        onCancel={() => {
          setSelectedPaymentMethod(null);
          setShowPaymentSelector(false);
        }}
      />
    );
  }

  // Show payment method selector
  if (showPaymentSelector) {
    return (
      <div className="space-y-4">
        <PaymentMethodSelector
          availableMethods={["square", "stripe", "paypal", "zelle", "bank"]}
          onMethodSelect={handlePaymentMethodSelect}
          eventPrice={event.price}
        />
        <button
          onClick={() => setShowPaymentSelector(false)}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Back to ticket details
        </button>
      </div>
    );
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
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Credit/Debit</span>
                </span>
                <span className="px-3 py-1.5 bg-green-100 rounded text-xs flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cash App</span>
                </span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Apple Pay</span>
                </span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Google Pay</span>
                </span>
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
