"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFiltersProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  selectedCategory: string | null;
  showPastEvents?: boolean;
  onTogglePastEvents?: (show: boolean) => void;
}

const CATEGORIES = [
  "All",
  "Set",
  "Workshop",
  "Save the Date",
  "Cruise",
  "Outdoors Steppin",
  "Holiday Event",
  "Weekend Event",
];

export function SearchFilters({
  onSearchChange,
  onCategoryChange,
  selectedCategory,
  showPastEvents = false,
  onTogglePastEvents,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      onCategoryChange(null);
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events by name, description, or location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Category Filter Chips and Past Events Toggle */}
      <div className="flex flex-wrap gap-2 items-center">
        {CATEGORIES.map((category) => {
          const isSelected =
            category === "All"
              ? selectedCategory === null
              : selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                }
              `}
            >
              {category}
            </button>
          );
        })}

        {/* Past Events Toggle - on same line */}
        {onTogglePastEvents && (
          <button
            onClick={() => onTogglePastEvents(!showPastEvents)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                showPastEvents
                  ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
              }
            `}
          >
            {showPastEvents ? "Viewing Past Events" : "View Past Events"}
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing results for:</span>
          {searchQuery && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              &ldquo;{searchQuery}&rdquo;
            </span>
          )}
          {selectedCategory && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              {selectedCategory}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
