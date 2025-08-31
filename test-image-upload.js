#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

async function testImageUpload() {
  console.log("🧪 Testing Image Upload to Convex Storage");
  console.log("=========================================");
  
  const client = new ConvexClient("https://youthful-porcupine-760.convex.cloud");
  
  try {
    // Test 1: Generate upload URL
    console.log("\n📝 Test 1: Generating upload URL...");
    const uploadUrl = await client.mutation(api.storage.generateUploadUrl);
    
    if (!uploadUrl) {
      throw new Error("Failed to generate upload URL");
    }
    
    console.log("✅ Upload URL generated successfully");
    console.log(`   URL starts with: ${uploadUrl.substring(0, 50)}...`);
    
    // Test 2: Test upload (simulate)
    console.log("\n📤 Test 2: Testing upload endpoint...");
    const testBlob = new Blob(["test"], { type: "text/plain" });
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": testBlob.type },
      body: testBlob,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }
    
    const { storageId } = await uploadResponse.json();
    console.log("✅ Test upload successful");
    console.log(`   Storage ID: ${storageId}`);
    
    // Test 3: Get URL for uploaded file
    console.log("\n🔗 Test 3: Getting URL for uploaded file...");
    const fileUrl = await client.mutation(api.storage.getUrl, { storageId });
    
    if (!fileUrl) {
      throw new Error("Failed to get file URL");
    }
    
    console.log("✅ File URL retrieved successfully");
    console.log(`   URL: ${fileUrl}`);
    
    // Test 4: Clean up test file
    console.log("\n🗑️  Test 4: Cleaning up test file...");
    await client.mutation(api.storage.deleteImage, { storageId });
    console.log("✅ Test file deleted successfully");
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS PASSED!");
    console.log("Image upload functionality is working correctly");
    console.log("=".repeat(50));
    
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error("Error:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Run the test
testImageUpload().then(() => {
  console.log("\n✨ Test completed successfully");
  process.exit(0);
}).catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});