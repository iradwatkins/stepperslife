"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { Home, Store, Shield } from "lucide-react";

interface ContextOption {
  label: string;
  value: "customer" | "organizer" | "admin";
  href: string;
  icon: React.ElementType;
  description: string;
}

export default function ContextSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isOrganizer, roles } = useUserRole();

  // Don't show if user only has one role
  if (roles.length <= 1) return null;

  // Determine current context based on pathname
  const getCurrentContext = (): "customer" | "organizer" | "admin" => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/organizer") || pathname.startsWith("/seller")) return "organizer";
    return "customer";
  };

  const currentContext = getCurrentContext();

  // Build available contexts
  const contexts: ContextOption[] = [
    {
      label: "Customer",
      value: "customer",
      href: "/",
      icon: Home,
      description: "Browse and buy tickets"
    }
  ];

  if (isOrganizer) {
    contexts.push({
      label: "Organizer",
      value: "organizer",
      href: "/organizer",
      icon: Store,
      description: "Manage your events"
    });
  }

  if (isAdmin) {
    contexts.push({
      label: "Admin",
      value: "admin",
      href: "/admin",
      icon: Shield,
      description: "Platform management"
    });
  }

  const handleContextSwitch = (context: ContextOption) => {
    if (context.value !== currentContext) {
      router.push(context.href);
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {contexts.map((context) => {
        const isActive = context.value === currentContext;
        const Icon = context.icon;
        
        return (
          <button
            key={context.value}
            onClick={() => handleContextSwitch(context)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              isActive
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
            title={context.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{context.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function CompactContextSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isOrganizer, roles } = useUserRole();

  if (roles.length <= 1) return null;

  const getCurrentContext = (): "customer" | "organizer" | "admin" => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/organizer") || pathname.startsWith("/seller")) return "organizer";
    return "customer";
  };

  const currentContext = getCurrentContext();

  const getContextIcon = () => {
    switch (currentContext) {
      case "admin": return Shield;
      case "organizer": return Store;
      default: return Home;
    }
  };

  const getContextLabel = () => {
    switch (currentContext) {
      case "admin": return "Admin";
      case "organizer": return "Organizer";
      default: return "Customer";
    }
  };

  const getContextColor = () => {
    switch (currentContext) {
      case "admin": return "bg-purple-600 text-white";
      case "organizer": return "bg-blue-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const Icon = getContextIcon();

  return (
    <div className="relative group">
      <button
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
          getContextColor()
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{getContextLabel()}</span>
      </button>

      {/* Dropdown on hover */}
      <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="p-2">
          <button
            onClick={() => router.push("/")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
              currentContext === "customer" && "bg-gray-100 dark:bg-gray-700"
            )}
          >
            <Home className="w-4 h-4" />
            <span>Customer View</span>
          </button>
          
          {isOrganizer && (
            <button
              onClick={() => router.push("/organizer")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                currentContext === "organizer" && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Store className="w-4 h-4" />
              <span>Organizer Dashboard</span>
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                currentContext === "admin" && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}