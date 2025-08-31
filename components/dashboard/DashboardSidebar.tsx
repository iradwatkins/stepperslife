"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CogIcon,
  CreditCardIcon,
  ChartPieIcon,
  TableCellsIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBarIcon,
    children: [
      { name: "Revenue", href: "/dashboard/analytics/revenue", icon: CurrencyDollarIcon },
      { name: "Sales", href: "/dashboard/analytics/sales", icon: ArrowTrendingUpIcon },
      { name: "Users", href: "/dashboard/analytics/users", icon: UserGroupIcon },
    ],
  },
  {
    name: "Events",
    href: "/dashboard/events",
    icon: CalendarIcon,
    children: [
      { name: "All Events", href: "/dashboard/events", icon: Squares2X2Icon },
      { name: "My Events", href: "/dashboard/events/my", icon: CalendarIcon },
      { name: "Create Event", href: "/seller/new-event", icon: CalendarIcon },
    ],
  },
  {
    name: "Tickets",
    href: "/dashboard/tickets",
    icon: TicketIcon,
    children: [
      { name: "All Tickets", href: "/dashboard/tickets", icon: TicketIcon },
      { name: "Sold Tickets", href: "/dashboard/tickets/sold", icon: TicketIcon },
      { name: "Purchased", href: "/tickets", icon: TicketIcon },
    ],
  },
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: CreditCardIcon,
    children: [
      { name: "Transactions", href: "/dashboard/payments/transactions", icon: BanknotesIcon },
      { name: "Payouts", href: "/dashboard/payments/payouts", icon: CurrencyDollarIcon },
      { name: "Settings", href: "/seller/payment-settings", icon: CogIcon },
    ],
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: UsersIcon,
    adminOnly: true,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: DocumentChartBarIcon,
    children: [
      { name: "Financial", href: "/dashboard/reports/financial", icon: ChartPieIcon },
      { name: "Performance", href: "/dashboard/reports/performance", icon: ArrowTrendingUpIcon },
      { name: "Platform", href: "/admin/revenue", icon: ChartBarIcon, adminOnly: true },
    ],
  },
  {
    name: "Tables",
    href: "/dashboard/tables",
    icon: TableCellsIcon,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: CogIcon,
  },
];

const ADMIN_EMAILS = ["admin@stepperslife.com", "irawatkins@gmail.com"];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = isSignedIn && user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="SteppersLife" className="h-8 w-auto" />
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.name);
          const isItemActive = isActive(item.href);

          return (
            <div key={item.name}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpanded(item.name);
                  } else {
                    setIsMobileOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isItemActive
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-soft-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Link
                  href={hasChildren ? "#" : item.href}
                  className="flex items-center flex-1"
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                    } else {
                      setIsMobileOpen(false);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg mr-3",
                      isItemActive
                        ? "bg-white/20"
                        : "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        isItemActive ? "text-white" : "text-purple-600"
                      )}
                    />
                  </div>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {hasChildren && (
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Submenu */}
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children
                    ?.filter((child) => !child.adminOnly || isAdmin)
                    .map((child) => {
                      const isChildActive = isActive(child.href);
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200",
                            isChildActive
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <child.icon className="w-4 h-4 mr-3" />
                          {child.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white">
          <p className="text-sm font-medium">Need Help?</p>
          <p className="text-xs mt-1 opacity-90">
            Check our documentation or contact support
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="xl:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-soft-md"
      >
        {isMobileOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="xl:hidden fixed inset-0 bg-black/50 z-40"
          />
          <aside className="xl:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}