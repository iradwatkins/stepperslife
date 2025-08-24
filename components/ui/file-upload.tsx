"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

interface FileUploadProps {
  value?: File | File[] | null;
  onChange: (files: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert value to array for consistent handling
  const files: UploadedFile[] = value
    ? (Array.isArray(value) ? value : [value]).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
      }))
    : [];

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds maximum size of ${formatBytes(maxSize)}`;
    }
    
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;
      
      const isAccepted = acceptedTypes.some((accepted) => {
        if (accepted.endsWith("/*")) {
          return fileType.startsWith(accepted.replace("/*", "/"));
        }
        if (accepted.startsWith(".")) {
          return fileExtension === accepted;
        }
        return fileType === accepted;
      });
      
      if (!isAccepted) {
        return `File type not accepted: ${file.name}`;
      }
    }
    
    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      // Check max files limit
      if (multiple && files.length + fileArray.length > maxFiles) {
        validationErrors.push(`Maximum ${maxFiles} files allowed`);
        setErrors(validationErrors);
        return;
      }

      // Validate each file
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      setErrors(validationErrors);

      if (validFiles.length > 0) {
        if (multiple) {
          const updatedFiles = [...files.map((f) => f.file), ...validFiles];
          onChange(updatedFiles);
        } else {
          onChange(validFiles[0]);
        }
      }
    },
    [files, maxFiles, multiple, onChange]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id).map((f) => f.file);
    
    if (multiple) {
      onChange(updatedFiles.length > 0 ? updatedFiles : null);
    } else {
      onChange(null);
    }
    setErrors([]);
  };

  const clearFiles = () => {
    onChange(null);
    setErrors([]);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[200px] flex-col items-center justify-center",
          "rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
          className="sr-only"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full border p-3">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-2 text-sm font-medium">
            Drop your files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            {accept === "image/*" 
              ? `Images up to ${formatBytes(maxSize)}`
              : `Files up to ${formatBytes(maxSize)}`}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={openFileDialog}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Files
          </Button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-md bg-destructive/10 p-3">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {file.preview && (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                {!file.preview && (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.file.size)}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFile(file.id)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {files.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFiles}
              disabled={disabled}
            >
              Remove all files
            </Button>
          )}
        </div>
      )}
    </div>
  );
}