"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "CULTURE", label: "Culture" },
  { value: "EVENTS", label: "Events" },
  { value: "MUSIC", label: "Music" },
  { value: "DANCE", label: "Dance" },
  { value: "FASHION", label: "Fashion" },
  { value: "COMMUNITY", label: "Community" },
];

export function MagazineFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "all";
  const featured = searchParams.get("featured") === "true";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/magazine?${params.toString()}`);
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
            placeholder="Search articles..."
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
          <h3 className="mb-2 text-sm font-medium">Category</h3>
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

        <div>
          <h3 className="mb-2 text-sm font-medium">Filters</h3>
          <Button
            variant={featured ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("featured", featured ? null : "true")}
          >
            Featured Only
          </Button>
        </div>
      </div>
    </div>
  );
}
