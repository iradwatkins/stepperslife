'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatEventDate } from '@/lib/date-utils';
import { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateAffiliateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string;
}

export default function CreateAffiliateModal({ 
  open, 
  onOpenChange,
  organizerId 
}: CreateAffiliateModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateEmail, setAffiliateEmail] = useState('');
  const [commissionPerTicket, setCommissionPerTicket] = useState('5.00');
  
  // Get organizer's events
  const events = useQuery(api.events.getEventsByUser, { userId: organizerId });
  const createAffiliate = useMutation(api.affiliates.createAffiliate);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId || !affiliateName || !affiliateEmail || !commissionPerTicket) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await createAffiliate({
        eventId: selectedEventId as Id<"events">,
        affiliateName,
        affiliateEmail,
        commissionPerTicket: parseFloat(commissionPerTicket),
        organizerId,
      });
      
      toast({
        title: "Affiliate Created!",
        description: `Referral code: ${result.referralCode}`,
      });
      
      // Reset form
      setAffiliateName('');
      setAffiliateEmail('');
      setCommissionPerTicket('5.00');
      setSelectedEventId('');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Error",
        description: "Failed to create affiliate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Affiliate Partner</DialogTitle>
          <DialogDescription>
            Create an affiliate program for someone to promote your event
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event">Select Event</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name} - {formatEventDate(event.eventDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Affiliate Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Affiliate Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={affiliateName}
              onChange={(e) => setAffiliateName(e.target.value)}
              required
            />
          </div>
          
          {/* Affiliate Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Affiliate Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={affiliateEmail}
              onChange={(e) => setAffiliateEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Commission Per Ticket */}
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Per Ticket ($)</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              value={commissionPerTicket}
              onChange={(e) => setCommissionPerTicket(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Amount the affiliate earns for each ticket sold
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !events?.length}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Affiliate
            </Button>
          </div>
          
          {!events?.length && (
            <p className="text-sm text-amber-600 text-center">
              You need to create an event first before adding affiliates.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}