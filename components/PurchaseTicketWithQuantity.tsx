"use client";

import { createSquareCheckoutSession } from "@/app/actions/createSquareCheckoutSession";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Ticket, Users, Plus, Minus, ShoppingCart } from "lucide-react";

interface TableConfig {
  name: string;
  seatCount: number;
  pricePerSeat: number;
  description: string;
  ticketType: string;
}

interface PurchaseTicketWithQuantityProps {
  eventId: Id<"events">;
  isMultiDay?: boolean;
  eventDays?: any[];
  bundles?: any[];
  ticketTypes?: any[];
}

export default function PurchaseTicketWithQuantity({ 
  eventId,
  isMultiDay = false,
  eventDays,
  bundles,
  ticketTypes: propTicketTypes
}: PurchaseTicketWithQuantityProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isTablePurchase, setIsTablePurchase] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Multi-day event states
  const [selectedDay, setSelectedDay] = useState<Id<"eventDays"> | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Id<"ticketBundles"> | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<"day" | "bundle" | "single">("single");
  
  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const tableOptions = useQuery(api.tableSales.getTableOptions, { eventId });
  
  // Get ticket types for selected day (multi-day) or event (single)
  const dayTicketTypes = useQuery(api.ticketTypes.getAvailableTickets, {
    eventId,
    eventDayId: selectedDay || undefined,
  });
  
  // Get referral code from URL if present
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        setReferralCode(ref);
        sessionStorage.setItem('referralCode', ref);
      } else {
        const storedRef = sessionStorage.getItem('referralCode');
        if (storedRef) {
          setReferralCode(storedRef);
        }
      }
    }
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (availability && newQuantity > availability.totalTickets - availability.purchasedCount) {
      alert(`Only ${availability.totalTickets - availability.purchasedCount} tickets available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleTableSelect = (table: TableConfig) => {
    setSelectedTable(table);
    setIsTablePurchase(true);
    setQuantity(table.seatCount);
  };

  const handlePurchase = async () => {
    if (!isSignedIn || !user) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare checkout data based on purchase type
      let checkoutData: any = { eventId };
      
      if (isMultiDay && purchaseMode === "bundle" && selectedBundle) {
        // Bundle purchase for multi-day event
        checkoutData = {
          ...checkoutData,
          purchaseType: "bundle",
          bundleId: selectedBundle,
          // @ts-ignore - Add bundle support to checkout
          isBundle: true,
        };
      } else if (isMultiDay && purchaseMode === "day" && selectedDay) {
        // Individual day ticket purchase
        checkoutData = {
          ...checkoutData,
          purchaseType: "day_ticket",
          eventDayId: selectedDay,
          // @ts-ignore - Add day ticket support to checkout
          quantity: quantity,
          isDayTicket: true,
        };
      } else {
        // Standard single event purchase
        checkoutData = {
          ...checkoutData,
          purchaseType: "single_ticket",
          // @ts-ignore - Add quantity support to checkout
          quantity: quantity,
          isTablePurchase: isTablePurchase,
          tableName: selectedTable?.name,
        };
      }
      
      // Add referral code if present
      if (referralCode) {
        checkoutData.referralCode = referralCode;
      }
      
      const { sessionUrl } = await createSquareCheckoutSession(checkoutData);
      
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event || !availability) {
    return null;
  }

  const totalPrice = isTablePurchase && selectedTable 
    ? selectedTable.pricePerSeat * selectedTable.seatCount
    : event.price * quantity;

  const isPastEvent = event.eventDate < Date.now();
  const isSoldOut = availability.purchasedCount >= availability.totalTickets;

  if (isPastEvent || isSoldOut) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Multi-day Event Mode Selection */}
      {isMultiDay && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPurchaseMode("day");
                setSelectedBundle(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                purchaseMode === "day"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Individual Days
            </button>
            {bundles && bundles.length > 0 && (
              <button
                onClick={() => {
                  setPurchaseMode("bundle");
                  setSelectedDay(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  purchaseMode === "bundle"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bundle Packages
              </button>
            )}
          </div>

          {/* Day Selection for Multi-day Events */}
          {purchaseMode === "day" && eventDays && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Day</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDay || ""}
                onChange={(e) => setSelectedDay(e.target.value as Id<"eventDays">)}
              >
                <option value="">Choose a day</option>
                {eventDays.map((day) => (
                  <option key={day._id} value={day._id}>
                    {day.dayLabel}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bundle Selection */}
          {purchaseMode === "bundle" && bundles && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Bundle</label>
              <div className="space-y-2">
                {bundles.map((bundle) => (
                  <div
                    key={bundle._id}
                    onClick={() => setSelectedBundle(bundle._id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBundle === bundle._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{bundle.name}</p>
                        {bundle.description && (
                          <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Includes: {bundle.includedDays.length} days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${bundle.bundlePrice}</p>
                        {bundle.savingsAmount > 0 && (
                          <p className="text-xs text-green-600">Save ${bundle.savingsAmount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Mode Toggle (for single events or after day selection) */}
      {(!isMultiDay || (purchaseMode === "day" && selectedDay)) && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsTablePurchase(false);
              setSelectedTable(null);
              setQuantity(1);
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              !isTablePurchase 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Ticket className="w-4 h-4 inline mr-2" />
            Individual Tickets
          </button>
          {tableOptions?.configurations && (
            <button
              onClick={() => setIsTablePurchase(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isTablePurchase 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Table/Group
            </button>
          )}
        </div>
      )}

      {/* Individual Ticket Purchase */}
      {!isTablePurchase && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10 || (availability && quantity >= availability.totalTickets - availability.purchasedCount)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {availability.totalTickets - availability.purchasedCount} tickets available
            </p>
          </div>
        </div>
      )}

      {/* Table Purchase Options */}
      {isTablePurchase && tableOptions && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Table Configuration
          </label>
          {tableOptions.configurations.map((table, index) => (
            <div
              key={index}
              onClick={() => handleTableSelect(table)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTable?.name === table.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{table.name}</h4>
                  <p className="text-sm text-gray-600">{table.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {table.seatCount} seats × ${table.pricePerSeat} per seat
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${table.seatCount * table.pricePerSeat}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral Code Display */}
      {referralCode && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            🎉 Referral code <span className="font-semibold">{referralCode}</span> applied!
          </p>
        </div>
      )}

      {/* Price Summary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">
              {isTablePurchase && selectedTable 
                ? `${selectedTable.name} (${selectedTable.seatCount} seats)`
                : `${quantity} ticket${quantity > 1 ? 's' : ''}`}
            </p>
            <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isLoading || (isTablePurchase && !selectedTable)}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isLoading || (isTablePurchase && !selectedTable)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {isTablePurchase ? "Purchase Table" : "Purchase Tickets"}
            </>
          )}
        </button>

        {isTablePurchase && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            After purchase, you'll receive individual claim links for each seat
          </p>
        )}
      </div>
    </div>
  );
}