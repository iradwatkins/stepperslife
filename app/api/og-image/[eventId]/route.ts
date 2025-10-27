import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    eventId: string;
  }>;
}

async function getEventData(eventId: string) {
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;

    // Fetch event details
    const eventDetails = await getEventData(eventId);

    if (!eventDetails || !eventDetails.imageUrl) {
      return new NextResponse('Event or image not found', { status: 404 });
    }

    // Fetch the original image
    const eventsSubdomain = process.env.NEXT_PUBLIC_EVENTS_SUBDOMAIN || 'https://events.stepperslife.com';
    const imageUrl = eventDetails.imageUrl.startsWith('http')
      ? eventDetails.imageUrl
      : `${eventsSubdomain}${eventDetails.imageUrl}`;

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Get original image dimensions
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 1200;
    const originalHeight = metadata.height || 630;

    // Target dimensions for Open Graph
    const targetWidth = 1200;
    const targetHeight = 630;

    // Brand color (SteppersLife blue #1c9cf0)
    const brandBlue = { r: 28, g: 156, b: 240 };

    // Step 1: Resize the flyer to fit within target dimensions (contain mode - no cropping)
    // Use transparent background so we can position it ourselves
    const resizedFlyer = await sharp(buffer)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Calculate how much the flyer was scaled
    const scale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
    const actualFlyerWidth = Math.round(originalWidth * scale);
    const actualFlyerHeight = Math.round(originalHeight * scale);

    // Step 2: Create blue background canvas
    const blueBackground = await sharp({
      create: {
        width: targetWidth,
        height: targetHeight,
        channels: 3,
        background: brandBlue,
      }
    })
    .jpeg()
    .toBuffer();

    // Step 3: Calculate text area position (remaining space after flyer)
    const textStartX = actualFlyerWidth + 30; // 30px padding from flyer
    const textWidth = targetWidth - actualFlyerWidth - 60; // Available width for text

    // Format event information
    const eventName = eventDetails.name || 'Event';
    const eventDate = eventDetails.startDate
      ? new Date(eventDetails.startDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const eventLocation = eventDetails.location?.city && eventDetails.location?.state
      ? `${eventDetails.location.city}, ${eventDetails.location.state}`
      : eventDetails.location?.city || eventDetails.location?.state || '';

    // Escape XML special characters
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Determine font sizes based on available space
    const titleSize = textWidth > 400 ? 36 : 28;
    const detailSize = textWidth > 400 ? 22 : 18;
    const ctaSize = textWidth > 400 ? 24 : 20;

    // Determine CTA text based on event type and ticket availability
    let ctaText = 'SteppersLife.com'; // Default

    if (eventDetails.eventType === 'TICKETED_EVENT') {
      // Check if tickets are visible and available
      if (eventDetails.ticketsVisible &&
          eventDetails.ticketTiers &&
          eventDetails.ticketTiers.length > 0) {
        ctaText = 'BUY TICKETS';
      }
    } else if (eventDetails.eventType === 'FREE_EVENT') {
      ctaText = 'REGISTER FREE';
    }
    // For SAVE_THE_DATE or when tickets aren't visible, use 'SteppersLife.com'

    // Create SVG overlay with event info in the text area
    const infoOverlay = `
      <svg width="${targetWidth}" height="${targetHeight}">
        <defs>
          <style>
            .event-title {
              font-family: Arial, sans-serif;
              font-size: ${titleSize}px;
              font-weight: 700;
              fill: white;
            }
            .event-details {
              font-family: Arial, sans-serif;
              font-size: ${detailSize}px;
              font-weight: 500;
              fill: white;
            }
            .cta-button {
              font-family: Arial, sans-serif;
              font-size: ${ctaSize}px;
              font-weight: 700;
              fill: white;
            }
            .cta-bg {
              fill: rgba(255, 255, 255, 0.2);
              rx: 8;
            }
            .branding-text {
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 500;
              fill: rgba(255, 255, 255, 0.5);
            }
          </style>
        </defs>

        <!-- Event Name (wrap if too long) -->
        <text x="${textStartX}" y="120" class="event-title" textLength="${textWidth > 50 ? textWidth - 20 : 50}" lengthAdjust="spacingAndGlyphs">${escapeXml(eventName.substring(0, 45))}</text>

        <!-- Event Date -->
        <text x="${textStartX}" y="190" class="event-details">📅 ${escapeXml(eventDate)}</text>

        <!-- Event Location -->
        <text x="${textStartX}" y="240" class="event-details">📍 ${escapeXml(eventLocation)}</text>

        <!-- Call to Action Button -->
        <rect x="${textStartX - 10}" y="300" width="${Math.min(textWidth, 320)}" height="60" class="cta-bg"/>
        <text x="${textStartX + Math.min(textWidth, 320) / 2}" y="340" text-anchor="middle" class="cta-button">${ctaText}</text>

        <!-- SteppersLife.com -->
        <text x="${textStartX + Math.min(textWidth, 320) / 2}" y="390" text-anchor="middle" class="branding-text">SteppersLife.com</text>
      </svg>
    `;

    // Step 4: Composite everything together
    const resizedImage = await sharp(blueBackground)
      .composite([
        {
          input: resizedFlyer,
          top: Math.round((targetHeight - actualFlyerHeight) / 2), // Center vertically
          left: 0, // Align to left edge
        },
        {
          input: Buffer.from(infoOverlay),
          top: 0,
          left: 0,
        }
      ])
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    // Return the optimized image
    return new NextResponse(new Uint8Array(resizedImage), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year, immutable
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
