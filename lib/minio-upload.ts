/**
 * MinIO Upload Helper Functions
 * Handles image uploads directly to MinIO storage, bypassing Convex
 */

export interface MinIOUploadResponse {
  uploadUrl: string
  publicUrl: string
  objectName: string
  bucketName: string
}

/**
 * Get a presigned upload URL from MinIO
 */
export async function getMinIOUploadUrl(filename: string, contentType?: string): Promise<MinIOUploadResponse> {
  try {
    const response = await fetch('/api/upload/minio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType: contentType || 'image/jpeg'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get upload URL')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting MinIO upload URL:', error)
    throw error
  }
}

/**
 * Upload a file directly to MinIO using presigned URL
 */
export async function uploadToMinIO(file: File): Promise<string> {
  try {
    // Step 1: Get presigned URL
    const { uploadUrl, publicUrl } = await getMinIOUploadUrl(file.name, file.type)
    
    // Step 2: Upload file directly to MinIO
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    // Step 3: Return the public URL
    return publicUrl
  } catch (error) {
    console.error('Error uploading to MinIO:', error)
    throw error
  }
}

/**
 * Upload a blob URL to MinIO
 */
export async function uploadBlobToMinIO(blobUrl: string): Promise<string> {
  try {
    // Fetch the blob from the URL
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    const file = new File([blob], `image-${Date.now()}.jpg`, { 
      type: blob.type || 'image/jpeg' 
    })
    
    return uploadToMinIO(file)
  } catch (error) {
    console.error('Error uploading blob to MinIO:', error)
    throw error
  }
}

/**
 * Get a file URL from MinIO
 */
export async function getMinIOFileUrl(objectName: string): Promise<string> {
  try {
    const response = await fetch(`/api/upload/minio?objectName=${encodeURIComponent(objectName)}`)
    
    if (!response.ok) {
      throw new Error('Failed to get file URL')
    }

    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Error getting MinIO file URL:', error)
    throw error
  }
}