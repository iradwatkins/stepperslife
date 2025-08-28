"use client";

import { useState } from "react";
import { Plus, Trash2, Package, DollarSign, ChevronLeft, ChevronRight, Sparkles, PercentIcon, Calendar } from "lucide-react";
import type { DayConfiguration, Bundle } from "../MultiDayEventFlow";

interface BundleCreationStepProps {
  days: DayConfiguration[];
  bundles: Bundle[];
  onChange: (bundles: Bundle[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function BundleCreationStep({
  days,
  bundles,
  onChange,
  onNext,
  onBack,
  onSkip,
}: BundleCreationStepProps) {
  const [localBundles, setLocalBundles] = useState<Bundle[]>(bundles);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addBundle = () => {
    const newId = (localBundles.length + 1).toString();
    const newBundle: Bundle = {
      id: newId,
      name: "",
      description: "",
      selectedTickets: [],
      bundlePrice: 0,
    };
    setLocalBundles([...localBundles, newBundle]);
  };

  const removeBundle = (index: number) => {
    setLocalBundles(localBundles.filter((_, i) => i !== index));
    setErrors({});
  };

  const updateBundle = (index: number, field: keyof Bundle, value: any) => {
    const updated = [...localBundles];
    updated[index] = { ...updated[index], [field]: value };
    setLocalBundles(updated);
    setErrors({});
  };

  const toggleTicketSelection = (bundleIndex: number, dayId: string, ticketTypeId: string) => {
    const updated = [...localBundles];
    const bundle = updated[bundleIndex];
    const day = days.find(d => d.id === dayId);
    const ticket = day?.ticketTypes.find(t => t.id === ticketTypeId);
    
    if (!day || !ticket) return;
    
    const existingIndex = bundle.selectedTickets.findIndex(
      st => st.dayId === dayId && st.ticketTypeId === ticketTypeId
    );
    
    if (existingIndex >= 0) {
      // Remove if already selected
      bundle.selectedTickets = bundle.selectedTickets.filter((_, i) => i !== existingIndex);
    } else {
      // Add if not selected
      bundle.selectedTickets.push({
        dayId,
        ticketTypeId,
        ticketName: ticket.name,
        dayLabel: day.dayLabel,
      });
    }
    
    // Auto-calculate suggested price (sum of individual prices minus 15% discount)
    const totalPrice = bundle.selectedTickets.reduce((sum, st) => {
      const selectedDay = days.find(d => d.id === st.dayId);
      const selectedTicket = selectedDay?.ticketTypes.find(t => t.id === st.ticketTypeId);
      return sum + (selectedTicket?.price || 0);
    }, 0);
    
    bundle.bundlePrice = Math.round(totalPrice * 0.85 * 100) / 100; // 15% discount
    
    setLocalBundles(updated);
  };

  const isTicketSelected = (bundleIndex: number, dayId: string, ticketTypeId: string) => {
    return localBundles[bundleIndex].selectedTickets.some(
      st => st.dayId === dayId && st.ticketTypeId === ticketTypeId
    );
  };

  const calculateSavings = (bundle: Bundle) => {
    const totalPrice = bundle.selectedTickets.reduce((sum, st) => {
      const day = days.find(d => d.id === st.dayId);
      const ticket = day?.ticketTypes.find(t => t.id === st.ticketTypeId);
      return sum + (ticket?.price || 0);
    }, 0);
    
    return totalPrice - bundle.bundlePrice;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    localBundles.forEach((bundle, index) => {
      if (!bundle.name.trim()) {
        newErrors[`bundle-${index}-name`] = "Bundle name is required";
      }
      if (bundle.selectedTickets.length < 2) {
        newErrors[`bundle-${index}-tickets`] = "Select at least 2 tickets for a bundle";
      }
      if (bundle.bundlePrice <= 0) {
        newErrors[`bundle-${index}-price`] = "Bundle price must be greater than 0";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (localBundles.length === 0) {
      onChange([]);
      onNext();
      return;
    }
    
    if (validate()) {
      onChange(localBundles);
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Ticket Bundles</h2>
        <p className="text-gray-600">Offer discounted bundles for customers buying multiple days</p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="flex items-start">
          <Sparkles className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-purple-800 font-medium">Bundle Tip</p>
            <p className="text-sm text-purple-700">
              Create attractive bundles to encourage multi-day purchases. Mix and match any tickets from different days.
              We auto-suggest 15% off, but you set the final price!
            </p>
          </div>
        </div>
      </div>

      {/* Bundle List */}
      <div className="space-y-6">
        {localBundles.map((bundle, bundleIndex) => (
          <div key={bundle.id} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Bundle {bundleIndex + 1}
              </h3>
              <button
                onClick={() => removeBundle(bundleIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Name *
                </label>
                <input
                  type="text"
                  value={bundle.name}
                  onChange={(e) => updateBundle(bundleIndex, "name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`bundle-${bundleIndex}-name`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Weekend Pass - General Admission"
                />
                {errors[`bundle-${bundleIndex}-name`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`bundle-${bundleIndex}-name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline w-3 h-3" />
                  Bundle Price *
                </label>
                <input
                  type="number"
                  value={bundle.bundlePrice}
                  onChange={(e) => updateBundle(bundleIndex, "bundlePrice", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`bundle-${bundleIndex}-price`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[`bundle-${bundleIndex}-price`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`bundle-${bundleIndex}-price`]}</p>
                )}
                {bundle.bundlePrice > 0 && calculateSavings(bundle) > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                    <div className="flex items-center">
                      <PercentIcon className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">
                        Customer Savings: ${calculateSavings(bundle).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-green-600">
                      {Math.round((calculateSavings(bundle) / bundle.selectedTickets.reduce((sum, st) => {
                        const day = days.find(d => d.id === st.dayId);
                        const ticket = day?.ticketTypes.find(t => t.id === st.ticketTypeId);
                        return sum + (ticket?.price || 0);
                      }, 0)) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={bundle.description || ""}
                onChange={(e) => updateBundle(bundleIndex, "description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Get access to all 3 days of workshops and social dancing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Tickets for Bundle * <span className="text-xs text-gray-500">(Mix & Match Any Days)</span>
              </label>
              {errors[`bundle-${bundleIndex}-tickets`] && (
                <p className="text-red-500 text-xs mb-2">{errors[`bundle-${bundleIndex}-tickets`]}</p>
              )}
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {days.map((day) => (
                  <div key={day.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-base mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      {day.dayLabel}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {day.ticketTypes.map((ticket) => (
                        <label
                          key={ticket.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            isTicketSelected(bundleIndex, day.id, ticket.id)
                              ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isTicketSelected(bundleIndex, day.id, ticket.id)}
                            onChange={() => toggleTicketSelection(bundleIndex, day.id, ticket.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            isTicketSelected(bundleIndex, day.id, ticket.id)
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}>
                            {isTicketSelected(bundleIndex, day.id, ticket.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm text-gray-900">
                              {ticket.name}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              ${ticket.price}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {bundle.selectedTickets.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium mb-2 text-blue-900 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  This bundle includes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bundle.selectedTickets.map((st, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      <span className="font-medium">{st.dayLabel}:</span>
                      <span className="ml-1">{st.ticketName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Quantity Available (Optional)
              </label>
              <input
                type="number"
                value={bundle.maxQuantity || ""}
                onChange={(e) => updateBundle(bundleIndex, "maxQuantity", parseInt(e.target.value) || undefined)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>
        ))}

        {localBundles.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No bundles created yet</p>
            <button
              onClick={addBundle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Bundle
            </button>
          </div>
        )}
      </div>

      {localBundles.length > 0 && (
        <button
          onClick={addBundle}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          Add Another Bundle
        </button>
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
            onClick={onSkip}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Skip Bundles
          </button>
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next: Tables
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}