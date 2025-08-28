"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStorageUrl } from "@/lib/utils";
// import EventTypeSelector, { EventType } from "@/components/EventTypeSelector";
import EventTypeDropdown, { EventType } from "@/components/EventTypeDropdown";
import { ReliableCategorySelector, EventCategory } from "@/components/ui/reliable-category-selector";
import { Calendar24 } from "@/components/events/Calendar24";
import { MultiDayCalendar24 } from "@/components/events/MultiDayCalendar24";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRange } from "react-day-picker";
// import LocationPicker from "@/components/LocationPicker"; // Disabled - Google Maps API not configured

const formSchema = z.object({
  ticketSalesType: z.enum(["no_tickets", "selling_tickets", "custom_seating"]),
  eventMode: z.enum(["single", "multi_day"]).optional(),
  isSaveTheDate: z.boolean().optional(),
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(), // Will be validated in refine
  eventDate: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Event date must be in the future"
    ),
  endDate: z.date().optional(), // For multi-day events
  eventDateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(), // For date range picker
  sameLocation: z.boolean().optional(), // For multi-day events
  price: z.number().min(0, "Price must be 0 or greater").optional(), // Optional for ticketed events
  doorPrice: z.number().optional(),
  totalTickets: z.number().min(1, "Must have at least 1 ticket").optional(), // Optional for ticketed events
  eventType: z.string().optional(),
  eventCategories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
}).refine((data) => {
  // Location is required unless it's a save the date event
  if (!data.isSaveTheDate && (!data.location || data.location.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Location is required unless this is a Save the Date event",
  path: ["location"],
}).refine((data) => {
  // End date must be after start date for multi-day events
  if (data.eventMode === "multi_day" && data.endDate) {
    return data.endDate > data.eventDate;
  }
  return true;
}, {
  message: "End date must be after start date for multi-day events",
  path: ["endDate"],
}).refine((data) => {
  // Other validations can go here
  return true;
}, {
  message: "Please check all required fields",
  path: [],
});

type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageId?: Id<"_storage">;
  eventCategories?: string[];
  eventType?: string;
  isTicketed?: boolean;
  doorPrice?: number;
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: InitialEventData;
}

export default function EventForm({ mode, initialData }: EventFormProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.updateEvent);
  const createEventDays = useMutation(api.multiDayEvents.createEventDays);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const currentImageUrl = useStorageUrl(initialData?.imageStorageId);

  // Image upload
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);
  const [locationData, setLocationData] = useState<any>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketSalesType: "no_tickets",
      eventMode: "single",
      isSaveTheDate: false,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location || "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      endDate: undefined,
      sameLocation: true,
      price: initialData?.price ?? 0,
      doorPrice: 0,
      totalTickets: initialData?.totalTickets ?? 100,
      eventType: undefined,
      eventCategories: initialData?.eventCategories ?? [],
      latitude: undefined,
      longitude: undefined,
      address: undefined,
      city: undefined,
      state: undefined,
      country: undefined,
      postalCode: undefined,
    },
  });

  async function onSubmit(values: FormData) {
    console.log("Form submitted with values:", values);
    console.log("Location value:", values.location);
    console.log("Is save the date:", values.isSaveTheDate);
    
    if (!user?.id) {
      console.error("No user ID found");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to create an event.",
      });
      router.push("/auth/signin");
      return;
    }

    startTransition(async () => {
      try {
        let imageStorageId = null;

        // Handle image changes
        if (selectedImage) {
          // Upload new image
          imageStorageId = await handleImageUpload(selectedImage);
        }

        // Handle image deletion/update in edit mode
        if (mode === "edit" && initialData?.imageStorageId) {
          if (removedCurrentImage || selectedImage) {
            // Delete old image from storage
            await deleteImage({
              storageId: initialData.imageStorageId,
            });
          }
        }

        if (mode === "create") {
          // Set isTicketed based on ticketSalesType
          const isTicketed = values.ticketSalesType === "selling_tickets" || values.ticketSalesType === "custom_seating";
          
          // Get the first category as eventType for backward compatibility
          const primaryEventType = values.eventCategories && values.eventCategories.length > 0 
            ? values.eventCategories[0] 
            : "other";
          
          // For ticketed events, we'll use temporary values for price and totalTickets
          // These will be updated when tickets are configured
          // Ensure we have a valid date
          const eventTimestamp = values.eventDate ? values.eventDate.getTime() : Date.now();
          
          // Debug log to see what's being sent
          const eventPayload = {
            name: values.name,
            description: values.description,
            userId: user.id,
            eventDate: eventTimestamp,
            location: values.location || "",
            price: isTicketed ? 0 : (values.price || 0),
            totalTickets: isTicketed ? 100 : (values.totalTickets || 100),
            // Optional fields - only add if they have values
            ...(values.endDate && { endDate: values.endDate.getTime() }),
            ...(values.eventMode === "multi_day" && { isMultiDay: true }),
            ...(values.isSaveTheDate && { isSaveTheDate: true }),
            ...(values.sameLocation && { sameLocation: true }),
            ...(imageStorageId && { imageStorageId }),
            ...(values.eventCategories && values.eventCategories.length > 0 && { 
              eventType: primaryEventType,
              eventCategories: values.eventCategories 
            }),
            ...(isTicketed !== undefined && { isTicketed }),
            ...(values.ticketSalesType === "no_tickets" && values.doorPrice && { doorPrice: values.doorPrice }),
            // Location details - only add if present
            ...(locationData?.latitude && { latitude: locationData.latitude }),
            ...(locationData?.longitude && { longitude: locationData.longitude }),
            ...(locationData?.address && { address: locationData.address }),
            ...(locationData?.city && { city: locationData.city }),
            ...(locationData?.state && { state: locationData.state }),
            ...(locationData?.country && { country: locationData.country }),
            ...(locationData?.postalCode && { postalCode: locationData.postalCode }),
          };
          
          console.log("Form values:", values);
          console.log("Location value:", values.location);
          console.log("Is save the date:", values.isSaveTheDate);
          console.log("LocationData:", locationData);
          console.log("Full payload:", eventPayload);
          
          const eventId = await createEvent(eventPayload);
          
          console.log("Event created successfully with ID:", eventId);

          // Create event days for multi-day events
          if (values.eventMode === "multi_day" && values.endDate) {
            // Validate date range
            if (values.endDate <= values.eventDate) {
              toast({
                variant: "destructive",
                title: "Invalid Date Range",
                description: "End date must be after start date for multi-day events.",
              });
              return;
            }
            
            // Calculate days difference
            const daysDiff = Math.ceil((values.endDate.getTime() - values.eventDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            if (daysDiff > 30) {
              toast({
                variant: "destructive",
                title: "Date Range Too Long",
                description: "Multi-day events cannot exceed 30 days.",
              });
              return;
            }
            
            await createEventDays({
              eventId,
              startDate: values.eventDate?.getTime() || Date.now(),
              endDate: values.endDate.getTime(),
              sameLocation: values.sameLocation !== false,
              location: values.location,
              address: locationData?.address,
              latitude: locationData?.latitude,
              longitude: locationData?.longitude,
              city: locationData?.city,
              state: locationData?.state,
              postalCode: locationData?.postalCode,
            });
            
            // Multi-day event - go to ticket setup
            router.push(`/seller/events/${eventId}/tickets/setup`);
          } else if (values.ticketSalesType === "selling_tickets") {
            // Single event with tickets - also needs ticket setup
            router.push(`/seller/events/${eventId}/tickets/setup`);
          } else {
            // No tickets or save the date - go straight to event page
            router.push(`/event/${eventId}`);
          }
        } else {
          // Ensure initialData exists before proceeding with update
          if (!initialData) {
            throw new Error("Initial event data is required for updates");
          }

          // Update event details with new image storage ID if provided
          await updateEvent({
            eventId: initialData._id,
            name: values.name,
            description: values.description,
            location: values.location,
            eventDate: values.eventDate?.getTime() || Date.now(),
            price: values.price,
            totalTickets: values.totalTickets,
            imageStorageId: imageStorageId || (removedCurrentImage ? null : undefined),
            eventCategories: values.eventCategories,
            eventType: values.eventCategories?.[0] || "other",
            isTicketed: values.ticketSalesType === "selling_tickets",
            doorPrice: values.ticketSalesType === "no_tickets" ? values.doorPrice : undefined,
          });

          toast({
            title: "Event updated",
            description: "Your event has been successfully updated.",
          });

          router.push(`/event/${initialData._id}`);
        }
      } catch (error: any) {
        console.error("Failed to handle event:", error);
        console.error("Error details:", {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          formValues: values,
          errorData: error?.data,
          errorResponse: error?.response
        });
        
        // Extract more specific error messages from Convex errors
        let errorMessage = "There was a problem with your request. Please check all required fields.";
        if (error instanceof Error) {
          errorMessage = error.message;
          // Check for common Convex validation errors
          if (error.message.includes("ValidationError")) {
            errorMessage = "Please check all required fields are properly filled.";
          } else if (error.message.includes("eventDate")) {
            errorMessage = "Please select a valid event date and time.";
          } else if (error.message.includes("totalTickets")) {
            errorMessage = "Please enter a valid number of tickets.";
          }
        }
        
        toast({
          variant: "destructive",
          title: "Error creating event",
          description: errorMessage,
        });
      } finally {
        // Loading state is automatically managed by startTransition
        setIsSubmitting(false);
      }
    });
  }

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      // Step 1: Get an upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      
      // Step 2: Upload the file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!response.ok) {
        throw new Error("Upload to Convex failed");
      }
      
      // Step 3: Get the storage ID from the response
      const { storageId } = await response.json();
      
      // Return the storage ID (which will be stored as imageStorageId)
      return storageId;
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        variant: "destructive",
        title: "Image upload failed",
        description: "Please try again or continue without an image.",
      });
      return null;
    }
  }


  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(
          onSubmit,
          (errors) => {
            console.error("Form validation errors:", errors);
            console.log("Current form values:", form.getValues());
          }
        )} 
        className="space-y-8">
        {/* Form fields */}
        <div className="space-y-4">
          {/* Ticket Sales Type Dropdown - At the top */}
          <FormField
            control={form.control}
            name="ticketSalesType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Tickets</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="no_tickets">No - Just Posting an Event</option>
                    <option value="selling_tickets">Yes - Selling Tickets</option>
                    <option value="custom_seating" disabled>Custom Seating (Coming Soon)</option>
                  </select>
                </FormControl>
                <FormDescription>
                  Choose whether to sell tickets online or just post the event information
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Save the Date checkbox for no_tickets */}
          {form.watch("ticketSalesType") === "no_tickets" && (
            <FormField
              control={form.control}
              name="isSaveTheDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      This is a Save the Date event
                    </FormLabel>
                    <FormDescription>
                      Save the Date events don't require a specific location yet
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Show door price field if no_tickets is selected */}
          {form.watch("ticketSalesType") === "no_tickets" && (
            <FormField
              control={form.control}
              name="doorPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Door Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Price at the door for walk-in attendees
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Event Mode Dropdown - Only show when selling tickets */}
          {form.watch("ticketSalesType") === "selling_tickets" && (
            <FormField
              control={form.control}
              name="eventMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="single">Single Event</option>
                      <option value="multi_day">Multi-Day Event</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Multi-day events allow bundling tickets across multiple days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Same Location checkbox for multi-day events */}
          {form.watch("ticketSalesType") === "selling_tickets" && 
           form.watch("eventMode") === "multi_day" && (
            <FormField
              control={form.control}
              name="sameLocation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      All days at the same location?
                    </FormLabel>
                    <FormDescription>
                      Uncheck if each day will be at a different venue
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventCategories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Categories</FormLabel>
                <FormControl>
                  <ReliableCategorySelector
                    value={field.value as EventCategory[]}
                    onChange={(value) => field.onChange(value)}
                    maxCategories={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location field - hide if Save the Date */}
          {!form.watch("isSaveTheDate") && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location {form.watch("isSaveTheDate") ? "(Optional)" : ""}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the venue name or address" 
                      {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.watch("eventMode") === "multi_day" && !form.watch("sameLocation")
                      ? "This will be the location for Day 1. You'll set other locations later."
                      : "Enter the venue name or address"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Single event date picker with Calendar24 */}
          {form.watch("eventMode") !== "multi_day" && (
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => {
                // Extract time from the date object
                const getTimeString = (date: Date | undefined) => {
                  if (!date) return "19:00";
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  return `${hours}:${minutes}`;
                };

                // Combine date and time into a single Date object
                const handleDateTimeChange = (date: Date | undefined, timeString: string) => {
                  if (!date) {
                    field.onChange(undefined);
                    return;
                  }
                  
                  const [hours, minutes] = timeString.split(':').map(Number);
                  const newDate = new Date(date);
                  newDate.setHours(hours, minutes, 0, 0);
                  field.onChange(newDate);
                };

                return (
                  <FormItem>
                    <FormLabel>Event Date & Time</FormLabel>
                    <FormControl>
                      <Calendar24
                        date={field.value ? new Date(field.value.setHours(0, 0, 0, 0)) : undefined}
                        time={getTimeString(field.value)}
                        onDateChange={(date) => handleDateTimeChange(date, getTimeString(field.value))}
                        onTimeChange={(time) => handleDateTimeChange(field.value || new Date(), time)}
                        minDate={new Date()}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose the date and time when your event will take place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

          {/* Multi-day event date range picker */}
          {form.watch("eventMode") === "multi_day" && (
            <FormField
              control={form.control}
              name="eventDateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date Range</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value as DateRange | undefined}
                      onChange={(range) => {
                        field.onChange(range);
                        // Update eventDate and endDate from range
                        if (range?.from) {
                          form.setValue("eventDate", range.from);
                        }
                        if (range?.to) {
                          form.setValue("endDate", range.to);
                        }
                      }}
                      placeholder="Select event date range"
                      minDate={new Date()}
                      maxDays={30}
                    />
                  </FormControl>
                  <FormDescription>
                    Select the start and end dates for your multi-day event (max 30 days)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Info message for ticketed events */}
          {form.watch("ticketSalesType") === "selling_tickets" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Step: Configure Tickets</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                After creating your event, you'll set up different ticket tiers with their own prices and quantities.
              </p>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Event Image
            </label>
            <FileUpload
              value={selectedImage}
              onChange={(file) => {
                if (file && !Array.isArray(file)) {
                  setSelectedImage(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setRemovedCurrentImage(true);
                }
              }}
              accept="image/*"
              multiple={false}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Creating Event..." : "Updating Event..."}
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </form>
    </Form>
  );
}
