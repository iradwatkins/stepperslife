"use server";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";
import { validateEventData, prepareEventDataForConvex } from "@/lib/category-mapper";

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

    // Calculate total tickets if event is ticketed
    const totalTickets = data.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0;

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("📝 PublishEvent - Input Data:", {
        name: data.event.name,
        userId: user.id,
        location: data.event.location,
        address: data.event.address,
        city: data.event.city,
        state: data.event.state,
        postalCode: data.event.postalCode,
        categories: data.event.categories,
        eventDate: data.event.eventDate,
        eventTime: data.event.eventTime,
        totalTickets: totalTickets,
        paymentModel: data.event.paymentModel,
        hasAffiliateProgram: data.event.hasAffiliateProgram
      });
    }

    // Validate event data with userId
    const eventDataForValidation = {
      ...data.event,
      userId: user.id
    };
    
    const validation = validateEventData(eventDataForValidation);
    if (!validation.isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ PublishEvent Validation Failed:", validation.errors);
      }
      return {
        success: false,
        error: validation.errors.join(", ")
      };
    }

    // Prepare data for Convex - pass original data and let it handle conversion
    const convexData = prepareEventDataForConvex(data.event, user.id, totalTickets);

    if (process.env.NODE_ENV === 'development') {
      console.log("🚀 Publishing event to Convex:", {
        userId: convexData.userId,
        name: convexData.name,
        eventDate: convexData.eventDate,
        location: convexData.location,
        totalTickets: convexData.totalTickets,
        price: convexData.price,
        hasAllRequiredFields: !!(convexData.name && convexData.description && convexData.location && convexData.eventDate && convexData.userId)
      });
    }

    // Create the event using server-side mutation
    let eventId;
    try {
      eventId = await fetchMutation(api.events.create, convexData);
    } catch (createError: any) {
      console.error("❌ Convex create mutation failed:", {
        error: createError,
        message: createError?.message,
        data: createError?.data,
        convexData: {
          name: convexData.name,
          userId: convexData.userId,
          eventDate: convexData.eventDate,
          location: convexData.location,
          price: convexData.price,
          totalTickets: convexData.totalTickets
        }
      });
      throw createError;
    }

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
      const verifyEvent = await fetchQuery(api.events.getById, { eventId });
      
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
          // Convert date string to timestamp if it exists
          earlyBirdEndDate: ticket.earlyBirdEndDate 
            ? new Date(ticket.earlyBirdEndDate).getTime()
            : undefined,
        })),
      });
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Ticket types created for event:", eventId);
      }
    }

    // Create payment configuration if payment model is selected
    // NOTE: Temporarily disabled to isolate the event creation issue
    // TODO: Re-enable once event creation is working
    /*
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
    */

    // Create affiliate program if enabled
    // NOTE: Affiliate program creation mutation not yet implemented
    // This can be added later when the affiliate system is fully set up
    if (data.event.hasAffiliateProgram && data.event.affiliateCommissionPercent) {
      if (process.env.NODE_ENV === 'development') {
        console.log("ℹ️ Affiliate program requested but creation not yet implemented");
      }
      // TODO: Implement affiliate program creation when api.affiliatePrograms.createProgram is available
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