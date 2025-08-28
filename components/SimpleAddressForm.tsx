"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface SimpleAddressFormProps {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  errors?: {
    address?: string;
    city?: string;
    state?: string;
  };
}

// Common US cities for autocomplete
const US_CITIES = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Phoenix", state: "AZ" },
  { city: "Philadelphia", state: "PA" },
  { city: "San Antonio", state: "TX" },
  { city: "San Diego", state: "CA" },
  { city: "Dallas", state: "TX" },
  { city: "Miami", state: "FL" },
  { city: "Atlanta", state: "GA" },
  { city: "Boston", state: "MA" },
  { city: "San Francisco", state: "CA" },
  { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" },
  { city: "Las Vegas", state: "NV" },
  { city: "Portland", state: "OR" },
  { city: "Detroit", state: "MI" },
  { city: "Memphis", state: "TN" },
  { city: "Nashville", state: "TN" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function SimpleAddressForm({
  address,
  city,
  state,
  postalCode,
  onAddressChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  errors = {}
}: SimpleAddressFormProps) {
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState(US_CITIES);

  useEffect(() => {
    if (city.length > 1) {
      const filtered = US_CITIES.filter(c => 
        c.city.toLowerCase().startsWith(city.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 5));
    }
  }, [city]);

  const selectCity = (selectedCity: string, selectedState: string) => {
    onCityChange(selectedCity);
    onStateChange(selectedState);
    setShowCitySuggestions(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123 Main Street"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              onCityChange(e.target.value);
              setShowCitySuggestions(true);
            }}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Miami"
          />
          {showCitySuggestions && filteredCities.length > 0 && city.length > 1 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {filteredCities.map((c, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectCity(c.city, c.state)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {c.city}, {c.state}
                </button>
              ))}
            </div>
          )}
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select...</option>
            {US_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 5) {
                onPostalCodeChange(value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="33139"
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
}