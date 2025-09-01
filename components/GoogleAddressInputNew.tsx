"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

// Declare google maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

export default function GoogleAddressInputNew({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  error,
  required = false
}: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualPostalCode, setManualPostalCode] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize autocomplete when script loads and input is ready
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Google Maps Places API not ready or input not mounted - Switching to manual mode");
      }
      setIsManualMode(true);
      // Trigger onAddressSelect with manual data when switching to manual mode
      if (onAddressSelect) {
        onAddressSelect({
          address: value,
          city: manualCity,
          state: manualState,
          postalCode: manualPostalCode
        });
      }
      return;
    }

    try {
      // Clean up existing autocomplete if any
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Create new autocomplete instance using the standard API
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca'] },
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
      });

      // Store reference
      autocompleteRef.current = autocomplete;

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          console.log("No address details available for this place");
          return;
        }

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let postalCode = "";

        // Parse address components
        place.address_components.forEach((component: any) => {
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
        const streetAddress = streetNumber && route 
          ? `${streetNumber} ${route}` 
          : place.formatted_address?.split(',')[0] || "";

        // Update the input value
        onChange(streetAddress);

        // Notify parent component with parsed components
        if (onAddressSelect) {
          onAddressSelect({
            address: streetAddress,
            city,
            state,
            postalCode
          });
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log("Google Places Autocomplete initialized successfully");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error initializing Google Places Autocomplete:", error);
      }
      setIsManualMode(true);
      // Trigger onAddressSelect with manual data when initialization fails
      if (onAddressSelect) {
        onAddressSelect({
          address: value,
          city: manualCity,
          state: manualState,
          postalCode: manualPostalCode
        });
      }
    }
  }, [onChange, onAddressSelect, value, manualCity, manualState, manualPostalCode]);

  // Handle manual input changes
  const handleManualChange = useCallback((field: 'city' | 'state' | 'postalCode', newValue: string) => {
    const updatedData = {
      city: field === 'city' ? newValue : manualCity,
      state: field === 'state' ? newValue : manualState,
      postalCode: field === 'postalCode' ? newValue : manualPostalCode
    };
    
    // Update local state
    if (field === 'city') setManualCity(newValue);
    if (field === 'state') setManualState(newValue);
    if (field === 'postalCode') setManualPostalCode(newValue);
    
    // Trigger callback with updated data
    if (onAddressSelect) {
      onAddressSelect({
        address: value,
        ...updatedData
      });
    }
  }, [value, manualCity, manualState, manualPostalCode, onAddressSelect]);

  // Initialize when script loads
  useEffect(() => {
    if (isScriptLoaded && isMounted && !isManualMode) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeAutocomplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded, isMounted, initializeAutocomplete, isManualMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Handle script load
  const handleScriptLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Google Maps script loaded");
    }
    setIsScriptLoaded(true);
  };

  // Handle script error
  const handleScriptError = (e: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error loading Google Maps script:", e);
    }
    setIsManualMode(true);
    // Ensure we trigger the callback for manual mode
    if (onAddressSelect) {
      onAddressSelect({
        address: value,
        city: manualCity,
        state: manualState,
        postalCode: manualPostalCode
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Load Google Maps Script */}
      {!isScriptLoaded && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="lazyOnload"
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-4 h-4 mr-1" />
          Street Address {required && "*"}
          {isManualMode && (
            <span className="text-xs text-gray-500 ml-2">
              (Manual entry - autocomplete unavailable)
            </span>
          )}
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          
          {/* Loading indicator */}
          {!isScriptLoaded && !isManualMode && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {/* Help text */}
        {!isManualMode && isScriptLoaded && (
          <p className="mt-1 text-xs text-gray-500">
            Start typing to search for an address
          </p>
        )}
        
        {/* Manual input fields when in manual mode */}
        {isManualMode && (
          <div className="mt-4 space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              📍 Please enter location details manually
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => handleManualChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required={required}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={manualState}
                  onChange={(e) => handleManualChange('state', e.target.value)}
                  placeholder="State/Province"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required={required}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  value={manualPostalCode}
                  onChange={(e) => handleManualChange('postalCode', e.target.value)}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}