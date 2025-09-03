'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageUrls {
  original?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumbnail?: string;
  placeholder?: string;
}

interface OptimizedImageProps {
  src: string | ImageUrls;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  useThumbnail?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  style,
  onLoad,
  onError,
  useThumbnail = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(false); // Changed to false - no loading state
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [placeholderSrc, setPlaceholderSrc] = useState<string>('');

  useEffect(() => {
    // Handle both string URLs and ImageUrls objects
    if (typeof src === 'string') {
      setImageSrc(src);
      // For string URLs, we don't have a placeholder
      setPlaceholderSrc('');
    } else if (src && typeof src === 'object') {
      // Use appropriate size based on props
      if (useThumbnail && src.thumbnail) {
        setImageSrc(src.thumbnail);
      } else if (width && width <= 400 && src.small) {
        setImageSrc(src.small);
      } else if (width && width <= 800 && src.medium) {
        setImageSrc(src.medium);
      } else if (src.large) {
        setImageSrc(src.large);
      } else if (src.original) {
        setImageSrc(src.original);
      } else if (src.medium) {
        setImageSrc(src.medium);
      }
      
      // Set placeholder if available
      if (src.placeholder) {
        setPlaceholderSrc(src.placeholder);
      }
    }
  }, [src, width, useThumbnail]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  // Fallback for error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style,
        }}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Generate responsive sizes string if using ImageUrls
  const responsiveSizes = sizes || (
    typeof src === 'object'
      ? '(max-width: 400px) 400px, (max-width: 800px) 800px, 1920px'
      : undefined
  );

  // Generate srcSet for responsive images
  const srcSet = typeof src === 'object' && src.small && src.medium && src.large
    ? `${src.small} 400w, ${src.medium} 800w, ${src.large} 1920w`
    : undefined;

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Main image - no loading skeleton, show immediately */}
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          quality={quality}
          sizes={responsiveSizes}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholderSrc ? 'blur' : 'empty'}
          blurDataURL={placeholderSrc}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className="object-cover"
          priority={priority}
          quality={quality}
          sizes={responsiveSizes}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholderSrc ? 'blur' : 'empty'}
          blurDataURL={placeholderSrc}
        />
      )}
    </div>
  );
}

// Helper component for lazy loading with Intersection Observer
export function LazyOptimizedImage(props: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref]);

  return (
    <div ref={setRef}>
      {isInView ? (
        <OptimizedImage {...props} />
      ) : (
        <div
          className={`bg-gray-200 animate-pulse ${props.className || ''}`}
          style={{
            width: props.fill ? '100%' : props.width,
            height: props.fill ? '100%' : props.height,
            ...props.style,
          }}
        />
      )}
    </div>
  );
}