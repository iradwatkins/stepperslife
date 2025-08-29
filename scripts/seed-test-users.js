const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

// Test users to seed
const TEST_USERS = [
  {
    email: "test@stepperslife.com",
    password: "Test123!",
    name: "Test User"
  },
  {
    email: "admin@stepperslife.com",
    password: "Admin123!",
    name: "Admin User"
  },
  {
    email: "demo@stepperslife.com",
    password: "Demo123!",
    name: "Demo User"
  }
];

async function seedTestUsers() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://mild-newt-621.convex.cloud";
  const client = new ConvexHttpClient(convexUrl);
  
  console.log("🌱 Seeding test users...");
  console.log("Convex URL:", convexUrl);
  
  for (const user of TEST_USERS) {
    try {
      // Check if user exists
      const { api } = require("../convex/_generated/api");
      const existing = await client.query(api.users.getUserByEmail, { email: user.email });
      
      if (existing) {
        console.log(`✅ User already exists: ${user.email}`);
        continue;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      // Create user
      await client.mutation(api.users.createUser, {
        email: user.email,
        name: user.name,
        passwordHash
      });
      
      console.log(`✅ Created user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message);
    }
  }
  
  console.log("\n✨ Test users seeding complete!");
  console.log("\nYou can now login with:");
  TEST_USERS.forEach(u => {
    console.log(`  Email: ${u.email}, Password: ${u.password}`);
  });
}

seedTestUsers().catch(console.error);