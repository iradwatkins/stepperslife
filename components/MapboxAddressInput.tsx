"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X } from "lucide-react";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface MapboxAddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

// Mapbox Geocoding API endpoint
const MAPBOX_GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiaXJhd2F0a2lucyIsImEiOiJjbWYyeGt1dzIwNXd1MnFvaHRrN2QwdnJ1In0.buWgnlsdSanIFCXU_-HGeA";

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  properties: {
    address?: string;
    category?: string;
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export default function MapboxAddressInput({
  value = "",
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  error,
  required = false
}: MapboxAddressInputProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry state
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualZip, setManualZip] = useState("");
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);

  // Perform search using Mapbox Geocoding API
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }

    setIsLoading(true);
    abortController.current = new AbortController();
    
    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        autocomplete: "true",
        limit: "5",
        country: "US", // Limit to US addresses
        types: "address,poi" // Search for addresses and points of interest
      });

      const response = await fetch(
        `${MAPBOX_GEOCODING_API}/${encodeURIComponent(query)}.json?${params}`,
        { signal: abortController.current.signal }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Mapbox search error:", error);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search (500ms delay)
    searchTimeout.current = setTimeout(() => {
      performSearch(newValue);
    }, 500);
  };

  // Parse Mapbox result into address components
  const parseMapboxResult = (feature: MapboxFeature): AddressComponents => {
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let postalCode = "";

    // Extract street address from properties
    if (feature.properties?.address) {
      const addressParts = feature.properties.address.split(" ");
      if (addressParts.length > 0 && /^\d+/.test(addressParts[0])) {
        streetNumber = addressParts[0];
        streetName = addressParts.slice(1).join(" ");
      } else {
        streetName = feature.properties.address;
      }
    }

    // Parse context for city, state, zip
    if (feature.context) {
      feature.context.forEach((ctx) => {
        if (ctx.id.startsWith("place")) {
          city = ctx.text;
        } else if (ctx.id.startsWith("region")) {
          state = ctx.short_code?.replace("US-", "") || ctx.text;
        } else if (ctx.id.startsWith("postcode")) {
          postalCode = ctx.text;
        }
      });
    }

    // Build full address
    const address = streetNumber && streetName 
      ? `${streetNumber} ${streetName}`
      : feature.text;

    return {
      address,
      city,
      state,
      postalCode,
      latitude: feature.center[1],
      longitude: feature.center[0]
    };
  };

  // Select a suggestion
  const selectSuggestion = (feature: MapboxFeature) => {
    setShowSuggestions(false);
    setSearchQuery(feature.place_name);
    
    if (onChange) {
      onChange(feature.place_name);
    }

    const components = parseMapboxResult(feature);
    if (onAddressSelect) {
      onAddressSelect(components);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle manual entry submission
  const handleManualSubmit = () => {
    const fullAddress = `${searchQuery}, ${manualCity}, ${manualState} ${manualZip}`;
    
    if (onChange) {
      onChange(fullAddress);
    }
    
    if (onAddressSelect) {
      onAddressSelect({
        address: searchQuery,
        city: manualCity,
        state: manualState,
        postalCode: manualZip
      });
    }
    
    setShowManualEntry(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-4 h-4 mr-1" />
          Address {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          
          {/* Search/Loading indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  if (onChange) onChange("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 ${
                  selectedIndex === index ? 'bg-gray-50' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.place_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Help text */}
        <p className="mt-1 text-xs text-gray-500">
          Powered by Mapbox • Type an address, business name, or landmark
        </p>
      </div>
      
      {/* Manual entry option */}
      {!showManualEntry ? (
        <button
          type="button"
          onClick={() => setShowManualEntry(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Can't find your address? Enter city/state/zip manually
        </button>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Complete the address details:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Miami"
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
                placeholder="33101"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleManualSubmit}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Save details
            </button>
            <button
              type="button"
              onClick={() => setShowManualEntry(false)}
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