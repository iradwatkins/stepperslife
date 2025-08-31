"use client";

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
  | "other";

interface EventCategoriesSelectProps {
  value: EventCategory[];
  onChange: (value: EventCategory[]) => void;
  required?: boolean;
}

const categoryOptions: { value: EventCategory; label: string }[] = [
  { value: "workshop", label: "Workshop" },
  { value: "sets", label: "Sets" },
  { value: "in_the_park", label: "In The Park" },
  { value: "trip", label: "Trip/Travel" },
  { value: "cruise", label: "Cruise" },
  { value: "holiday", label: "Holiday Event" },
  { value: "competition", label: "Competition" },
  { value: "class", label: "Class/Lesson" },
  { value: "social", label: "Social Dance" },
  { value: "other", label: "Other/Party" },
];

export default function EventCategoriesSelect({ 
  value = [], 
  onChange, 
  required = false 
}: EventCategoriesSelectProps) {
  const toggleCategory = (category: EventCategory) => {
    const newValue = value.includes(category)
      ? value.filter(v => v !== category)
      : [...value, category];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Categories {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Check all that apply to your event
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggleCategory(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700 select-none">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {value.length > 0 && (
        <div className="text-xs text-gray-600 mt-2">
          <span className="font-medium">Selected ({value.length}):</span>{" "}
          {value.map(v => 
            categoryOptions.find(opt => opt.value === v)?.label
          ).filter(Boolean).join(", ")}
        </div>
      )}
    </div>
  );
}