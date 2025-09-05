"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import EventTypeSelector, { EventType } from "./EventTypeSelector";
import MultiDayBasicInfoStep from "./steps/MultiDayBasicInfoStep";
import TicketDecisionStep from "./steps/TicketDecisionStep";
import MultiDayTicketsStep from "./steps/MultiDayTicketsStep";
import BundleCreationStep from "./steps/BundleCreationStep";
import TableConfigStep from "./steps/TableConfigStep";
import MultiDayReviewStep from "./steps/MultiDayReviewStep";

export interface MultiDayEventData {
  // Basic info
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  sameLocation: boolean;
  
  // Images
  mainImage?: string;
  galleryImages?: string[];
  
  // Location (if same for all days)
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  
  // Categories
  categories: string[];
  
  // Ticketing
  isTicketed: boolean;
  doorPrice?: number;
}

export interface DayConfiguration {
  id: string;
  dayNumber: number;
  date: string;
  dayLabel: string;
  
  // Location (if different per day)
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  
  // Time
  startTime: string;
  endTime?: string;
  
  // Tickets
  ticketTypes: TicketType[];
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

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  selectedTickets: Array<{
    dayId: string;
    ticketTypeId: string;
    ticketName: string;
    dayLabel: string;
  }>;
  bundlePrice: number;
  maxQuantity?: number;
}

interface MultiDayEventFlowProps {
  onComplete: (data: {
    event: MultiDayEventData;
    days: DayConfiguration[];
    bundles: Bundle[];
    tables: any[];
  }) => void;
  onCancel: () => void;
}

export default function MultiDayEventFlow({ onComplete, onCancel }: MultiDayEventFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState<EventType>('standard');
  const [eventData, setEventData] = useState<MultiDayEventData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    sameLocation: true,
    isTicketed: false,
    categories: [],
  });
  
  const [days, setDays] = useState<DayConfiguration[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  // Update eventData based on eventType changes
  const updateEventForType = (type: EventType) => {
    setEventType(type);
    setEventData(prev => ({
      ...prev,
      isTicketed: type === 'ticketed',
    }));
  };

  const steps = [
    { id: 1, name: "Event Type", description: "Choose event type" },
    { id: 2, name: "Basic Info", description: "Event details and dates" },
    { id: 3, name: "Day Configuration", description: "Set up each day", show: eventType === 'ticketed' },
    { id: 4, name: "Bundles", description: "Create ticket bundles", show: eventType === 'ticketed' && days.length > 1 },
    { id: 5, name: "Tables", description: "Private table sales", show: eventType === 'ticketed' && days.length > 0 },
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
    onComplete({
      event: eventData,
      days,
      bundles,
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
          <MultiDayBasicInfoStep
            data={eventData}
            onChange={setEventData}
            onNext={handleNext}
            onCancel={handleBack}
            isSaveTheDate={eventType === 'savedate'}
          />
        );
      
      case "Day Configuration":
        return (
          <MultiDayTicketsStep
            eventData={eventData}
            days={days}
            onChange={setDays}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case "Bundles":
        return (
          <BundleCreationStep
            days={days}
            bundles={bundles}
            onChange={setBundles}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleNext}
          />
        );
      
      case "Tables":
        return (
          <TableConfigStep
            ticketTypes={days.flatMap(d => d.ticketTypes)}
            tables={tables}
            onChange={setTables}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleNext}
          />
        );
      
      case "Review":
        return (
          <MultiDayReviewStep
            eventData={eventData}
            days={days}
            bundles={bundles}
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