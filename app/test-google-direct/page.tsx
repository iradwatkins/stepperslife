"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function TestGoogleDirect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("Loading...");
  const [apiKey] = useState("AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM");
  const [result, setResult] = useState<unknown>(null);

  const initAutocomplete = () => {
    if (!window.google?.maps?.places) {
      setStatus("❌ Google Places API not available");
      return;
    }

    if (!inputRef.current) {
      setStatus("❌ Input element not found");
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        setResult(place);
        console.log('Place selected:', place);
      });

      setStatus("✅ Autocomplete initialized - start typing!");
    } catch (error: Error | unknown) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Autocomplete error:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Direct Google Maps API Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        <div className="space-y-2 text-sm">
          <p><strong>API Key:</strong> {apiKey.substring(0, 20)}...</p>
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          <p><strong>Status:</strong> <span className={status.includes('✅') ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Autocomplete Test</h2>
        <input
          ref={inputRef}
          type="text"
          placeholder="Start typing an address..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Try typing: "1600 Pennsylvania Avenue"
        </p>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open browser console (F12) and check for errors</li>
          <li>Look for "InvalidKeyMapError" or other API errors</li>
          <li>If you see errors, follow these steps in Google Cloud Console:
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Enable Maps JavaScript API</li>
              <li>Enable Places API (the new one)</li>
              <li>Add {typeof window !== 'undefined' ? window.location.hostname : 'localhost'} to API key restrictions</li>
              <li>Ensure billing is enabled</li>
            </ul>
          </li>
        </ol>
      </div>

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google Maps script loaded");
          setStatus("Script loaded - initializing...");
          setTimeout(initAutocomplete, 100);
        }}
        onError={(e) => {
          console.error("Failed to load Google Maps:", e);
          setStatus("❌ Failed to load Google Maps script");
        }}
      />
    </div>
  );
}