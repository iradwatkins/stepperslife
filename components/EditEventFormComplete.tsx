"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar24 } from "@/components/events/Calendar24";
import { 
  ArrowLeft, Save, Plus, Trash2, Package, Ticket, 
  Users, DollarSign, Calendar, MapPin, Image as ImageIcon,
  Settings, Tag, ArrowUpCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ensureLocalDate, toTimestamp, getTimeInputValue } from "@/lib/date-utils";
import ImageUploadField from "@/components/ImageUploadField";

interface EditEventFormCompleteProps {
  event: any;
}

interface TicketType {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  allocatedQuantity: number;
  hasEarlyBird: boolean;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: Date;
}

interface Bundle {
  _id?: string;
  name: string;
  description?: string;
  includedTickets: {
    ticketTypeId: string;
    ticketName: string;
  }[];
  bundlePrice: number;
  isActive: boolean;
}

export default function EditEventFormComplete({ event }: EditEventFormCompleteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const updateEvent = useMutation(api.events.updateEvent);
  const updateTicketType = useMutation(api.ticketTypes.updateTicketType);
  const createTicketType = useMutation(api.ticketTypes.createTicketType);
  const deleteTicketType = useMutation(api.ticketTypes.deleteTicketType);
  const createBundle = useMutation(api.multiDayEvents.createBundle);
  const updateAffiliate = useMutation(api.affiliates.updateEventAffiliateSettings);
  
  // Fetch existing data
  const ticketTypes = useQuery(api.ticketTypes.getEventTicketTypes, {
    eventId: event._id,
  });
  
  const bundles = useQuery(api.multiDayEvents.getBundles, {
    eventId: event._id,
  });
  
  const eventDays = useQuery(api.multiDayEvents.getEventDays, {
    eventId: event._id,
  });
  
  const affiliateProgram = useQuery(api.affiliates.getEventAffiliateProgram, {
    eventId: event._id,
  });
  
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    location: event.location || "",
    eventDate: ensureLocalDate(event.eventDate) || new Date(),
    endDate: ensureLocalDate(event.endDate),
    price: event.price || 0,
    totalTickets: event.totalTickets || 0,
    doorPrice: event.doorPrice || 0,
    isTicketed: event.isTicketed || false,
    imageUrl: event.imageUrl || "",
    categories: event.categories || [],
  });
  
  const [localTickets, setLocalTickets] = useState<TicketType[]>([]);
  const [localBundles, setLocalBundles] = useState<Bundle[]>([]);
  const [affiliateSettings, setAffiliateSettings] = useState({
    enabled: false,
    commissionPercent: 10,
    totalAllocated: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Initialize local state when data loads
  useEffect(() => {
    if (ticketTypes) {
      setLocalTickets(ticketTypes.map(t => ({
        _id: t._id,
        name: t.name,
        description: t.description || "",
        price: t.price,
        allocatedQuantity: t.allocatedQuantity,
        hasEarlyBird: t.hasEarlyBird || false,
        earlyBirdPrice: t.earlyBirdPrice,
        earlyBirdDeadline: ensureLocalDate(t.earlyBirdDeadline) || undefined,
      })));
    }
  }, [ticketTypes]);
  
  useEffect(() => {
    if (bundles) {
      setLocalBundles(bundles);
    }
  }, [bundles]);
  
  useEffect(() => {
    if (affiliateProgram) {
      setAffiliateSettings({
        enabled: affiliateProgram.isActive,
        commissionPercent: affiliateProgram.commissionRate * 100,
        totalAllocated: affiliateProgram.totalAllocatedTickets || 0,
      });
    }
  }, [affiliateProgram]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Update main event details
      await updateEvent({
        eventId: event._id,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        eventDate: toTimestamp(formData.eventDate),
        endDate: toTimestamp(formData.endDate) || undefined,
        price: formData.price,
        totalTickets: formData.totalTickets,
        doorPrice: formData.doorPrice,
        isTicketed: formData.isTicketed,
        imageUrl: formData.imageUrl,
        categories: formData.categories,
      });
      
      // Update ticket types
      for (const ticket of localTickets) {
        if (ticket._id) {
          // Update existing ticket
          await updateTicketType({
            ticketTypeId: ticket._id as Id<"ticketTypes">,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            allocatedQuantity: ticket.allocatedQuantity,
            hasEarlyBird: ticket.hasEarlyBird,
            earlyBirdPrice: ticket.earlyBirdPrice,
            earlyBirdDeadline: toTimestamp(ticket.earlyBirdDeadline),
          });
        } else {
          // Create new ticket
          await createTicketType({
            eventId: event._id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            allocatedQuantity: ticket.allocatedQuantity,
            hasEarlyBird: ticket.hasEarlyBird,
            earlyBirdPrice: ticket.earlyBirdPrice,
            earlyBirdDeadline: toTimestamp(ticket.earlyBirdDeadline),
          });
        }
      }
      
      // Update affiliate settings
      if (affiliateProgram) {
        await updateAffiliate({
          eventId: event._id,
          isActive: affiliateSettings.enabled,
          commissionRate: affiliateSettings.commissionPercent / 100,
          totalAllocatedTickets: affiliateSettings.totalAllocated,
        });
      }
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      
      router.push("/organizer/events");
      router.refresh();
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addTicketType = () => {
    setLocalTickets([...localTickets, {
      name: "",
      description: "",
      price: 0,
      allocatedQuantity: 100,
      hasEarlyBird: false,
    }]);
  };
  
  const removeTicketType = async (index: number) => {
    const ticket = localTickets[index];
    if (ticket._id) {
      // Delete from database
      await deleteTicketType({ ticketTypeId: ticket._id as Id<"ticketTypes"> });
    }
    setLocalTickets(localTickets.filter((_, i) => i !== index));
  };
  
  const updateTicket = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...localTickets];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTickets(updated);
  };
  
  const addBundle = () => {
    setLocalBundles([...localBundles, {
      name: "",
      includedTickets: [],
      bundlePrice: 0,
      isActive: true,
    }]);
  };
  
  const removeBundle = (index: number) => {
    setLocalBundles(localBundles.filter((_, i) => i !== index));
  };
  
  const updateBundle = (index: number, field: keyof Bundle, value: any) => {
    const updated = [...localBundles];
    updated[index] = { ...updated[index], [field]: value };
    setLocalBundles(updated);
  };
  
  const toggleTicketInBundle = (bundleIndex: number, ticketId: string, ticketName: string) => {
    const updated = [...localBundles];
    const bundle = updated[bundleIndex];
    
    const existingIndex = bundle.includedTickets.findIndex(t => t.ticketTypeId === ticketId);
    
    if (existingIndex >= 0) {
      bundle.includedTickets = bundle.includedTickets.filter((_, i) => i !== existingIndex);
    } else {
      bundle.includedTickets.push({ ticketTypeId: ticketId, ticketName });
    }
    
    setLocalBundles(updated);
  };
  
  const handleDateTimeChange = (date: Date | undefined, timeString: string) => {
    if (!date) return;
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    setFormData(prev => ({ ...prev, eventDate: newDate }));
  };
  
  const getTimeString = (date: Date | null) => {
    if (!date) return '00:00';
    return getTimeInputValue(date);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/organizer/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">Edit Event</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          {/* Event Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
                <CardDescription>Basic details about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter event name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your event"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event venue or address"
                    required
                  />
                </div>
                
                {/* Date and Time Selection */}
                <div className="space-y-2">
                  <Label>Event Date & Time</Label>
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      {format(formData.eventDate, "MMM dd, yyyy")}
                    </Button>
                    <Input
                      type="time"
                      value={getTimeString(formData.eventDate)}
                      onChange={(e) => handleDateTimeChange(formData.eventDate, e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  {showCalendar && (
                    <div className="mt-2 p-4 border rounded-lg bg-white shadow-lg">
                      <Calendar24
                        selected={formData.eventDate}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            newDate.setHours(formData.eventDate.getHours());
                            newDate.setMinutes(formData.eventDate.getMinutes());
                            setFormData(prev => ({ ...prev, eventDate: newDate }));
                            setShowCalendar(false);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  )}
                </div>
                
                {/* Ticketing Options */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ticketed"
                    checked={formData.isTicketed}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isTicketed: checked }))
                    }
                  />
                  <Label htmlFor="ticketed">Selling tickets online</Label>
                </div>
                
                {formData.isTicketed && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalTickets">Total Tickets</Label>
                      <Input
                        id="totalTickets"
                        type="number"
                        value={formData.totalTickets}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          totalTickets: parseInt(e.target.value) || 0 
                        }))}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          price: parseFloat(e.target.value) || 0 
                        }))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
                
                {!formData.isTicketed && (
                  <div className="space-y-2">
                    <Label htmlFor="doorPrice">Door Price</Label>
                    <Input
                      id="doorPrice"
                      type="number"
                      value={formData.doorPrice}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        doorPrice: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Types</CardTitle>
                <CardDescription>Manage different ticket types and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {localTickets.map((ticket, index) => (
                  <Card key={ticket._id || index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Ticket Type {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicketType(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ticket Name</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => updateTicket(index, 'name', e.target.value)}
                            placeholder="e.g., General Admission"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => updateTicket(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity Available</Label>
                          <Input
                            type="number"
                            value={ticket.allocatedQuantity}
                            onChange={(e) => updateTicket(index, 'allocatedQuantity', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={ticket.hasEarlyBird}
                              onCheckedChange={(checked) => updateTicket(index, 'hasEarlyBird', checked)}
                            />
                            <Label>Early Bird Pricing</Label>
                          </div>
                          {ticket.hasEarlyBird && (
                            <Input
                              type="number"
                              value={ticket.earlyBirdPrice || 0}
                              onChange={(e) => updateTicket(index, 'earlyBirdPrice', parseFloat(e.target.value) || 0)}
                              placeholder="Early bird price"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={ticket.description}
                          onChange={(e) => updateTicket(index, 'description', e.target.value)}
                          placeholder="What's included with this ticket?"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTicketType}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Type
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bundles Tab */}
          <TabsContent value="bundles">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Bundles</CardTitle>
                <CardDescription>Create package deals for multiple tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {localBundles.map((bundle, bundleIndex) => (
                  <Card key={bundle._id || bundleIndex} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Bundle {bundleIndex + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBundle(bundleIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bundle Name</Label>
                          <Input
                            value={bundle.name}
                            onChange={(e) => updateBundle(bundleIndex, 'name', e.target.value)}
                            placeholder="e.g., Weekend Pass"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bundle Price</Label>
                          <Input
                            type="number"
                            value={bundle.bundlePrice}
                            onChange={(e) => updateBundle(bundleIndex, 'bundlePrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Included Tickets</Label>
                        <div className="space-y-2">
                          {localTickets.map((ticket) => (
                            <label
                              key={ticket._id || ticket.name}
                              className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={bundle.includedTickets.some(t => 
                                  t.ticketTypeId === (ticket._id || ticket.id)
                                )}
                                onChange={() => toggleTicketInBundle(
                                  bundleIndex, 
                                  ticket._id || ticket.id || '',
                                  ticket.name
                                )}
                              />
                              <span>{ticket.name} - ${ticket.price}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {bundle.includedTickets.length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            Savings: ${(
                              localTickets
                                .filter(t => bundle.includedTickets.some(bt => 
                                  bt.ticketTypeId === (t._id || t.id)
                                ))
                                .reduce((sum, t) => sum + t.price, 0) - bundle.bundlePrice
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBundle}
                  className="w-full"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Bundle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Affiliates Tab */}
          <TabsContent value="affiliates">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Program</CardTitle>
                <CardDescription>Configure affiliate sales and commissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={affiliateSettings.enabled}
                    onCheckedChange={(checked) => 
                      setAffiliateSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                  <Label>Enable Affiliate Program</Label>
                </div>
                
                {affiliateSettings.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Commission Rate (%)</Label>
                        <Input
                          type="number"
                          value={affiliateSettings.commissionPercent}
                          onChange={(e) => setAffiliateSettings(prev => ({ 
                            ...prev, 
                            commissionPercent: parseInt(e.target.value) || 0 
                          }))}
                          min="0"
                          max="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tickets Allocated to Affiliates</Label>
                        <Input
                          type="number"
                          value={affiliateSettings.totalAllocated}
                          onChange={(e) => setAffiliateSettings(prev => ({ 
                            ...prev, 
                            totalAllocated: parseInt(e.target.value) || 0 
                          }))}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Affiliate Settings</h4>
                      <p className="text-sm text-blue-700">
                        Affiliates will earn {affiliateSettings.commissionPercent}% commission on each sale.
                        {affiliateSettings.totalAllocated > 0 && 
                          ` ${affiliateSettings.totalAllocated} tickets are reserved for affiliate sales.`
                        }
                      </p>
                    </div>
                    
                    <Link href={`/organizer/events/${event._id}/affiliates`}>
                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Affiliates
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Event Images</CardTitle>
                <CardDescription>Add images to make your event stand out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUploadField
                  value={formData.imageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url || "" }))}
                  label="Main Event Image"
                />
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image Tips for Affiliates
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• This image will be shared by affiliates on social media</li>
                    <li>• Use high-quality images (at least 1200x630px)</li>
                    <li>• Landscape orientation works best for social sharing</li>
                    <li>• Include your event name or branding in the image</li>
                    <li>• Keep file size under 5MB for faster loading</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Link href="/organizer/events" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}