"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Briefcase, 
  Music, 
  Trees, 
  MapPin, 
  Ship, 
  Calendar, 
  Trophy, 
  GraduationCap,
  Sparkles
} from "lucide-react";

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

interface EventTypeSelectorProps {
  value?: EventType;
  onChange: (value: EventType) => void;
}

const eventTypes = [
  {
    id: "workshop" as EventType,
    label: "Workshop",
    description: "Educational or skill-building session",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "sets" as EventType,
    label: "Sets",
    description: "Music or performance sets",
    icon: Music,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "in_the_park" as EventType,
    label: "In the Park",
    description: "Outdoor gatherings and activities",
    icon: Trees,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "trip" as EventType,
    label: "Trip",
    description: "Travel or excursion events",
    icon: MapPin,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "cruise" as EventType,
    label: "Cruise",
    description: "Boat or ship events",
    icon: Ship,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    id: "holiday" as EventType,
    label: "Holiday",
    description: "Seasonal or holiday celebrations",
    icon: Calendar,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "competition" as EventType,
    label: "Competition",
    description: "Contests and competitive events",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "class" as EventType,
    label: "Class",
    description: "Educational courses or lessons",
    icon: GraduationCap,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "other" as EventType,
    label: "Other",
    description: "Other event types",
    icon: Sparkles,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export default function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Event Type</Label>
      <RadioGroup 
        value={value || ""} 
        onValueChange={(val) => onChange(val as EventType)}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {eventTypes.map((type) => (
          <div key={type.id} className="relative">
            <RadioGroupItem 
              value={type.id} 
              id={type.id} 
              className="peer sr-only" 
            />
            <Label
              htmlFor={type.id}
              className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50
                ${value === type.id 
                  ? `border-blue-500 ${type.bgColor}` 
                  : "border-gray-200"
                }
                peer-focus:ring-2 peer-focus:ring-blue-500`}
            >
              <type.icon className={`w-8 h-8 mb-2 ${type.color}`} />
              <div className="text-center">
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {type.description}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export function getEventTypeLabel(type?: EventType): string {
  if (!type) return "Event";
  const eventType = eventTypes.find(t => t.id === type);
  return eventType?.label || "Event";
}

export function getEventTypeIcon(type?: EventType) {
  if (!type) return Sparkles;
  const eventType = eventTypes.find(t => t.id === type);
  return eventType?.icon || Sparkles;
}