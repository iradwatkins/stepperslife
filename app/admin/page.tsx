"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Settings, Users, FileText, Database } from "lucide-react";

// Admin emails that have access
const ADMIN_EMAILS = [
  "admin@stepperslife.com",
  "irawatkins@gmail.com",
];

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  
  // Check if user is admin
  const isAdmin = user?.emailAddresses[0]?.emailAddress && 
    ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    redirect("/");
  }

  const adminSections = [
    {
      title: "Event Management",
      description: "Create and manage claimable events",
      href: "/admin/events",
      icon: Calendar,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      title: "Revenue Analytics",
      description: "View platform revenue and analytics",
      href: "/admin/revenue",
      icon: DollarSign,
      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Payment Settings",
      description: "Configure payment providers",
      href: "/admin/payments",
      icon: Settings,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    {
      title: "Reports",
      description: "Generate platform reports",
      href: "/admin/reports",
      icon: FileText,
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    },
    {
      title: "Database Reset",
      description: "Reset test data (dev only)",
      href: "/admin/reset-data",
      icon: Database,
      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "Admin"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue (Month)</p>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tickets Sold</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}