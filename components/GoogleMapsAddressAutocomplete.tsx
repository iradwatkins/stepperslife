"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, AlertCircle, RefreshCw } from "lucide-react";

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

// Global script loading state
let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Load Google Maps script with retry logic
const loadGoogleMapsScript = (): Promise<void> => {
  if (isScriptLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }
  
  if (scriptLoadPromise && isScriptLoading) {
    return scriptLoadPromise;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("Google Maps API key not configured - autocomplete will be unavailable");
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
          retryCount = 0; // Reset retry count on success
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isScriptLoaded) {
          isScriptLoading = false;
          reject(new Error("Timeout waiting for Google Maps"));
        }
      }, 5000);
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
      retryCount = 0; // Reset retry count on success
      resolve();
    };
    
    script.onerror = () => {
      isScriptLoading = false;
      document.head.removeChild(script); // Remove failed script
      delete (window as any).initGoogleMaps;
      
      console.warn(`Google Maps failed to load (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => {
          scriptLoadPromise = null; // Reset promise for retry
          loadGoogleMapsScript().then(resolve).catch(reject);
        }, RETRY_DELAY);
      } else {
        reject(new Error("Failed to load Google Maps after multiple attempts"));
      }
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
  const [isAutocompleteAvailable, setIsAutocompleteAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Manual mode state
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualPostalCode, setManualPostalCode] = useState("");

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Stable callback for address selection from Google
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

    // Update the input value
    if (inputRef.current) {
      inputRef.current.value = streetAddress;
    }
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
    if (!inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      
      await loadGoogleMapsScript();
      
      if (!window.google?.maps?.places) {
        throw new Error("Google Places API not available");
      }

      // Create autocomplete instance
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

      setIsAutocompleteAvailable(true);
      setIsLoading(false);
      console.log("✅ Google Places Autocomplete initialized successfully");
      
      // Cleanup function
      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error: any) {
      setIsLoading(false);
      
      // Log error but don't disrupt user
      console.warn("Google Maps autocomplete unavailable:", error.message);
      
      // Set specific error message for UI
      if (error.message?.includes("API key")) {
        setApiError("API key issue - autocomplete unavailable");
      } else if (error.message?.includes("multiple attempts")) {
        setApiError("Could not connect to Google Maps");
      } else {
        setApiError("Autocomplete temporarily unavailable");
      }
      
      setIsAutocompleteAvailable(false);
      // Don't force manual mode - let user keep typing
    }
  }, [handlePlaceSelect]);

  // Retry loading Google Maps
  const retryLoadingMaps = useCallback(() => {
    retryCount = 0; // Reset retry count
    scriptLoadPromise = null; // Reset promise
    isScriptLoading = false;
    isScriptLoaded = false;
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    initializeAutocomplete();
  }, [initializeAutocomplete]);

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

  return (
    <div className="space-y-3">
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
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            } ${className}`}
            autoComplete="off"
          />
          
          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : isAutocompleteAvailable ? (
              <MapPin className="w-4 h-4 text-green-500" title="Autocomplete active" />
            ) : (
              <button
                type="button"
                onClick={retryLoadingMaps}
                className="text-yellow-500 hover:text-yellow-600"
                title="Autocomplete unavailable - click to retry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        
        {/* Status messages */}
        {!isLoading && (
          <>
            {isAutocompleteAvailable ? (
              <p className="mt-1 text-xs text-gray-500">
                Start typing to search for an address
              </p>
            ) : (
              <div className="mt-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    {apiError || "Autocomplete unavailable"} - you can still type your address
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline mt-1"
                  >
                    {showManualEntry ? "Hide" : "Add"} city, state, zip manually
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Optional manual entry fields */}
      {showManualEntry && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Enter additional address details:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => handleManualChange('city', e.target.value)}
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={manualState}
                onChange={(e) => handleManualChange('state', e.target.value.toUpperCase())}
                placeholder="ST"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
      )}
    </div>
  );
}