"use client";

import { useState } from "react";
import { Plus, Trash2, Users, DollarSign, Info, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { TicketType, TableConfig } from "@/types/events";

interface TableConfigStepProps {
  ticketTypes: TicketType[];
  tables: TableConfig[];
  onChange: (tables: TableConfig[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function TableConfigStep({
  ticketTypes,
  tables,
  onChange,
  onNext,
  onBack,
  onSkip,
}: TableConfigStepProps) {
  const [localTables, setLocalTables] = useState<TableConfig[]>(tables);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate remaining tickets after table allocations
  const getAvailableTickets = (ticketTypeId: string) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) return 0;

    const tablesUsingThisType = localTables.filter(t => t.sourceTicketTypeId === ticketTypeId);
    const totalSeatsAllocated = tablesUsingThisType.reduce((sum, table) => sum + table.seatCount, 0);
    
    return ticketType.quantity - totalSeatsAllocated;
  };

  const handleTableChange = (index: number, field: keyof TableConfig, value: any) => {
    const updated = [...localTables];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update source ticket type name when ID changes
    if (field === "sourceTicketTypeId") {
      const ticketType = ticketTypes.find(t => t.id === value);
      if (ticketType) {
        updated[index].sourceTicketTypeName = ticketType.name;
      }
    }
    
    setLocalTables(updated);
    setErrors({});
  };

  const addTable = () => {
    const newId = localTables.length > 0 
      ? (Math.max(...localTables.map(t => parseInt(t.id))) + 1).toString()
      : "1";
    
    const defaultTicketType = ticketTypes[0];
    
    setLocalTables([
      ...localTables,
      {
        id: newId,
        name: "",
        seatCount: 8,
        price: 0,
        description: "",
        sourceTicketTypeId: defaultTicketType.id,
        sourceTicketTypeName: defaultTicketType.name,
      },
    ]);
  };

  const removeTable = (index: number) => {
    setLocalTables(localTables.filter((_, i) => i !== index));
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    localTables.forEach((table, index) => {
      if (!table.name.trim()) {
        newErrors[`table-${index}-name`] = "Table name is required";
      }
      
      if (table.seatCount < 1) {
        newErrors[`table-${index}-seats`] = "Must have at least 1 seat";
      }
      
      if (table.price < 0) {
        newErrors[`table-${index}-price`] = "Price cannot be negative";
      }
      
      const available = getAvailableTickets(table.sourceTicketTypeId);
      if (table.seatCount > available) {
        newErrors[`table-${index}-allocation`] = `Only ${available} ${table.sourceTicketTypeName} tickets available`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onChange(localTables);
      onNext();
    }
  };

  const handleSkip = () => {
    onChange([]);
    onSkip();
  };

  // Calculate ticket inventory summary
  const inventorySummary = ticketTypes.map(ticketType => {
    const tablesUsingType = localTables.filter(t => t.sourceTicketTypeId === ticketType.id);
    const seatsAllocated = tablesUsingType.reduce((sum, table) => sum + table.seatCount, 0);
    const remaining = ticketType.quantity - seatsAllocated;
    
    return {
      ticketType,
      tablesUsingType,
      seatsAllocated,
      remaining,
      originalQuantity: ticketType.quantity,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Table Configuration</h2>
        <p className="text-gray-600">
          Create private table sales from your ticket inventory (optional)
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>🎟️ Important:</strong> Tables are for <strong>private/direct sales only</strong> and won't appear on the public event page. 
          The organizer sells these directly to groups. Each table reduces available public tickets.
        </p>
      </div>

      {/* Inventory Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Ticket Inventory</h3>
        <div className="space-y-2">
          {inventorySummary.map(({ ticketType, seatsAllocated, remaining, originalQuantity }) => (
            <div key={ticketType.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{ticketType.name}:</span>
                <span className="text-gray-600">{originalQuantity} total</span>
              </div>
              <div className="flex items-center gap-3">
                {seatsAllocated > 0 && (
                  <span className="text-orange-600">
                    <ArrowRight className="inline w-3 h-3" /> {seatsAllocated} to tables
                  </span>
                )}
                <span className={`font-medium ${remaining === 0 ? "text-gray-400" : "text-green-600"}`}>
                  {remaining} available for public
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Configurations */}
      {localTables.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Tables</h3>
            <button
              onClick={addTable}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </div>

          {localTables.map((table, index) => {
            const ticketType = ticketTypes.find(t => t.id === table.sourceTicketTypeId);
            const pricePerSeat = table.seatCount > 0 ? table.price / table.seatCount : 0;
            const regularTotal = ticketType ? ticketType.price * table.seatCount : 0;
            const savings = regularTotal - table.price;

            return (
              <div key={table.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">Table {index + 1}</h4>
                  <button
                    onClick={() => removeTable(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Name *
                    </label>
                    <input
                      type="text"
                      value={table.name}
                      onChange={(e) => handleTableChange(index, "name", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`table-${index}-name`] ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="VIP Table"
                    />
                    {errors[`table-${index}-name`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`table-${index}-name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pull Tickets From *
                    </label>
                    <select
                      value={table.sourceTicketTypeId}
                      onChange={(e) => handleTableChange(index, "sourceTicketTypeId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ticketTypes.map(ticketType => (
                        <option key={ticketType.id} value={ticketType.id}>
                          {ticketType.name} ({getAvailableTickets(ticketType.id)} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="inline w-3 h-3" />
                      Number of Seats *
                    </label>
                    <input
                      type="number"
                      value={table.seatCount}
                      onChange={(e) => handleTableChange(index, "seatCount", parseInt(e.target.value) || 0)}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`table-${index}-seats`] || errors[`table-${index}-allocation`] 
                          ? "border-red-500" 
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`table-${index}-seats`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`table-${index}-seats`]}</p>
                    )}
                    {errors[`table-${index}-allocation`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`table-${index}-allocation`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="inline w-3 h-3" />
                      Total Table Price *
                    </label>
                    <input
                      type="number"
                      value={table.price}
                      onChange={(e) => handleTableChange(index, "price", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`table-${index}-price`] ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={regularTotal.toFixed(2)}
                    />
                    {errors[`table-${index}-price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`table-${index}-price`]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={table.description}
                    onChange={(e) => handleTableChange(index, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Premium seating with best view"
                  />
                </div>

                {/* Pricing Info */}
                {table.seatCount > 0 && table.price > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <Info className="inline w-4 h-4 mr-1" />
                        ${pricePerSeat.toFixed(2)} per seat
                      </div>
                      {savings > 0 && (
                        <div className="text-green-600 font-medium">
                          Group saves ${savings.toFixed(2)}!
                        </div>
                      )}
                    </div>
                    {ticketType && (
                      <div className="text-xs mt-1">
                        vs. ${ticketType.price} individual {ticketType.name} ticket
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No tables configured yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Tables are optional and used for private group sales
          </p>
          <button
            onClick={addTable}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Table
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Skip Tables
          </button>
          <button
            onClick={handleNext}
            disabled={Object.keys(errors).length > 0}
            className={`flex items-center px-6 py-2 rounded-lg ${
              Object.keys(errors).length === 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next: Review
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}