import { Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

interface EventCategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  maxCategories?: number;
  className?: string;
}

/**
 * Reusable event category selector component
 * Extracted from BasicInfoStep for reusability
 */
export function EventCategorySelector({
  selectedCategories,
  onChange,
  maxCategories = 5,
  className,
}: EventCategorySelectorProps) {
  const handleToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];
    
    if (newCategories.length <= maxCategories) {
      onChange(newCategories);
    }
  };

  const isDisabled = (categoryId: string) => {
    return !selectedCategories.includes(categoryId) && 
           selectedCategories.length >= maxCategories;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {EVENT_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const disabled = isDisabled(category.id);
          
          return (
            <label
              key={category.id}
              className={cn(
                "flex items-center p-3 border rounded-lg cursor-pointer transition-all",
                "hover:shadow-sm",
                isSelected && "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400",
                !isSelected && "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(category.id)}
                disabled={disabled}
                className="sr-only"
              />
              <span className="mr-2 text-lg">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.label}
              </span>
            </label>
          );
        })}
      </div>
      
      {selectedCategories.length >= maxCategories && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Tag className="w-3 h-3 mr-1" />
          Maximum {maxCategories} categories selected
        </p>
      )}
    </div>
  );
}