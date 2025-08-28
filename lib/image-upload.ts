import { Id } from "@/convex/_generated/dataModel";

export async function uploadImageToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>
): Promise<Id<"_storage"> | null> {
  try {
    // Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();
    
    // Upload the file
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    
    const { storageId } = await response.json();
    return storageId as Id<"_storage">;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function uploadBlobToConvex(
  blobUrl: string,
  generateUploadUrl: () => Promise<string>
): Promise<Id<"_storage"> | null> {
  try {
    // Fetch the blob from the URL
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
    
    return uploadImageToConvex(file, generateUploadUrl);
  } catch (error) {
    console.error("Error converting blob URL to storage ID:", error);
    return null;
  }
}