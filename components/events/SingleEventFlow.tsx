"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import TicketDecisionStep from "./steps/TicketDecisionStep";
import CapacityTicketsStep from "./steps/CapacityTicketsStep";
import TableConfigStep from "./steps/TableConfigStep";
import ReviewPublishStep from "./steps/ReviewPublishStep";

export interface EventData {
  // Basic info
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  eventDate: string;
  eventTime: string;
  endTime?: string;
  
  // Ticketing
  isTicketed: boolean;
  doorPrice?: number;
  
  // Capacity
  totalCapacity?: number;
  
  // Categories
  categories: string[];
}

export interface TicketType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  hasEarlyBird: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
}

export interface TableConfig {
  id: string;
  name: string;
  seatCount: number;
  price: number;
  description?: string;
  sourceTicketTypeId: string;
  sourceTicketTypeName: string;
}

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
    isTicketed: true,
    categories: [],
  });
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [tables, setTables] = useState<TableConfig[]>([]);

  const steps = [
    { id: 1, name: "Basic Info", description: "Event details and location" },
    { id: 2, name: "Ticketing", description: "Online sales or door price" },
    { id: 3, name: "Capacity & Tickets", description: "Define ticket types", show: eventData.isTicketed },
    { id: 4, name: "Tables", description: "Private table sales", show: eventData.isTicketed && ticketTypes.length > 0 },
    { id: 5, name: "Review", description: "Review and publish" },
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
    onComplete({
      event: eventData,
      ticketTypes,
      tables,
    });
  };

  const getStepComponent = () => {
    const activeStep = steps[currentStep - 1];
    
    switch (activeStep.name) {
      case "Basic Info":
        return (
          <BasicInfoStep
            data={eventData}
            onChange={setEventData}
            onNext={handleNext}
            onCancel={onCancel}
          />
        );
      
      case "Ticketing":
        return (
          <TicketDecisionStep
            data={eventData}
            onChange={setEventData}
            onNext={handleNext}
            onBack={handleBack}
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