"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Info, Lock, Check } from "lucide-react";
import PaymentModelSelector from "@/components/payment/PaymentModelSelector";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { EventData } from "@/types/events";

interface PaymentModelStepProps {
  data: EventData;
  onChange: (data: EventData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentModelStep({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}: PaymentModelStepProps) {
  const { userId } = useAuth();
  const [hasAffiliateProgram, setHasAffiliateProgram] = useState(data.hasAffiliateProgram || false);
  const [commissionPercent, setCommissionPercent] = useState(data.affiliateCommissionPercent || 10);
  const [maxAffiliateTickets, setMaxAffiliateTickets] = useState(data.maxAffiliateTickets || 0);
  
  const trustScore = useQuery(api.trust.trustScoring.getOrganizerTrust, { 
    organizerId: userId || "" 
  });

  const handleNext = () => {
    if (!data.paymentModel) {
      alert("Please select a payment model to continue");
      return;
    }
    
    onChange({
      ...data,
      hasAffiliateProgram,
      affiliateCommissionPercent: hasAffiliateProgram ? commissionPercent : undefined,
      maxAffiliateTickets: hasAffiliateProgram ? maxAffiliateTickets : undefined,
    });
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Payment Processing</h2>
        <p className="opacity-90">
          Choose how you want to handle payments for this event
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Select Payment Model</h3>
        
        <PaymentModelSelector
          organizerId={userId || ""}
          onSelect={(model) => onChange({ ...data, paymentModel: model })}
          selectedModel={data.paymentModel}
          ticketPrice={50} // You might want to calculate average ticket price
        />
      </div>

      {/* Affiliate Program Configuration */}
      {data.paymentModel && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Affiliate Program (Optional)</h3>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasAffiliateProgram}
              onChange={(e) => setHasAffiliateProgram(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="font-medium">Enable affiliate sales for this event</span>
          </label>

          {hasAffiliateProgram && (
            <div className="ml-8 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Affiliate Commission (%)
                </label>
                <input
                  type="number"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  min="1"
                  max="50"
                  className="w-32 px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Affiliates earn this percentage of each ticket sale
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Affiliate Tickets
                </label>
                <input
                  type="number"
                  value={maxAffiliateTickets}
                  onChange={(e) => setMaxAffiliateTickets(Number(e.target.value))}
                  min="0"
                  placeholder="0 for unlimited"
                  className="w-32 px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total tickets that can be allocated to affiliates (0 = unlimited)
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>How it works:</strong> After creating your event, you can allocate 
                  tickets to affiliates who will sell them on your behalf. They'll register 
                  sales in their app, and you'll verify payments before tickets are activated.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fee Summary */}
      {data.paymentModel && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Fee Summary</h4>
          <div className="text-sm space-y-1">
            {data.paymentModel === "connect_collect" && (
              <>
                <p>Platform Fee: $2.00 per ticket</p>
                <p>Processing: Your payment provider's rates</p>
                <p>Payout: Instant to your account</p>
              </>
            )}
            {data.paymentModel === "premium" && (
              <>
                <p>Service Fee: 3.7% + $1.79 per ticket</p>
                <p>Processing Fee: 2.9% (included)</p>
                <p>Payout: 5 days after event</p>
              </>
            )}
            {data.paymentModel === "split" && (
              <>
                <p>Platform Share: 10% of ticket price</p>
                <p>Your Share: 90% of ticket price</p>
                <p>Payout: Instant split at purchase</p>
              </>
            )}
            {hasAffiliateProgram && (
              <p className="text-purple-600 font-medium mt-2">
                Affiliate Commission: {commissionPercent}% per sale
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!data.paymentModel}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            data.paymentModel
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}