"use client";

import { useState } from "react";
import GoogleAddressInput from "@/components/GoogleAddressInput";

export default function TestGoogleAddressPage() {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Google Address Autocomplete</h1>
      
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4">Address Input with Google Autocomplete</h2>
          <p className="text-sm text-gray-600 mb-4">
            Start typing an address and select from the dropdown. The other fields will auto-fill.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <GoogleAddressInput
            value={formData.address}
            onChange={(value) => setFormData({...formData, address: value})}
            onAddressSelect={(components) => {
              setFormData({
                address: components.address,
                city: components.city,
                state: components.state,
                postalCode: components.postalCode
              });
            }}
            placeholder="Start typing: 1600 Pennsylvania Avenue..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Auto-filled"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Auto-filled"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Auto-filled"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current Form Data:</h3>
          <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click in the address field</li>
            <li>Start typing a real address (e.g., "1600 Pennsylvania")</li>
            <li>Select from the Google dropdown</li>
            <li>Watch the other fields auto-fill</li>
          </ol>
        </div>
      </div>
    </div>
  );
}