"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, TrendingUp, Calendar, DollarSign, Users, Ticket } from "lucide-react"
import { format } from "date-fns"

export default function SellerReportsPage() {
  const { user } = useUser()
  const [period, setPeriod] = useState("month")
  const [reportType, setReportType] = useState("revenue")
  
  const userId = user?.id || ""
  
  // Fetch analytics data
  const analytics = useQuery(api.sellers.getAnalytics, { 
    sellerId: userId,
    period: period as "week" | "month" | "year"
  })
  
  const transactions = useQuery(api.sellers.getRecentTransactions, { 
    sellerId: userId,
    limit: 100
  })
  
  const upcomingEvents = useQuery(api.sellers.getUpcomingEvents, { 
    sellerId: userId
  })

  const exportReport = (type: string) => {
    // Generate CSV data
    let csvContent = ""
    
    if (type === "transactions" && transactions) {
      csvContent = "Date,Event,Buyer,Amount,Platform Fee,Provider Fee,Net Payout\n"
      transactions.forEach(t => {
        csvContent += `${format(new Date(t.date), "yyyy-MM-dd")},${t.eventName},${t.buyerName},${t.amount},${t.platformFee},${t.providerFee.toFixed(2)},${t.sellerPayout.toFixed(2)}\n`
      })
    } else if (type === "events" && upcomingEvents) {
      csvContent = "Event Name,Date,Location,Tickets Sold,Revenue\n"
      upcomingEvents.forEach(e => {
        csvContent += `${e.name},${format(new Date(e.date), "yyyy-MM-dd")},${e.location},${e.ticketsSold}/${e.totalCapacity},${e.revenue}\n`
      })
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">View detailed reports and export your data</p>
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "week" ? "This week" : period === "month" ? "This month" : "This year"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {period === "week" ? "This week" : period === "month" ? "This month" : "This year"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.fees?.totalFees?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.fees?.averageFeeRate?.toFixed(1) || 0}% average rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Report</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          <TabsTrigger value="events">Event Performance</TabsTrigger>
          <TabsTrigger value="fees">Fee Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Revenue Summary</CardTitle>
                <Button onClick={() => exportReport("revenue")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Gross Revenue</p>
                    <p className="text-2xl font-bold">${analytics?.totalRevenue?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Revenue (after fees)</p>
                    <p className="text-2xl font-bold">
                      ${((analytics?.totalRevenue || 0) - (analytics?.fees?.totalFees || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Revenue by Payment Method */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Revenue by Payment Method</h4>
                  <div className="space-y-2">
                    {analytics?.revenueByMethod?.map((method) => (
                      <div key={method.method} className="flex justify-between items-center">
                        <span className="capitalize">{method.method}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">{method.percentage.toFixed(1)}%</span>
                          <span className="font-medium">${method.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaction Details</CardTitle>
                <Button onClick={() => exportReport("transactions")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Event</th>
                      <th className="text-left py-2">Buyer</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Fees</th>
                      <th className="text-right py-2">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.slice(0, 20).map((t) => (
                      <tr key={t.id} className="border-b">
                        <td className="py-2">{format(new Date(t.date), "MMM dd")}</td>
                        <td className="py-2">{t.eventName}</td>
                        <td className="py-2">{t.buyerName}</td>
                        <td className="text-right py-2">${t.amount.toFixed(2)}</td>
                        <td className="text-right py-2">
                          ${(t.platformFee + t.providerFee).toFixed(2)}
                        </td>
                        <td className="text-right py-2 font-medium">
                          ${t.sellerPayout.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Event Performance</CardTitle>
                <Button onClick={() => exportReport("events")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Event Name</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Location</th>
                      <th className="text-right py-2">Sold/Total</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents?.map((e) => (
                      <tr key={e.id} className="border-b">
                        <td className="py-2">{e.name}</td>
                        <td className="py-2">{format(new Date(e.date), "MMM dd, yyyy")}</td>
                        <td className="py-2">{e.location}</td>
                        <td className="text-right py-2">
                          {e.ticketsSold}/{e.totalCapacity}
                        </td>
                        <td className="text-right py-2 font-medium">
                          ${e.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Platform Fees ($1.50/ticket)</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.fees?.platformFees?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Provider Fees (2.9%)</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.fees?.providerFees?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total Fees</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.fees?.totalFees?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Average fee rate: {analytics?.fees?.averageFeeRate?.toFixed(2) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}