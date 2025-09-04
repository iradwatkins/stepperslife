"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";
import { getTimezoneFromState, localToUTC } from "@/lib/timezone-utils";

export async function publishEvent(data: {
  event: any;
  ticketTypes?: any[];
  tables?: any[];
}) {
  try {
    // Get the current user
    const { userId } = await auth();
    const user = await currentUser();
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 PublishEvent Debug - User Info:", {
        clerkUserId: userId,
        userId: user?.id,
        userEmail: user?.emailAddresses?.[0]?.emailAddress,
        hasUser: !!user
      });
    }
    
    if (!userId || !user) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ PublishEvent Error: No authenticated user");
      }
      return {
        success: false,
        error: "You must be signed in to create an event"
      };
    }

    // Validate location fields if not Save the Date
    if (!data.event.isSaveTheDate) {
      const missingFields = [];
      if (!data.event.city?.trim()) missingFields.push("city");
      if (!data.event.state?.trim()) missingFields.push("state");
      
      if (missingFields.length > 0 && process.env.NODE_ENV === 'development') {
        console.warn("⚠️ PublishEvent Warning: Missing location fields:", missingFields);
        // Don't fail, but log the warning
      }
    }

    // Prepare event data with proper timezone handling
    // Use Google-provided timezone if available, otherwise fallback to state-based
    const eventTimezone = data.event.eventTimezone || getTimezoneFromState(data.event.state || 'NY');
    
    // Convert local date/time to UTC
    const eventDateUTC = localToUTC(
      data.event.eventDate,
      data.event.eventTime || '00:00',
      eventTimezone
    );
    
    // For backward compatibility, also store in eventDate field
    // This will be the local time as a timestamp (legacy behavior)
    const [year, month, day] = data.event.eventDate.split('-').map(Number);
    const [hours, minutes] = (data.event.eventTime || '00:00').split(':').map(Number);
    const localDateTime = new Date(year, month - 1, day, hours || 0, minutes || 0);
    
    const eventData = {
      ...data.event,
      userId: user.id, // Use the Clerk user ID
      eventDate: localDateTime.getTime(), // Legacy field for backward compatibility
      eventDateUTC: eventDateUTC, // New UTC timestamp
      eventTimezone: eventTimezone, // Store the timezone
      totalTickets: data.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0,
      // Include image URL - support both imageUrl and mainImage fields
      imageUrl: data.event.imageUrl || data.event.mainImage || null,
      // Payment model configuration
      paymentModel: data.event.paymentModel || "premium", // Default to premium if not specified
      hasAffiliateProgram: data.event.hasAffiliateProgram || false,
      affiliateCommissionPercent: data.event.affiliateCommissionPercent,
      maxAffiliateTickets: data.event.maxAffiliateTickets,
    };

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("📝 PublishEvent - Event Data:", {
        name: eventData.name,
        userId: eventData.userId,
        location: eventData.location,
        address: eventData.address,
        city: eventData.city,
        state: eventData.state,
        postalCode: eventData.postalCode,
        categories: eventData.categories,
        imageUrl: eventData.imageUrl
      });
    }

    // Validate event data
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ PublishEvent Validation Failed:", validation.errors);
      }
      return {
        success: false,
        error: validation.errors.join(", ")
      };
    }

    // Prepare data for Convex
    const convexData = prepareEventDataForConvex(eventData);

    if (process.env.NODE_ENV === 'development') {
      console.log("🚀 Publishing event to Convex with userId:", convexData.userId);
    }

    // Create the event using server-side mutation
    const eventId = await fetchMutation(api.events.create, convexData);

    console.log("✅ Event created successfully:", {
      eventId,
      userId: convexData.userId,
      userIdType: typeof convexData.userId,
      userIdLength: convexData.userId?.length,
      eventName: convexData.name,
      timestamp: new Date().toISOString()
    });
    
    // Verify the event was created by querying it back
    try {
      const verifyEvent = await fetchMutation(api.events.getById, { eventId });
      
      if (verifyEvent) {
        console.log("✅ Event verified in database:", {
          id: verifyEvent._id,
          name: verifyEvent.name,
          storedUserId: verifyEvent.userId,
          userIdMatch: verifyEvent.userId === convexData.userId
        });
      } else {
        console.warn("⚠️ Event created but not immediately queryable");
      }
    } catch (verifyError) {
      console.warn("⚠️ Could not verify event creation:", verifyError);
      // Don't fail the creation, just log the warning
    }

    // If ticketed, create ticket types
    if (data.event.isTicketed && data.ticketTypes && data.ticketTypes.length > 0) {
      await fetchMutation(api.ticketTypes.createSingleEventTickets, {
        eventId,
        ticketTypes: data.ticketTypes.map(ticket => ({
          name: ticket.name,
          category: "general",
          allocatedQuantity: ticket.quantity,
          price: ticket.price,
          hasEarlyBird: ticket.hasEarlyBird,
          earlyBirdPrice: ticket.earlyBirdPrice,
          earlyBirdEndDate: ticket.earlyBirdEndDate,
        })),
      });
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Ticket types created for event:", eventId);
      }
    }

    // Create payment configuration if payment model is selected
    if (data.event.paymentModel && data.event.isTicketed) {
      try {
        // Get organizer trust score (create if doesn't exist)
        await fetchMutation(api.trust.trustScoring.updateOrganizerTrust, {
          organizerId: user.id,
          forceRecalculate: true,
        });
        
        // Configure payment model for the event
        if (data.event.paymentModel === "connect_collect") {
          await fetchMutation(api.payments.connectCollect.configureConnectCollect, {
            eventId,
            organizerId: user.id,
            provider: "stripe", // Default to Stripe, can be changed later
          });
        } else if (data.event.paymentModel === "premium") {
          await fetchMutation(api.payments.premiumProcessing.configurePremiumProcessing, {
            eventId,
            organizerId: user.id,
          });
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Payment model configured:", data.event.paymentModel);
        }
      } catch (paymentError) {
        console.warn("⚠️ Payment configuration failed:", paymentError);
        // Don't fail the event creation, payment can be configured later
      }
    }

    // Create affiliate program if enabled
    if (data.event.hasAffiliateProgram && data.event.affiliateCommissionPercent) {
      try {
        await fetchMutation(api.affiliatePrograms.createProgram, {
          eventId,
          organizerId: user.id,
          name: `${data.event.name} Affiliate Program`,
          commissionRate: data.event.affiliateCommissionPercent,
          maxTicketsPerAffiliate: Math.floor((data.event.maxAffiliateTickets || 100) / 10), // Divide by estimated affiliates
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Affiliate program created");
        }
      } catch (affiliateError) {
        console.warn("⚠️ Affiliate program creation failed:", affiliateError);
        // Don't fail the event creation, affiliate program can be set up later
      }
    }

    return {
      success: true,
      eventId,
      userId: process.env.NODE_ENV === 'development' ? convexData.userId : undefined // Only return userId in development
    };
  } catch (error: Error | unknown) {
    // Always log the full error for debugging
    console.error("❌ Error publishing event - Full details:", {
      message: error.message,
      stack: error.stack,
      data: error.data,
      code: error.code,
      fullError: JSON.stringify(error, null, 2)
    });
    
    // Try to extract a more meaningful error message
    let errorMessage = "Failed to publish event";
    if (error.message) {
      errorMessage = error.message;
    }
    if (error.data?.message) {
      errorMessage = error.data.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Removed generateUploadUrl - now using MinIO for image uploads
// Images are uploaded directly to MinIO via /api/upload/minio endpoint