import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy endpoint to serve MinIO images over HTTPS
 * This avoids mixed content errors when displaying images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the full object path
    const objectPath = params.path.join('/')
    
    // Get MinIO configuration from environment
    const minioEndpoint = process.env.MINIO_ENDPOINT || '72.60.28.175'
    const minioPort = process.env.MINIO_PORT || '9000'
    const minioBucket = process.env.MINIO_BUCKET || 'stepperslife'
    
    // Construct MinIO URL
    const minioUrl = `http://${minioEndpoint}:${minioPort}/${minioBucket}/${objectPath}`
    
    // Fetch the image from MinIO
    const response = await fetch(minioUrl)
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Stream the image data
    const imageData = await response.arrayBuffer()
    
    // Return the image with proper headers
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Error loading image', { status: 500 })
  }
}