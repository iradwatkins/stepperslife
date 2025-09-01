/**
 * Migration Script: Copy images from Convex to MinIO
 * This script will:
 * 1. Fetch all events with imageStorageId
 * 2. Download images from Convex
 * 3. Upload them to MinIO
 * 4. Update events with new MinIO URLs
 */

const { ConvexHttpClient } = require("convex/browser");
const Minio = require("minio");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Load environment
require("dotenv").config({ path: ".env.production" });

// Initialize Convex client
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "72.60.28.175",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "stepperslife";
const TEMP_DIR = "./temp-images";

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`✅ Created bucket: ${BUCKET_NAME}`);
  }
}

async function downloadFromConvex(storageId) {
  try {
    // Get the URL from Convex
    const { api } = await import("../convex/_generated/api.js");
    const url = await convexClient.query(api.storage.getUrl, { storageId });
    
    if (!url) {
      console.error(`  ❌ No URL found for storage ID: ${storageId}`);
      return null;
    }

    // Download the image
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  ❌ Failed to download image: ${response.statusText}`);
      return null;
    }

    const buffer = await response.buffer();
    const fileName = `convex-${storageId}.jpg`;
    const filePath = path.join(TEMP_DIR, fileName);
    
    // Save temporarily
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✅ Downloaded: ${fileName}`);
    
    return filePath;
  } catch (error) {
    console.error(`  ❌ Error downloading from Convex:`, error.message);
    return null;
  }
}

async function uploadToMinIO(filePath, eventId) {
  try {
    const fileName = path.basename(filePath);
    const objectName = `events/${eventId}/${fileName}`;
    
    // Upload to MinIO
    await minioClient.fPutObject(BUCKET_NAME, objectName, filePath, {
      "Content-Type": "image/jpeg",
    });
    
    // Generate public URL
    const publicUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
    
    console.log(`  ✅ Uploaded to MinIO: ${objectName}`);
    return publicUrl;
  } catch (error) {
    console.error(`  ❌ Error uploading to MinIO:`, error.message);
    return null;
  }
}

async function migrateImages() {
  console.log("🚀 Starting image migration from Convex to MinIO...\n");
  
  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }
  
  // Ensure MinIO bucket exists
  await ensureBucket();
  
  try {
    // Get all events from Convex
    const { api } = await import("../convex/_generated/api.js");
    const events = await convexClient.query(api.events.get);
    
    console.log(`Found ${events.length} events to check...\n`);
    
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const event of events) {
      if (event.imageStorageId && !event.imageUrl) {
        console.log(`\n📸 Processing event: ${event.name} (${event._id})`);
        
        // Download from Convex
        const localPath = await downloadFromConvex(event.imageStorageId);
        if (!localPath) {
          failed++;
          continue;
        }
        
        // Upload to MinIO
        const minioUrl = await uploadToMinIO(localPath, event._id);
        if (!minioUrl) {
          failed++;
          continue;
        }
        
        // Update event with new URL
        try {
          await convexClient.mutation(api.events.updateEvent, {
            eventId: event._id,
            updates: { imageUrl: minioUrl },
          });
          console.log(`  ✅ Updated event with MinIO URL`);
          migrated++;
        } catch (error) {
          console.error(`  ❌ Failed to update event:`, error.message);
          failed++;
        }
        
        // Clean up temp file
        fs.unlinkSync(localPath);
      } else if (event.imageUrl) {
        console.log(`⏭️  Skipping ${event.name} - already has imageUrl`);
        skipped++;
      } else {
        console.log(`⏭️  Skipping ${event.name} - no image`);
        skipped++;
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Complete!");
    console.log("=".repeat(50));
    console.log(`✅ Migrated: ${migrated} images`);
    console.log(`⏭️  Skipped: ${skipped} events`);
    console.log(`❌ Failed: ${failed} images`);
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    // Clean up temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true });
    }
  }
}

// Run the migration
migrateImages()
  .then(() => {
    console.log("\n✨ Migration script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });