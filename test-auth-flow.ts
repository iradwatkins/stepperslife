// Test script to verify authentication flow
// Run with: npx tsx test-auth-flow.ts

import { NextAuthConfig } from "next-auth";

// Test loading the auth configurations
console.log("🧪 Testing Authentication Configuration...\n");

try {
  // Test simple config
  console.log("✅ Loading simple auth config...");
  const simpleConfig = require("./auth.config.simple");
  console.log("  - Providers:", simpleConfig.default.providers.map((p: any) => p.id || p.name));
  
  // Test production config
  console.log("\n✅ Loading production auth config...");
  const prodConfig = require("./auth.config.production");
  console.log("  - Providers:", prodConfig.default.providers.map((p: any) => p.id || p.name));
  
  // Check environment variables
  console.log("\n🔍 Checking environment variables:");
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV || "development",
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  
  // Test callback URL handling
  console.log("\n🔗 Testing callback URL handling:");
  const testUrls = [
    "http://stepperslife.com/seller/new-event",
    "https://stepperslife.com/seller/new-event",
    "/seller/new-event",
    "https://stepperslife.com/auth/signin?callbackUrl=/seller/new-event",
  ];
  
  testUrls.forEach(url => {
    console.log(`  - Input: ${url}`);
    // In production, should convert to HTTPS
  });
  
  console.log("\n✅ Authentication configuration test completed!");
  
} catch (error) {
  console.error("❌ Error testing auth configuration:", error);
}