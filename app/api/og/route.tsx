import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const eventId = searchParams.get('eventId');
    const referralCode = searchParams.get('ref');

    if (!eventId) {
      return new NextResponse('Event ID required', { status: 400 });
    }

    // Fetch event data
    const event = await fetchQuery(api.events.getById, {
      eventId: eventId as Id<"events">,
    });

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    // Fetch affiliate data if referral code provided
    let affiliate = null;
    if (referralCode) {
      try {
        affiliate = await fetchQuery(api.affiliates.getAffiliateByCode, {
          referralCode: referralCode,
        });
      } catch (error) {
        console.log('Could not fetch affiliate:', error);
      }
    }

    // Format date and time
    const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const eventTime = new Date(event.eventDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Generate HTML for the OG image
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 1200px;
            height: 630px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
          }
          
          .container {
            width: 100%;
            height: 100%;
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            padding: 60px;
            color: white;
          }
          
          .background-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 0;
          }
          
          .content {
            position: relative;
            z-index: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .affiliate-badge {
            background: #fbbf24;
            color: #000;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 24px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
            max-width: fit-content;
          }
          
          .event-title {
            font-size: 72px;
            font-weight: bold;
            line-height: 1.1;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            max-height: 160px;
            overflow: hidden;
          }
          
          .event-details {
            font-size: 32px;
            line-height: 1.5;
            margin-bottom: 30px;
            opacity: 0.95;
          }
          
          .price-info {
            font-size: 48px;
            font-weight: bold;
            color: #fbbf24;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 40px;
          }
          
          .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .logo-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          
          .logo {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .tagline {
            font-size: 20px;
            opacity: 0.9;
          }
          
          .cta-button {
            background: white;
            color: #764ba2;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 28px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .event-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.2;
            z-index: -1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${event.imageUrl ? `<img src="${event.imageUrl}" class="event-image" />` : ''}
          <div class="background-overlay"></div>
          <div class="content">
            <div>
              ${affiliate ? `
                <div class="affiliate-badge">
                  🎫 ${affiliate.affiliateName} invites you!
                </div>
              ` : ''}
              
              <h1 class="event-title">${event.name}</h1>
              
              <div class="event-details">
                📅 ${eventDate} at ${eventTime}<br/>
                📍 ${event.venue}
              </div>
              
              <div class="price-info">
                ${affiliate 
                  ? `Save $${affiliate.commissionPerTicket} with this link!` 
                  : `Tickets from $${event.price}`
                }
              </div>
            </div>
            
            <div class="bottom-section">
              <div class="logo-section">
                <div class="logo">SteppersLife</div>
                <div class="tagline">Your Event Ticket Marketplace</div>
              </div>
              
              <div class="cta-button">
                Get Tickets →
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Since we can't use Canvas API directly in Next.js without additional packages,
    // we'll return an HTML response that can be captured as an image
    // For production, you would need to use a service or package to convert HTML to image
    
    // For now, return a simple image response with the event image if available
    if (event.imageUrl) {
      // Redirect to the event image with overlay text
      // This is a temporary solution - in production you'd generate a proper image
      return NextResponse.redirect(event.imageUrl);
    }

    // Return a default OG image placeholder
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}

// For a production-ready solution without external services,
// you would need to:
// 1. Install a package like 'canvas' or 'sharp' that's already in your project
// 2. Or use Next.js Image component with text overlay
// 3. Or generate SVG images which can include text