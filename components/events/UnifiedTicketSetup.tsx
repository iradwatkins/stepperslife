"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Package,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Event {
  _id: Id<"events">;
  name: string;
  eventDate: number;
  endDate?: number;
  totalTickets: number;
  price: number;
  isMultiDay?: boolean;
  userId: string;
}

interface EventDay {
  _id: Id<"eventDays">;
  eventId: Id<"events">;
  dayNumber: number;
  date: number;
  dayLabel: string;
}

interface TicketType {
  _id?: Id<"dayTicketTypes">;
  name: string;
  category: "general" | "vip" | "early_bird";
  price: number;
  allocatedQuantity: number;
  hasEarlyBird?: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: number;
  dayId?: Id<"eventDays">;
  dayLabel?: string;
}

interface Bundle {
  name: string;
  description: string;
  includedDays: Array<{
    dayId: Id<"eventDays">;
    ticketCategory: "general" | "vip";
    dayLabel: string;
  }>;
  bundlePrice: number;
}

interface UnifiedTicketSetupProps {
  event: Event;
  eventDays: EventDay[] | undefined;
  isMultiDay: boolean;
  existingTicketTypes: any[] | undefined;
}

export default function UnifiedTicketSetup({ 
  event, 
  eventDays, 
  isMultiDay,
  existingTicketTypes 
}: UnifiedTicketSetupProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ticket types state
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  
  // Bundles state (multi-day only)
  const [bundles, setBundles] = useState<Bundle[]>([]);
  
  // Mutations
  const createTicketType = useMutation(api.multiDayEvents.createTicketType);
  const createBundle = useMutation(api.multiDayEvents.createBundle);
  const generateStandardBundles = useMutation(api.multiDayEvents.generateStandardBundles);
  const createSingleEventTickets = useMutation(api.ticketTypes.createTicketTypes);
  
  // Initialize with existing ticket types if any
  useState(() => {
    if (existingTicketTypes && existingTicketTypes.length > 0) {
      setTicketTypes(existingTicketTypes);
    }
  });
  
  // Add a new ticket type
  const addTicketType = (dayId?: Id<"eventDays">, dayLabel?: string) => {
    setTicketTypes([...ticketTypes, {
      name: "",
      category: "general",
      price: 0,
      allocatedQuantity: 0,
      dayId,
      dayLabel
    }]);
  };
  
  // Update a ticket type
  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };
  
  // Remove a ticket type
  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };
  
  // Add a bundle
  const addBundle = () => {
    setBundles([...bundles, {
      name: "",
      description: "",
      includedDays: [],
      bundlePrice: 0
    }]);
  };
  
  // Save configuration
  const saveConfiguration = async () => {
    setIsLoading(true);
    
    try {
      if (isMultiDay && eventDays) {
        // Create ticket types for each day
        for (const ticketType of ticketTypes) {
          await createTicketType({
            eventId: event._id,
            eventDayId: ticketType.dayId,
            name: ticketType.name,
            category: ticketType.category,
            price: ticketType.price,
            maxQuantity: ticketType.allocatedQuantity,
            earlyBirdPrice: ticketType.earlyBirdPrice,
            earlyBirdEndDate: ticketType.earlyBirdEndDate,
          });
        }
        
        // Create bundles
        for (const bundle of bundles) {
          const includedDaysWithPrices = bundle.includedDays.map(day => {
            const ticketType = ticketTypes.find(t => 
              t.dayId === day.dayId && t.category === day.ticketCategory
            );
            return {
              eventDayId: day.dayId,
              ticketTypeId: ticketType?._id!, // This would need to be set after creation
              dayLabel: day.dayLabel,
              originalPrice: ticketType?.price || 0
            };
          });
          
          await createBundle({
            eventId: event._id,
            name: bundle.name,
            description: bundle.description,
            bundleType: "custom_selection",
            includedDays: includedDaysWithPrices,
            bundlePrice: bundle.bundlePrice,
          });
        }
      } else {
        // Single event - create ticket types
        const ticketTypesData = ticketTypes.map(ticket => ({
          name: ticket.name,
          category: ticket.category,
          allocatedQuantity: ticket.allocatedQuantity,
          price: ticket.price,
          hasEarlyBird: ticket.hasEarlyBird,
          earlyBirdPrice: ticket.earlyBirdPrice,
          earlyBirdEndDate: ticket.earlyBirdEndDate,
        }));
        
        await createSingleEventTickets({
          eventId: event._id,
          ticketTypes: ticketTypesData,
        });
      }
      
      toast({
        title: "Success!",
        description: "Ticket configuration saved successfully.",
      });
      
      // Redirect to event page
      router.push(`/event/${event._id}`);
    } catch (error) {
      console.error("Error saving ticket configuration:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save ticket configuration. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate auto bundles for multi-day events
  const handleGenerateBundles = async () => {
    if (!isMultiDay) return;
    
    try {
      await generateStandardBundles({ eventId: event._id });
      toast({
        title: "Bundles Generated",
        description: "Standard bundle packages have been created.",
      });
    } catch (error) {
      console.error("Error generating bundles:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate bundles.",
      });
    }
  };
  
  // Render based on current step
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                Configure Ticket Types
              </h2>
              
              {isMultiDay && eventDays ? (
                // Multi-day ticket configuration
                <div className="space-y-6">
                  {eventDays.map((day) => (
                    <div key={day._id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {day.dayLabel}
                      </h3>
                      
                      <div className="space-y-3">
                        {ticketTypes
                          .filter(t => t.dayId === day._id)
                          .map((ticket, index) => (
                            <div key={index} className="grid grid-cols-4 gap-3">
                              <Input
                                placeholder="Ticket name (e.g., General Admission)"
                                value={ticket.name}
                                onChange={(e) => updateTicketType(
                                  ticketTypes.indexOf(ticket), 
                                  'name', 
                                  e.target.value
                                )}
                              />
                              <select
                                className="px-3 py-2 border rounded-md"
                                value={ticket.category}
                                onChange={(e) => updateTicketType(
                                  ticketTypes.indexOf(ticket),
                                  'category',
                                  e.target.value
                                )}
                              >
                                <option value="general">General</option>
                                <option value="vip">VIP</option>
                                <option value="early_bird">Early Bird</option>
                              </select>
                              <Input
                                type="number"
                                placeholder="Price"
                                value={ticket.price}
                                onChange={(e) => updateTicketType(
                                  ticketTypes.indexOf(ticket),
                                  'price',
                                  parseFloat(e.target.value)
                                )}
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="Quantity"
                                  value={ticket.allocatedQuantity}
                                  onChange={(e) => updateTicketType(
                                    ticketTypes.indexOf(ticket),
                                    'allocatedQuantity',
                                    parseInt(e.target.value)
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTicketType(ticketTypes.indexOf(ticket))}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTicketType(day._id, day.dayLabel)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Ticket Type for {day.dayLabel}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Single event ticket configuration
                <div className="space-y-3">
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Ticket name (e.g., VIP)"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={ticket.category}
                        onChange={(e) => updateTicketType(index, 'category', e.target.value)}
                      >
                        <option value="general">General</option>
                        <option value="vip">VIP</option>
                        <option value="early_bird">Early Bird</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value))}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={ticket.allocatedQuantity}
                          onChange={(e) => updateTicketType(index, 'allocatedQuantity', parseInt(e.target.value))}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicketType(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => addTicketType()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ticket Type
                  </Button>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => isMultiDay ? setCurrentStep(2) : saveConfiguration()}
                  disabled={ticketTypes.length === 0 || isLoading}
                >
                  {isMultiDay ? "Next: Configure Bundles" : "Save Configuration"}
                  {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 2:
        // Bundle configuration (multi-day only)
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Configure Bundle Packages
              </h2>
              
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleGenerateBundles}
                >
                  Auto-Generate Standard Bundles
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or create custom bundles</span>
                  </div>
                </div>
                
                {bundles.map((bundle, bundleIndex) => (
                  <div key={bundleIndex} className="border rounded-lg p-4 space-y-3">
                    <Input
                      placeholder="Bundle name (e.g., Weekend Pass)"
                      value={bundle.name}
                      onChange={(e) => {
                        const updated = [...bundles];
                        updated[bundleIndex].name = e.target.value;
                        setBundles(updated);
                      }}
                    />
                    <Textarea
                      placeholder="Bundle description"
                      value={bundle.description}
                      onChange={(e) => {
                        const updated = [...bundles];
                        updated[bundleIndex].description = e.target.value;
                        setBundles(updated);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Bundle price"
                      value={bundle.bundlePrice}
                      onChange={(e) => {
                        const updated = [...bundles];
                        updated[bundleIndex].bundlePrice = parseFloat(e.target.value);
                        setBundles(updated);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBundles(bundles.filter((_, i) => i !== bundleIndex))}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 mr-2" />
                      Remove Bundle
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addBundle}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Bundle
                </Button>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={saveConfiguration}
                  disabled={isLoading}
                >
                  Save All Configuration
                  {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {isMultiDay && (
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-400'}`}>
              1
            </div>
            <span className="ml-2">Ticket Types</span>
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-400'}`}>
              2
            </div>
            <span className="ml-2">Bundles</span>
          </div>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
}