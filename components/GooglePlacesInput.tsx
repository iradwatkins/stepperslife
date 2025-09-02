"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface GooglePlacesInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

// Track script loading globally
let isScriptLoading = false;
let isScriptLoaded = false;

const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isScriptLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (isScriptLoading) {
      const checkInterval = setInterval(() => {
        if (isScriptLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          isScriptLoaded = true;
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isScriptLoaded) {
          reject(new Error("Timeout waiting for Google Maps"));
        }
      }, 5000);
      return;
    }

    // Load new script
    isScriptLoading = true;
    const script = document.createElement("script");
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      isScriptLoading = false;
      reject(new Error("No API key"));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;

    (window as any).initGooglePlaces = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      delete (window as any).initGooglePlaces;
      resolve();
    };

    script.onerror = () => {
      isScriptLoading = false;
      script.remove();
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });
};

export default function GooglePlacesInput({
  value = "",
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address or place...",
  error,
  required = false
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (!mounted || !inputRef.current) return;

        // Create autocomplete instance
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'], // Search addresses and places
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
        });

        // Store reference
        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
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

          // Parse address components
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

          // Build address
          const address = streetNumber && route 
            ? `${streetNumber} ${route}`
            : place.name || place.formatted_address || "";

          // Update input value
          if (inputRef.current) {
            inputRef.current.value = address;
          }

          // Notify parent
          if (onChange) {
            onChange(address);
          }

          if (onAddressSelect) {
            onAddressSelect({
              address,
              city,
              state,
              postalCode,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng()
            });
          }
        });

        setIsReady(true);
        console.log("✅ Google Places Autocomplete initialized");
      } catch (error) {
        console.error("Failed to initialize Google Places:", error);
        setIsReady(false);
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onChange, onAddressSelect]);

  // Manual fields for fallback
  const [showManual, setShowManual] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualZip, setManualZip] = useState("");

  const handleManualSave = () => {
    if (onAddressSelect) {
      onAddressSelect({
        address: inputRef.current?.value || "",
        city: manualCity,
        state: manualState,
        postalCode: manualZip
      });
    }
    setShowManual(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-4 h-4 mr-1" />
          Address {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            defaultValue={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <MapPin className={`w-4 h-4 ${isReady ? "text-green-500" : "text-gray-400"}`} />
          </div>
        </div>
        
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        
        <p className="mt-1 text-xs text-gray-500">
          {isReady 
            ? "Type an address, business name, or landmark" 
            : "Loading address search..."}
        </p>
      </div>

      {/* Manual entry option */}
      {!showManual ? (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Can't find your address? Enter city/state/zip manually
        </button>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Complete address details:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={manualState}
                onChange={(e) => setManualState(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="FL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input
                type="text"
                value={manualZip}
                onChange={(e) => setManualZip(e.target.value.replace(/\D/g, ''))}
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Save details
            </button>
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}