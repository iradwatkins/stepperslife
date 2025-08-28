"use client";

import { Ticket, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

interface TicketDecisionStepProps {
  data: {
    isTicketed: boolean;
    doorPrice?: number;
    isSaveTheDate?: boolean;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TicketDecisionStep({
  data,
  onChange,
  onNext,
  onBack,
}: TicketDecisionStepProps) {
  const handleTicketingChange = (isTicketed: boolean) => {
    onChange({ ...data, isTicketed });
  };

  const handleDoorPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    onChange({ ...data, doorPrice: price });
  };


  const canProceed = data.isTicketed || (data.doorPrice !== undefined && data.doorPrice >= 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Ticketing Options</h2>
        <p className="text-gray-600">How will you sell tickets for this event?</p>
      </div>

      {/* Ticketing Options */}
      <div className="space-y-4">
        <label
          className={`block p-6 border-2 rounded-lg cursor-pointer transition-all ${
            data.isTicketed
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="ticketing"
            checked={data.isTicketed}
            onChange={() => handleTicketingChange(true)}
            className="sr-only"
          />
          <div className="flex items-start">
            <Ticket className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Sell Tickets Online</h3>
              <p className="text-gray-600 text-sm mb-2">
                Accept online payments and manage ticket inventory
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Individual ticket sales</li>
                <li>✓ Table/group purchases</li>
                <li>✓ Early bird pricing</li>
                <li>✓ QR code tickets</li>
                <li>✓ Real-time inventory tracking</li>
              </ul>
            </div>
          </div>
        </label>

        <label
          className={`block p-6 border-2 rounded-lg cursor-pointer transition-all ${
            !data.isTicketed
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="ticketing"
            checked={!data.isTicketed}
            onChange={() => handleTicketingChange(false)}
            className="sr-only"
          />
          <div className="flex items-start">
            <DollarSign className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Door Price Only</h3>
              <p className="text-gray-600 text-sm mb-2">
                Display event information with door pricing (no online sales)
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Event listing on platform</li>
                <li>✓ Show door price</li>
                <li>✓ Cash/payment at venue</li>
                <li>✗ No online ticket sales</li>
                <li>✗ No advance reservations</li>
              </ul>
            </div>
          </div>
        </label>
      </div>

      {/* Door Price Input (if door price only) */}
      {!data.isTicketed && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Door Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={data.doorPrice || ""}
              onChange={(e) => handleDoorPriceChange(e.target.value)}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="25.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This price will be displayed on the event page. Customers will pay at the door.
          </p>
        </div>
      )}


      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> {
            data.isSaveTheDate 
              ? "Save the Date events are for announcements only - no tickets or location required."
              : data.isTicketed 
                ? "You'll set up ticket types, pricing, and capacity in the next step."
                : "You can always upgrade to online ticketing later if needed."
          }
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center px-6 py-2 rounded-lg ${
            canProceed
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {data.isSaveTheDate ? "Next: Review" : data.isTicketed ? "Next: Set Capacity" : "Next: Review"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}