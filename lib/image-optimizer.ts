import sharp from 'sharp';

export interface ImageVariant {
  buffer: Buffer;
  width: number;
  height?: number;
  suffix: string;
  quality: number;
}

export interface OptimizedImages {
  original: Buffer;
  large: Buffer;
  medium: Buffer;
  small: Buffer;
  thumbnail: Buffer;
  placeholder: Buffer;
  metadata: {
    format: string;
    width: number;
    height: number;
    size: number;
  };
}

/**
 * Image size configurations for different use cases
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, quality: 75 },
  small: { width: 400, quality: 80 },
  medium: { width: 800, quality: 85 },
  large: { width: 1920, quality: 85 },
  placeholder: { width: 20, quality: 60 },
} as const;

/**
 * Optimize and convert image to WebP format with multiple size variants
 */
export async function optimizeImage(
  input: Buffer | string,
  options: {
    maintainAspectRatio?: boolean;
    generateVariants?: boolean;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<OptimizedImages> {
  const {
    maintainAspectRatio = true,
    generateVariants = true,
    maxWidth = 4096,
    maxHeight = 4096,
  } = options;

  try {
    // Load image and get metadata
    const image = sharp(input);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image - could not read dimensions');
    }

    // Calculate dimensions respecting max limits
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;
    
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const aspectRatio = metadata.width / metadata.height;
      
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = maintainAspectRatio 
          ? Math.round(maxWidth / aspectRatio)
          : targetHeight;
      }
      
      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = maintainAspectRatio
          ? Math.round(maxHeight * aspectRatio)
          : targetWidth;
      }
    }

    // Convert original to WebP
    const original = await sharp(input)
      .resize(targetWidth, targetHeight, {
        fit: maintainAspectRatio ? 'inside' : 'fill',
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    if (!generateVariants) {
      return {
        original,
        large: original,
        medium: original,
        small: original,
        thumbnail: original,
        placeholder: original,
        metadata: {
          format: 'webp',
          width: targetWidth,
          height: targetHeight,
          size: original.length,
        },
      };
    }

    // Generate size variants
    const [large, medium, small, thumbnail, placeholder] = await Promise.all([
      // Large - Desktop
      sharp(input)
        .resize(IMAGE_SIZES.large.width, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_SIZES.large.quality, effort: 6 })
        .toBuffer(),

      // Medium - Tablet
      sharp(input)
        .resize(IMAGE_SIZES.medium.width, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_SIZES.medium.quality, effort: 6 })
        .toBuffer(),

      // Small - Mobile
      sharp(input)
        .resize(IMAGE_SIZES.small.width, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_SIZES.small.quality, effort: 6 })
        .toBuffer(),

      // Thumbnail - Square crop
      sharp(input)
        .resize(IMAGE_SIZES.thumbnail.width, IMAGE_SIZES.thumbnail.height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: IMAGE_SIZES.thumbnail.quality, effort: 6 })
        .toBuffer(),

      // Placeholder - Blurred tiny version for progressive loading
      sharp(input)
        .resize(IMAGE_SIZES.placeholder.width, undefined, {
          fit: 'inside',
        })
        .blur(5)
        .webp({ quality: IMAGE_SIZES.placeholder.quality, effort: 6 })
        .toBuffer(),
    ]);

    return {
      original,
      large,
      medium,
      small,
      thumbnail,
      placeholder,
      metadata: {
        format: 'webp',
        width: targetWidth,
        height: targetHeight,
        size: original.length,
      },
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a base64 data URL from buffer (for placeholder images)
 */
export function bufferToDataURL(buffer: Buffer, mimeType: string = 'image/webp'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate image file
 */
export function validateImage(
  file: { size: number; type: string },
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from buffer
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }
  
  return {
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Convert image to different format
 */
export async function convertImageFormat(
  input: Buffer,
  format: 'jpeg' | 'png' | 'webp',
  quality: number = 85
): Promise<Buffer> {
  const sharpInstance = sharp(input);
  
  switch (format) {
    case 'jpeg':
      return sharpInstance.jpeg({ quality }).toBuffer();
    case 'png':
      return sharpInstance.png({ quality }).toBuffer();
    case 'webp':
      return sharpInstance.webp({ quality }).toBuffer();
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}