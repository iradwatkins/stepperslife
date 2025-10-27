import { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventsAPI } from "@/lib/api/events-client";
import EventDetailClient from "./EventDetailClient";

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

// Fetch event data directly from Convex HTTP API for metadata
async function getEventDataForMetadata(eventId: string) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not defined');
    }

    const response = await fetch(
      `${convexUrl}/api/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'public/queries:getPublicEventDetails',
          args: { eventId },
          format: 'json',
        }),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching event data:', error);
    return null;
  }
}

function formatEventDateForMetadata(timestamp: number, timezone?: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone || 'America/New_York',
  });
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { eventId } = await params;

  if (!eventId) {
    return {
      title: "Event | SteppersLife",
      description: "Discover amazing stepping events at SteppersLife.com",
    };
  }

  const eventDetails = await getEventDataForMetadata(eventId);

  if (!eventDetails) {
    return {
      title: "Event Not Found | SteppersLife",
      description: "This event doesn't exist or is no longer available.",
    };
  }

  // Format event date for description
  const eventDateStr = eventDetails.startDate
    ? formatEventDateForMetadata(eventDetails.startDate, eventDetails.timezone)
    : '';

  // Check if tickets are available
  const hasTickets = eventDetails.eventType === "TICKETED_EVENT" &&
                     eventDetails.ticketsVisible &&
                     eventDetails.ticketTiers &&
                     eventDetails.ticketTiers.length > 0;

  // Create description with event title and call to action
  const callToAction = hasTickets
    ? "Buy Tickets on SteppersLife.com"
    : "Find more events on SteppersLife.com";

  const description = `${eventDetails.name}${eventDateStr ? ' - ' + eventDateStr : ''}. ${callToAction}`;

  // Use stepperslife.com OG image API for properly sized images
  // No cache-busting parameter needed - eventId in path makes URL unique
  const imageUrl = eventDetails.imageUrl
    ? `https://stepperslife.com/api/og-image/${eventId}`
    : 'https://stepperslife.com/og-default.png';

  // Get the event URL - IMPORTANT: Points to stepperslife.com, NOT events subdomain
  const eventUrl = `https://stepperslife.com/events/${eventId}`;

  return {
    title: `${eventDetails.name} | SteppersLife`,
    description: description,

    // Open Graph metadata for Facebook, LinkedIn, etc.
    openGraph: {
      type: 'website',
      url: eventUrl,
      title: eventDetails.name,
      description: description,
      siteName: 'SteppersLife',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: eventDetails.name,
          type: 'image/jpeg',
        },
      ],
      locale: 'en_US',
      // @ts-expect-error - fb:app_id is valid Open Graph but not in Next.js types
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890',
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: eventDetails.name,
      description: description,
      images: [imageUrl],
      creator: '@SteppersLife',
      site: '@SteppersLife',
    },

    // Additional metadata
    keywords: [
      'steppin events',
      'steppers',
      'dance events',
      'chicago stepping',
      eventDetails.name,
      ...(eventDetails.categories || []),
      ...(eventDetails.location ? [
        eventDetails.location.city,
        eventDetails.location.state,
      ] : []),
    ],

    authors: [
      {
        name: eventDetails.organizer?.name || eventDetails.organizerName || 'Event Organizer'
      }
    ],

    // Canonical URL - points to stepperslife.com
    alternates: {
      canonical: eventUrl,
    },

    // Other metadata
    other: {
      'event:start_time': eventDetails.startDate ? new Date(eventDetails.startDate).toISOString() : '',
      'event:end_time': eventDetails.endDate ? new Date(eventDetails.endDate).toISOString() : '',
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  // Fetch event details from Convex API
  const event = await eventsAPI.getEvent(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
