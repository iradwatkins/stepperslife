"use client";

import { useState } from "react";
import { Plus, Trash2, Users, DollarSign, Calendar, Info, ChevronLeft, ChevronRight } from "lucide-react";
import type { EventData } from "../SingleEventFlow";
import type { TicketType } from "@/types/events";

interface CapacityTicketsStepProps {
  eventData: EventData;
  ticketTypes: TicketType[];
  onChange: (eventData: EventData, ticketTypes: TicketType[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CapacityTicketsStep({
  eventData,
  ticketTypes,
  onChange,
  onNext,
  onBack,
}: CapacityTicketsStepProps) {
  const [localCapacity, setLocalCapacity] = useState(eventData.totalCapacity || 100);
  const [localTickets, setLocalTickets] = useState<TicketType[]>(
    ticketTypes.length > 0 ? ticketTypes : [
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
    ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalAllocated = localTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const capacityRemaining = localCapacity - totalAllocated;
  const isValidAllocation = capacityRemaining === 0;

  const handleCapacityChange = (value: string) => {
    const capacity = parseInt(value) || 0;
    setLocalCapacity(capacity);
    setErrors({});
  };

  const handleTicketChange = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...localTickets];
    updated[index] = { ...updated[index], [field]: value };
    
    // If turning off early bird, clear early bird fields
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
    if (localTickets.length > 1) {
      setLocalTickets(localTickets.filter((_, i) => i !== index));
      setErrors({});
    }
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
    
    if (localCapacity < 1) {
      newErrors.capacity = "Total capacity must be at least 1";
    }
    
    if (!isValidAllocation) {
      newErrors.allocation = capacityRemaining > 0
        ? `You have ${capacityRemaining} tickets unallocated`
        : `You've allocated ${Math.abs(capacityRemaining)} tickets over capacity`;
    }
    
    localTickets.forEach((ticket, index) => {
      if (!ticket.name.trim()) {
        newErrors[`ticket-${index}-name`] = "Ticket name is required";
      }
      if (ticket.quantity < 0) {
        newErrors[`ticket-${index}-quantity`] = "Quantity cannot be negative";
      }
      if (ticket.price < 0) {
        newErrors[`ticket-${index}-price`] = "Price cannot be negative";
      }
      if (ticket.hasEarlyBird) {
        if (!ticket.earlyBirdPrice || ticket.earlyBirdPrice >= ticket.price) {
          newErrors[`ticket-${index}-earlybird`] = "Early bird price must be less than regular price";
        }
        if (!ticket.earlyBirdEndDate) {
          newErrors[`ticket-${index}-earlydate`] = "Early bird end date is required";
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onChange(
        { ...eventData, totalCapacity: localCapacity },
        localTickets
      );
      onNext();
    }
  };

  // Calculate early bird cutoff date (default to 2 weeks before event)
  const getDefaultEarlyBirdDate = () => {
    if (!eventData.eventDate) return "";
    const eventDate = new Date(eventData.eventDate);
    eventDate.setDate(eventDate.getDate() - 14);
    return eventDate.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Capacity & Ticket Types</h2>
        <p className="text-gray-600">Define your venue capacity and break it down into ticket types</p>
      </div>

      {/* Total Capacity */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="inline w-4 h-4 mr-1" />
          Total Venue Capacity *
        </label>
        <input
          type="number"
          value={localCapacity}
          onChange={(e) => handleCapacityChange(e.target.value)}
          min="1"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.capacity ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="200"
        />
        {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
        <p className="text-xs text-gray-600 mt-1">
          Maximum number of people your venue can accommodate
        </p>
      </div>

      {/* Allocation Status */}
      <div className={`p-4 rounded-lg border ${
        isValidAllocation
          ? "bg-green-50 border-green-200"
          : capacityRemaining > 0
          ? "bg-yellow-50 border-yellow-200"
          : "bg-red-50 border-red-200"
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {isValidAllocation
                ? "✅ Perfect allocation!"
                : capacityRemaining > 0
                ? `⚠️ ${capacityRemaining} tickets unallocated`
                : `❌ Over capacity by ${Math.abs(capacityRemaining)} tickets`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total: {totalAllocated} / {localCapacity} tickets
            </p>
          </div>
          {!isValidAllocation && (
            <button
              onClick={autoBalance}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Auto-Balance
            </button>
          )}
        </div>
        {errors.allocation && <p className="text-red-500 text-sm mt-2">{errors.allocation}</p>}
      </div>

      {/* Ticket Types */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Ticket Types</h3>
          <button
            onClick={addTicketType}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Ticket Type
          </button>
        </div>

        {localTickets.map((ticket, index) => (
          <div key={ticket.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Ticket Type {index + 1}</h4>
              {localTickets.length > 1 && (
                <button
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`ticket-${index}-name`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="VIP"
                />
                {errors[`ticket-${index}-name`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticket-${index}-name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) => handleTicketChange(index, "quantity", parseInt(e.target.value) || 0)}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`ticket-${index}-quantity`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[`ticket-${index}-quantity`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticket-${index}-quantity`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline w-3 h-3" />
                  Regular Price *
                </label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketChange(index, "price", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`ticket-${index}-price`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[`ticket-${index}-price`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`ticket-${index}-price`]}</p>
                )}
              </div>
            </div>

            {/* Early Bird Toggle */}
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ticket.hasEarlyBird}
                  onChange={(e) => handleTicketChange(index, "hasEarlyBird", e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Enable Early Bird Pricing</span>
              </label>

              {ticket.hasEarlyBird && (
                <div className="mt-3 grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Early Bird Price *
                    </label>
                    <input
                      type="number"
                      value={ticket.earlyBirdPrice || ""}
                      onChange={(e) => handleTicketChange(index, "earlyBirdPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`ticket-${index}-earlybird`] ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={`${(ticket.price * 0.8).toFixed(2)}`}
                    />
                    {errors[`ticket-${index}-earlybird`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`ticket-${index}-earlybird`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline w-3 h-3" />
                      Early Bird Ends *
                    </label>
                    <input
                      type="date"
                      value={ticket.earlyBirdEndDate || getDefaultEarlyBirdDate()}
                      onChange={(e) => handleTicketChange(index, "earlyBirdEndDate", e.target.value)}
                      max={eventData.eventDate}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`ticket-${index}-earlydate`] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors[`ticket-${index}-earlydate`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`ticket-${index}-earlydate`]}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Projection */}
            {ticket.quantity > 0 && ticket.price > 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <Info className="inline w-4 h-4 mr-1" />
                Potential revenue: ${(ticket.quantity * ticket.price).toFixed(2)}
                {ticket.hasEarlyBird && ticket.earlyBirdPrice && (
                  <span className="ml-2">
                    (Early bird: ${(ticket.quantity * ticket.earlyBirdPrice).toFixed(2)})
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Revenue Projection */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Revenue Projection</h4>
        <div className="space-y-1 text-sm">
          {localTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between">
              <span>{ticket.name}: {ticket.quantity} × ${ticket.price}</span>
              <span>${(ticket.quantity * ticket.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t font-semibold flex justify-between">
            <span>Total Potential Revenue:</span>
            <span>${localTickets.reduce((sum, t) => sum + (t.quantity * t.price), 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isValidAllocation || Object.keys(errors).length > 0}
          className={`flex items-center px-6 py-2 rounded-lg ${
            isValidAllocation && Object.keys(errors).length === 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next: Table Configuration
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}