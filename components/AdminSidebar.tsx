"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Ticket,
  DollarSign,
  Settings,
  ChevronLeft,
  Menu,
  Shield,
  TrendingUp,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    name: "Events",
    href: "/admin/events/manage",
    icon: Calendar,
    description: "Manage all events",
  },
  {
    name: "Organizers",
    href: "/admin/organizers",
    icon: UserCheck,
    description: "Event organizers",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Platform users",
  },
  {
    name: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
    description: "Ticket management",
  },
  {
    name: "Finance",
    href: "/admin/finance",
    icon: DollarSign,
    description: "Revenue & payouts",
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileText,
    description: "Analytics & exports",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Platform settings",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link 
            href="/admin" 
            className={cn(
              "flex items-center gap-2 font-semibold",
              collapsed && "justify-center"
            )}
          >
            <Shield className="h-6 w-6 text-purple-600" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={cn(
            "flex items-center gap-2 text-xs text-gray-500",
            collapsed && "justify-center"
          )}>
            <AlertCircle className="h-4 w-4" />
            {!collapsed && <span>Admin Access Only</span>}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
        />
      )}
    </>
  );
}