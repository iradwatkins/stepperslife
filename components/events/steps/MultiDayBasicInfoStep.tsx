"use client";

import { useState } from "react";
import { Calendar, MapPin, Tag, Upload, X, Image as ImageIcon } from "lucide-react";
import type { MultiDayEventData } from "../MultiDayEventFlow";

interface MultiDayBasicInfoStepProps {
  data: MultiDayEventData;
  onChange: (data: MultiDayEventData) => void;
  onNext: () => void;
  onCancel: () => void;
}

const EVENT_CATEGORIES = [
  { id: "workshop", label: "Workshop", icon: "🎓" },
  { id: "sets", label: "Sets/Performance", icon: "🎭" },
  { id: "in_the_park", label: "In The Park", icon: "🌳" },
  { id: "trip", label: "Trip/Travel", icon: "✈️" },
  { id: "cruise", label: "Cruise", icon: "🚢" },
  { id: "holiday", label: "Holiday Event", icon: "🎉" },
  { id: "competition", label: "Competition", icon: "🏆" },
  { id: "class", label: "Class/Lesson", icon: "📚" },
  { id: "social_dance", label: "Social Dance", icon: "💃" },
  { id: "lounge_bar", label: "Lounge/Bar", icon: "🍸" },
  { id: "party", label: "Party", icon: "🎊" },
  { id: "other", label: "Other", icon: "📌" },
];

export default function MultiDayBasicInfoStep({
  data,
  onChange,
  onNext,
  onCancel,
}: MultiDayBasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MultiDayEventData, value: any) => {
    onChange({ ...data, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = data.categories.includes(categoryId)
      ? data.categories.filter(c => c !== categoryId)
      : [...data.categories, categoryId];
    
    // Max 5 categories
    if (newCategories.length <= 5) {
      handleChange("categories", newCategories);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.name.trim()) newErrors.name = "Event name is required";
    if (!data.description.trim()) newErrors.description = "Description is required";
    if (!data.startDate) newErrors.startDate = "Start date is required";
    if (!data.endDate) newErrors.endDate = "End date is required";
    
    // Validate date range
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after start date";
      }
      
      // Max 30 days
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        newErrors.endDate = "Events cannot span more than 30 days";
      }
    }
    
    if (data.categories.length === 0) newErrors.categories = "Select at least one category";
    
    // If same location, validate location fields
    if (data.sameLocation) {
      if (!data.location?.trim()) newErrors.location = "Venue name is required";
      if (!data.address?.trim()) newErrors.address = "Address is required";
      if (!data.city?.trim()) newErrors.city = "City is required";
      if (!data.state?.trim()) newErrors.state = "State is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  // Calculate number of days
  const calculateDays = () => {
    if (!data.startDate || !data.endDate) return 0;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Multi-Day Event Details</h2>
        <p className="text-gray-600">Basic information about your multi-day event</p>
      </div>

      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Summer Dance Festival 2025"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Join us for 3 days of workshops, competitions, and social dancing..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Event Images */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Event Images
        </h3>
        
        {/* Main Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Event Image
          </label>
          <div className="relative">
            {data.mainImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={data.mainImage} 
                  alt="Main event" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleChange("mainImage", "")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <Upload className="w-10 h-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload main image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // For now, we'll use a placeholder URL
                      // In production, this would upload to a server
                      handleChange("mainImage", URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images (Optional, max 5)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {data.galleryImages?.map((image, index) => (
              <div key={index} className="relative h-32">
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    const newGallery = [...(data.galleryImages || [])];
                    newGallery.splice(index, 1);
                    handleChange("galleryImages", newGallery);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {(!data.galleryImages || data.galleryImages.length < 5) && (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-xs text-gray-600 mt-1">Add image</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const newGallery = [...(data.galleryImages || [])];
                      newGallery.push(URL.createObjectURL(file));
                      handleChange("galleryImages", newGallery);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Tag className="inline w-4 h-4 mr-1" />
          Event Categories * (Select up to 5)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                data.categories.includes(category.id)
                  ? "bg-blue-50 border-blue-500"
                  : "border-gray-300 hover:bg-gray-50"
              } ${
                !data.categories.includes(category.id) && data.categories.length >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={data.categories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                disabled={!data.categories.includes(category.id) && data.categories.length >= 5}
                className="sr-only"
              />
              <span className="mr-2">{category.icon}</span>
              <span className="text-sm">{category.label}</span>
            </label>
          ))}
        </div>
        {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Event Dates
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={data.startDate || ""}
              onChange={(e) => handleChange("startDate", e.target.value)}
              min={minDate}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={data.endDate || ""}
              onChange={(e) => handleChange("endDate", e.target.value)}
              min={data.startDate || minDate}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
        
        {data.startDate && data.endDate && (
          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            📅 This will be a {calculateDays()}-day event
          </p>
        )}
      </div>

      {/* Location Options */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Event Location
        </h3>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.sameLocation}
            onChange={(e) => handleChange("sameLocation", e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium">Same location for all days</span>
        </label>
        
        {data.sameLocation && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                value={data.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Miami Convention Center"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={data.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="1901 Convention Center Dr"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={data.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Miami Beach"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={data.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="FL"
                  maxLength={2}
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={data.postalCode || ""}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="33139"
                />
              </div>
            </div>
          </div>
        )}
        
        {!data.sameLocation && (
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
            📍 You'll set up locations for each day in the next steps
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next: Ticketing
        </button>
      </div>
    </div>
  );
}