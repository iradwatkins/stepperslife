"use server";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function generateUploadUrl() {
  try {
    const uploadUrl = await fetchMutation(api.storage.generateUploadUrl, {});
    return {
      success: true,
      uploadUrl
    };
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    return {
      success: false,
      error: error.message || "Failed to generate upload URL"
    };
  }
}

export async function getImageUrl(storageId: Id<"_storage">) {
  try {
    const url = await fetchQuery(api.storage.getUrl, { storageId });
    return {
      success: true,
      url
    };
  } catch (error: any) {
    console.error("Error getting image URL:", error);
    return {
      success: false,
      error: error.message || "Failed to get image URL"
    };
  }
}