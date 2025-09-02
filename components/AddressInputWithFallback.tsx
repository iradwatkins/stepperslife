"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface AddressInputWithFallbackProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// US States for dropdown
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
];

// Global state for Google Maps
let googleMapsState: 'idle' | 'loading' | 'loaded' | 'failed' = 'idle';
let googleMapsPromise: Promise<void> | null = null;

export default function AddressInputWithFallback({
  value = "",
  onChange,
  onAddressSelect,
  placeholder = "Enter street address",
  error,
  required = false,
  className = ""
}: AddressInputWithFallbackProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Component state
  const [mode, setMode] = useState<'auto' | 'manual'>('manual');
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [address, setAddress] = useState(value);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Check if Google Maps can be loaded
  const checkGoogleMapsAvailability = useCallback(async () => {
    // Skip if already checked
    if (googleMapsState === 'loaded') {
      setApiStatus('available');
      setMode('auto');
      return true;
    }
    
    if (googleMapsState === 'failed') {
      setApiStatus('unavailable');
      setMode('manual');
      return false;
    }

    // Skip if already loading
    if (googleMapsState === 'loading' && googleMapsPromise) {
      try {
        await googleMapsPromise;
        setApiStatus('available');
        setMode('auto');
        return true;
      } catch {
        setApiStatus('unavailable');
        setMode('manual');
        return false;
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.log("No Google Maps API key configured - using manual entry");
      googleMapsState = 'failed';
      setApiStatus('unavailable');
      setMode('manual');
      return false;
    }

    // Try to load Google Maps
    googleMapsState = 'loading';
    googleMapsPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps?.places) {
        googleMapsState = 'loaded';
        resolve();
        return;
      }

      // Check for existing script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for it to load (max 3 seconds)
        let checkCount = 0;
        const checkInterval = setInterval(() => {
          checkCount++;
          if (window.google?.maps?.places) {
            clearInterval(checkInterval);
            googleMapsState = 'loaded';
            resolve();
          } else if (checkCount > 30) { // 3 seconds
            clearInterval(checkInterval);
            googleMapsState = 'failed';
            reject(new Error("Timeout waiting for Google Maps"));
          }
        }, 100);
        return;
      }

      // Load new script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMaps`;
      script.async = true;
      
      (window as any).initMaps = () => {
        googleMapsState = 'loaded';
        resolve();
      };
      
      script.onerror = () => {
        googleMapsState = 'failed';
        reject(new Error("Failed to load Google Maps"));
      };
      
      document.head.appendChild(script);
    });

    try {
      await googleMapsPromise;
      setApiStatus('available');
      setMode('auto');
      return true;
    } catch (error) {
      console.log("Google Maps unavailable - using manual entry:", error);
      setApiStatus('unavailable');
      setMode('manual');
      return false;
    }
  }, []);

  // Initialize autocomplete
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocompleteRef.current || mode !== 'auto') {
      return;
    }

    const available = await checkGoogleMapsAvailability();
    if (!available) {
      return;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        let streetNumber = "";
        let route = "";
        let locality = "";
        let administrativeArea = "";
        let postalCode = "";

        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number")) streetNumber = component.long_name;
          if (types.includes("route")) route = component.long_name;
          if (types.includes("locality")) locality = component.long_name;
          if (types.includes("administrative_area_level_1")) administrativeArea = component.short_name;
          if (types.includes("postal_code")) postalCode = component.long_name;
        });

        const fullAddress = streetNumber && route ? `${streetNumber} ${route}` : "";
        
        setAddress(fullAddress);
        setCity(locality);
        setState(administrativeArea);
        setPostalCode(postalCode);
        setIsValid(true);

        if (onChange) onChange(fullAddress);
        if (onAddressSelect) {
          onAddressSelect({
            address: fullAddress,
            city: locality,
            state: administrativeArea,
            postalCode: postalCode,
            latitude: place.geometry?.location?.lat(),
            longitude: place.geometry?.location?.lng()
          });
        }
      });

      console.log("✅ Autocomplete initialized");
    } catch (error) {
      console.log("Could not initialize autocomplete:", error);
      setMode('manual');
    }
  }, [mode, checkGoogleMapsAvailability, onChange, onAddressSelect]);

  // Check API on mount
  useEffect(() => {
    checkGoogleMapsAvailability();
  }, [checkGoogleMapsAvailability]);

  // Initialize autocomplete when mode changes to auto
  useEffect(() => {
    if (mode === 'auto') {
      initializeAutocomplete();
    }
  }, [mode, initializeAutocomplete]);

  // Validate manual entry
  useEffect(() => {
    if (mode === 'manual') {
      const hasAddress = address.trim().length > 0;
      const hasCity = city.trim().length > 0;
      const hasState = state.trim().length > 0;
      const hasZip = postalCode.trim().length >= 5;
      
      setIsValid(hasAddress && hasCity && hasState && hasZip);
      
      if (hasAddress && onAddressSelect) {
        onAddressSelect({
          address,
          city,
          state,
          postalCode
        });
      }
    }
  }, [address, city, state, postalCode, mode, onAddressSelect]);

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Address Entry</span>
        </div>
        <div className="flex items-center gap-2">
          {apiStatus === 'checking' ? (
            <span className="text-xs text-gray-500">Checking...</span>
          ) : apiStatus === 'available' ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Autocomplete Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-yellow-600">Manual Entry Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Address input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder={mode === 'auto' ? "Start typing to search..." : placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Manual entry fields (always visible in manual mode, optional in auto mode) */}
      {(mode === 'manual' || (mode === 'auto' && address && !isValid)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select state</option>
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="12345"
              required={required}
              pattern="[0-9]{5}(-[0-9]{4})?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Validation status */}
      {mode === 'manual' && (
        <div className="flex items-center gap-2 text-sm">
          {isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Address complete</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Please fill in all required fields</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}