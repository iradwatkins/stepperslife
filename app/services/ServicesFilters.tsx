"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Services" },
  { value: "DJ", label: "DJ Services" },
  { value: "PHOTOGRAPHER", label: "Photography" },
  { value: "VIDEOGRAPHER", label: "Videography" },
  { value: "EVENT_PLANNER", label: "Event Planning" },
  { value: "INSTRUCTOR", label: "Instructors" },
  { value: "VENUE", label: "Venues" },
];

export function ServicesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "all";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/services?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search services, providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-3">
        <div>
          <h3 className="mb-2 text-sm font-medium">Service Type</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("category", cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
