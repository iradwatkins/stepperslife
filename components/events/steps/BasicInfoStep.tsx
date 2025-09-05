"use client";

import { useState, useRef } from "react";
import { Calendar, MapPin, Clock, Tag, Upload, X, Image as ImageIcon } from "lucide-react";
import { SimpleDateTimePicker } from "@/components/ui/simple-date-time-picker";
import { Calendar as CalendarIcon, Info } from "lucide-react";
import type { EventData } from "../SingleEventFlow";
import SimpleAddressInput from "@/components/SimpleAddressInput";
import ImageUploadField from "@/components/ImageUploadField";

interface BasicInfoStepProps {
  data: EventData;
  onChange: (data: EventData) => void;
  onNext: () => void;
  onCancel: () => void;
  isSaveTheDate?: boolean;
}

const EVENT_CATEGORIES = [
  { id: "workshop", label: "Workshop", icon: "🎓" },
  { id: "sets", label: "Sets", icon: "🎭" },
  { id: "in_the_park", label: "In The Park", icon: "🌳" },
  { id: "trip", label: "Trip/Travel", icon: "✈️" },
  { id: "cruise", label: "Cruise", icon: "🚢" },
  { id: "holiday", label: "Holiday Event", icon: "🎉" },
  { id: "competition", label: "Competition", icon: "🏆" },
  { id: "class", label: "Class/Lesson", icon: "📚" },
  { id: "social_dance", label: "Social Dance", icon: "💃" },
  { id: "lounge_bar", label: "Lounge/Bar", icon: "🍸" },
  { id: "other", label: "Other/Party", icon: "🎊" },
];

export default function BasicInfoStep({
  data,
  onChange,
  onNext,
  onCancel,
  isSaveTheDate = false,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleChange = (field: keyof EventData, value: any) => {
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
    
    // Only validate location fields if not a Save the Date event
    if (!isSaveTheDate) {
      if (!data.location.trim()) newErrors.location = "Venue name is required";
      if (!data.address.trim()) newErrors.address = "Address is required";
      if (!data.city.trim()) newErrors.city = "City is required";
      if (!data.state.trim()) newErrors.state = "State is required";
    }
    
    if (!data.eventDate) newErrors.eventDate = "Event date is required";
    if (!data.eventTime) newErrors.eventTime = "Start time is required";
    if (data.categories.length === 0) newErrors.categories = "Select at least one category";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    if (validate()) {
      onNext();
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Set default date to today if not set
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Event Details</h2>
        <p className="text-gray-600">Basic information about your event</p>
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
          className={`w-full px-4 py-3 md:px-3 md:py-2 text-base md:text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Summer Dance Festival"
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
          className={`w-full px-4 py-3 md:px-3 md:py-2 text-base md:text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Join us for an amazing evening of dance, music, and fun..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Tag className="inline w-4 h-4 mr-1" />
          Event Categories * (Select up to 5)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EVENT_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
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

      {/* Event Images */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Event Images (Optional)
        </h3>
        
        <p className="text-sm text-gray-600">
          Add images to make your event more attractive. You can skip this step and add images later.
        </p>
        
        {/* Main Image Upload */}
        <ImageUploadField
          value={data.mainImage}
          onChange={(url) => {
            handleChange("mainImage", url || "");
          }}
          label="Main Event Image (Optional)"
        />

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
                      // Use placeholder images for demo
                      const placeholderImages = [
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
                        "https://images.unsplash.com/photo-1468234847176-28606331216a?w=800",
                        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
                        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"
                      ];
                      newGallery.push(placeholderImages[newGallery.length % placeholderImages.length]);
                      handleChange("galleryImages", newGallery);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4" suppressHydrationWarning>
        {isSaveTheDate ? (
          <>
            <h3 className="font-semibold text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Event Location
            </h3>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Save the Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Location details will be announced later.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
          {/* Venue Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="The Grand Ballroom"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Simple Address Fields */}
          <SimpleAddressInput
            address={data.address}
            city={data.city}
            state={data.state}
            postalCode={data.postalCode || ""}
            onAddressChange={(value) => handleChange("address", value)}
            onCityChange={(value) => handleChange("city", value)}
            onStateChange={(value) => handleChange("state", value)}
            onPostalCodeChange={(value) => handleChange("postalCode", value)}
            errors={{
              address: errors.address,
              city: errors.city,
              state: errors.state,
              postalCode: errors.postalCode
            }}
          />
        </>
        )}
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Date & Time
        </h3>
        
        <SimpleDateTimePicker
          date={data.eventDate || ""}
          time={data.eventTime || "19:00"}
          onDateChange={(date) => handleChange("eventDate", date)}
          onTimeChange={(time) => handleChange("eventTime", time)}
          dateLabel="Event Date *"
          timeLabel="Start Time *"
          minDate={new Date().toISOString().split("T")[0]}
          dateError={errors.eventDate}
          timeError={errors.eventTime}
        />
        
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            End Time (Optional)
          </label>
          <input
            type="time"
            value={data.endTime || ""}
            onChange={(e) => handleChange("endTime", e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
            style={{ colorScheme: 'light' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t">
        {/* Show validation summary if there are errors after attempting submit */}
        {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex">
              <Info className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Almost there! Please complete these required fields:
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Fill in all required fields to continue"
          >
            Next: Ticketing
          </button>
        </div>
      </div>
    </div>
  );
}