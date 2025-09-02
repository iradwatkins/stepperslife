"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Tag, CalendarIcon, ImageIcon, ChevronRight, X } from "lucide-react";
import { cn, getButtonClass } from "@/lib/utils/cn";
import { FormField, FormSection } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Checkbox } from "@/components/forms/Select";
import { validateForm, eventValidationSchema } from "@/lib/validation/form-validation";
import { SimpleDateTimePicker } from "@/components/ui/simple-date-time-picker";
import MapboxAddressInput from "@/components/MapboxAddressInput";
import ImageUploadField from "@/components/ImageUploadField";
import { EventCategorySelector } from "@/components/events/EventCategorySelector";
import { SaveTheDateToggle } from "@/components/events/SaveTheDateToggle";
import type { EventData } from "../SingleEventFlow";

interface BasicInfoStepProps {
  data: EventData;
  onChange: (data: EventData) => void;
  onNext: () => void;
  onCancel: () => void;
}

/**
 * Refactored BasicInfoStep - reduced from 377 lines to ~200 lines
 * Extracted components: EventCategorySelector, SaveTheDateToggle
 * Uses centralized validation and form components
 */
export default function BasicInfoStepRefactored({
  data,
  onChange,
  onNext,
  onCancel,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof EventData, value: any) => {
    onChange({ ...data, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    // Use centralized validation
    const baseErrors = validateForm(data, eventValidationSchema);
    const newErrors: Record<string, string> = {};
    
    // Convert validation errors to string format
    Object.entries(baseErrors).forEach(([key, error]) => {
      if (error) newErrors[key] = error;
    });
    
    // Additional custom validation
    if (data.categories.length === 0) {
      newErrors.categories = "Select at least one category";
    }
    
    // Skip location validation for Save the Date events
    if (data.isSaveTheDate) {
      delete newErrors.location;
      delete newErrors.address;
      delete newErrors.city;
      delete newErrors.state;
      delete newErrors.postalCode;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FormSection
        title="Event Details"
        description="Basic information about your event"
      >
        {/* Event Name */}
        <FormField
          label="Event Name"
          name="name"
          required
          error={errors.name}
        >
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Summer Dance Festival"
            error={!!errors.name}
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          name="description"
          required
          error={errors.description}
        >
          <textarea
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className={cn(
              "w-full px-3 py-2 border rounded-lg",
              "focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
              "dark:bg-gray-900 dark:text-white dark:border-gray-700",
              errors.description ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Join us for an amazing evening of dance, music, and fun..."
          />
        </FormField>

        {/* Categories */}
        <FormField
          label="Event Categories"
          name="categories"
          required
          error={errors.categories}
          hint="Select up to 5 categories"
        >
          <EventCategorySelector
            selectedCategories={data.categories}
            onChange={(categories) => handleChange("categories", categories)}
            maxCategories={5}
          />
        </FormField>
      </FormSection>

      {/* Event Images */}
      <FormSection
        title="Event Images"
        description="Add images to make your event more attractive (optional)"
        icon={<ImageIcon className="w-5 h-5" />}
      >
        {/* Main Image */}
        <ImageUploadField
          value={data.mainImage}
          onChange={(url) => handleChange("mainImage", url || "")}
          label="Main Event Image (Optional)"
        />

        {/* Gallery Images */}
        <FormField
          label="Gallery Images"
          name="gallery"
          hint="Optional, max 5 images"
        >
          <GalleryImageGrid
            images={data.galleryImages || []}
            onChange={(images) => handleChange("galleryImages", images)}
            maxImages={5}
          />
        </FormField>
      </FormSection>

      {/* Save the Date Option */}
      <SaveTheDateToggle
        checked={data.isSaveTheDate === true}
        onChange={(checked) => handleChange("isSaveTheDate", checked)}
      />

      {/* Location */}
      <FormSection
        title="Event Location"
        icon={<MapPin className="w-5 h-5" />}
      >
        {data.isSaveTheDate ? (
          <LocationPendingNotice />
        ) : (
          <>
            <FormField
              label="Venue Name"
              name="location"
              required
              error={errors.location}
            >
              <Input
                value={data.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="The Grand Ballroom"
                error={!!errors.location}
              />
            </FormField>

            <MapboxAddressInput
              value={data.address}
              onChange={(value) => handleChange("address", value)}
              onAddressSelect={(components) => {
                handleChange("address", components.address);
                handleChange("city", components.city);
                handleChange("state", components.state);
                handleChange("postalCode", components.postalCode);
              }}
              placeholder="Start typing venue address..."
              error={errors.address}
              required
            />
          </>
        )}
      </FormSection>

      {/* Date and Time */}
      <FormSection
        title="Date & Time"
        icon={<Calendar className="w-5 h-5" />}
      >
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
        
        <FormField
          label="End Time"
          name="endTime"
          icon={<Clock className="w-4 h-4" />}
        >
          <Input
            type="time"
            value={data.endTime || ""}
            onChange={(e) => handleChange("endTime", e.target.value)}
          />
        </FormField>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className={cn(getButtonClass("ghost"))}
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className={cn(getButtonClass("primary"), "flex items-center")}
        >
          Next: Ticketing
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

// Extracted helper components
function GalleryImageGrid({ 
  images, 
  onChange, 
  maxImages 
}: { 
  images: string[]; 
  onChange: (images: string[]) => void; 
  maxImages: number;
}) {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    "https://images.unsplash.com/photo-1468234847176-28606331216a?w=800",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"
  ];

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleAdd = () => {
    if (images.length < maxImages) {
      onChange([...images, placeholderImages[images.length % placeholderImages.length]]);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative h-32">
          <img 
            src={image} 
            alt={`Gallery ${index + 1}`} 
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => handleRemove(index)}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {images.length < maxImages && (
        <button
          onClick={handleAdd}
          className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ImageIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Add image</p>
        </button>
      )}
    </div>
  );
}

function LocationPendingNotice() {
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start">
        <CalendarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Save the Date Event</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Location details will be announced later. You can update this information 
            anytime before the event date.
          </p>
        </div>
      </div>
    </div>
  );
}