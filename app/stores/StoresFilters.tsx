"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "APPAREL", label: "Apparel" },
  { value: "SHOES", label: "Shoes" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "MUSIC", label: "Music" },
  { value: "VIDEOS", label: "Videos" },
];

export function StoresFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const category = searchParams.get("category") || "all";
  const inStock = searchParams.get("inStock") === "true";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/stores?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    router.push(`/stores?${params.toString()}`);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1"
            min="0"
            step="0.01"
          />
          <Input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1"
            min="0"
            step="0.01"
          />
        </div>
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
          <h3 className="mb-2 text-sm font-medium">Availability</h3>
          <Button
            variant={inStock ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("inStock", inStock ? null : "true")}
          >
            In Stock Only
          </Button>
        </div>
      </div>
    </div>
  );
}
