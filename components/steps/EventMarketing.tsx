"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SimpleCategorySelector, EventCategory } from "@/components/ui/simple-category-selector";
import { FileUpload } from "@/components/ui/file-upload";
import Image from "next/image";

interface EventMarketingProps {
  form: any;
}

export default function EventMarketing({ form }: EventMarketingProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      form.setValue("imageFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("imageFile", null);
      setImagePreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Marketing & Media</h3>
        <p className="text-sm text-gray-600">
          Add categories and images to help people discover your event.
        </p>
      </div>

      {/* Event Categories */}
      <FormField
        control={form.control}
        name="eventCategories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Categories</FormLabel>
            <FormControl>
              <SimpleCategorySelector
                value={field.value as EventCategory[]}
                onChange={(value) => field.onChange(value)}
                maxCategories={5}
              />
            </FormControl>
            <FormDescription>
              Choose up to 5 categories that best describe your event
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Event Image */}
      <FormField
        control={form.control}
        name="imageFile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Image</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <FileUpload
                  value={field.value}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple={false}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
                
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Upload an eye-catching image for your event (max 10MB)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}