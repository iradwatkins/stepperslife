"use client";

import { DollarSign, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState } from "react";

interface MultiDayDoorPriceStepProps {
  data: {
    doorPriceMin?: number;
    doorPriceMax?: number;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MultiDayDoorPriceStep({
  data,
  onChange,
  onNext,
  onBack,
}: MultiDayDoorPriceStepProps) {
  const [errors, setErrors] = useState<{ min?: string; max?: string }>({});

  const handleMinPriceChange = (value: string) => {
    const newErrors = { ...errors };
    delete newErrors.min;
    setErrors(newErrors);
    
    const price = value === "" ? undefined : parseFloat(value);
    
    if (value !== "" && (isNaN(price!) || price! < 0)) {
      setErrors({ ...newErrors, min: "Please enter a valid minimum price" });
      return;
    }
    
    onChange({ ...data, doorPriceMin: price });
  };

  const handleMaxPriceChange = (value: string) => {
    const newErrors = { ...errors };
    delete newErrors.max;
    setErrors(newErrors);
    
    const price = value === "" ? undefined : parseFloat(value);
    
    if (value !== "" && (isNaN(price!) || price! < 0)) {
      setErrors({ ...newErrors, max: "Please enter a valid maximum price" });
      return;
    }
    
    onChange({ ...data, doorPriceMax: price });
  };

  const handleNext = () => {
    const newErrors: { min?: string; max?: string } = {};
    
    if (data.doorPriceMin === undefined || data.doorPriceMin === null) {
      newErrors.min = "Please enter a minimum door price";
    }
    
    if (data.doorPriceMax === undefined || data.doorPriceMax === null) {
      newErrors.max = "Please enter a maximum door price";
    }
    
    if (data.doorPriceMin !== undefined && data.doorPriceMax !== undefined) {
      if (data.doorPriceMax < data.doorPriceMin) {
        newErrors.max = "Maximum price must be greater than or equal to minimum price";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Door Price Range</h2>
        <p className="text-gray-600">Set the price range for your multi-day event</p>
      </div>

      {/* Price Range Inputs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Door Price Range *
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum Price */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Minimum Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={data.doorPriceMin ?? ""}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.min ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-900`}
                placeholder="25.00"
              />
            </div>
            {errors.min && (
              <p className="text-red-500 text-sm mt-1">{errors.min}</p>
            )}
          </div>

          {/* Maximum Price */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Maximum Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={data.doorPriceMax ?? ""}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.max ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-900`}
                placeholder="45.00"
              />
            </div>
            {errors.max && (
              <p className="text-red-500 text-sm mt-1">{errors.max}</p>
            )}
          </div>
        </div>
        
        {/* Preview */}
        {data.doorPriceMin !== undefined && data.doorPriceMax !== undefined && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price Range Display:</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${data.doorPriceMin.toFixed(2)} - ${data.doorPriceMax.toFixed(2)}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          This price range will be displayed on your event page. Different days may have different prices within this range.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Multi-Day Pricing Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Minimum price typically for single-day attendance</li>
          <li>• Maximum price typically for full event pass</li>
          <li>• Consider early bird vs. regular pricing in your range</li>
          <li>• You can update these prices later if needed</li>
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