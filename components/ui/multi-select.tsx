"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  icon?: React.ReactNode;
  [key: string]: any;
}

interface MultiSelectProps {
  options: Option[];
  value?: Option[];
  onChange?: (value: Option[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxItems?: number;
  hideClearAllButton?: boolean;
  hidePlaceholderWhenSelected?: boolean;
  badgeClassName?: string;
  commandProps?: any;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  className,
  disabled = false,
  maxItems,
  hideClearAllButton = false,
  hidePlaceholderWhenSelected = false,
  badgeClassName,
  commandProps,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const handleSelect = (option: Option) => {
    if (option.disable) return;

    const isSelected = value.some((item) => item.value === option.value);
    let newValue: Option[];

    if (isSelected) {
      newValue = value.filter((item) => item.value !== option.value);
    } else {
      if (maxItems && value.length >= maxItems) {
        return;
      }
      newValue = [...value, option];
    }

    onChange?.(newValue);
  };

  const handleRemove = (option: Option) => {
    const newValue = value.filter((item) => item.value !== option.value);
    onChange?.(newValue);
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-[40px] py-2",
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1">
            {value.length > 0 ? (
              <>
                {value.map((item) => (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className={cn("mr-1", badgeClassName)}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
                {!hidePlaceholderWhenSelected && (
                  <span className="text-muted-foreground text-sm">
                    {placeholder}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!hideClearAllButton && value.length > 0 && (
              <button
                type="button"
                className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command {...commandProps}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = value.some(
                (item) => item.value === option.value
              );
              
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                  disabled={option.disable}
                  className={cn(
                    "cursor-pointer",
                    option.disable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.icon && (
                    <span className="mr-2">{option.icon}</span>
                  )}
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Default export for compatibility
export default MultiSelect;