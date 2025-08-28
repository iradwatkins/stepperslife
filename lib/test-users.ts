// Test users for development
// IMPORTANT: Never use these in production!

export const testUsers = [
  {
    id: "1",
    email: "test@stepperslife.com",
    password: "Test123!",
    name: "Test User",
    role: "user"
  },
  {
    id: "2", 
    email: "admin@stepperslife.com",
    password: "Admin123!",
    name: "Admin User",
    role: "admin"
  },
  {
    id: "3",
    email: "demo@stepperslife.com", 
    password: "Demo123!",
    name: "Demo User",
    role: "user"
  }
];

export function validateTestUser(email: string, password: string) {
  const user = testUsers.find(u => u.email === email && u.password === password);
  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}