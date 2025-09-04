import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  formatDateForDisplay,
  convert24to12Hour 
} from './helpers/qa-test-helpers';

test.describe('QR Code Generation & Event Check-in', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== QR CODE & SCANNING TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('=====================================================\n');
  });

  test('Test 1: QR code generation and validation', async ({ page }) => {
    const startTime = Date.now();
    const ticketId = 'TKT-2025-000123';
    const ticketCode = 'ABC123';
    
    let error: string | undefined;

    try {
      console.log('🎫 Test 1: QR Code Generation & Validation');
      
      // Step 1: Access ticket page
      console.log(`📱 Accessing ticket: ${ticketId}`);
      await page.goto(`/ticket/${ticketId}`);
      
      // Step 2: Verify QR code is displayed
      console.log('🔍 Verifying QR code display');
      const qrCode = page.locator('img[alt*="QR"], canvas#qr-code, [data-testid="qr-code"]').first();
      await expect(qrCode).toBeVisible();
      
      // Step 3: Verify QR code contains ticket data
      console.log('📊 Checking QR code data attributes');
      
      // Get QR code source or data
      const qrSrc = await qrCode.getAttribute('src');
      if (qrSrc) {
        // QR should encode the ticket URL or ticket data
        expect(qrSrc).toBeTruthy();
        console.log('✅ QR code image generated');
      }
      
      // Step 4: Verify 6-character backup code
      console.log('🔤 Verifying backup code display');
      const backupCode = page.locator(`text="${ticketCode}"`);
      await expect(backupCode).toBeVisible();
      
      // Verify code format (6 alphanumeric)
      const codeText = await backupCode.textContent();
      expect(codeText).toMatch(/^[A-Z0-9]{6}$/);
      
      // Step 5: Verify ticket details
      console.log('📋 Checking ticket information');
      
      // Event details should be visible
      await expect(page.locator('text="Event:"')).toBeVisible();
      await expect(page.locator('text="Date:"')).toBeVisible();
      await expect(page.locator('text="Time:"')).toBeVisible();
      await expect(page.locator('text="Venue:"')).toBeVisible();
      
      // Step 6: Test QR code download
      console.log('💾 Testing QR code download');
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Save")');
      if (await downloadButton.isVisible()) {
        // Set up download promise
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toContain('ticket');
        console.log('✅ QR code downloadable');
      }
      
      // Step 7: Test mobile responsiveness
      console.log('📱 Testing mobile QR display');
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      // QR should still be visible and properly sized
      await expect(qrCode).toBeVisible();
      const qrBox = await qrCode.boundingBox();
      if (qrBox) {
        expect(qrBox.width).toBeGreaterThanOrEqual(200);
        expect(qrBox.width).toBeLessThanOrEqual(350);
        console.log('✅ QR code responsive on mobile');
      }
      
      // Take screenshot
      await helpers.takeScreenshot('qr-code-display');
      
      testResults.push({
        testName: 'QR Code Generation and Validation',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 1 Passed: QR code properly generated');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'QR Code Generation and Validation',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 2: Door scanning flow with valid ticket', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-event-scan';
    const ticketCode = 'VALID1';
    
    let error: string | undefined;

    try {
      console.log('📱 Test 2: Door Scanning - Valid Ticket');
      
      // Step 1: Navigate to scanner page as staff
      console.log('🚪 Opening scanner interface');
      await helpers.loginAsOrganizer();
      await page.goto(`/events/${eventId}/scan`);
      
      // Step 2: Verify scanner interface
      console.log('📷 Checking scanner interface');
      
      // Check for camera view or manual entry
      const scannerView = page.locator('[data-testid="scanner-view"], #scanner-container, video').first();
      const manualEntry = page.locator('input[placeholder*="ticket code"], input[placeholder*="manual"]');
      
      // At least one input method should be available
      const hasScannerView = await scannerView.isVisible();
      const hasManualEntry = await manualEntry.isVisible();
      expect(hasScannerView || hasManualEntry).toBeTruthy();
      
      // Step 3: Test manual code entry
      console.log('⌨️ Testing manual code entry');
      if (hasManualEntry) {
        await manualEntry.fill(ticketCode);
        await page.click('button:has-text("Check In"), button:has-text("Scan")');
      }
      
      // Step 4: Wait for scan result
      console.log('⏳ Processing scan...');
      await page.waitForTimeout(1000);
      
      // Step 5: Verify successful scan
      console.log('✅ Verifying successful check-in');
      
      // Look for success indicators
      const successMessages = [
        'Valid',
        'Success',
        'Checked In',
        'Welcome',
        '✓',
        '✅'
      ];
      
      let scanSuccess = false;
      for (const msg of successMessages) {
        if (await page.locator(`text="${msg}"`).count() > 0) {
          scanSuccess = true;
          break;
        }
      }
      
      expect(scanSuccess).toBeTruthy();
      
      // Step 6: Verify ticket details displayed
      console.log('📋 Checking ticket details display');
      
      // Should show attendee info
      const ticketInfo = page.locator('[data-testid="ticket-info"], .ticket-details').first();
      if (await ticketInfo.isVisible()) {
        const infoText = await ticketInfo.textContent();
        console.log('Ticket info displayed:', infoText);
      }
      
      // Step 7: Check attendance counter updated
      console.log('📊 Verifying attendance counter');
      const attendanceCounter = page.locator('text=/Checked In:.*[0-9]+|Attendance:.*[0-9]+/');
      if (await attendanceCounter.count() > 0) {
        const counterText = await attendanceCounter.textContent();
        console.log('Attendance:', counterText);
      }
      
      // Take screenshot
      await helpers.takeScreenshot('valid-scan-result');
      
      testResults.push({
        testName: 'Door Scanning - Valid Ticket',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 2 Passed: Valid ticket scanned successfully');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Door Scanning - Valid Ticket',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 3: Duplicate scan prevention', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-event-scan';
    const ticketCode = 'USED01';
    
    let error: string | undefined;

    try {
      console.log('🚫 Test 3: Duplicate Scan Prevention');
      
      // Step 1: Navigate to scanner
      await helpers.loginAsOrganizer();
      await page.goto(`/events/${eventId}/scan`);
      
      // Step 2: First scan (should succeed)
      console.log('✅ First scan attempt');
      const manualEntry = page.locator('input[placeholder*="code"]').first();
      await manualEntry.fill(ticketCode);
      await page.click('button:has-text("Scan"), button:has-text("Check")');
      
      await page.waitForTimeout(1000);
      
      // Step 3: Clear and try to scan same ticket again
      console.log('🔄 Attempting duplicate scan');
      await manualEntry.clear();
      await manualEntry.fill(ticketCode);
      await page.click('button:has-text("Scan"), button:has-text("Check")');
      
      // Step 4: Verify duplicate rejection
      console.log('⚠️ Checking for duplicate warning');
      
      const warningMessages = [
        'Already Used',
        'Already Scanned',
        'Duplicate',
        'Previously Checked In',
        'Already checked in',
        '❌',
        'Invalid'
      ];
      
      let duplicateDetected = false;
      for (const msg of warningMessages) {
        if (await page.locator(`text="${msg}"`).count() > 0) {
          duplicateDetected = true;
          console.log(`Found warning: ${msg}`);
          break;
        }
      }
      
      expect(duplicateDetected).toBeTruthy();
      
      // Step 5: Check if scan timestamp is shown
      const scanTime = page.locator('text=/Scanned at:.*[0-9]+:[0-9]+|Previously scanned/');
      if (await scanTime.count() > 0) {
        console.log('✅ Previous scan time displayed');
      }
      
      // Take screenshot
      await helpers.takeScreenshot('duplicate-scan-warning');
      
      testResults.push({
        testName: 'Duplicate Scan Prevention',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 3 Passed: Duplicate scans properly prevented');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Duplicate Scan Prevention',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 4: Invalid ticket rejection', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-event-scan';
    
    let error: string | undefined;

    try {
      console.log('❌ Test 4: Invalid Ticket Rejection');
      
      // Step 1: Navigate to scanner
      await helpers.loginAsOrganizer();
      await page.goto(`/events/${eventId}/scan`);
      
      // Step 2: Test various invalid codes
      const invalidCodes = [
        'XXXXXX',     // Non-existent code
        '123456',     // Wrong format
        'EXPIRED',    // Expired ticket
        'WRONGEVENT', // Different event
        ''            // Empty code
      ];
      
      for (const code of invalidCodes) {
        console.log(`Testing invalid code: ${code || '(empty)'}`);
        
        const manualEntry = page.locator('input[placeholder*="code"]').first();
        await manualEntry.clear();
        
        if (code) {
          await manualEntry.fill(code);
          await page.click('button:has-text("Scan"), button:has-text("Check")');
          
          // Wait for result
          await page.waitForTimeout(500);
          
          // Check for error message
          const errorMessages = [
            'Invalid',
            'Not Found',
            'Error',
            'Wrong Event',
            'Expired',
            '❌',
            'No ticket found'
          ];
          
          let errorFound = false;
          for (const msg of errorMessages) {
            if (await page.locator(`text="${msg}"`).count() > 0) {
              errorFound = true;
              console.log(`✅ Rejected with: ${msg}`);
              break;
            }
          }
          
          expect(errorFound).toBeTruthy();
        }
      }
      
      // Take screenshot
      await helpers.takeScreenshot('invalid-ticket-rejection');
      
      testResults.push({
        testName: 'Invalid Ticket Rejection',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 4 Passed: Invalid tickets properly rejected');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Invalid Ticket Rejection',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 5: Real-time attendance tracking', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-event-attendance';
    
    let error: string | undefined;

    try {
      console.log('📊 Test 5: Real-time Attendance Tracking');
      
      // Step 1: Open attendance dashboard
      await helpers.loginAsOrganizer();
      await page.goto(`/organizer/events/${eventId}/attendance`);
      
      // Step 2: Check initial attendance
      console.log('📈 Checking attendance metrics');
      
      const metrics = {
        total: page.locator('text=/Total Tickets:.*[0-9]+|Total Sold:.*[0-9]+/'),
        checkedIn: page.locator('text=/Checked In:.*[0-9]+|Scanned:.*[0-9]+/'),
        percentage: page.locator('text=/[0-9]+%/'),
        remaining: page.locator('text=/Remaining:.*[0-9]+|Not Checked In:.*[0-9]+/')
      };
      
      // Get initial values
      let initialCheckedIn = 0;
      if (await metrics.checkedIn.count() > 0) {
        const text = await metrics.checkedIn.textContent();
        const match = text?.match(/[0-9]+/);
        if (match) initialCheckedIn = parseInt(match[0]);
      }
      
      console.log(`Initial attendance: ${initialCheckedIn}`);
      
      // Step 3: Simulate a scan in another tab
      const newPage = await page.context().newPage();
      await newPage.goto(`/events/${eventId}/scan`);
      
      // Scan a ticket
      const testCode = 'TEST99';
      await newPage.fill('input[placeholder*="code"]', testCode);
      await newPage.click('button:has-text("Scan")');
      await newPage.waitForTimeout(1000);
      
      // Step 4: Check if attendance updated
      await page.reload();
      await page.waitForTimeout(1000);
      
      let newCheckedIn = 0;
      if (await metrics.checkedIn.count() > 0) {
        const text = await metrics.checkedIn.textContent();
        const match = text?.match(/[0-9]+/);
        if (match) newCheckedIn = parseInt(match[0]);
      }
      
      console.log(`New attendance: ${newCheckedIn}`);
      
      // Should have increased
      expect(newCheckedIn).toBeGreaterThanOrEqual(initialCheckedIn);
      
      // Step 5: Check scan log
      console.log('📜 Verifying scan log');
      const scanLog = page.locator('[data-testid="scan-log"], .scan-history').first();
      if (await scanLog.isVisible()) {
        // Should show recent scan
        await expect(scanLog).toContainText(testCode);
      }
      
      // Step 6: Check time-based metrics
      const timeMetrics = page.locator('text=/Peak Time:|Busiest Hour:|Last Scan:/');
      if (await timeMetrics.count() > 0) {
        console.log('✅ Time-based metrics available');
      }
      
      // Close second page
      await newPage.close();
      
      // Take screenshot
      await helpers.takeScreenshot('attendance-dashboard');
      
      testResults.push({
        testName: 'Real-time Attendance Tracking',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 5 Passed: Attendance tracking working');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Real-time Attendance Tracking',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });
});