"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useClerk } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  User,
  Ticket,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  Store,
  LogOut,
  ChevronDown,
  UserCircle,
  Clock,
  Heart,
  Users,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuSection {
  label?: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  roleRequired?: "admin" | "organizer";
}

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isAdmin, isOrganizer, primaryRole } = useUserRole();
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isSignedIn || !user) return null;

  // Build menu sections based on user role
  const menuSections: MenuSection[] = [
    // Customer Section - Always visible
    {
      label: "My Account",
      items: [
        {
          label: "Profile",
          href: "/profile",
          icon: UserCircle,
          description: "View your profile"
        },
        {
          label: "My Tickets",
          href: "/profile/tickets",
          icon: Ticket,
          description: "View purchased tickets"
        },
        {
          label: "Purchase History",
          href: "/profile/history",
          icon: Clock,
          description: "Past purchases"
        },
        {
          label: "Wishlist",
          href: "/profile/wishlist",
          icon: Heart,
          description: "Saved events"
        },
      ]
    }
  ];

  // Add Organizer Section if user is an organizer
  if (isOrganizer) {
    menuSections.push({
      label: "Organizer Tools",
      items: [
        {
          label: "Organizer Dashboard",
          href: "/organizer",
          icon: Store,
          description: "Manage your events",
          badge: "Pro"
        },
        {
          label: "My Events",
          href: "/organizer/events",
          icon: Calendar,
          description: "Events you organize"
        },
        {
          label: "Analytics",
          href: "/organizer/analytics",
          icon: TrendingUp,
          description: "Sales & metrics"
        },
        {
          label: "Earnings",
          href: "/organizer/earnings",
          icon: DollarSign,
          description: "Revenue & payouts"
        },
        {
          label: "Affiliates",
          href: "/organizer/affiliates",
          icon: Users,
          description: "Affiliate programs"
        },
      ]
    });
  }

  // Add Admin Section if user is admin
  if (isAdmin) {
    menuSections.push({
      label: "Administration",
      items: [
        {
          label: "Admin Panel",
          href: "/admin",
          icon: Shield,
          description: "Platform management",
          badge: "Admin"
        },
      ]
    });
  }

  // Add Settings section
  menuSections.push({
    label: "Settings",
    items: [
      {
        label: "Account Settings",
        href: "/profile/settings",
        icon: Settings,
        description: "Manage your account"
      },
      {
        label: "Payment Methods",
        href: "/profile/payment-methods",
        icon: CreditCard,
        description: "Saved payment info"
      },
    ]
  });

  // Get user display info
  const userEmail = user.emailAddresses?.[0]?.emailAddress || "";
  const userName = user.firstName || userEmail.split("@")[0];
  const userInitial = userName[0]?.toUpperCase() || "U";

  // Determine current context for badge
  const getContextBadge = () => {
    if (pathname.startsWith("/admin")) return { text: "Admin", color: "bg-purple-600" };
    if (pathname.startsWith("/organizer")) return { text: "Organizer", color: "bg-blue-600" };
    return null;
  };

  const contextBadge = getContextBadge();

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isOpen && "bg-gray-100 dark:bg-gray-800"
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          {userInitial}
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden md:flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {userName}
            </span>
            {contextBadge && (
              <span className={cn(
                "px-2 py-0.5 text-xs text-white rounded-full",
                contextBadge.color
              )}>
                {contextBadge.text}
              </span>
            )}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {userInitial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.label && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {section.label}
                    </p>
                  </div>
                )}
                <div className="py-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors",
                        "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                        pathname === item.href && "bg-purple-50 dark:bg-purple-900/20"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4",
                        pathname === item.href 
                          ? "text-purple-600 dark:text-purple-400" 
                          : "text-gray-400 dark:text-gray-500"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            pathname === item.href
                              ? "text-purple-900 dark:text-purple-300"
                              : "text-gray-700 dark:text-gray-300"
                          )}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              item.badge === "Admin" 
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                : item.badge === "Pro"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {sectionIndex < menuSections.length - 1 && (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut(() => router.push("/"));
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}