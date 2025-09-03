import { NextRequest, NextResponse } from 'next/server'
import * as Minio from 'minio'
import { optimizeImage, validateImage, bufferToDataURL } from '@/lib/image-optimizer'

// Initialize MinIO client
const getMinioEndpoint = () => {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Always use environment variable if set
  if (process.env.MINIO_ENDPOINT) {
    return process.env.MINIO_ENDPOINT;
  }
  
  // Use production server IP if in production, localhost for development
  return isProduction ? '72.60.28.175' : 'localhost';
}

const minioClient = new Minio.Client({
  endPoint: getMinioEndpoint(),
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'stepperslife'

// Ensure bucket exists
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      // Set bucket policy to allow public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      }
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error)
  }
}

// Handle file upload directly (server-side proxy to avoid mixed content issues)
export async function POST(request: NextRequest) {
  try {
    // Log MinIO configuration for debugging
    console.log('MinIO Configuration:', {
      endpoint: getMinioEndpoint(),
      port: process.env.MINIO_PORT || '9000',
      bucket: BUCKET_NAME,
      ssl: process.env.MINIO_USE_SSL === 'true'
    });
    
    await ensureBucket()
    
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate the image
    const validation = validateImage({ size: file.size, type: file.type })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_')
    const baseObjectName = `uploads/${timestamp}-${fileNameWithoutExt}`
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Optimize image and generate variants
    const optimized = await optimizeImage(buffer, {
      generateVariants: true,
      maxWidth: 4096,
      maxHeight: 4096,
    })
    
    // Upload all variants to MinIO
    const uploadPromises = [
      { name: `${baseObjectName}-original.webp`, buffer: optimized.original },
      { name: `${baseObjectName}-large.webp`, buffer: optimized.large },
      { name: `${baseObjectName}-medium.webp`, buffer: optimized.medium },
      { name: `${baseObjectName}-small.webp`, buffer: optimized.small },
      { name: `${baseObjectName}-thumb.webp`, buffer: optimized.thumbnail },
      { name: `${baseObjectName}-placeholder.webp`, buffer: optimized.placeholder },
    ].map(async ({ name, buffer }) => {
      await minioClient.putObject(
        BUCKET_NAME,
        name,
        buffer,
        buffer.length,
        {
          'Content-Type': 'image/webp'
        }
      )
      return name
    })
    
    await Promise.all(uploadPromises)
    
    // Generate placeholder data URL for immediate display
    const placeholderDataUrl = bufferToDataURL(optimized.placeholder)
    
    // Construct URLs for different sizes
    const baseUrl = `https://stepperslife.com/api/storage`
    const urls = {
      original: `${baseUrl}/${baseObjectName}-original.webp`,
      large: `${baseUrl}/${baseObjectName}-large.webp`,
      medium: `${baseUrl}/${baseObjectName}-medium.webp`,
      small: `${baseUrl}/${baseObjectName}-small.webp`,
      thumbnail: `${baseUrl}/${baseObjectName}-thumb.webp`,
      placeholder: placeholderDataUrl,
    }
    
    // Primary public URL (medium size for general use)
    const publicUrl = urls.medium
    
    // Direct URL for internal use (not for browser display)
    const directUrl = `http://72.60.28.175:9000/${BUCKET_NAME}/${baseObjectName}-medium.webp`
    
    return NextResponse.json({ 
      success: true,
      publicUrl,
      urls,
      directUrl,
      objectName: `${baseObjectName}-medium.webp`,
      bucketName: BUCKET_NAME,
      metadata: optimized.metadata,
    })
  } catch (error) {
    console.error('MinIO upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve file URL (kept for backward compatibility)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const objectName = searchParams.get('objectName')
    
    if (!objectName) {
      return NextResponse.json({ error: 'Object name is required' }, { status: 400 })
    }
    
    // Generate presigned URL for download (expires in 7 days)
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      objectName,
      7 * 24 * 60 * 60 // 7 days
    )
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error('MinIO get URL error:', error)
    return NextResponse.json(
      { error: 'Failed to get file URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}