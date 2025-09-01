/**
 * Migrate all images from Convex Storage to MinIO
 * Run with: npx tsx scripts/migrate-convex-to-minio.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as Minio from "minio";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load production environment
dotenv.config({ path: ".env.production" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";
const MINIO_ENDPOINT = "72.60.28.175";
const MINIO_PORT = 9000;
const BUCKET_NAME = "stepperslife";
const TEMP_DIR = "./temp-migration";

// Initialize clients
const convex = new ConvexHttpClient(CONVEX_URL);
const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

async function ensureMinioSetup() {
  console.log("🔧 Setting up MinIO...");
  
  // Check/create bucket
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    console.log(`  ✅ Created bucket: ${BUCKET_NAME}`);
  } else {
    console.log(`  ✅ Bucket exists: ${BUCKET_NAME}`);
  }
  
  // Set public read policy
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
  console.log("  ✅ Bucket policy set for public read access");
}

async function downloadImage(storageId: string, eventName: string): Promise<string | null> {
  try {
    console.log(`  📥 Downloading from Convex (${storageId})...`);
    
    // Get URL from Convex
    const url = await convex.query(api.storage.getUrl, { storageId });
    if (!url) {
      console.log(`    ❌ No URL returned from Convex`);
      return null;
    }
    
    // Download the image
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`    ❌ Failed to download: ${response.statusText}`);
      return null;
    }
    
    // Save to temp file
    const buffer = await response.buffer();
    const sanitizedName = eventName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const fileName = `${sanitizedName}_${storageId.substring(0, 8)}.jpg`;
    const filePath = path.join(TEMP_DIR, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`    ✅ Downloaded: ${fileName}`);
    
    return filePath;
  } catch (error: any) {
    console.log(`    ❌ Download error: ${error.message}`);
    return null;
  }
}

async function uploadToMinIO(filePath: string, eventId: string, eventName: string): Promise<string | null> {
  try {
    const fileName = path.basename(filePath);
    const objectName = `events/${eventId}/${fileName}`;
    
    console.log(`  📤 Uploading to MinIO...`);
    
    // Upload file
    await minioClient.fPutObject(BUCKET_NAME, objectName, filePath, {
      "Content-Type": "image/jpeg",
    });
    
    // Generate public URL
    const publicUrl = `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
    console.log(`    ✅ Uploaded: ${objectName}`);
    console.log(`    🔗 URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error: any) {
    console.log(`    ❌ Upload error: ${error.message}`);
    return null;
  }
}

async function migrate() {
  console.log("\n🚀 CONVEX → MINIO IMAGE MIGRATION");
  console.log("=" .repeat(50));
  console.log(`Convex: ${CONVEX_URL}`);
  console.log(`MinIO: http://${MINIO_ENDPOINT}:${MINIO_PORT}`);
  console.log("=" .repeat(50) + "\n");
  
  // Setup
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  await ensureMinioSetup();
  
  try {
    // Get all events
    console.log("\n📋 Fetching events from Convex...");
    const events = await convex.query(api.events.get);
    console.log(`  Found ${events.length} total events\n`);
    
    let stats = {
      total: events.length,
      withImages: 0,
      migrated: 0,
      alreadyMigrated: 0,
      noImage: 0,
      failed: 0,
    };
    
    // Process each event
    for (const event of events) {
      console.log(`\n🎯 Event: ${event.name}`);
      console.log(`  ID: ${event._id}`);
      
      // Check if has Convex image
      if (event.imageStorageId) {
        stats.withImages++;
        
        // Check if already migrated
        if (event.imageUrl && event.imageUrl.includes(MINIO_ENDPOINT)) {
          console.log(`  ⏭️  Already migrated to MinIO`);
          stats.alreadyMigrated++;
          continue;
        }
        
        // Download from Convex
        const localPath = await downloadImage(event.imageStorageId, event.name);
        if (!localPath) {
          stats.failed++;
          continue;
        }
        
        // Upload to MinIO
        const minioUrl = await uploadToMinIO(localPath, event._id, event.name);
        if (!minioUrl) {
          stats.failed++;
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
          continue;
        }
        
        // Update event in Convex
        try {
          await convex.mutation(api.events.updateEvent, {
            eventId: event._id,
            updates: { imageUrl: minioUrl },
          });
          console.log(`  ✅ Event updated with MinIO URL`);
          stats.migrated++;
        } catch (error: any) {
          console.log(`  ❌ Failed to update event: ${error.message}`);
          stats.failed++;
        }
        
        // Clean up temp file
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        
      } else if (event.imageUrl) {
        console.log(`  ℹ️  Has imageUrl but no imageStorageId`);
        stats.alreadyMigrated++;
      } else {
        console.log(`  ⚪ No image`);
        stats.noImage++;
      }
    }
    
    // Final report
    console.log("\n" + "=" .repeat(50));
    console.log("📊 MIGRATION COMPLETE!");
    console.log("=" .repeat(50));
    console.log(`Total Events: ${stats.total}`);
    console.log(`  📸 With Convex Images: ${stats.withImages}`);
    console.log(`  ✅ Newly Migrated: ${stats.migrated}`);
    console.log(`  ⏭️  Already on MinIO: ${stats.alreadyMigrated}`);
    console.log(`  ⚪ No Image: ${stats.noImage}`);
    console.log(`  ❌ Failed: ${stats.failed}`);
    
    if (stats.migrated > 0) {
      console.log("\n🎉 SUCCESS! Images are now on MinIO!");
      console.log("Convex is now just your database!");
    }
    
  } catch (error: any) {
    console.error("\n💥 Migration failed:", error);
    throw error;
  } finally {
    // Cleanup
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true });
      console.log("\n🧹 Cleaned up temp files");
    }
  }
}

// Run migration
console.log("Starting migration...");
migrate()
  .then(() => {
    console.log("\n✨ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });