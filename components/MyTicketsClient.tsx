"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SimpleTicketCard from "@/components/SimpleTicketCard";
import { Ticket } from "lucide-react";

interface MyTicketsClientProps {
  tickets: any[];
}

export default function MyTicketsClient({ tickets }: MyTicketsClientProps) {
  const { user, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return null; // Will redirect in useEffect
  }

  const validTickets = tickets.filter((t: any) => t.status === "valid");
  const otherTickets = tickets.filter((t: any) => t.status !== "valid");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your event tickets
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tickets yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              When you purchase tickets, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {validTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Active Tickets ({validTickets.length})
                </h2>
                <div className="grid gap-4">
                  {validTickets.map((ticket: any) => (
                    <SimpleTicketCard key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}

            {otherTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Past/Used Tickets ({otherTickets.length})
                </h2>
                <div className="grid gap-4 opacity-60">
                  {otherTickets.map((ticket: any) => (
                    <SimpleTicketCard key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}