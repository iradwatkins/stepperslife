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
import EventCategoriesSelect, { EventCategory } from "@/components/EventCategoriesSelect";
// import LocationPicker from "@/components/LocationPicker"; // Disabled - Google Maps API not configured

const formSchema = z.object({
  ticketSalesType: z.enum(["no_tickets", "selling_tickets", "custom_seating"]),
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  eventDate: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Event date must be in the future"
    ),
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
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : undefined,
      price: initialData?.price ?? 0,
      doorPrice: 0,
      totalTickets: initialData?.totalTickets ?? 100,
      eventType: undefined,
      eventCategories: [],
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
            imageStorageId: imageStorageId || undefined,
            eventType: primaryEventType as EventType,
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
            ...values,
            eventDate: values.eventDate.getTime(),
            imageStorageId: imageStorageId || (removedCurrentImage ? null : undefined),
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
                <EventCategoriesSelect
                  value={field.value as EventCategory[]}
                  onChange={(value) => field.onChange(value)}
                  required={false}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
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
                  Enter the venue name or address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            <div className="mt-1 flex items-center gap-4">
              {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setRemovedCurrentImage(true);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInput}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              )}
            </div>
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
