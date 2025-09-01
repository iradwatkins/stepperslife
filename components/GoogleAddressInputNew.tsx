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

export default function GoogleAddressInputNew({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  error,
  required = false
}: GoogleAddressInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.google) return;

    try {
      // Check if PlaceAutocompleteElement is available
      if (!window.google.maps.places.PlaceAutocompleteElement) {
        console.error("PlaceAutocompleteElement not available");
        return;
      }

      // Create the new PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: ["us", "ca"] },
        fields: ["formatted_address", "address_components", "geometry"],
        types: ["address"]
      });

      // Store reference
      elementRef.current = autocomplete;

      // Set placeholder
      const input = autocomplete.querySelector('input');
      if (input) {
        input.placeholder = placeholder;
        input.className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
        if (value) {
          input.value = value;
        }
      }

      // Add to container
      containerRef.current.appendChild(autocomplete);

      // Listen for place changes
      autocomplete.addEventListener('gmp-placeselect', async (event: any) => {
        const place = await event.place.toJSON();
        
        if (!place.addressComponents) {
          console.log("No address components found");
          return;
        }

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let postalCode = "";

        // Extract address components
        place.addressComponents.forEach((component: any) => {
          const types = component.types;

          if (types.includes("street_number")) {
            streetNumber = component.longName;
          }
          if (types.includes("route")) {
            route = component.longName;
          }
          if (types.includes("locality")) {
            city = component.longName;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.shortName;
          }
          if (types.includes("postal_code")) {
            postalCode = component.longName;
          }
        });

        // Construct the street address
        const streetAddress = streetNumber && route ? `${streetNumber} ${route}` : "";

        // Update the input
        onChange(streetAddress || place.formattedAddress || "");

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
        // Cleanup
        if (elementRef.current && containerRef.current) {
          containerRef.current.removeChild(elementRef.current);
        }
      };
    } catch (error) {
      console.error("Error initializing PlaceAutocompleteElement:", error);
      // Fall back to manual input
    }
  }, [isScriptLoaded, placeholder, onAddressSelect, onChange, value]);

  if (!isMounted) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-10 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async&callback=__googleMapsCallback`}
        strategy="lazyOnload"
        onLoad={() => {
          // Create a global callback
          if (typeof window !== 'undefined') {
            (window as any).__googleMapsCallback = () => {
              console.log("Google Maps script loaded");
              setIsScriptLoaded(true);
            };
            // If already loaded, call it immediately
            if (window.google?.maps) {
              (window as any).__googleMapsCallback();
            }
          }
        }}
      />

      <div className="relative">
        {/* Container for the PlaceAutocompleteElement */}
        <div ref={containerRef} className="w-full">
          {/* Fallback input if PlaceAutocompleteElement fails */}
          {!isScriptLoaded && (
            <>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={`w-full px-10 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </>
  );
}