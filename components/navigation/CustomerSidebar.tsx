"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  Clock,
  Heart,
  Settings,
  CreditCard,
  User,
  Bell,
  HelpCircle,
  ChevronLeft,
  Menu
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/profile",
    icon: LayoutDashboard,
    description: "Your account overview",
  },
  {
    name: "My Tickets",
    href: "/profile/tickets",
    icon: Ticket,
    description: "View your purchased tickets",
    badge: null,
  },
  {
    name: "Purchase History",
    href: "/profile/history",
    icon: Clock,
    description: "Past purchases and receipts",
  },
  {
    name: "Wishlist",
    href: "/profile/wishlist",
    icon: Heart,
    description: "Events you're interested in",
  },
  {
    name: "Payment Methods",
    href: "/profile/payment-methods",
    icon: CreditCard,
    description: "Manage saved payment info",
  },
  {
    name: "Notifications",
    href: "/profile/notifications",
    icon: Bell,
    description: "Email and push preferences",
  },
  {
    name: "Account Settings",
    href: "/profile/settings",
    icon: Settings,
    description: "Profile and security",
  },
  {
    name: "Help & Support",
    href: "/profile/help",
    icon: HelpCircle,
    description: "FAQs and contact support",
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-30 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 pt-16",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}>
            <User className="h-5 w-5 text-purple-600" />
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">My Account</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your profile</p>
              </div>
            )}
          </div>
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
                           (item.href !== "/profile" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0",
                  isActive 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                )} />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!collapsed ? (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">Need Help?</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Visit our help center or contact support
              </p>
              <Link
                href="/profile/help"
                className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-2"
              >
                Get Support
                <ChevronLeft className="h-3 w-3 rotate-180" />
              </Link>
            </div>
          ) : (
            <Link
              href="/profile/help"
              className="flex justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Get Help"
            >
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
        />
      )}
    </>
  );
}