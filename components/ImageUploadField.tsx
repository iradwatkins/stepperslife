"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Image as ImageIcon, CloudUpload } from "lucide-react";
import { uploadToMinIO } from "@/lib/minio-upload";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string | null) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`Image must be less than ${maxSize / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload directly to MinIO (no more Convex for storage!)
      const publicUrl = await uploadToMinIO(file);
      
      // Call onChange with the MinIO public URL
      onChange(publicUrl);
      
      // Keep the preview URL for display
      setPreviewUrl(publicUrl);
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
    } catch (error) {
      console.error("Failed to upload image to MinIO:", error);
      // More user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message.includes('fetch') || error.message.includes('network')
          ? "Unable to connect to image storage. Please check your connection and try again."
          : "Failed to upload image. Please try again."
        : "Failed to upload image. Please try again.";
      alert(errorMessage);
      setPreviewUrl(null);
      onChange(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await processFile(imageFile);
    } else if (files.length > 0) {
      alert('Please drop an image file');
    }
  };
  
  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
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
          <div className="relative w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-200 p-4">
            <img 
              src={previewUrl} 
              alt="Event preview" 
              className="w-full h-auto object-contain mx-auto"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isDragging 
                ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm font-medium text-gray-700 mt-4">Uploading image...</p>
              </>
            ) : (
              <>
                <CloudUpload className={`w-16 h-16 mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragging ? "Drop image here" : "Drag & Drop your event image"}
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Supports: PNG, JPG, JPEG, WebP (up to 50MB)
                </p>
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
          </div>
        )}
      </div>
    </div>
  );
}