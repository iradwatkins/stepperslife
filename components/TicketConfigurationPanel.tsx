"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Users, Ticket, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  type: "individual" | "table";
  seatCount?: number; // For table tickets
}

interface TicketConfigurationPanelProps {
  value?: TicketType[];
  onChange: (tickets: TicketType[]) => void;
  eventMode?: "single" | "multi_day";
}

export default function TicketConfigurationPanel({
  value = [],
  onChange,
  eventMode = "single"
}: TicketConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState<"individual" | "table">("individual");
  
  // Default ticket types
  const defaultIndividualTickets: Partial<TicketType>[] = [
    { name: "General Admission", price: 50, quantity: 100, type: "individual" },
    { name: "VIP", price: 150, quantity: 20, type: "individual" },
    { name: "Early Bird", price: 35, quantity: 50, type: "individual" }
  ];
  
  const defaultTableTickets: Partial<TicketType>[] = [
    { name: "VIP Table", price: 2000, quantity: 5, type: "table", seatCount: 10 },
    { name: "Standard Table", price: 1000, quantity: 10, type: "table", seatCount: 8 },
    { name: "Premium Table", price: 3000, quantity: 2, type: "table", seatCount: 12 }
  ];

  const addTicketType = (preset?: Partial<TicketType>) => {
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: preset?.name || (activeTab === "individual" ? "New Ticket" : "New Table"),
      description: preset?.description || "",
      price: preset?.price || 0,
      quantity: preset?.quantity || 10,
      type: preset?.type || activeTab,
      seatCount: preset?.seatCount || (activeTab === "table" ? 8 : undefined)
    };
    
    onChange([...value, newTicket]);
  };

  const updateTicket = (id: string, updates: Partial<TicketType>) => {
    onChange(value.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ));
  };

  const removeTicket = (id: string) => {
    onChange(value.filter(ticket => ticket.id !== id));
  };

  const getTotalCapacity = () => {
    return value.reduce((total, ticket) => {
      if (ticket.type === "table" && ticket.seatCount) {
        return total + (ticket.quantity * ticket.seatCount);
      }
      return total + ticket.quantity;
    }, 0);
  };

  const getEstimatedRevenue = () => {
    return value.reduce((total, ticket) => {
      return total + (ticket.price * ticket.quantity);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "individual" | "table")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">
            <Ticket className="w-4 h-4 mr-2" />
            Individual Tickets
          </TabsTrigger>
          <TabsTrigger value="table">
            <Users className="w-4 h-4 mr-2" />
            Table/Group Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {defaultIndividualTickets.map((preset, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTicketType(preset)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {preset.name}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {defaultTableTickets.map((preset, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTicketType(preset)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {preset.name}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Ticket List */}
      <div className="space-y-3">
        {value.map((ticket) => (
          <Card key={ticket.id} className={cn(
            "border",
            ticket.type === "table" ? "border-purple-200 bg-purple-50/50" : "border-blue-200 bg-blue-50/50"
          )}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`name-${ticket.id}`}>Ticket Name</Label>
                  <Input
                    id={`name-${ticket.id}`}
                    value={ticket.name}
                    onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                    placeholder="e.g., VIP Pass"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`price-${ticket.id}`}>
                    Price {ticket.type === "table" ? "per Table" : "per Ticket"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id={`price-${ticket.id}`}
                      type="number"
                      value={ticket.price}
                      onChange={(e) => updateTicket(ticket.id, { price: parseFloat(e.target.value) || 0 })}
                      className="pl-6"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`quantity-${ticket.id}`}>
                    {ticket.type === "table" ? "Number of Tables" : "Quantity"}
                  </Label>
                  <Input
                    id={`quantity-${ticket.id}`}
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => updateTicket(ticket.id, { quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                {ticket.type === "table" && (
                  <div>
                    <Label htmlFor={`seats-${ticket.id}`}>Seats per Table</Label>
                    <Input
                      id={`seats-${ticket.id}`}
                      type="number"
                      value={ticket.seatCount}
                      onChange={(e) => updateTicket(ticket.id, { seatCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicket(ticket.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor={`desc-${ticket.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`desc-${ticket.id}`}
                  value={ticket.description}
                  onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                  placeholder="Describe what's included with this ticket..."
                  className="h-20"
                />
              </div>
              
              {ticket.type === "table" && ticket.seatCount && (
                <div className="mt-2 text-sm text-gray-600">
                  Total capacity: {ticket.quantity} tables × {ticket.seatCount} seats = {ticket.quantity * ticket.seatCount} people
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {value.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">No ticket types configured yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => addTicketType()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Ticket Type
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      {value.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ticket Types</p>
                <p className="text-xl font-bold">{value.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Capacity</p>
                <p className="text-xl font-bold">{getTotalCapacity()}</p>
              </div>
              <div>
                <p className="text-gray-600">Est. Revenue</p>
                <p className="text-xl font-bold">${getEstimatedRevenue().toLocaleString()}</p>
              </div>
            </div>
            
            {eventMode === "multi_day" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Multi-Day Event:</strong> Bundle tickets will be automatically created with 15% discount
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Custom Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => addTicketType()}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Custom Ticket Type
      </Button>
    </div>
  );
}