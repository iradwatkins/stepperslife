"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Tag } from "lucide-react";
import type { EventData } from "../SingleEventFlow";

interface BasicInfoStepProps {
  data: EventData;
  onChange: (data: EventData) => void;
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

export default function BasicInfoStep({
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
    if (!data.location.trim()) newErrors.location = "Venue name is required";
    if (!data.address.trim()) newErrors.address = "Address is required";
    if (!data.city.trim()) newErrors.city = "City is required";
    if (!data.state.trim()) newErrors.state = "State is required";
    if (!data.eventDate) newErrors.eventDate = "Event date is required";
    if (!data.eventTime) newErrors.eventTime = "Start time is required";
    if (data.categories.length === 0) newErrors.categories = "Select at least one category";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
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

      {/* Location */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Event Location
        </h3>
        
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123 Main Street"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Miami"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              value={data.state}
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
              value={data.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="33139"
            />
          </div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Date & Time
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date *
            </label>
            <input
              type="date"
              value={data.eventDate}
              onChange={(e) => handleChange("eventDate", e.target.value)}
              min={minDate}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.eventDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              Start Time *
            </label>
            <input
              type="time"
              value={data.eventTime}
              onChange={(e) => handleChange("eventTime", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.eventTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.eventTime && <p className="text-red-500 text-sm mt-1">{errors.eventTime}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time (Optional)
            </label>
            <input
              type="time"
              value={data.endTime || ""}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
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