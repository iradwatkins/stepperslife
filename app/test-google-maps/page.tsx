"use client";

import { useState } from "react";
import GoogleMapsAddressAutocomplete from "@/components/GoogleMapsAddressAutocomplete";

export default function TestGoogleMaps() {
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Google Maps API Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Address Autocomplete Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter an address:
            </label>
            <GoogleMapsAddressAutocomplete
              value={address}
              onChange={setAddress}
              onAddressSelect={(details) => {
                console.log("Address selected:", details);
                setAddressDetails(details);
              }}
              placeholder="Start typing an address..."
            />
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Current Value:</h3>
            <p className="text-sm">{address || "(empty)"}</p>
          </div>

          {addressDetails && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Address Details:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(addressDetails, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2">API Status:</h3>
            <p className="text-sm">
              API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 
                `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 
                "NOT SET"}
            </p>
            <p className="text-sm mt-1">
              Check browser console for any errors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}