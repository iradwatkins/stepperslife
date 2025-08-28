"use client";

import { useRef, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

declare global {
  interface Window {
    google: any;
    initAutocomplete?: () => void;
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressComponents: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  }) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "123 Main Street",
  className = "",
  error,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const autocompleteRef = useRef<any>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
      setIsLoaded(true);
      return;
    }

    // Get the API key - fallback to the one from CLAUDE.md if env var is not available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE";
    if (!apiKey) {
      console.error("Google Maps API key is missing");
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        initAutocomplete();
        setIsLoaded(true);
      });
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;

    window.initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        setIsLoaded(true);
      } else {
        console.error("Google Maps loaded but places library is missing");
        setLoadError(true);
      }
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script - API key may be invalid");
      setLoadError(true);
      setIsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      if (window.initAutocomplete) {
        delete window.initAutocomplete;
      }
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: ["us", "ca"] }, // Restrict to US and Canada
    });

    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.address_components) return;

      let streetNumber = "";
      let route = "";
      let city = "";
      let state = "";
      let postalCode = "";

      // Parse address components
      for (const component of place.address_components) {
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
      }

      // Construct the street address
      const address = streetNumber && route ? `${streetNumber} ${route}` : place.formatted_address;

      // Update the input value
      onChange(address);

      // Call the callback with all address components
      if (onAddressSelect) {
        onAddressSelect({
          address,
          city,
          state,
          postalCode,
        });
      }
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        placeholder={placeholder}
      />
      {isMounted && isLoaded && !loadError && (
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {loadError && isMounted && (
        <p className="text-amber-600 text-xs mt-1">
          Address autocomplete unavailable - enter address manually
        </p>
      )}
    </div>
  );
}