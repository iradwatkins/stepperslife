"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Revenue Report",
      description: "Monthly revenue breakdown and platform fees",
      icon: DollarSign,
      type: "financial",
    },
    {
      title: "Event Analytics",
      description: "Event performance metrics and attendance rates",
      icon: TrendingUp,
      type: "events",
    },
    {
      title: "User Activity",
      description: "User engagement and registration trends",
      icon: Users,
      type: "users",
    },
    {
      title: "Monthly Summary",
      description: "Complete platform overview for the month",
      icon: Calendar,
      type: "summary",
    },
  ];

  const handleExport = (type: string) => {
    alert(`Export ${type} report (not implemented yet)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and export platform reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <report.icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport(report.type)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleExport(report.type)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>Export data for specific date ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Last 7 Days</Button>
            <Button variant="outline" size="sm">Last 30 Days</Button>
            <Button variant="outline" size="sm">Last Quarter</Button>
            <Button variant="outline" size="sm">Year to Date</Button>
            <Button variant="outline" size="sm">Custom Range</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}