"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X } from "lucide-react";
import Script from "next/script";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface SimpleGoogleAddressSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function SimpleGoogleAddressSearch({
  value = "",
  onChange,
  onAddressSelect,
  placeholder = "Enter address or location name...",
  error,
  required = false
}: SimpleGoogleAddressSearchProps) {
  // State
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  // Manual entry state
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualZip, setManualZip] = useState("");
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Google services when script loads
  useEffect(() => {
    if (scriptLoaded && window.google?.maps?.places) {
      try {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
        console.log("✅ Google Places services initialized");
      } catch (error) {
        console.error("Failed to initialize Google Places:", error);
        setManualMode(true);
      }
    }
  }, [scriptLoaded]);

  // Debounced search function
  const performSearch = useCallback((query: string) => {
    if (!query || query.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Search for both addresses and places
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'us' },
        types: [] // Empty array searches all types (addresses, establishments, etc.)
      },
      (predictions, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          console.log("No predictions found for:", query);
        }
      }
    );
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

    // Set new timeout for search (wait 500ms after user stops typing)
    searchTimeout.current = setTimeout(() => {
      performSearch(newValue);
    }, 500);
  };

  // Select a suggestion
  const selectSuggestion = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) {
      console.error("Places service not initialized");
      return;
    }

    setShowSuggestions(false);
    setSearchQuery(prediction.description);
    
    if (onChange) {
      onChange(prediction.description);
    }

    // Get place details
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'geometry', 'formatted_address', 'name']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          parseAndSetAddress(place);
        } else {
          console.error("Failed to get place details:", status);
        }
      }
    );
  };

  // Parse place details into address components
  const parseAndSetAddress = (place: google.maps.places.PlaceResult) => {
    let streetNumber = "";
    let route = "";
    let city = "";
    let state = "";
    let postalCode = "";

    if (place.address_components) {
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
    }

    // For places (not addresses), use the name as the address
    const address = streetNumber && route 
      ? `${streetNumber} ${route}`
      : place.name || place.formatted_address || "";

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

  // Handle manual entry
  const handleManualSubmit = () => {
    if (onAddressSelect) {
      onAddressSelect({
        address: searchQuery,
        city: manualCity,
        state: manualState,
        postalCode: manualZip
      });
    }
    setManualMode(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Google Maps script loaded");
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Google Maps:", e);
          setManualMode(true);
        }}
      />
      
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
                  key={suggestion.place_id}
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
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-gray-500">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Help text */}
          <p className="mt-1 text-xs text-gray-500">
            Type an address, business name, or landmark
          </p>
        </div>
        
        {/* Manual entry toggle */}
        {!scriptLoaded || manualMode ? (
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
            <button
              type="button"
              onClick={handleManualSubmit}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Save address details
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Can't find your address? Enter manually
          </button>
        )}
      </div>
    </>
  );
}