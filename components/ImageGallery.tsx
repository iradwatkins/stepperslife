"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  mainImage?: string;
  eventName: string;
}

export default function ImageGallery({ images, mainImage, eventName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Combine main image with gallery images
  const allImages = mainImage ? [mainImage, ...images] : images;
  
  if (allImages.length === 0) return null;
  
  const handlePrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setSelectedImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };
  
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <>
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-lg group">
          <img
            src={allImages[selectedImageIndex]}
            alt={`${eventName} - Image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={openModal}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-event.jpg";
            }}
          />
          
          {/* Expand Icon */}
          <button
            onClick={openModal}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            aria-label="View full size"
          >
            <Expand className="w-5 h-5" />
          </button>
          
          {/* Navigation Arrows (if multiple images) */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail Strip (if multiple images) */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-cyan-500 shadow-lg scale-105"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={image}
                  alt={`${eventName} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-event.jpg";
                  }}
                />
                {index === 0 && mainImage && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-1">
                    <span className="text-white text-xs font-semibold">Main</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={allImages[selectedImageIndex]}
            alt={`${eventName} - Fullscreen ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-event.jpg";
            }}
          />
          
          {/* Modal Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          {/* Modal Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 text-white rounded-full">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}