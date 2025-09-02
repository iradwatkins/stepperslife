'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Link2, Plus, DollarSign, RefreshCw } from "lucide-react";
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import CreateAffiliateModal from '@/components/CreateAffiliateModal';
import AffiliateList from '@/components/AffiliateList';

interface AffiliateClientProps {
  organizerId: string;
  initialData: any;
  error: string | null;
}

export default function AffiliateClient({ organizerId, initialData, error }: AffiliateClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use real-time data with Convex
  const affiliateData = useQuery(api.affiliates.getOrganizerAffiliates, {
    organizerId
  });
  
  // Use real-time data if available, otherwise use initial data
  const data = affiliateData || initialData;
  const stats = data?.stats || {
    activeAffiliates: 0,
    referralSales: 0,
    commissionPaid: 0
  };
  const affiliates = data?.affiliates || [];
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">Error loading affiliates: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Program</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your event affiliates and referrals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Affiliate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Affiliates</p>
                <p className="text-2xl font-bold">{stats.activeAffiliates}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Referral Sales</p>
                <p className="text-2xl font-bold">{stats.referralSales}</p>
              </div>
              <Link2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commission Paid</p>
                <p className="text-2xl font-bold">${stats.commissionPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate List or Empty State */}
      {affiliates.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Affiliate Partners</h2>
          <AffiliateList 
            affiliates={affiliates} 
            onRefresh={handleRefresh}
          />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Partners</CardTitle>
            <CardDescription>People promoting your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No affiliates yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 mb-4">
                Add affiliates to help promote your events
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Affiliate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Create Affiliate Modal */}
      <CreateAffiliateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizerId={organizerId}
      />
    </div>
  );
}