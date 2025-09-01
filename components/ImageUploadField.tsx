"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { generateUploadUrl } from "@/app/actions/uploadImage";
import { uploadToMinIO } from "@/lib/minio-upload";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (storageId: string | null, url: string | null) => void;
  label?: string;
  className?: string;
}

export default function ImageUploadField({ 
  value, 
  onChange, 
  label = "Event Image",
  className 
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload directly to MinIO (no more Convex for storage!)
      const publicUrl = await uploadToMinIO(file);
      
      // Call onChange with null for storageId (we're not using Convex storage)
      // and the MinIO public URL
      onChange(null, publicUrl);
      
      // Keep the preview URL for display
      setPreviewUrl(publicUrl);
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
    } catch (error) {
      console.error("Failed to upload image to MinIO:", error);
      alert("Failed to upload image. Please try again.");
      setPreviewUrl(null);
      onChange(null, null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={previewUrl} 
              alt="Event preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}