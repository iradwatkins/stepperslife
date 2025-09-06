"use client";

import { DollarSign, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState } from "react";

interface DoorPriceStepProps {
  data: {
    doorPrice?: number;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DoorPriceStep({
  data,
  onChange,
  onNext,
  onBack,
}: DoorPriceStepProps) {
  const [error, setError] = useState<string>("");

  const handlePriceChange = (value: string) => {
    setError("");
    const price = value === "" ? undefined : parseFloat(value);
    
    if (value !== "" && (isNaN(price!) || price! < 0)) {
      setError("Please enter a valid price");
      return;
    }
    
    onChange({ ...data, doorPrice: price });
  };

  const handleNext = () => {
    if (data.doorPrice === undefined || data.doorPrice === null) {
      setError("Please enter a door price (or 0 for free events)");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Door Price</h2>
        <p className="text-gray-600">Set the price attendees will pay at the door</p>
      </div>

      {/* Door Price Input */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Door Price *
        </label>
        
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 text-lg">$</span>
          <input
            type="number"
            value={data.doorPrice ?? ""}
            onChange={(e) => handlePriceChange(e.target.value)}
            min="0"
            step="0.01"
            className={`w-full pl-10 pr-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-900`}
            placeholder="25.00"
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          This price will be displayed on your event page. Attendees will pay when they arrive at the venue.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Pricing Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Enter 0 for free events</li>
          <li>• Consider your venue costs and expected attendance</li>
          <li>• You can always update the price later if needed</li>
          <li>• This is for door sales only - no online transactions</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Next: Review
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}