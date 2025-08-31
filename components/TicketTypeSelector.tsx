"use client";

import { useState } from "react";
import { Plus, Minus, Ticket, Calendar, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TicketType {
  _id: string;
  name: string;
  price: number;
  category: "general" | "vip" | "early_bird";
  allocatedQuantity: number;
  availableQuantity: number;
  soldCount: number;
  hasEarlyBird?: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: number;
  description?: string;
}

interface TicketTypeSelection {
  ticketType: TicketType;
  quantity: number;
}

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[];
  onProceedToCheckout: (selections: TicketTypeSelection[]) => void;
  eventName?: string;
  eventDate?: number;
}

export default function TicketTypeSelector({
  ticketTypes,
  onProceedToCheckout,
  eventName,
  eventDate
}: TicketTypeSelectorProps) {
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    const currentQuantity = selections[ticketTypeId] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    const ticketType = ticketTypes.find(t => t._id === ticketTypeId);
    if (ticketType && newQuantity > ticketType.availableQuantity) {
      alert(`Only ${ticketType.availableQuantity} tickets available for ${ticketType.name}`);
      return;
    }

    setSelections(prev => ({
      ...prev,
      [ticketTypeId]: newQuantity
    }));
  };

  const getTotalPrice = () => {
    return Object.entries(selections).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find(t => t._id === ticketTypeId);
      if (!ticketType) return total;
      
      // Check if early bird pricing applies
      const now = Date.now();
      const isEarlyBird = ticketType.hasEarlyBird && 
                         ticketType.earlyBirdEndDate && 
                         now < ticketType.earlyBirdEndDate;
      
      const price = isEarlyBird && ticketType.earlyBirdPrice 
        ? ticketType.earlyBirdPrice 
        : ticketType.price;
      
      return total + (price * quantity);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  };

  const handleProceedToCheckout = () => {
    const selectedTickets: TicketTypeSelection[] = Object.entries(selections)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketType: ticketTypes.find(t => t._id === ticketTypeId)!,
        quantity
      }));

    if (selectedTickets.length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    onProceedToCheckout(selectedTickets);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "vip": return "bg-purple-100 text-purple-800";
      case "early_bird": return "bg-green-100 text-green-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const isEarlyBirdActive = (ticketType: TicketType) => {
    if (!ticketType.hasEarlyBird || !ticketType.earlyBirdEndDate) return false;
    return Date.now() < ticketType.earlyBirdEndDate;
  };

  if (ticketTypes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tickets available for this event</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select Your Tickets</CardTitle>
          <CardDescription>
            Choose your ticket type and quantity for {eventName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketTypes.map((ticketType) => {
            const quantity = selections[ticketType._id] || 0;
            const isEarlyBird = isEarlyBirdActive(ticketType);
            const displayPrice = isEarlyBird && ticketType.earlyBirdPrice 
              ? ticketType.earlyBirdPrice 
              : ticketType.price;

            return (
              <div
                key={ticketType._id}
                className={`border rounded-lg p-4 transition-all ${
                  quantity > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{ticketType.name}</h3>
                      <Badge className={getCategoryBadgeColor(ticketType.category)}>
                        {ticketType.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {isEarlyBird && (
                        <Badge className="bg-green-100 text-green-800">
                          <Tag className="w-3 h-3 mr-1" />
                          Early Bird
                        </Badge>
                      )}
                    </div>
                    
                    {ticketType.description && (
                      <p className="text-sm text-gray-600 mb-2">{ticketType.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{ticketType.availableQuantity} available</span>
                      </div>
                      
                      {isEarlyBird && ticketType.earlyBirdEndDate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Early bird ends {new Date(ticketType.earlyBirdEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${displayPrice.toFixed(2)}
                      </div>
                      {isEarlyBird && ticketType.price !== displayPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${ticketType.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(ticketType._id, -1)}
                        disabled={quantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <div className="w-12 text-center font-semibold">
                        {quantity}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(ticketType._id, 1)}
                        disabled={quantity >= ticketType.availableQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {getTotalTickets() > 0 && (
        <Card className="w-full sticky bottom-4 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">${getTotalPrice().toFixed(2)}</p>
                <p className="text-sm text-gray-500">{getTotalTickets()} ticket(s)</p>
              </div>
              
              <Button
                size="lg"
                onClick={handleProceedToCheckout}
                className="px-8"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}