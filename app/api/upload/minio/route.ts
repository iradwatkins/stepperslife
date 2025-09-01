import { NextRequest, NextResponse } from 'next/server'
import * as Minio from 'minio'

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
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

export async function POST(request: NextRequest) {
  try {
    await ensureBucket()
    
    const { filename, contentType } = await request.json()
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const objectName = `uploads/${timestamp}-${sanitizedFilename}`
    
    // Generate presigned URL for upload (expires in 1 hour)
    const uploadUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      objectName,
      3600 // 1 hour expiry
    )
    
    // Construct the public URL for accessing the file after upload
    const publicUrl = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${objectName}`
    
    return NextResponse.json({ 
      uploadUrl,
      publicUrl,
      objectName,
      bucketName: BUCKET_NAME
    })
  } catch (error) {
    console.error('MinIO upload URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve file URL
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