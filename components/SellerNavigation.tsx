"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  FileText,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your sales and earnings",
  },
  {
    name: "Events",
    href: "/seller/events",
    icon: Calendar,
    description: "Manage your events and tickets",
  },
  {
    name: "Earnings",
    href: "/seller/earnings",
    icon: DollarSign,
    description: "Track earnings and request payouts",
  },
  {
    name: "Payment Settings",
    href: "/seller/payment-settings",
    icon: CreditCard,
    description: "Configure payment methods",
    badge: "Important",
  },
  {
    name: "Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
    description: "Detailed sales analytics",
  },
  {
    name: "Customers",
    href: "/seller/customers",
    icon: Users,
    description: "View customer information",
  },
  {
    name: "Reports",
    href: "/seller/reports",
    icon: FileText,
    description: "Download financial reports",
  },
  {
    name: "Settings",
    href: "/seller/settings",
    icon: Settings,
    description: "Account and profile settings",
  },
];

export default function SellerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Seller Portal</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your events and earnings</p>
      </div>
      <nav className="px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-start gap-3 px-3 py-2 rounded-lg transition-colors mb-1",
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}