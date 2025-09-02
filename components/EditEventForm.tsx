"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar24 } from "@/components/events/Calendar24";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface EditEventFormProps {
  event: {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    doorPrice?: number;
    isTicketed?: boolean;
  };
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const updateEvent = useMutation(api.events.updateEvent);
  
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    location: event.location || "",
    eventDate: new Date(event.eventDate),
    price: event.price || 0,
    totalTickets: event.totalTickets || 0,
    doorPrice: event.doorPrice || 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateEvent({
        eventId: event._id,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        eventDate: formData.eventDate.getTime(),
        price: formData.price,
        totalTickets: formData.totalTickets,
        doorPrice: formData.doorPrice,
      });
      
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
  
  const getTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleDateTimeChange = (date: Date | undefined, timeString: string) => {
    if (!date) return;
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    setFormData(prev => ({ ...prev, eventDate: newDate }));
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/organizer/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update your event details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Event Date & Time</Label>
              <Calendar24
                date={new Date(formData.eventDate.getFullYear(), formData.eventDate.getMonth(), formData.eventDate.getDate())}
                time={getTimeString(formData.eventDate)}
                onDateChange={(date) => handleDateTimeChange(date, getTimeString(formData.eventDate))}
                onTimeChange={(time) => handleDateTimeChange(formData.eventDate, time)}
                minDate={new Date()}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalTickets">Total Tickets</Label>
                <Input
                  id="totalTickets"
                  type="number"
                  min="0"
                  value={formData.totalTickets}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalTickets: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doorPrice">Door Price ($)</Label>
              <Input
                id="doorPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.doorPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, doorPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href="/organizer/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}