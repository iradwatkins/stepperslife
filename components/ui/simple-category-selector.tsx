"use client";

import React from "react";
import { 
  Music, 
  Users, 
  TreePine, 
  Plane, 
  Ship, 
  Calendar,
  Trophy,
  GraduationCap,
  Wine,
  MoreHorizontal,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  | "other";

interface CategoryOption {
  value: EventCategory;
  label: string;
  icon: React.ReactNode;
}

const categoryOptions: CategoryOption[] = [
  { value: "workshop", label: "Workshop", icon: <Users className="h-4 w-4" /> },
  { value: "sets", label: "Sets", icon: <Music className="h-4 w-4" /> },
  { value: "in_the_park", label: "In The Park", icon: <TreePine className="h-4 w-4" /> },
  { value: "trip", label: "Trip/Travel", icon: <Plane className="h-4 w-4" /> },
  { value: "cruise", label: "Cruise", icon: <Ship className="h-4 w-4" /> },
  { value: "holiday", label: "Holiday Event", icon: <Calendar className="h-4 w-4" /> },
  { value: "competition", label: "Competition", icon: <Trophy className="h-4 w-4" /> },
  { value: "class", label: "Class/Lesson", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "social_dance", label: "Social Dance", icon: <Users className="h-4 w-4" /> },
  { value: "lounge_bar", label: "Lounge/Bar", icon: <Wine className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];

interface SimpleCategorySelectorProps {
  value?: EventCategory[];
  onChange: (value: EventCategory[]) => void;
  maxCategories?: number;
  disabled?: boolean;
  className?: string;
}

export function SimpleCategorySelector({
  value = [],
  onChange,
  maxCategories = 5,
  disabled = false,
  className
}: SimpleCategorySelectorProps) {
  const handleToggle = (category: EventCategory) => {
    if (disabled) return;
    
    const isSelected = value.includes(category);
    
    if (isSelected) {
      // Remove the category
      onChange(value.filter(v => v !== category));
    } else {
      // Add the category if under max limit
      if (value.length < maxCategories) {
        onChange([...value, category]);
      }
    }
  };

  const handleRemove = (category: EventCategory) => {
    if (disabled) return;
    onChange(value.filter(v => v !== category));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected categories display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground mr-2">Selected:</span>
          {value.map(category => {
            const option = categoryOptions.find(opt => opt.value === category);
            if (!option) return null;
            
            return (
              <div
                key={category}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
              >
                {option.icon}
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(category)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Remove ${option.label}`}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
              disabled={disabled}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categoryOptions.map(option => {
          const isSelected = value.includes(option.value);
          const isDisabled = disabled || (!isSelected && value.length >= maxCategories);
          
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                "hover:bg-accent/50",
                isSelected && "border-primary bg-primary/5",
                !isSelected && "border-muted-foreground/20",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                disabled={isDisabled}
                aria-label={option.label}
              />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{option.icon}</span>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected && "text-primary"
                )}>
                  {option.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Select up to {maxCategories} categories that best describe your event.
        {value.length > 0 && ` (${value.length}/${maxCategories} selected)`}
      </p>
    </div>
  );
}