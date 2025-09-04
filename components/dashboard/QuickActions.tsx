import Link from "next/link";
import { cn, getButtonClass } from "@/lib/utils/cn";
import { Plus, Calendar, BarChart3, Settings, Users, FileText } from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  variant?: "primary" | "secondary" | "ghost";
}

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      label: "Create Event",
      href: "/organizer/new-event",
      icon: <Plus className="w-5 h-5" />,
      description: "Start selling tickets",
      variant: "primary",
    },
    {
      label: "View Events",
      href: "/organizer/events",
      icon: <Calendar className="w-5 h-5" />,
      description: "Manage your events",
      variant: "secondary",
    },
    {
      label: "Analytics",
      href: "/seller/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "View performance",
      variant: "secondary",
    },
    {
      label: "Customers",
      href: "/seller/customers",
      icon: <Users className="w-5 h-5" />,
      description: "Manage attendees",
      variant: "secondary",
    },
    {
      label: "Reports",
      href: "/seller/reports",
      icon: <FileText className="w-5 h-5" />,
      description: "Download reports",
      variant: "secondary",
    },
    {
      label: "Settings",
      href: "/seller/settings",
      icon: <Settings className="w-5 h-5" />,
      description: "Configure account",
      variant: "ghost",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "group relative flex flex-col items-center justify-center p-4 rounded-lg transition-all",
            "hover:scale-105 hover:shadow-lg",
            action.variant === "primary" 
              ? "bg-cyan-600 text-white hover:bg-cyan-700"
              : action.variant === "ghost"
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-cyan-300"
          )}
        >
          <div className="mb-2">{action.icon}</div>
          <span className="text-sm font-medium">{action.label}</span>
          <span className={cn(
            "text-xs mt-1",
            action.variant === "primary" 
              ? "text-cyan-100"
              : "text-gray-500 dark:text-gray-400"
          )}>
            {action.description}
          </span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Compact version for sidebar or header
 */
export function QuickActionsCompact({ className }: QuickActionsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Link
        href="/organizer/new-event"
        className={cn(getButtonClass("primary"), "flex items-center")}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Event
      </Link>
      <Link
        href="/organizer/events"
        className={cn(getButtonClass("secondary"), "flex items-center")}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Events
      </Link>
      <Link
        href="/seller/analytics"
        className={cn(getButtonClass("ghost"), "flex items-center")}
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Analytics
      </Link>
    </div>
  );
}