'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  QrCode, 
  Shield, 
  Mail,
  Trash2,
  UserCheck,
  Clock,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function EventStaffPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'scanner' | 'manager'>('scanner');
  const [isInviting, setIsInviting] = useState(false);
  
  const eventId = params.id as string;
  
  // Get event details
  const event = useQuery(api.events.getById, { eventId: eventId as Id<"events"> });
  
  // Get staff members for this event
  const staffMembers = useQuery(api.eventStaff.getEventStaff, { 
    eventId: eventId as Id<"events"> 
  });
  
  // Get scan logs for the event
  const scanLogs = useQuery(api.eventStaff.getEventScanLogs, {
    eventId: eventId as Id<"events">,
    limit: 10
  });
  
  // Mutations
  const inviteStaff = useMutation(api.eventStaff.inviteStaffMember);
  const removeStaff = useMutation(api.eventStaff.removeStaffMember);
  
  // Check if user is the event owner
  const isOwner = event?.userId === user?.id;
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to manage event staff</p>
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
          <p className="text-gray-500">You don\'t have permission to manage staff for this event</p>
        </div>
      </div>
    );
  }
  
  const handleInviteStaff = async () => {
    if (!inviteEmail || !user?.id) return;
    
    setIsInviting(true);
    try {
      const result = await inviteStaff({
        eventId: eventId as Id<"events">,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user.id,
      });
      
      toast({
        title: "Invitation Sent",
        description: result.message,
      });
      
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('scanner');
    } catch (error: Error | unknown) {
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error.message,
      });
    } finally {
      setIsInviting(false);
    }
  };
  
  const handleRemoveStaff = async (staffId: Id<"eventStaff">, email: string) => {
    if (!user?.id) return;
    
    if (confirm(`Are you sure you want to remove ${email} from staff?`)) {
      try {
        await removeStaff({
          staffId,
          removedBy: user.id,
          reason: "Removed by organizer",
        });
        
        toast({
          title: "Staff member removed",
          description: `${email} has been removed from event staff`,
        });
      } catch (error: Error | unknown) {
        toast({
          variant: "destructive",
          title: "Failed to remove staff",
          description: error.message,
        });
      }
    }
  };
  
  // Calculate stats
  const totalStaff = staffMembers?.filter(m => m.isActive).length || 0;
  const totalScans = staffMembers?.reduce((sum, m) => sum + m.totalScans, 0) || 0;
  const pendingInvites = staffMembers?.filter(m => m.invitationStatus === 'pending').length || 0;
  
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
            <h1 className="text-3xl font-bold text-gray-900">Event Staff & Scanners</h1>
            <p className="text-gray-600 mt-2">{event.name}</p>
            <p className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/organizer/events/${eventId}/affiliates`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Affiliates
            </Link>
            <Button onClick={() => setShowInviteModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Staff
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{totalStaff}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{totalScans}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold">{pendingInvites}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Scanner Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const scanUrl = `${window.location.origin}/events/${eventId}/scan`;
                navigator.clipboard.writeText(scanUrl);
                toast({
                  title: "Link copied",
                  description: "Scanner link copied to clipboard",
                });
              }}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Staff List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {staffMembers && staffMembers.length > 0 ? (
            <div className="space-y-4">
              {staffMembers.map((member) => (
                <div 
                  key={member._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {member.role === 'manager' ? (
                        <Shield className="w-5 h-5 text-blue-600" />
                      ) : (
                        <QrCode className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={member.role === 'manager' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <Badge variant={
                          member.invitationStatus === 'accepted' ? 'default' :
                          member.invitationStatus === 'pending' ? 'outline' :
                          'destructive'
                        }>
                          {member.invitationStatus}
                        </Badge>
                        {!member.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{member.totalScans} scans</p>
                      {member.lastScanAt && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(member.lastScanAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {member.isActive && member.role !== 'organizer' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStaff(member._id as Id<"eventStaff">, member.email)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Members Yet</h3>
              <p className="text-gray-500 mb-4">
                Invite staff members to help scan tickets at your event
              </p>
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Your First Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Scan Activity */}
      {scanLogs && scanLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Scan Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanLogs.map((log) => (
                <div key={log._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      log.scanResult === 'success' ? 'default' :
                      log.scanResult === 'already_scanned' ? 'secondary' :
                      'destructive'
                    }>
                      {log.scanResult}
                    </Badge>
                    <div>
                      <p className="text-sm">
                        {log.ticketHolderName || 'Unknown'} - {log.ticketType || 'General'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Scanned by {log.scannerEmail}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(log.scanTimestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Invite Staff Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'scanner' | 'manager')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="scanner">Scanner - Can scan tickets only</option>
                  <option value="manager">Manager - Can scan tickets and manage staff</option>
                </select>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  The invited person must be registered on SteppersLife to accept the invitation.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteStaff}
                disabled={!inviteEmail || isInviting}
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}