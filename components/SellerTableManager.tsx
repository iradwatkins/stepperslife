'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Users, DollarSign, TrendingUp, Table, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function SellerTableManager({ eventId }: { eventId: Id<"events"> }) {
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.email || '';
  const [showSellForm, setShowSellForm] = useState(false);
  const [formData, setFormData] = useState({
    buyerEmail: '',
    buyerName: '',
    companyName: '',
    tableName: 'Standard Table',
    seatCount: 10,
    pricePerSeat: 0,
    paymentReference: '',
    paymentMethod: 'manual',
  });

  // Get event details
  const event = useQuery(api.events.getById, { eventId });
  const tableStats = useQuery(api.tableSales.getTableSalesStats, { eventId });
  const eventTables = useQuery(api.tableSales.getEventTables, { 
    eventId, 
    organizerId: userId 
  });
  const tableOptions = useQuery(api.tableSales.getTableOptions, { eventId });
  
  const sellTable = useMutation(api.tableSales.sellTable);

  const handleSellTable = async () => {
    if (!event) return;
    
    try {
      const result = await sellTable({
        eventId,
        buyerEmail: formData.buyerEmail,
        buyerName: formData.buyerName,
        companyName: formData.companyName || undefined,
        tableConfig: {
          tableName: formData.tableName,
          seatCount: formData.seatCount,
          pricePerSeat: formData.pricePerSeat || event.price,
          ticketType: formData.tableName.includes('VIP') ? 'VIP' : 'GA',
        },
        paymentReference: formData.paymentReference,
        paymentMethod: formData.paymentMethod,
        sellerId: userId,
      });
      
      alert(`Table sold successfully! Created ${result.ticketIds.length} tickets.`);
      setShowSellForm(false);
      setFormData({
        buyerEmail: '',
        buyerName: '',
        companyName: '',
        tableName: 'Standard Table',
        seatCount: 10,
        pricePerSeat: event.price,
        paymentReference: '',
        paymentMethod: 'manual',
      });
    } catch (error) {
      console.error('Error selling table:', error);
      alert('Failed to sell table: ' + error);
    }
  };

  if (!event || !tableStats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Table className="w-4 h-4 mr-2" />
              Tables Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tableStats.totalTables}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Seats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tableStats.totalSeats}</p>
            <p className="text-xs text-gray-500">{tableStats.distributedSeats} distributed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Distribution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {tableStats.totalSeats > 0 
                ? Math.round((tableStats.distributedSeats / tableStats.totalSeats) * 100) 
                : 0}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Table Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${tableStats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sell Table Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Table Sales</h3>
        <Button onClick={() => setShowSellForm(!showSellForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Sell Table Manually
        </Button>
      </div>

      {/* Sell Table Form */}
      {showSellForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>Sell Table Directly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buyer Name *</label>
                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Buyer Email *</label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({...formData, buyerEmail: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Table Type</label>
                <select
                  value={formData.tableName}
                  onChange={(e) => setFormData({...formData, tableName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {tableOptions?.configurations.map((config, idx) => (
                    <option key={idx} value={config.name}>{config.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Number of Seats</label>
                <input
                  type="number"
                  value={formData.seatCount}
                  onChange={(e) => setFormData({...formData, seatCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max="20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price per Seat</label>
                <input
                  type="number"
                  value={formData.pricePerSeat}
                  onChange={(e) => setFormData({...formData, pricePerSeat: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="manual">Manual (Cash/Check)</option>
                  <option value="square">Square</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Reference</label>
                <input
                  type="text"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Invoice #, check #, etc."
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">
                Total Amount: <span className="font-bold text-lg">
                  ${(formData.seatCount * (formData.pricePerSeat || event.price)).toFixed(2)}
                </span>
              </p>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSellTable} className="flex-1">
                Complete Sale
              </Button>
              <Button 
                onClick={() => setShowSellForm(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables List */}
      <div className="space-y-4">
        {eventTables && eventTables.length > 0 ? (
          eventTables.map((table) => (
            <Card key={table.groupPurchaseId}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{table.tableName}</h4>
                    <p className="text-sm text-gray-600">
                      Buyer: {table.buyerEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      {table.seatCount} seats • ${table.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Purchased: {new Date(table.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Distribution:</span>
                      <span className="font-semibold">
                        {table.distributedSeats}/{table.seatCount}
                      </span>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(table.distributedSeats / table.seatCount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Seat Details */}
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-6 gap-2">
                    {table.tickets.map((ticket) => (
                      <div
                        key={ticket.ticketId}
                        className={`text-center p-2 rounded text-xs ${
                          ticket.isClaimed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ticket.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              No tables sold yet. Click "Sell Table Manually" to record a table sale.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}