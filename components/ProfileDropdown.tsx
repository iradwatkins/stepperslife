"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { ROUTES } from "@/lib/routes";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Calendar,
  CreditCard,
  HelpCircle,
  Shield,
  Ticket,
  Clock,
  DollarSign,
  UserPlus,
  ScanLine,
  Receipt
} from "lucide-react";

export default function ProfileDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin, isOrganizer, isStaff, isAffiliate, primaryRole } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress;
    }
    return "User";
  };

  // Build menu items based on user role
  const menuItems = [];

  // === CUSTOMER ITEMS (Everyone gets these) ===
  menuItems.push(
    {
      label: "Profile",
      href: ROUTES.PROFILE.HOME,
      icon: User,
    },
    {
      label: "My Tickets",
      href: ROUTES.PROFILE.TICKETS,
      icon: Ticket,
    },
    {
      label: "Purchase History",
      href: ROUTES.PROFILE.HISTORY,
      icon: Receipt,
    }
  );

  // === ADMIN-SPECIFIC ITEMS ===
  if (isAdmin) {
    menuItems.push({
      label: "Admin Dashboard",
      href: ROUTES.ADMIN.DASHBOARD,
      icon: Shield,
      className: "bg-red-50 dark:bg-red-900/20",
      divider: true,
    });
  }

  // === ORGANIZER-SPECIFIC ITEMS ===
  if (isOrganizer) {
    menuItems.push({
      label: "Organizer Dashboard",
      href: ROUTES.ORGANIZER.DASHBOARD,
      icon: LayoutDashboard,
      divider: !isAdmin, // Only add divider if not admin (admin already has one)
    });
    menuItems.push({
      label: "My Events",
      href: ROUTES.ORGANIZER.EVENTS,
      icon: Calendar,
    });
    menuItems.push({
      label: "Earnings",
      href: ROUTES.ORGANIZER.EARNINGS,
      icon: DollarSign,
    });
    menuItems.push({
      label: "Affiliates",
      href: ROUTES.ORGANIZER.AFFILIATES,
      icon: UserPlus,
    });
  }

  // === AFFILIATE-SPECIFIC ITEMS ===
  if (isAffiliate && !isOrganizer) { // Don't duplicate if they're also an organizer
    menuItems.push({
      label: "Affiliate Dashboard",
      href: "/affiliate",
      icon: UserPlus,
      divider: true,
    });
    menuItems.push({
      label: "My Commissions",
      href: "/affiliate/commissions",
      icon: DollarSign,
    });
  }

  // === STAFF-SPECIFIC ITEMS ===
  if (isStaff) {
    menuItems.push({
      label: "Staff Portal",
      href: "/staff",
      icon: ScanLine,
      divider: !isOrganizer && !isAffiliate, // Only add divider if they don't have other roles
    });
  }

  // === COMMON ITEMS (Everyone gets these) ===
  menuItems.push(
    {
      label: "Payment Methods",
      href: ROUTES.PROFILE.PAYMENT_METHODS,
      icon: CreditCard,
      divider: true,
    },
    {
      label: "Settings",
      href: ROUTES.PROFILE.SETTINGS,
      icon: Settings,
    },
    {
      label: "Help & Support",
      href: ROUTES.PROFILE.HELP,
      icon: HelpCircle,
    },
    {
      label: "Sign Out",
      href: "#",
      icon: LogOut,
      className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
      divider: true,
      onClick: () => signOut(),
    }
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-semibold text-sm">
          {getUserInitial()}
        </div>
        
        {/* Name (hidden on mobile) */}
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
          {getDisplayName()}
        </span>
        
        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {getDisplayName()}
            </p>
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.primaryEmailAddress.emailAddress}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                {item.divider && (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                )}
                {item.onClick ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      item.className || ""
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      item.className || ""
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}