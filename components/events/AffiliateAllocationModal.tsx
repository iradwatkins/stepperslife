"use client";

import { useState } from "react";
import { X, Plus, Users, Ticket, Info } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AffiliateAllocationModalProps {
  eventId: Id<"events">;
  totalTickets: number;
  commissionPercent: number;
  isOpen: boolean;
  onClose: () => void;
}

interface AffiliateAllocation {
  email: string;
  name: string;
  ticketQuantity: number;
}

export default function AffiliateAllocationModal({
  eventId,
  totalTickets,
  commissionPercent,
  isOpen,
  onClose,
}: AffiliateAllocationModalProps) {
  const [allocations, setAllocations] = useState<AffiliateAllocation[]>([]);
  const [newAffiliate, setNewAffiliate] = useState<AffiliateAllocation>({
    email: "",
    name: "",
    ticketQuantity: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAffiliate = useMutation(api.affiliatePrograms.createAffiliate);
  const allocateTickets = useMutation(api.tickets.allocation.allocateTicketsToAffiliate);
  
  // Get existing affiliates
  const existingAffiliates = useQuery(api.affiliatePrograms.getEventAffiliates, { eventId });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.ticketQuantity, 0);
  const remainingTickets = totalTickets - totalAllocated;

  const handleAddAffiliate = () => {
    if (newAffiliate.email && newAffiliate.name && newAffiliate.ticketQuantity > 0) {
      if (newAffiliate.ticketQuantity <= remainingTickets) {
        setAllocations([...allocations, newAffiliate]);
        setNewAffiliate({ email: "", name: "", ticketQuantity: 10 });
      } else {
        alert(`Only ${remainingTickets} tickets remaining`);
      }
    }
  };

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (allocations.length === 0) {
      alert("Please add at least one affiliate");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create affiliates and allocate tickets
      for (const allocation of allocations) {
        // Create affiliate
        const affiliateId = await createAffiliate({
          eventId,
          name: allocation.name,
          email: allocation.email,
          commissionRate: commissionPercent,
        });

        // Allocate tickets
        if (affiliateId) {
          await allocateTickets({
            eventId,
            affiliateId,
            quantity: allocation.ticketQuantity,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          });
        }
      }

      alert(`Successfully allocated tickets to ${allocations.length} affiliates`);
      onClose();
    } catch (error) {
      console.error("Failed to allocate tickets:", error);
      alert("Failed to allocate tickets. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Allocate Tickets to Affiliates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Commission Rate: {commissionPercent}% per sale
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Ticket Allocation Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Available</p>
                <p className="font-bold text-lg">{totalTickets}</p>
              </div>
              <div>
                <p className="text-gray-600">Allocated</p>
                <p className="font-bold text-lg text-blue-600">{totalAllocated}</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining</p>
                <p className="font-bold text-lg text-green-600">{remainingTickets}</p>
              </div>
            </div>
          </div>

          {/* Add New Affiliate */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Add New Affiliate
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newAffiliate.name}
                onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newAffiliate.email}
                onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Tickets"
                  value={newAffiliate.ticketQuantity}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, ticketQuantity: parseInt(e.target.value) || 0 })}
                  min="1"
                  max={remainingTickets}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 flex-1"
                />
                <button
                  onClick={handleAddAffiliate}
                  disabled={!newAffiliate.email || !newAffiliate.name || remainingTickets === 0}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Existing Affiliates */}
          {existingAffiliates && existingAffiliates.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Existing Affiliates</h3>
              <div className="space-y-2">
                {existingAffiliates.map((affiliate: any) => (
                  <div key={affiliate._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{affiliate.name}</span>
                    <span className="text-sm text-gray-600">{affiliate.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Allocations */}
          {allocations.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Pending Allocations</h3>
              <div className="space-y-2">
                {allocations.map((allocation, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{allocation.name}</p>
                      <p className="text-sm text-gray-600">{allocation.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                        {allocation.ticketQuantity} tickets
                      </span>
                      <button
                        onClick={() => handleRemoveAllocation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p>
                  <strong>How Affiliate Sales Work:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Affiliates receive their allocated tickets to sell</li>
                  <li>They can accept cash or digital payments from customers</li>
                  <li>After receiving payment, they register the sale in the app</li>
                  <li>You verify the payment, then the ticket becomes active</li>
                  <li>Affiliates earn {commissionPercent}% commission on each sale</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for Now
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={allocations.length === 0 || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                allocations.length > 0 && !isSubmitting
                  ? "bg-cyan-600 text-white hover:bg-cyan-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Allocating..." : `Allocate to ${allocations.length} Affiliate${allocations.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}