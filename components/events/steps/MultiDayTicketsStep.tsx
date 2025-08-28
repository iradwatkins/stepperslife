"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Clock, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import type { MultiDayEventData, DayConfiguration, TicketType } from "../MultiDayEventFlow";

interface MultiDayTicketsStepProps {
  eventData: MultiDayEventData;
  days: DayConfiguration[];
  onChange: (days: DayConfiguration[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MultiDayTicketsStep({
  eventData,
  days,
  onChange,
  onNext,
  onBack,
}: MultiDayTicketsStepProps) {
  const [localDays, setLocalDays] = useState<DayConfiguration[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize days on component mount
  useEffect(() => {
    if (days.length === 0 && eventData.startDate && eventData.endDate) {
      const generatedDays = generateDays();
      setLocalDays(generatedDays);
    } else {
      setLocalDays(days);
    }
  }, []);

  const generateDays = (): DayConfiguration[] => {
    const start = new Date(eventData.startDate);
    const end = new Date(eventData.endDate);
    const dayConfigs: DayConfiguration[] = [];
    
    let currentDate = new Date(start);
    let dayNumber = 1;
    
    while (currentDate <= end) {
      const dayLabel = `Day ${dayNumber} - ${currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })}`;
      
      dayConfigs.push({
        id: `day-${dayNumber}`,
        dayNumber,
        date: currentDate.toISOString().split('T')[0],
        dayLabel,
        startTime: "09:00",
        endTime: "23:00",
        ticketTypes: [
          {
            id: "1",
            name: "General Admission",
            quantity: 100,
            price: 50,
            hasEarlyBird: false,
          }
        ],
        // Copy location from event if same location
        ...(eventData.sameLocation ? {
          location: eventData.location,
          address: eventData.address,
          city: eventData.city,
          state: eventData.state,
          postalCode: eventData.postalCode,
        } : {})
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }
    
    return dayConfigs;
  };

  const handleDayChange = (field: keyof DayConfiguration, value: any) => {
    const updated = [...localDays];
    updated[activeDay] = { ...updated[activeDay], [field]: value };
    setLocalDays(updated);
    setErrors({});
  };

  const handleTicketChange = (ticketIndex: number, field: keyof TicketType, value: any) => {
    const updated = [...localDays];
    const tickets = [...updated[activeDay].ticketTypes];
    tickets[ticketIndex] = { ...tickets[ticketIndex], [field]: value };
    
    // If turning off early bird, clear early bird fields
    if (field === "hasEarlyBird" && !value) {
      tickets[ticketIndex].earlyBirdPrice = undefined;
      tickets[ticketIndex].earlyBirdEndDate = undefined;
    }
    
    updated[activeDay].ticketTypes = tickets;
    setLocalDays(updated);
    setErrors({});
  };

  const addTicketType = () => {
    const updated = [...localDays];
    const currentDay = updated[activeDay];
    const newId = (Math.max(...currentDay.ticketTypes.map(t => parseInt(t.id)), 0) + 1).toString();
    
    currentDay.ticketTypes.push({
      id: newId,
      name: "",
      quantity: 50,
      price: 0,
      hasEarlyBird: false,
    });
    
    setLocalDays(updated);
  };

  const removeTicketType = (ticketIndex: number) => {
    const updated = [...localDays];
    const currentDay = updated[activeDay];
    
    if (currentDay.ticketTypes.length > 1) {
      currentDay.ticketTypes = currentDay.ticketTypes.filter((_, i) => i !== ticketIndex);
      setLocalDays(updated);
      setErrors({});
    }
  };

  const copyToPreviousDay = () => {
    if (activeDay === 0) return;
    
    const updated = [...localDays];
    const previousDay = updated[activeDay - 1];
    const currentDay = updated[activeDay];
    
    // Copy ticket configuration from previous day
    currentDay.ticketTypes = previousDay.ticketTypes.map(ticket => ({
      ...ticket,
      id: ticket.id + "-copy"
    }));
    
    setLocalDays(updated);
  };

  const copyToAllDays = () => {
    const updated = [...localDays];
    const currentDayTickets = updated[activeDay].ticketTypes;
    
    updated.forEach((day, index) => {
      if (index !== activeDay) {
        day.ticketTypes = currentDayTickets.map(ticket => ({
          ...ticket,
          id: `${ticket.id}-day${day.dayNumber}`
        }));
      }
    });
    
    setLocalDays(updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    localDays.forEach((day, dayIndex) => {
      // Validate location if different per day
      if (!eventData.sameLocation) {
        if (!day.location?.trim()) {
          newErrors[`day-${dayIndex}-location`] = "Location is required";
          hasError = true;
        }
      }
      
      // Validate tickets
      day.ticketTypes.forEach((ticket, ticketIndex) => {
        if (!ticket.name.trim()) {
          newErrors[`day-${dayIndex}-ticket-${ticketIndex}-name`] = "Ticket name is required";
          hasError = true;
        }
        if (ticket.price < 0) {
          newErrors[`day-${dayIndex}-ticket-${ticketIndex}-price`] = "Price cannot be negative";
          hasError = true;
        }
        if (ticket.quantity < 1) {
          newErrors[`day-${dayIndex}-ticket-${ticketIndex}-quantity`] = "Must have at least 1 ticket";
          hasError = true;
        }
        
        if (ticket.hasEarlyBird) {
          if (!ticket.earlyBirdPrice || ticket.earlyBirdPrice >= ticket.price) {
            newErrors[`day-${dayIndex}-ticket-${ticketIndex}-earlybird`] = "Early bird price must be less than regular price";
            hasError = true;
          }
          if (!ticket.earlyBirdEndDate) {
            newErrors[`day-${dayIndex}-ticket-${ticketIndex}-earlydate`] = "Early bird end date is required";
            hasError = true;
          }
        }
      });
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const handleNext = () => {
    if (validate()) {
      onChange(localDays);
      onNext();
    }
  };

  const currentDay = localDays[activeDay];
  if (!currentDay) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Configure Each Day</h2>
        <p className="text-gray-600">Set up location, times, and tickets for each day</p>
      </div>

      {/* Day Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {localDays.map((day, index) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(index)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeDay === index
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {day.dayLabel}
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {currentDay.dayLabel}
        </h3>

        {/* Location (if different per day) */}
        {!eventData.sameLocation && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Location for this day
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                value={currentDay.location || ""}
                onChange={(e) => handleDayChange("location", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors[`day-${activeDay}-location`] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Main Ballroom"
              />
              {errors[`day-${activeDay}-location`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-location`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={currentDay.address || ""}
                onChange={(e) => handleDayChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={currentDay.city || ""}
                  onChange={(e) => handleDayChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={currentDay.state || ""}
                  onChange={(e) => handleDayChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP
                </label>
                <input
                  type="text"
                  value={currentDay.postalCode || ""}
                  onChange={(e) => handleDayChange("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              Start Time
            </label>
            <input
              type="time"
              value={currentDay.startTime}
              onChange={(e) => handleDayChange("startTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              End Time
            </label>
            <input
              type="time"
              value={currentDay.endTime || ""}
              onChange={(e) => handleDayChange("endTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Ticket Types */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Ticket Types</h4>
            <div className="flex gap-2">
              {activeDay > 0 && (
                <button
                  onClick={copyToPreviousDay}
                  className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Copy from Previous Day
                </button>
              )}
              {localDays.length > 1 && (
                <button
                  onClick={copyToAllDays}
                  className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Copy to All Days
                </button>
              )}
              <button
                onClick={addTicketType}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Ticket
              </button>
            </div>
          </div>

          {currentDay.ticketTypes.map((ticket, ticketIndex) => (
            <div key={ticket.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h5 className="font-medium">Ticket Type {ticketIndex + 1}</h5>
                {currentDay.ticketTypes.length > 1 && (
                  <button
                    onClick={() => removeTicketType(ticketIndex)}
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
                    onChange={(e) => handleTicketChange(ticketIndex, "name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`day-${activeDay}-ticket-${ticketIndex}-name`] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="General Admission"
                  />
                  {errors[`day-${activeDay}-ticket-${ticketIndex}-name`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-ticket-${ticketIndex}-name`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketChange(ticketIndex, "quantity", parseInt(e.target.value) || 0)}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`day-${activeDay}-ticket-${ticketIndex}-quantity`] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[`day-${activeDay}-ticket-${ticketIndex}-quantity`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-ticket-${ticketIndex}-quantity`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline w-3 h-3" />
                    Price *
                  </label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(ticketIndex, "price", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`day-${activeDay}-ticket-${ticketIndex}-price`] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[`day-${activeDay}-ticket-${ticketIndex}-price`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-ticket-${ticketIndex}-price`]}</p>
                  )}
                </div>
              </div>

              {/* Early Bird Toggle */}
              <div className="border-t pt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ticket.hasEarlyBird}
                    onChange={(e) => handleTicketChange(ticketIndex, "hasEarlyBird", e.target.checked)}
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
                        onChange={(e) => handleTicketChange(ticketIndex, "earlyBirdPrice", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`day-${activeDay}-ticket-${ticketIndex}-earlybird`] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={`${(ticket.price * 0.8).toFixed(2)}`}
                      />
                      {errors[`day-${activeDay}-ticket-${ticketIndex}-earlybird`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-ticket-${ticketIndex}-earlybird`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Early Bird Ends *
                      </label>
                      <input
                        type="date"
                        value={ticket.earlyBirdEndDate || ""}
                        onChange={(e) => handleTicketChange(ticketIndex, "earlyBirdEndDate", e.target.value)}
                        max={currentDay.date}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`day-${activeDay}-ticket-${ticketIndex}-earlydate`] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors[`day-${activeDay}-ticket-${ticketIndex}-earlydate`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`day-${activeDay}-ticket-${ticketIndex}-earlydate`]}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {localDays.length > 1 ? "Next: Create Bundles" : "Next: Tables"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}