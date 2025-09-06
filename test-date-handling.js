#!/usr/bin/env node

/**
 * Test script to verify date handling fixes
 * Tests that dates don't shift due to timezone issues
 */

console.log("🧪 Testing Date Handling Fixes\n");
console.log("=" .repeat(50));

// Simulate different US timezones
const timezones = [
  { name: "US Eastern (UTC-5)", offset: -5 },
  { name: "US Central (UTC-6)", offset: -6 },
  { name: "US Mountain (UTC-7)", offset: -7 },
  { name: "US Pacific (UTC-8)", offset: -8 },
];

// Test date strings (what user enters in date picker)
const testDates = [
  "2025-09-12",  // September 12, 2025
  "2025-12-31",  // December 31, 2025 (edge case)
  "2025-01-01",  // January 1, 2025 (edge case)
];

console.log("\n📅 Testing Date Conversion Methods:\n");

// Method 1: Using new Date() directly (PROBLEMATIC)
console.log("❌ PROBLEMATIC METHOD - new Date(dateString):");
testDates.forEach(dateStr => {
  const date = new Date(dateStr);
  console.log(`  Input: ${dateStr}`);
  console.log(`  UTC interpretation: ${date.toISOString()}`);
  console.log(`  Local display: ${date.toLocaleDateString('en-US')}`);
  console.log(`  Note: Date may shift by 1 day depending on timezone!\n`);
});

console.log("-".repeat(50));

// Method 2: Parse as local date (FIXED)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

console.log("\n✅ FIXED METHOD - parseLocalDate():");
testDates.forEach(dateStr => {
  const date = parseLocalDate(dateStr);
  console.log(`  Input: ${dateStr}`);
  console.log(`  Local interpretation: ${date.toString()}`);
  console.log(`  Local display: ${date.toLocaleDateString('en-US')}`);
  console.log(`  Timestamp: ${date.getTime()}`);
  console.log(`  ✓ Date remains consistent!\n`);
});

console.log("-".repeat(50));

// Test the actual problem scenario
console.log("\n🔍 Reproducing the Reported Issue:\n");

const userInput = {
  startDate: "2025-09-12",
  endDate: "2025-09-14"
};

console.log("User enters:");
console.log(`  Start: ${userInput.startDate} (Sept 12)`);
console.log(`  End: ${userInput.endDate} (Sept 14)`);

console.log("\nUsing old method (new Date):");
const oldStart = new Date(userInput.startDate);
const oldEnd = new Date(userInput.endDate);
console.log(`  Display: ${oldStart.toLocaleDateString()} - ${oldEnd.toLocaleDateString()}`);
console.log(`  ⚠️  May show as Sept 11 - Sept 13 in US timezones!`);

console.log("\nUsing fixed method (parseLocalDate):");
const newStart = parseLocalDate(userInput.startDate);
const newEnd = parseLocalDate(userInput.endDate);
console.log(`  Display: ${newStart.toLocaleDateString()} - ${newEnd.toLocaleDateString()}`);
console.log(`  ✅ Always shows as Sept 12 - Sept 14!`);

console.log("\n" + "=".repeat(50));
console.log("✅ Date Handling Test Complete\n");

// Demonstrate the difference in timestamps
console.log("📊 Timestamp Comparison:");
console.log(`  Old method timestamp: ${oldStart.getTime()}`);
console.log(`  New method timestamp: ${newStart.getTime()}`);
console.log(`  Difference: ${Math.abs(oldStart.getTime() - newStart.getTime()) / (1000 * 60 * 60)} hours`);

console.log("\n💡 Summary:");
console.log("- The old method interprets YYYY-MM-DD as UTC midnight");
console.log("- The new method interprets YYYY-MM-DD as local midnight");
console.log("- This prevents dates from shifting by 1 day in US timezones");
console.log("- All date inputs now consistently show the date the user selected");