"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getButtonClass } from "@/lib/utils/cn";
import { FormField, FormSection } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { TicketAllocationStatus } from "@/components/events/tickets/TicketAllocationStatus";
import { TicketTypeCard } from "@/components/events/tickets/TicketTypeCard";
import { validateForm, ticketValidationSchema } from "@/lib/validation/form-validation";
import type { EventData } from "../SingleEventFlow";
import type { TicketType } from "@/types/events";

interface CapacityTicketsStepProps {
  eventData: EventData;
  ticketTypes: TicketType[];
  onChange: (eventData: EventData, ticketTypes: TicketType[]) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Refactored CapacityTicketsStep - reduced from 439 lines to ~200 lines
 * Extracted components: TicketAllocationStatus, TicketTypeCard
 * Extracted validation logic to form-validation.ts
 */
export default function CapacityTicketsStepRefactored({
  eventData,
  ticketTypes,
  onChange,
  onNext,
  onBack,
}: CapacityTicketsStepProps) {
  const [localCapacity, setLocalCapacity] = useState(eventData.totalCapacity || 100);
  const [localTickets, setLocalTickets] = useState<TicketType[]>(
    ticketTypes.length > 0 ? ticketTypes : getDefaultTickets()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate allocation
  const totalAllocated = localTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const capacityRemaining = localCapacity - totalAllocated;
  const canProceed = capacityRemaining >= 0;

  // Auto-save changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(
        { ...eventData, totalCapacity: localCapacity },
        localTickets
      );
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localCapacity, localTickets]);

  const handleCapacityChange = (value: string) => {
    const capacity = parseInt(value) || 0;
    setLocalCapacity(capacity);
    setErrors({});
  };

  const handleTicketChange = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...localTickets];
    updated[index] = { ...updated[index], [field]: value };
    
    // Clear early bird fields if disabled
    if (field === "hasEarlyBird" && !value) {
      updated[index].earlyBirdPrice = undefined;
      updated[index].earlyBirdEndDate = undefined;
    }
    
    setLocalTickets(updated);
    setErrors({});
  };

  const addTicketType = () => {
    const newId = (Math.max(...localTickets.map(t => parseInt(t.id))) + 1).toString();
    setLocalTickets([
      ...localTickets,
      {
        id: newId,
        name: "",
        quantity: 0,
        price: 0,
        hasEarlyBird: false,
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    setLocalTickets(localTickets.filter((_, i) => i !== index));
    setErrors({});
  };

  const autoBalance = () => {
    if (localTickets.length === 0) return;
    
    const perTicket = Math.floor(localCapacity / localTickets.length);
    const remainder = localCapacity % localTickets.length;
    
    const balanced = localTickets.map((ticket, index) => ({
      ...ticket,
      quantity: perTicket + (index < remainder ? 1 : 0),
    }));
    
    setLocalTickets(balanced);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate capacity
    if (localCapacity < 1) {
      newErrors.capacity = "Total capacity must be at least 1";
    }
    
    // Only block if over-allocated
    if (capacityRemaining < 0) {
      newErrors.allocation = `You've allocated ${Math.abs(capacityRemaining)} tickets over capacity`;
    }
    
    // Validate each ticket
    localTickets.forEach((ticket, index) => {
      const ticketErrors = validateForm(ticket, ticketValidationSchema);
      Object.entries(ticketErrors).forEach(([field, error]) => {
        if (error) {
          newErrors[`ticket-${index}-${field}`] = error;
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const calculateTotalRevenue = () => {
    return localTickets.reduce((sum, t) => sum + (t.quantity * t.price), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FormSection
        title="Capacity & Ticket Types"
        description="Define your venue capacity and break it down into ticket types"
      >
        {/* Total Capacity */}
        <FormField
          label="Total Venue Capacity"
          name="capacity"
          required
          error={errors.capacity}
          hint="Maximum number of people your venue can accommodate"
        >
          <Input
            type="number"
            value={localCapacity}
            onChange={(e) => handleCapacityChange(e.target.value)}
            min="1"
            placeholder="200"
            error={!!errors.capacity}
          />
        </FormField>

        {/* Allocation Status */}
        <TicketAllocationStatus
          totalCapacity={localCapacity}
          totalAllocated={totalAllocated}
          onAutoBalance={autoBalance}
        />
        {errors.allocation && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.allocation}</p>
        )}
      </FormSection>

      {/* Ticket Types */}
      <FormSection title="Ticket Types">
        <div className="space-y-4">
          {localTickets.map((ticket, index) => (
            <TicketTypeCard
              key={ticket.id}
              ticket={ticket}
              index={index}
              eventDate={eventData.eventDate}
              canDelete={localTickets.length > 1}
              errors={errors}
              onChange={(field, value) => handleTicketChange(index, field, value)}
              onDelete={() => removeTicketType(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addTicketType}
          className={cn(getButtonClass("secondary"), "w-full flex items-center justify-center")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ticket Type
        </button>
      </FormSection>

      {/* Revenue Projection */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
          Revenue Projection
        </h4>
        <div className="space-y-2 text-sm">
          {localTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{ticket.name || "Unnamed"}: {ticket.quantity} × ${ticket.price}</span>
              <span>${(ticket.quantity * ticket.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold flex justify-between text-gray-900 dark:text-white">
            <span>Total Potential Revenue:</span>
            <span>${calculateTotalRevenue().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={cn(getButtonClass("ghost"), "flex items-center")}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            getButtonClass("primary"),
            "flex items-center",
            !canProceed && "opacity-50 cursor-not-allowed"
          )}
        >
          Next: Table Configuration
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

function getDefaultTickets(): TicketType[] {
  return [
    {
      id: "1",
      name: "General Admission",
      quantity: 50,
      price: 30,
      hasEarlyBird: false,
    },
    {
      id: "2",
      name: "VIP",
      quantity: 50,
      price: 60,
      hasEarlyBird: false,
    },
  ];
}