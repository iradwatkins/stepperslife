"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShirtIcon, FileTextIcon } from "lucide-react";
import PrintedMaterialsForm from "./PrintedMaterialsForm";
import TShirtOrderForm from "./TShirtOrderForm";
import { Id } from "@/convex/_generated/dataModel";

interface ProductSectionProps {
  eventId?: Id<"events">;
  userId: string;
}

export default function ProductSection({ eventId, userId }: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState("printed");

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order Custom Products
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create custom merchandise and promotional materials for your event
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="printed" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Printed Materials
          </TabsTrigger>
          <TabsTrigger value="tshirts" className="flex items-center gap-2">
            <ShirtIcon className="h-4 w-4" />
            T-Shirts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="printed" className="mt-0">
          <PrintedMaterialsForm 
            eventId={eventId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="tshirts" className="mt-0">
          <TShirtOrderForm 
            eventId={eventId}
            userId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}