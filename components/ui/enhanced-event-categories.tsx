"use client";

import React from "react";
import { MultiSelect, Option } from "@/components/ui/multi-select";
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
  MoreHorizontal
} from "lucide-react";

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

const eventCategoryOptions: Option[] = [
  {
    value: "workshop",
    label: "Workshop",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "sets",
    label: "Sets",
    icon: <Music className="h-4 w-4" />,
  },
  {
    value: "in_the_park",
    label: "In The Park",
    icon: <TreePine className="h-4 w-4" />,
  },
  {
    value: "trip",
    label: "Trip/Travel",
    icon: <Plane className="h-4 w-4" />,
  },
  {
    value: "cruise",
    label: "Cruise",
    icon: <Ship className="h-4 w-4" />,
  },
  {
    value: "holiday",
    label: "Holiday Event",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    value: "competition",
    label: "Competition",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    value: "class",
    label: "Class/Lesson",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    value: "social_dance",
    label: "Social Dance",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "lounge_bar",
    label: "Lounge/Bar",
    icon: <Wine className="h-4 w-4" />,
  },
  {
    value: "other",
    label: "Other",
    icon: <MoreHorizontal className="h-4 w-4" />,
  },
];

interface EnhancedEventCategoriesProps {
  value?: EventCategory[];
  onChange: (value: EventCategory[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxCategories?: number;
}

export function EnhancedEventCategories({
  value = [],
  onChange,
  placeholder = "Select event categories",
  disabled = false,
  className,
  maxCategories = 5,
}: EnhancedEventCategoriesProps) {
  const selectedOptions = value.map(val => 
    eventCategoryOptions.find(opt => opt.value === val)
  ).filter(Boolean) as Option[];

  const handleChange = (options: Option[]) => {
    const categories = options.map(opt => opt.value as EventCategory);
    onChange(categories);
  };

  return (
    <div className={className}>
      <MultiSelect
        options={eventCategoryOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        searchPlaceholder="Search categories..."
        emptyMessage="No categories found"
        disabled={disabled}
        maxItems={maxCategories}
        hidePlaceholderWhenSelected
        commandProps={{
          label: "Select event categories",
        }}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Select up to {maxCategories} categories that best describe your event
      </p>
    </div>
  );
}