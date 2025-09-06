/**
 * MinIO Upload Helper Functions
 * Handles image uploads via server-side proxy to avoid mixed content issues
 */

export interface MinIOUploadResponse {
  success: boolean
  publicUrl: string
  directUrl: string
  objectName: string
  bucketName: string
}

/**
 * Upload a file to MinIO via server-side proxy
 * This avoids mixed content issues by uploading through our API
 */
export async function uploadToMinIO(file: File): Promise<string> {
  try {
    // First, try MinIO upload
    const formData = new FormData()
    formData.append('file', file)
    
    // Try to upload to MinIO endpoint
    const response = await fetch('/api/upload/minio', {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      const data: MinIOUploadResponse = await response.json()
      return data.publicUrl
    }

    // If MinIO fails, fallback to simple base64 upload
    console.warn('MinIO upload failed, using base64 fallback')
    return await uploadToBase64(file)
  } catch (error) {
    console.error('Error uploading to MinIO, trying fallback:', error)
    // Fallback to base64 if MinIO is not available
    return await uploadToBase64(file)
  }
}

/**
 * Fallback upload method using base64 data URLs
 * This works without any external storage service
 */
async function uploadToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
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
 * Get a file URL from MinIO (kept for backward compatibility)
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

/**
 * DEPRECATED: Get a presigned upload URL from MinIO
 * This is no longer used - we upload directly through the server
 * @deprecated Use uploadToMinIO instead
 */
export async function getMinIOUploadUrl(filename: string, contentType?: string): Promise<any> {
  console.warn('getMinIOUploadUrl is deprecated. Use uploadToMinIO instead.')
  throw new Error('Direct presigned URLs are no longer supported. Use uploadToMinIO instead.')
}