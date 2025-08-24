"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormLabel } from "@/components/ui/form";

export type EventType = 
  | "workshop"
  | "sets"
  | "in_the_park"
  | "trip"
  | "cruise"
  | "holiday"
  | "competition"
  | "class"
  | "other";

interface EventTypeDropdownProps {
  value?: EventType;
  onChange: (value: EventType) => void;
  required?: boolean;
}

const eventTypes = [
  { id: "workshop", label: "Workshop", description: "Educational or skill-building session" },
  { id: "sets", label: "Sets", description: "Music or performance sets" },
  { id: "in_the_park", label: "In the Park", description: "Outdoor park event" },
  { id: "trip", label: "Trip", description: "Travel or excursion" },
  { id: "cruise", label: "Cruise", description: "Boat or ship cruise" },
  { id: "holiday", label: "Holiday", description: "Holiday celebration" },
  { id: "competition", label: "Competition", description: "Competitive event or contest" },
  { id: "class", label: "Class", description: "Educational class or course" },
  { id: "other", label: "Other", description: "Other type of event" },
];

export default function EventTypeDropdown({ value, onChange, required = false }: EventTypeDropdownProps) {
  return (
    <div className="space-y-2">
      <FormLabel>
        Event Type {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <Select value={value} onValueChange={(val) => onChange(val as EventType)}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {eventTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <div>
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-gray-500">{type.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}