"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import EventTypeSelector, { EventType } from "./EventTypeSelector";
import BasicInfoStep from "./steps/BasicInfoStep";
import TicketDecisionStep from "./steps/TicketDecisionStep";
import CapacityTicketsStep from "./steps/CapacityTicketsStep";
import PaymentModelStep from "./steps/PaymentModelStep";
import TableConfigStep from "./steps/TableConfigStep";
import ReviewPublishStep from "./steps/ReviewPublishStep";

// Import and re-export all event types from centralized location
import type { TicketType, TableConfig, EventData } from "@/types/events";
export type { TicketType, TableConfig, EventData };


interface SingleEventFlowProps {
  onComplete: (data: {
    event: EventData;
    ticketTypes: TicketType[];
    tables: TableConfig[];
  }) => void;
  onCancel: () => void;
}

export default function SingleEventFlow({ onComplete, onCancel }: SingleEventFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState<EventType>('standard');
  const [eventData, setEventData] = useState<EventData>({
    name: "",
    description: "",
    location: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    eventDate: "",
    eventTime: "",
    mainImage: "",
    galleryImages: [],
    isTicketed: false,
    isSaveTheDate: false,
    categories: [],
    hasAffiliateProgram: false,
    affiliateCommissionPercent: undefined,
  });
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [tables, setTables] = useState<TableConfig[]>([]);

  // Update eventData based on eventType changes
  const updateEventForType = (type: EventType) => {
    setEventType(type);
    setEventData(prev => ({
      ...prev,
      isSaveTheDate: type === 'savedate',
      isTicketed: type === 'ticketed',
      hasAffiliateProgram: type === 'ticketed',
      affiliateCommissionPercent: type === 'ticketed' ? 10 : undefined,
    }));
  };

  const steps = [
    { id: 1, name: "Event Type", description: "Choose event type" },
    { id: 2, name: "Basic Info", description: "Event details and location" },
    { id: 3, name: "Capacity & Tickets", description: "Define ticket types", show: eventType === 'ticketed' },
    { id: 4, name: "Payment Model", description: "Choose payment processing", show: eventType === 'ticketed' },
    { id: 5, name: "Tables", description: "Private table sales", show: eventType === 'ticketed' && ticketTypes.length > 0 },
    { id: 6, name: "Review", description: "Review and publish" },
  ].filter(step => step.show !== false);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log("🎯 SingleEventFlow complete - passing data:", {
      eventName: eventData.name,
      isTicketed: eventData.isTicketed,
      ticketTypes: ticketTypes,
      ticketCount: ticketTypes.length,
      tables: tables.length,
      categories: eventData.categories
    });
    
    onComplete({
      event: eventData,
      ticketTypes,
      tables,
    });
  };

  const getStepComponent = () => {
    const activeStep = steps[currentStep - 1];
    
    switch (activeStep.name) {
      case "Event Type":
        return (
          <div>
            <EventTypeSelector
              value={eventType}
              onChange={updateEventForType}
              className="mb-6"
            />
            <div className="flex justify-between mt-8">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case "Basic Info":
        return (
          <BasicInfoStep
            data={eventData}
            onChange={setEventData}
            onNext={handleNext}
            isSaveTheDate={eventType === 'savedate'}
            onCancel={handleBack}
          />
        );
      
      case "Capacity & Tickets":
        return (
          <CapacityTicketsStep
            eventData={eventData}
            ticketTypes={ticketTypes}
            onChange={(data, tickets) => {
              setEventData(data);
              setTicketTypes(tickets);
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case "Payment Model":
        return (
          <PaymentModelStep
            data={eventData}
            onChange={setEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case "Tables":
        return (
          <TableConfigStep
            ticketTypes={ticketTypes}
            tables={tables}
            onChange={setTables}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleNext}
          />
        );
      
      case "Review":
        return (
          <ReviewPublishStep
            eventData={eventData}
            ticketTypes={ticketTypes}
            tables={tables}
            onPublish={handleComplete}
            onBack={handleBack}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${index !== steps.length - 1 ? "pr-2" : ""}`}
            >
              <div className="relative">
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-10 right-0 h-0.5 ${
                      currentStep > index + 1 ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
                <div className="flex flex-col items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === index + 1
                        ? "bg-blue-600 text-white"
                        : currentStep > index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {getStepComponent()}
      </div>
    </div>
  );
}