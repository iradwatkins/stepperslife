"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import OrganizerSidebar from "@/components/navigation/OrganizerSidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();

  // Clerk will handle redirects automatically

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Allow all signed-in users to access organizer section
  // They become organizers once they create their first event

  return (
    <SidebarProvider>
      <OrganizerLayoutContent>{children}</OrganizerLayoutContent>
    </SidebarProvider>
  );
}

function OrganizerLayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrganizerSidebar />
      
      {/* Main content area with dynamic padding for sidebar */}
      <div className={cn(
        "pt-16 transition-all duration-300",
        collapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}