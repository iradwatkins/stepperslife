"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, AlertCircle } from "lucide-react";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleMapsAddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// Global script loading state to prevent multiple loads
let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

// Load Google Maps script once globally
const loadGoogleMapsScript = (): Promise<void> => {
  if (isScriptLoaded) {
    return Promise.resolve();
  }
  
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error("Google Maps API key not configured");
    return Promise.reject(new Error("API key missing"));
  }

  isScriptLoading = true;
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          isScriptLoaded = true;
          isScriptLoading = false;
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isScriptLoaded) {
          reject(new Error("Timeout waiting for Google Maps"));
        }
      }, 10000);
      return;
    }

    // Create new script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Define callback
    (window as any).initGoogleMaps = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isScriptLoading = false;
      console.error("Failed to load Google Maps script");
      reject(new Error("Failed to load Google Maps"));
    };
    
    document.head.appendChild(script);
  });
  
  return scriptLoadPromise;
};

export default function GoogleMapsAddressAutocomplete({
  value = "",
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  error,
  required = false,
  className = ""
}: GoogleMapsAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [internalValue, setInternalValue] = useState(value);
  
  // Manual mode state
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualPostalCode, setManualPostalCode] = useState("");

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Stable callback for address selection
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
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

    // Construct the street address
    const streetAddress = streetNumber && route 
      ? `${streetNumber} ${route}` 
      : place.formatted_address?.split(',')[0] || "";

    // Extract coordinates if available
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (place.geometry?.location) {
      latitude = place.geometry.location.lat();
      longitude = place.geometry.location.lng();
    }

    // Update internal value and notify parent
    setInternalValue(streetAddress);
    
    if (onChange) {
      onChange(streetAddress);
    }

    if (onAddressSelect) {
      onAddressSelect({
        address: streetAddress,
        city,
        state,
        postalCode,
        latitude,
        longitude
      });
    }
  }, [onChange, onAddressSelect]);

  // Initialize autocomplete
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || isInitialized) {
      return;
    }

    try {
      await loadGoogleMapsScript();
      
      if (!window.google?.maps?.places) {
        throw new Error("Google Places API not available");
      }

      // Clean up existing instance
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }

      // Create new autocomplete with uncontrolled input
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca'] },
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      // Store reference
      autocompleteRef.current = autocomplete;

      // Add place changed listener
      const listener = google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (place) {
          handlePlaceSelect(place);
        }
      });

      setIsInitialized(true);
      setLoading(false);
      
      console.log("✅ Google Places Autocomplete initialized successfully");
      
      // Cleanup function
      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error: any) {
      console.error("Failed to initialize Google Maps:", error);
      
      // Check for specific errors
      if (error.message?.includes("InvalidKeyMapError") || 
          error.message?.includes("API key")) {
        console.error("🔴 API Key Error - Switching to manual mode");
        console.error("Current domain:", window.location.hostname);
        console.error("Please check Google Cloud Console for proper API key configuration");
      }
      
      setIsManualMode(true);
      setLoading(false);
    }
  }, [isInitialized, handlePlaceSelect]);

  // Initialize on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeAutocomplete();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup autocomplete on unmount
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initializeAutocomplete]);

  // Handle manual mode changes
  const handleManualChange = useCallback((field: 'city' | 'state' | 'postalCode', value: string) => {
    const updates = {
      city: field === 'city' ? value : manualCity,
      state: field === 'state' ? value : manualState,
      postalCode: field === 'postalCode' ? value : manualPostalCode
    };
    
    // Update local state
    if (field === 'city') setManualCity(value);
    if (field === 'state') setManualState(value);
    if (field === 'postalCode') setManualPostalCode(value);
    
    // Notify parent
    if (onAddressSelect) {
      onAddressSelect({
        address: internalValue,
        ...updates
      });
    }
  }, [internalValue, manualCity, manualState, manualPostalCode, onAddressSelect]);

  // Manual mode UI
  if (isManualMode) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            Street Address {required && "*"}
          </label>
          <input
            type="text"
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              if (onChange) onChange(e.target.value);
            }}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${className}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />
            <p className="text-sm text-yellow-800">
              Google Maps unavailable. Please enter address details manually.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City {required && "*"}
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
                State {required && "*"}
              </label>
              <input
                type="text"
                value={manualState}
                onChange={(e) => handleManualChange('state', e.target.value.toUpperCase())}
                placeholder="ST"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required={required}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={manualPostalCode}
                onChange={(e) => handleManualChange('postalCode', e.target.value)}
                placeholder="12345"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Autocomplete mode UI
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <MapPin className="inline w-4 h-4 mr-1" />
        Street Address {required && "*"}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          // Let Google control the input
          autoComplete="off"
        />
        
        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {!loading && isInitialized && (
        <p className="mt-1 text-xs text-gray-500">
          Start typing to search for an address
        </p>
      )}
    </div>
  );
}