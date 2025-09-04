#!/usr/bin/env node

// Simple test runner for date/time validation functions
console.log('🧪 QA Date/Time Validation Tests\n');
console.log('=' .repeat(60));

// Helper functions (copied from qa-test-helpers.ts)
function convert24to12Hour(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatDateForDisplay(isoDate) {
  const date = new Date(isoDate + 'T00:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Test 1: 12-Hour Time Conversion
console.log('\n📅 Test 1: 12-Hour Time Format Conversion');
console.log('-'.repeat(40));

const timeTests = [
  { input: '00:00', expected: '12:00 AM', description: 'Midnight' },
  { input: '00:30', expected: '12:30 AM', description: 'After midnight' },
  { input: '01:00', expected: '1:00 AM', description: 'Early morning' },
  { input: '10:00', expected: '10:00 AM', description: 'Morning' },
  { input: '11:59', expected: '11:59 AM', description: 'Before noon' },
  { input: '12:00', expected: '12:00 PM', description: 'Noon' },
  { input: '12:30', expected: '12:30 PM', description: 'After noon' },
  { input: '13:00', expected: '1:00 PM', description: 'Early afternoon' },
  { input: '14:00', expected: '2:00 PM', description: 'Afternoon' },
  { input: '18:30', expected: '6:30 PM', description: 'Evening' },
  { input: '19:00', expected: '7:00 PM', description: 'Evening party time' },
  { input: '20:00', expected: '8:00 PM', description: 'Late evening' },
  { input: '23:00', expected: '11:00 PM', description: 'Late night' },
  { input: '23:30', expected: '11:30 PM', description: 'Very late' },
  { input: '23:59', expected: '11:59 PM', description: 'One minute to midnight' }
];

let passedTests = 0;
let failedTests = 0;

timeTests.forEach(test => {
  const result = convert24to12Hour(test.input);
  const passed = result === test.expected;
  
  if (passed) {
    console.log(`✅ ${test.description}: ${test.input} → ${result}`);
    passedTests++;
  } else {
    console.log(`❌ ${test.description}: ${test.input} → ${result} (expected: ${test.expected})`);
    failedTests++;
  }
});

console.log(`\n📊 Time Conversion Results: ${passedTests} passed, ${failedTests} failed`);

// Test 2: Date Format Display
console.log('\n📅 Test 2: Date Format Display');
console.log('-'.repeat(40));

const dateTests = [
  { input: '2025-01-01', expected: 'January 1, 2025', description: 'New Year' },
  { input: '2025-01-25', expected: 'January 25, 2025', description: 'January date' },
  { input: '2025-02-05', expected: 'February 5, 2025', description: 'February date' },
  { input: '2025-02-14', expected: 'February 14, 2025', description: 'Valentine\'s Day' },
  { input: '2025-02-20', expected: 'February 20, 2025', description: 'Late February' },
  { input: '2025-02-28', expected: 'February 28, 2025', description: 'End of February' },
  { input: '2025-03-01', expected: 'March 1, 2025', description: 'Start of March' },
  { input: '2025-03-02', expected: 'March 2, 2025', description: 'Early March' },
  { input: '2025-03-10', expected: 'March 10, 2025', description: 'Mid March' },
  { input: '2025-03-16', expected: 'March 16, 2025', description: 'March date' },
  { input: '2025-03-21', expected: 'March 21, 2025', description: 'Spring date' },
  { input: '2025-03-23', expected: 'March 23, 2025', description: 'Late March' },
  { input: '2025-04-04', expected: 'April 4, 2025', description: 'April date' },
  { input: '2025-04-06', expected: 'April 6, 2025', description: 'Early April' },
  { input: '2025-12-31', expected: 'December 31, 2025', description: 'New Year\'s Eve' }
];

let datePassedTests = 0;
let dateFailedTests = 0;

dateTests.forEach(test => {
  const result = formatDateForDisplay(test.input);
  const passed = result === test.expected;
  
  if (passed) {
    console.log(`✅ ${test.description}: ${test.input} → ${result}`);
    datePassedTests++;
  } else {
    console.log(`❌ ${test.description}: ${test.input} → ${result} (expected: ${test.expected})`);
    dateFailedTests++;
  }
});

console.log(`\n📊 Date Format Results: ${datePassedTests} passed, ${dateFailedTests} failed`);

// Test 3: Event Time Scenarios
console.log('\n📅 Test 3: Real Event Time Scenarios');
console.log('-'.repeat(40));

const eventScenarios = [
  {
    name: 'Save-the-Date Evening',
    date: '2025-03-15',
    time: '19:00',
    expectedDate: 'March 15, 2025',
    expectedTime: '7:00 PM'
  },
  {
    name: 'Free Community Event',
    date: '2025-01-25',
    time: '14:00',
    expectedDate: 'January 25, 2025',
    expectedTime: '2:00 PM'
  },
  {
    name: 'Morning Workshop',
    date: '2025-02-05',
    time: '10:00',
    expectedDate: 'February 5, 2025',
    expectedTime: '10:00 AM'
  },
  {
    name: 'Valentine\'s Party',
    date: '2025-02-14',
    time: '20:00',
    expectedDate: 'February 14, 2025',
    expectedTime: '8:00 PM'
  },
  {
    name: 'Midnight Kickoff',
    date: '2025-04-04',
    time: '00:00',
    expectedDate: 'April 4, 2025',
    expectedTime: '12:00 AM'
  },
  {
    name: 'Noon Conference',
    date: '2025-04-05',
    time: '12:00',
    expectedDate: 'April 5, 2025',
    expectedTime: '12:00 PM'
  },
  {
    name: 'Late Night Gala',
    date: '2025-04-06',
    time: '23:30',
    expectedDate: 'April 6, 2025',
    expectedTime: '11:30 PM'
  }
];

let scenariosPassed = 0;
let scenariosFailed = 0;

eventScenarios.forEach(scenario => {
  const dateResult = formatDateForDisplay(scenario.date);
  const timeResult = convert24to12Hour(scenario.time);
  
  const datePassed = dateResult === scenario.expectedDate;
  const timePassed = timeResult === scenario.expectedTime;
  const passed = datePassed && timePassed;
  
  if (passed) {
    console.log(`✅ ${scenario.name}:`);
    console.log(`   Date: ${dateResult}`);
    console.log(`   Time: ${timeResult}`);
    scenariosPassed++;
  } else {
    console.log(`❌ ${scenario.name}:`);
    if (!datePassed) {
      console.log(`   Date: ${dateResult} (expected: ${scenario.expectedDate})`);
    } else {
      console.log(`   Date: ${dateResult} ✓`);
    }
    if (!timePassed) {
      console.log(`   Time: ${timeResult} (expected: ${scenario.expectedTime})`);
    } else {
      console.log(`   Time: ${timeResult} ✓`);
    }
    scenariosFailed++;
  }
});

console.log(`\n📊 Event Scenario Results: ${scenariosPassed} passed, ${scenariosFailed} failed`);

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('📊 FINAL TEST SUMMARY');
console.log('='.repeat(60));

const totalPassed = passedTests + datePassedTests + scenariosPassed;
const totalFailed = failedTests + dateFailedTests + scenariosFailed;
const totalTests = totalPassed + totalFailed;

console.log(`Total Tests Run: ${totalTests}`);
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

if (totalFailed === 0) {
  console.log('\n🎉 All tests passed! Date/time handling is working correctly.');
  console.log('✅ 12-hour format with AM/PM is properly implemented');
  console.log('✅ Date display format is consistent');
  process.exit(0);
} else {
  console.log('\n⚠️ Some tests failed. Please review the date/time implementation.');
  process.exit(1);
}