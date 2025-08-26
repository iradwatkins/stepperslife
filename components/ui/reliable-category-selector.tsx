"use client";

import React from "react";

export type EventCategory = 
  | "workshop"
  | "sets"
  | "in_the_park"
  | "trip"
  | "cruise"
  | "holiday"
  | "competition"
  | "class"
  | "social_dance"
  | "lounge_bar"
  | "party"
  | "other";

interface CategoryOption {
  value: EventCategory;
  label: string;
}

const categoryOptions: CategoryOption[] = [
  { value: "workshop", label: "Workshop" },
  { value: "sets", label: "Sets/Performance" },
  { value: "in_the_park", label: "In The Park" },
  { value: "trip", label: "Trip/Travel" },
  { value: "cruise", label: "Cruise" },
  { value: "holiday", label: "Holiday Event" },
  { value: "competition", label: "Competition" },
  { value: "class", label: "Class/Lesson" },
  { value: "social_dance", label: "Social Dance" },
  { value: "lounge_bar", label: "Lounge/Bar" },
  { value: "party", label: "Party" },
  { value: "other", label: "Other" },
];

interface ReliableCategorySelectorProps {
  value?: EventCategory[];
  onChange: (value: EventCategory[]) => void;
  maxCategories?: number;
  disabled?: boolean;
}

export function ReliableCategorySelector({
  value = [],
  onChange,
  maxCategories = 5,
  disabled = false
}: ReliableCategorySelectorProps) {
  const handleToggle = (category: EventCategory) => {
    if (disabled) return;
    
    const isSelected = value.includes(category);
    
    if (isSelected) {
      onChange(value.filter(v => v !== category));
    } else {
      if (value.length < maxCategories) {
        onChange([...value, category]);
      }
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Select up to {maxCategories} categories
          {value.length > 0 && (
            <span className="ml-2 font-medium">
              ({value.length}/{maxCategories} selected)
            </span>
          )}
        </div>
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
            disabled={disabled}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryOptions.map(option => {
            const isSelected = value.includes(option.value);
            const isDisabled = disabled || (!isSelected && value.length >= maxCategories);
            
            return (
              <label
                key={option.value}
                className={`
                  flex items-center space-x-2 p-2 rounded cursor-pointer
                  transition-colors duration-150
                  ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-white'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{
                  border: isSelected ? '1px solid rgb(147 197 253)' : '1px solid transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(option.value)}
                  disabled={isDisabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  aria-label={option.label}
                />
                <span 
                  className={`text-sm select-none ${
                    isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {value.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs font-medium text-blue-900 mb-2">Selected Categories:</div>
          <div className="flex flex-wrap gap-2">
            {value.map(cat => {
              const option = categoryOptions.find(opt => opt.value === cat);
              if (!option) return null;
              
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-800 rounded text-sm border border-blue-200"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(cat);
                    }}
                    className="ml-1 text-blue-600 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${option.label}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}