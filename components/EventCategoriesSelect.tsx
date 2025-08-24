"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

export type EventCategory = 
  | "workshop"
  | "sets"
  | "in_the_park"
  | "trip"
  | "cruise"
  | "holiday"
  | "competition"
  | "class"
  | "social"
  | "party"
  | "other";

interface EventCategoriesSelectProps {
  value: EventCategory[];
  onChange: (value: EventCategory[]) => void;
  required?: boolean;
}

const categoryOptions: { value: EventCategory; label: string }[] = [
  { value: "workshop", label: "Workshop" },
  { value: "sets", label: "Sets/Performance" },
  { value: "in_the_park", label: "In The Park" },
  { value: "trip", label: "Trip/Travel" },
  { value: "cruise", label: "Cruise" },
  { value: "holiday", label: "Holiday Event" },
  { value: "competition", label: "Competition" },
  { value: "class", label: "Class/Lesson" },
  { value: "social", label: "Social Dance" },
  { value: "party", label: "Party" },
  { value: "other", label: "Other" },
];

export default function EventCategoriesSelect({ 
  value = [], 
  onChange, 
  required = false 
}: EventCategoriesSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (category: EventCategory) => {
    const newValue = value.includes(category)
      ? value.filter(v => v !== category)
      : [...value, category];
    onChange(newValue);
  };

  const selectedLabels = value.map(v => 
    categoryOptions.find(opt => opt.value === v)?.label
  ).filter(Boolean).join(", ");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Event Categories {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={value.length === 0 ? "text-gray-400" : ""}>
            {value.length === 0 
              ? "Select categories..." 
              : selectedLabels
            }
          </span>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {categoryOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => toggleCategory(option.value)}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-sm">{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Select all categories that apply to your event
      </p>
    </div>
  );
}