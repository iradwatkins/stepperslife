"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Import step components
import EventBasicInfo from "@/components/steps/EventBasicInfo";
import EventTicketConfig from "@/components/steps/EventTicketConfig";
import EventMarketing from "@/components/steps/EventMarketing";

const formSchema = z.object({
  // Basic Info
  ticketSalesType: z.enum(["no_tickets", "selling_tickets", "custom_seating"]),
  eventMode: z.enum(["single", "multi_day"]).optional(),
  isSaveTheDate: z.boolean().optional(),
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  eventDate: z.date().min(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "Event date must be in the future"
  ),
  endDate: z.date().optional(),
  eventDateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  sameLocation: z.boolean().optional(),
  doorPrice: z.number().optional(),
  
  // Ticket Configuration
  tickets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    type: z.enum(["individual", "table"]),
    seatCount: z.number().optional(),
  })).optional(),
  
  // Marketing
  eventCategories: z.array(z.string()).optional(),
  imageFile: z.any().optional(),
  
  // Location data
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventFormSteppedProps {
  mode: "create" | "edit";
  initialData?: any;
}

export default function EventFormStepped({ mode, initialData }: EventFormSteppedProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.updateEvent);
  const createTableConfig = useMutation(api.tables.createTableConfig);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketSalesType: "no_tickets",
      eventMode: "single",
      isSaveTheDate: false,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      endDate: undefined,
      sameLocation: true,
      doorPrice: 0,
      tickets: [],
      eventCategories: [],
    },
  });

  const steps = [
    {
      title: "Event Details",
      description: "Basic information about your event",
      component: EventBasicInfo,
    },
    {
      title: "Ticket Configuration",
      description: "Set up ticket types and pricing",
      component: EventTicketConfig,
      condition: () => form.watch("ticketSalesType") !== "no_tickets",
    },
    {
      title: "Marketing & Media",
      description: "Categories and images",
      component: EventMarketing,
    },
  ];

  // Filter steps based on conditions
  const activeSteps = steps.filter(step => !step.condition || step.condition());

  const nextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (values: FormData) => {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        let imageStorageId = null;

        // Handle image upload if provided
        if (values.imageFile) {
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": values.imageFile.type },
            body: values.imageFile,
          });
          
          if (response.ok) {
            const { storageId } = await response.json();
            imageStorageId = storageId;
          }
        }

        if (mode === "create") {
          const isTicketed = values.ticketSalesType === "selling_tickets" || values.ticketSalesType === "custom_seating";
          
          // Create the event
          const eventId = await createEvent({
            name: values.name,
            description: values.description,
            location: values.location || "",
            eventDate: values.eventDate?.getTime() || Date.now(),
            endDate: values.endDate?.getTime(),
            isMultiDay: values.eventMode === "multi_day",
            isSaveTheDate: values.isSaveTheDate,
            sameLocation: values.sameLocation,
            userId: user.id,
            imageStorageId: imageStorageId || undefined,
            eventType: values.eventCategories?.[0] || "other",
            eventCategories: values.eventCategories, // Save the full array
            isTicketed,
            doorPrice: values.ticketSalesType === "no_tickets" ? values.doorPrice : undefined,
            // Default price and tickets for backward compatibility
            price: values.tickets?.[0]?.price || 0,
            totalTickets: values.tickets?.reduce((sum, t) => {
              if (t.type === "table" && t.seatCount) {
                return sum + (t.quantity * t.seatCount);
              }
              return sum + t.quantity;
            }, 0) || 100,
          });

          // Create table configurations if any
          if (values.tickets && values.tickets.length > 0) {
            for (const ticket of values.tickets) {
              if (ticket.type === "table") {
                await createTableConfig({
                  eventId,
                  name: ticket.name,
                  seatCount: ticket.seatCount || 8,
                  price: ticket.price,
                  description: ticket.description || "",
                  maxTables: ticket.quantity,
                });
              }
              // Individual tickets are handled differently
              // They would be created as regular ticket types
            }
          }

          toast({
            title: "Event created!",
            description: "Your event has been successfully created.",
          });

          router.push(`/event/${eventId}`);
        } else {
          // Update existing event
          await updateEvent({
            eventId: initialData._id,
            ...values,
            eventDate: values.eventDate.getTime(),
            imageStorageId: imageStorageId || undefined,
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
          title: "Error",
          description: "Failed to save event. Please try again.",
        });
      }
    });
  };

  const CurrentStepComponent = activeSteps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle className="text-2xl">
                {mode === "create" ? "Create New Event" : "Edit Event"}
              </CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {activeSteps.length}: {activeSteps[currentStep].title}
              </CardDescription>
            </div>
          </div>
          <Progress value={((currentStep + 1) / activeSteps.length) * 100} className="h-2" />
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CurrentStepComponent form={form} />
              
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep === activeSteps.length - 1 ? (
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === "create" ? "Creating..." : "Updating..."}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {mode === "create" ? "Create Event" : "Update Event"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}