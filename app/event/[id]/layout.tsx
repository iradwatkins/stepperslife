import { Metadata } from 'next';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
): Promise<Metadata> {
  try {
    // Fetch event data
    const event = await fetchQuery(api.events.getById, {
      eventId: params.id as Id<"events">,
    });

    if (!event) {
      return {
        title: 'Event Not Found - SteppersLife',
        description: 'The requested event could not be found.',
      };
    }

    // Check for affiliate referral code
    const referralCode = searchParams.ref as string | undefined;
    let affiliate = null;
    
    if (referralCode) {
      try {
        affiliate = await fetchQuery(api.affiliates.getAffiliateByCode, {
          referralCode: referralCode,
        });
      } catch (error) {
        console.log('Could not fetch affiliate info:', error);
      }
    }

    // Format date for display
    const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(event.eventDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Build title and description based on affiliate presence
    const title = affiliate 
      ? `🎫 ${affiliate.affiliateName} invites you to ${event.name}`
      : event.name;

    const description = affiliate
      ? `Save $${affiliate.commissionPerTicket} on tickets! ${event.description || ''} | ${eventDate} at ${event.venue}`
      : `${event.description || ''} | ${eventDate} at ${eventTime} | ${event.venue} | Tickets from $${event.price}`;

    // Build the full URL with referral code if present
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stepperslife.com';
    const eventUrl = `${baseUrl}/event/${params.id}${referralCode ? `?ref=${referralCode}` : ''}`;
    
    // Generate OG image URL - we'll create this endpoint next
    const ogImageUrl = `${baseUrl}/api/og?eventId=${params.id}${referralCode ? `&ref=${referralCode}` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: eventUrl,
        siteName: 'SteppersLife',
        images: [
          {
            url: event.imageUrl || ogImageUrl, // Use event image if available, otherwise generated
            width: 1200,
            height: 630,
            alt: event.name,
          }
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [event.imageUrl || ogImageUrl],
        site: '@stepperslife',
      },
      // Additional metadata
      keywords: [
        event.name,
        event.venue,
        'event tickets',
        'stepperslife',
        event.categories?.join(', ') || 'event',
        affiliate ? 'discount tickets' : '',
      ].filter(Boolean).join(', '),
      authors: [{ name: 'SteppersLife' }],
      creator: 'SteppersLife',
      publisher: 'SteppersLife',
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    return {
      title: 'Event - SteppersLife',
      description: 'Discover amazing events and get your tickets on SteppersLife',
    };
  }
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}