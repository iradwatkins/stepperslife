import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import EventsClient from "./EventsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function EventsPage() {
  const events = await fetchQuery(api.events.get) || [];
  
  // Filter active events (not cancelled and in the future)
  const activeEvents = events?.filter((event: any) => 
    !event.is_cancelled && 
    event.eventDate > Date.now()
  ) || [];
  
  return <EventsClient initialEvents={activeEvents} />;
}