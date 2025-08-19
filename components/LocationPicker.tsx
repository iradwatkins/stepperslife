"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Search } from "lucide-react";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

interface LocationData {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  required?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060, // New York City default
};

export default function LocationPicker({ value, onChange, required = false }: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [locationData, setLocationData] = useState<LocationData>(value || {
    address: "",
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (map && !value?.latitude) {
            map.setCenter(pos);
          }
        },
        () => {
          console.log("Location access denied");
        }
      );
    }
  }, [map, value]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // If we have existing coordinates, center on them
    if (value?.latitude && value?.longitude) {
      const position = { lat: value.latitude, lng: value.longitude };
      map.setCenter(position);
      
      // Add marker for existing location
      const newMarker = new google.maps.Marker({
        position,
        map,
        draggable: true,
      });
      
      setMarker(newMarker);
      
      // Listen for marker drag
      newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition();
        if (position) {
          geocodePosition(position.lat(), position.lng());
        }
      });
    }
  }, [value]);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Extract address components
        const addressComponents = place.address_components || [];
        let city = "";
        let state = "";
        let country = "";
        let postalCode = "";
        
        addressComponents.forEach((component) => {
          const types = component.types;
          if (types.includes("locality")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
          if (types.includes("country")) {
            country = component.long_name;
          }
          if (types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });
        
        const newLocationData: LocationData = {
          address: place.formatted_address || "",
          city,
          state,
          country,
          postalCode,
          latitude: lat,
          longitude: lng,
        };
        
        setLocationData(newLocationData);
        onChange(newLocationData);
        
        // Update map
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
          
          // Update or create marker
          if (marker) {
            marker.setPosition({ lat, lng });
          } else {
            const newMarker = new google.maps.Marker({
              position: { lat, lng },
              map,
              draggable: true,
            });
            
            setMarker(newMarker);
            
            // Listen for marker drag
            newMarker.addListener("dragend", () => {
              const position = newMarker.getPosition();
              if (position) {
                geocodePosition(position.lat(), position.lng());
              }
            });
          }
        }
      }
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Update or create marker
      if (marker) {
        marker.setPosition(e.latLng);
      } else if (map) {
        const newMarker = new google.maps.Marker({
          position: e.latLng,
          map,
          draggable: true,
        });
        
        setMarker(newMarker);
        
        // Listen for marker drag
        newMarker.addListener("dragend", () => {
          const position = newMarker.getPosition();
          if (position) {
            geocodePosition(position.lat(), position.lng());
          }
        });
      }
      
      // Reverse geocode to get address
      geocodePosition(lat, lng);
    }
  }, [map, marker]);

  const geocodePosition = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const place = results[0];
          const addressComponents = place.address_components || [];
          
          let city = "";
          let state = "";
          let country = "";
          let postalCode = "";
          
          addressComponents.forEach((component) => {
            const types = component.types;
            if (types.includes("locality")) {
              city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              state = component.short_name;
            }
            if (types.includes("country")) {
              country = component.long_name;
            }
            if (types.includes("postal_code")) {
              postalCode = component.long_name;
            }
          });
          
          const newLocationData: LocationData = {
            address: place.formatted_address,
            city,
            state,
            country,
            postalCode,
            latitude: lat,
            longitude: lng,
          };
          
          setLocationData(newLocationData);
          onChange(newLocationData);
          
          // Update the search input
          if (searchInputRef.current) {
            searchInputRef.current.value = place.formatted_address;
          }
        }
      }
    );
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
            
            // Update or create marker
            if (marker) {
              marker.setPosition({ lat, lng });
            } else {
              const newMarker = new google.maps.Marker({
                position: { lat, lng },
                map,
                draggable: true,
              });
              
              setMarker(newMarker);
              
              // Listen for marker drag
              newMarker.addListener("dragend", () => {
                const position = newMarker.getPosition();
                if (position) {
                  geocodePosition(position.lat(), position.lng());
                }
              });
            }
            
            // Reverse geocode to get address
            geocodePosition(lat, lng);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please search for an address or click on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="location">
            Event Location {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex gap-2 mt-2">
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              className="flex-1"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  id="location"
                  placeholder="Search for a location..."
                  defaultValue={locationData.address}
                  className="pl-10"
                  required={required}
                />
              </div>
            </Autocomplete>
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              title="Use my current location"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Search for an address or click on the map to set the location
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={
                locationData.latitude && locationData.longitude
                  ? { lat: locationData.latitude, lng: locationData.longitude }
                  : userLocation || defaultCenter
              }
              zoom={locationData.latitude ? 15 : 12}
              onClick={onMapClick}
              onLoad={onLoad}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
              }}
            />
          </CardContent>
        </Card>

        {locationData.latitude && locationData.longitude && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-xs text-gray-600">City</Label>
              <p className="font-medium">{locationData.city || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">State</Label>
              <p className="font-medium">{locationData.state || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Country</Label>
              <p className="font-medium">{locationData.country || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Postal Code</Label>
              <p className="font-medium">{locationData.postalCode || "—"}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-gray-600">Coordinates</Label>
              <p className="font-medium text-sm">
                {locationData.latitude?.toFixed(6)}, {locationData.longitude?.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}