"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CUISINES = [
  { value: "all", label: "All Cuisines" },
  { value: "SOUL_FOOD", label: "Soul Food" },
  { value: "SEAFOOD", label: "Seafood" },
  { value: "AMERICAN", label: "American" },
  { value: "ITALIAN", label: "Italian" },
  { value: "CARIBBEAN", label: "Caribbean" },
  { value: "BBQ", label: "BBQ" },
  { value: "STEAKHOUSE", label: "Steakhouse" },
];

export function RestaurantsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const cuisine = searchParams.get("cuisine") || "all";
  const openNow = searchParams.get("openNow") === "true";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/restaurants?${params.toString()}`);
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
            placeholder="Search restaurants, location..."
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
          <h3 className="mb-2 text-sm font-medium">Cuisine Type</h3>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cat) => (
              <Button
                key={cat.value}
                variant={cuisine === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("cuisine", cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Availability</h3>
          <Button
            variant={openNow ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("openNow", openNow ? null : "true")}
          >
            Open Now
          </Button>
        </div>
      </div>
    </div>
  );
}
