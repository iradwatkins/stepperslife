"use client";

import { useState } from "react";

interface SimpleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function SimpleAddressInput({
  value,
  onChange,
  placeholder = "Enter address...",
  className = "",
  error,
  required = false,
}: SimpleAddressInputProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [addressParts, setAddressParts] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
  });

  const handleManualSubmit = () => {
    const fullAddress = `${addressParts.street}, ${addressParts.city}, ${addressParts.state} ${addressParts.zip}, ${addressParts.country}`;
    onChange(fullAddress);
    setShowManualInput(false);
  };

  if (showManualInput) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={addressParts.street}
            onChange={(e) => setAddressParts({ ...addressParts, street: e.target.value })}
            placeholder="123 Main St"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required={required}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={addressParts.city}
              onChange={(e) => setAddressParts({ ...addressParts, city: e.target.value })}
              placeholder="Atlanta"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required={required}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <input
              type="text"
              value={addressParts.state}
              onChange={(e) => setAddressParts({ ...addressParts, state: e.target.value })}
              placeholder="GA"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required={required}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={addressParts.zip}
              onChange={(e) => setAddressParts({ ...addressParts, zip: e.target.value })}
              placeholder="30301"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required={required}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={addressParts.country}
              onChange={(e) => setAddressParts({ ...addressParts, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required={required}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Use This Address
          </button>
          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowManualInput(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700"
        >
          Enter manually
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Type an address or click "Enter manually" to input address details
      </p>
    </div>
  );
}