'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Users, DollarSign, TrendingUp, Ticket } from 'lucide-react';
import Link from 'next/link';
import AffiliateList from '@/components/AffiliateList';
import CreateAffiliateModal from '@/components/CreateAffiliateModal';

export default function EventAffiliatesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const eventId = params.id as string;
  
  // Get event details
  const event = useQuery(api.events.get, { id: eventId as Id<"events"> });
  
  // Get affiliates for this specific event
  const affiliates = useQuery(api.affiliates.getEventAffiliates, { 
    eventId: eventId as Id<"events"> 
  });
  
  // Refresh data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Check if user is the event owner
  const isOwner = event?.userId === user?.id;
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to manage affiliates</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">You don't have permission to manage affiliates for this event</p>
        </div>
      </div>
    );
  }
  
  // Calculate total stats for this event
  const totalTicketsSold = affiliates?.reduce((sum, a) => sum + a.totalSold, 0) || 0;
  const totalCommissionPaid = affiliates?.reduce((sum, a) => sum + a.totalEarned, 0) || 0;
  const activeAffiliates = affiliates?.filter(a => a.isActive).length || 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/organizer/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affiliate Program</h1>
            <p className="text-gray-600 mt-2">{event.name}</p>
            <p className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</p>
          </div>
          
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Affiliates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{activeAffiliates}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Referral Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{totalTicketsSold}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commissions Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">${totalCommissionPaid.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Per Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">
                ${activeAffiliates > 0 
                  ? (totalCommissionPaid / activeAffiliates).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Affiliates List */}
      {affiliates && affiliates.length > 0 ? (
        <AffiliateList 
          affiliates={affiliates.map(a => ({
            ...a,
            eventName: event.name,
            eventDate: event.eventDate
          }))} 
          onRefresh={handleRefresh}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Affiliates Yet</h3>
            <p className="text-gray-500 mb-6">
              Start your affiliate program by adding partners who can promote your event
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Affiliate
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Create Affiliate Modal */}
      {user?.id && (
        <CreateAffiliateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          organizerId={user.id}
        />
      )}
    </div>
  );
}