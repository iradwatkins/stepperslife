"use server";

// MinIO upload functions - no more Convex storage!
// Images are uploaded directly to MinIO and URLs are stored in the database

export async function generateUploadUrl() {
  // This function is no longer needed - MinIO handles uploads via API route
  // Keeping for backward compatibility but returning error
  return {
    success: false,
    error: "Please use MinIO upload endpoint at /api/upload/minio"
  };
}

export async function getImageUrl(imageUrl: string) {
  // Simply return the MinIO URL that's already stored
  // No need to query Convex storage anymore
  return {
    success: true,
    url: imageUrl || "/placeholder-event.jpg"
  };
}