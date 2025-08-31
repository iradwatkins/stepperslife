"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import SimpleTicketCard from "@/components/SimpleTicketCard";
import { Ticket } from "lucide-react";

export default function MyTicketsPage() {
  // Check if Clerk is disabled
  const skipClerk = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'false' || 
                    process.env.NODE_ENV === 'development';
  
  // Handle Clerk or use mock user
  let user: any = null;
  
  if (skipClerk) {
    // Mock user for development
    user = {
      id: "dev_user_123",
      email: "Appvillagellc@gmail.com"
    };
  } else {
    // Use NextAuth user from useAuth hook
    const authUser = authData?.user;
    user = authUser ? {
      id: authUser.id,
      email: authUser.emailAddresses?.[0]?.emailAddress || ""
    } : {
      id: "dev_user_123",
      email: "Appvillagellc@gmail.com"
    };
  }

  const ticketsData = useQuery(api.tickets.getTicketsByEmail, 
    user?.email ? { email: user.email } : "skip"
  );

  if (!ticketsData) return null;

  const tickets = ticketsData || [];
  const validTickets = tickets.filter((t: any) => t.status === "valid");
  const otherTickets = tickets.filter((t: any) => t.status !== "valid");

  const upcomingTickets = validTickets.filter(
    (t: any) => t.event && t.event.date > Date.now()
  );
  const pastTickets = validTickets.filter(
    (t: any) => t.event && t.event.date <= Date.now()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="mt-2 text-gray-600">
              Manage and view all your tickets in one place
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Ticket className="w-5 h-5" />
              <span className="font-medium">
                {tickets.length} Total Tickets
              </span>
            </div>
          </div>
        </div>

        {upcomingTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket: any) => (
                <SimpleTicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {pastTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket: any) => (
                <SimpleTicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {otherTickets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Other Tickets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTickets.map((ticket: any) => (
                <SimpleTicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No tickets yet
            </h3>
            <p className="text-gray-600 mt-1">
              When you purchase tickets, they&apos;ll appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
