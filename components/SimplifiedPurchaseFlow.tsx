"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, CreditCard, Users, Ticket } from "lucide-react";

interface SimplifiedPurchaseFlowProps {
  eventId: Id<"events">;
}

export default function SimplifiedPurchaseFlow({ eventId }: SimplifiedPurchaseFlowProps) {
  const [selectedTableId, setSelectedTableId] = useState<Id<"tableConfigurations"> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  // Get event and table configurations
  const event = useQuery(api.events.getById, { eventId });
  const tableConfigs = useQuery(api.tables.getTableConfigurations, { 
    eventId,
    activeOnly: true 
  });
  const purchaseTable = useMutation(api.purchases.purchaseTable);

  const handlePurchase = async () => {
    if (!selectedTableId || !buyerInfo.name || !buyerInfo.email) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await purchaseTable({
        tableConfigId: selectedTableId,
        buyerEmail: buyerInfo.email,
        buyerName: buyerInfo.name,
        buyerPhone: buyerInfo.phone,
        paymentMethod: "test",
        paymentReference: `TEST-${Date.now()}`,
      });

      setPurchaseResult(result);
      setPurchaseComplete(true);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!event || !tableConfigs) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (purchaseComplete && purchaseResult) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">
          ✅ Purchase Successful!
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Your {purchaseResult.tableConfig.name} purchase for {purchaseResult.tableConfig.seatCount} seats has been confirmed.
        </p>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Your Tickets:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {purchaseResult.tickets.map((ticket: any, index: number) => (
              <a
                key={ticket.ticketId}
                href={ticket.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{ticket.seatLabel}</p>
                    <p className="text-xs text-gray-600">Code: {ticket.ticketCode}</p>
                  </div>
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
              </a>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Share these links with your guests - no login required!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Purchase Tickets</h2>
      
      {/* Table Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Table Type
        </label>
        <div className="space-y-2">
          {tableConfigs.map((config) => (
            <div
              key={config._id}
              onClick={() => setSelectedTableId(config._id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTableId === config._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{config.name}</h3>
                  {config.description && (
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {config.seatCount} seats
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${config.price}</p>
                  <p className="text-xs text-gray-500">
                    ${(config.price / config.seatCount).toFixed(2)}/seat
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Information */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            value={buyerInfo.name}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={buyerInfo.email}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={buyerInfo.phone}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="555-0123"
          />
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={!selectedTableId || !buyerInfo.name || !buyerInfo.email || isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Complete Purchase
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        This is a test purchase. In production, this would process payment.
      </p>
    </div>
  );
}