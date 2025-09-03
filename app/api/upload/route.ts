import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { optimizeImage, validateImage, bufferToDataURL } from "@/lib/image-optimizer";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate the image
    const validation = validateImage({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename base (without extension)
    const uniqueId = randomUUID();
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "events");
    await mkdir(uploadsDir, { recursive: true });
    
    // Optimize image and generate variants
    const optimized = await optimizeImage(buffer, {
      generateVariants: true,
      maxWidth: 4096,
      maxHeight: 4096,
    });
    
    // Save all variants
    const savedFiles = await Promise.all([
      { suffix: 'original', buffer: optimized.original },
      { suffix: 'large', buffer: optimized.large },
      { suffix: 'medium', buffer: optimized.medium },
      { suffix: 'small', buffer: optimized.small },
      { suffix: 'thumb', buffer: optimized.thumbnail },
      { suffix: 'placeholder', buffer: optimized.placeholder },
    ].map(async ({ suffix, buffer }) => {
      const filename = `${uniqueId}-${suffix}.webp`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      return { suffix, url: `/uploads/events/${filename}` };
    }));
    
    // Generate placeholder data URL
    const placeholderDataUrl = bufferToDataURL(optimized.placeholder);
    
    // Create URLs object
    const urls = {
      original: savedFiles.find(f => f.suffix === 'original')?.url,
      large: savedFiles.find(f => f.suffix === 'large')?.url,
      medium: savedFiles.find(f => f.suffix === 'medium')?.url,
      small: savedFiles.find(f => f.suffix === 'small')?.url,
      thumbnail: savedFiles.find(f => f.suffix === 'thumb')?.url,
      placeholder: placeholderDataUrl,
    };
    
    // Return the URL path for the uploaded image (medium as default)
    const imageUrl = urls.medium || `/uploads/events/${uniqueId}-medium.webp`;
    
    return NextResponse.json({ 
      success: true,
      imageUrl,
      urls,
      filename: `${uniqueId}-medium.webp`,
      metadata: optimized.metadata,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}