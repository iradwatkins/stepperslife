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
import { EnhancedDateTimePicker } from "@/components/ui/enhanced-date-time-picker";
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
  location: z.string().optional(), // Optional for save the date
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
  price: z.number().min(0, "Price must be 0 or greater"),
  doorPrice: z.number().optional(),
  totalTickets: z.number().min(1, "Must have at least 1 ticket"),
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
  if (!data.isSaveTheDate && !data.location) {
    return false;
  }
  // End date must be after start date for multi-day events
  if (data.eventMode === "multi_day" && data.endDate) {
    return data.endDate > data.eventDate;
  }
  return true;
}, {
  message: "Location is required unless this is a Save the Date event",
  path: ["location"],
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
  const [locationData, setLocationData] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketSalesType: "no_tickets",
      eventMode: "single",
      isSaveTheDate: false,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : undefined,
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
    if (!user?.id) return;

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
          
          const eventId = await createEvent({
            ...values,
            userId: user.id,
            eventDate: values.eventDate?.getTime() || Date.now(),
            endDate: values.endDate?.getTime(),
            isMultiDay: values.eventMode === "multi_day",
            isSaveTheDate: values.isSaveTheDate,
            sameLocation: values.sameLocation,
            location: values.location || "",
            imageStorageId: imageStorageId || undefined,
            eventType: primaryEventType as EventType,
            eventCategories: values.eventCategories as EventType[], // Save the full array
            isTicketed,
            doorPrice: values.ticketSalesType === "no_tickets" ? values.doorPrice : undefined,
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            address: locationData?.address,
            city: locationData?.city,
            state: locationData?.state,
            country: locationData?.country,
            postalCode: locationData?.postalCode,
          });

          router.push(`/event/${eventId}`);
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
      } catch (error) {
        console.error("Failed to handle event:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      placeholder="Enter event location" 
                      {...field} 
                      value={field.value || locationData?.address || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setLocationData({ address: e.target.value } as any);
                      }}
                    />
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

          {/* Single event date picker */}
          {form.watch("eventMode") !== "multi_day" && (
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date & Time</FormLabel>
                  <FormControl>
                    <EnhancedDateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select event date and time"
                      minDate={new Date()}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose the date and time when your event will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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

          {/* Only show price field if selling tickets */}
          {(form.watch("ticketSalesType") === "selling_tickets" || form.watch("ticketSalesType") === "custom_seating") && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Ticket</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2">
                        $
                      </span>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-6"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Only show total tickets field if selling tickets */}
          {(form.watch("ticketSalesType") === "selling_tickets" || form.watch("ticketSalesType") === "custom_seating") && (
            <FormField
              control={form.control}
              name="totalTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Tickets Available</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
