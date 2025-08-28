"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MapPin } from "lucide-react";

interface GoogleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (components: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  }) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

// Use the API key from environment or fallback
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE";

export default function GoogleAddressInput({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  error,
  required = false
}: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google) return;

    try {
      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: ["us", "ca"] },
        fields: ["address_components", "formatted_address"]
      });

      autocompleteRef.current = autocomplete;

      // Add listener for place selection
      const listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          console.log("No address components found");
          return;
        }

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let postalCode = "";

        // Extract address components
        place.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (types.includes("route")) {
            route = component.long_name;
          }
          if (types.includes("locality")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
          if (types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });

        // Construct the street address
        const streetAddress = streetNumber && route ? `${streetNumber} ${route}` : "";

        // Update the input
        onChange(streetAddress || place.formatted_address || "");

        // Notify parent component
        if (onAddressSelect) {
          onAddressSelect({
            address: streetAddress,
            city,
            state,
            postalCode
          });
        }
      });

      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }
  }, [isScriptLoaded, onChange, onAddressSelect]);

  if (!isMounted) {
    // Return a simple input during SSR to prevent hydration mismatch
    return (
      <input
        type="text"
        className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        required={required}
        defaultValue={value}
      />
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Google Maps script loaded");
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Google Maps script:", e);
        }}
      />
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          } ${isScriptLoaded ? "pr-10" : ""}`}
          placeholder={placeholder}
          required={required}
        />
        {isScriptLoaded && (
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
}