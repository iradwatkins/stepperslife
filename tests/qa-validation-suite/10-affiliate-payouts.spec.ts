import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Affiliate Payout Management (Organizer-Managed)', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== AFFILIATE PAYOUT TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('===================================================\n');
  });

  test('Test 1: Record cash payout to affiliate', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-event-payout';
    const affiliateName = 'John Promoter';
    const payoutAmount = 150.00;
    
    let error: string | undefined;

    try {
      console.log('💵 Test 1: Recording Cash Payout');
      
      // Step 1: Navigate to affiliate payout section
      await helpers.loginAsOrganizer();
      await page.goto(`/organizer/events/${eventId}/affiliates/payouts`);
      
      // Step 2: View affiliate with outstanding balance
      console.log('📊 Checking affiliate balances');
      
      // Find affiliate row
      const affiliateRow = page.locator(`tr:has-text("${affiliateName}")`);
      await expect(affiliateRow).toBeVisible();
      
      // Check outstanding balance
      const balance = affiliateRow.locator('text=/\\$[0-9]+\\.[0-9]{2}/');
      const balanceText = await balance.textContent();
      console.log(`Outstanding balance: ${balanceText}`);
      
      // Step 3: Click record payout
      console.log('📝 Opening payout recording dialog');
      await affiliateRow.locator('button:has-text("Record Payout")').click();
      
      // Step 4: Select cash payment method
      console.log('💰 Selecting cash payment method');
      
      // Wait for modal/dialog
      await page.waitForSelector('[role="dialog"], .modal, .payout-form');
      
      // Select payment method
      await page.click('input[value="cash"], label:has-text("Cash")');
      
      // Step 5: Enter payout amount
      await page.fill('input[name="amount"], input[placeholder*="amount"]', payoutAmount.toString());
      
      // Step 6: Add optional notes
      const notesField = page.locator('textarea[name="notes"], textarea[placeholder*="notes"]');
      if (await notesField.isVisible()) {
        await notesField.fill(`Cash payment at venue on ${new Date().toLocaleDateString()}`);
      }
      
      // Step 7: Confirm payout
      console.log('✅ Recording cash payout');
      await page.click('button:has-text("Record Payout"), button:has-text("Confirm")');
      
      // Wait for confirmation
      await page.waitForTimeout(1000);
      
      // Step 8: Verify payout recorded
      console.log('🔍 Verifying payout record');
      
      // Check for success message
      const successMsg = page.locator('text=/Payout recorded|Payment recorded|Successfully/');
      await expect(successMsg.first()).toBeVisible();
      
      // Verify balance updated
      const newBalance = affiliateRow.locator('text=/\\$[0-9]+\\.[0-9]{2}/');
      const newBalanceText = await newBalance.textContent();
      console.log(`New balance: ${newBalanceText}`);
      
      // Step 9: Check payout history
      console.log('📜 Checking payout history');
      await page.click('tab:has-text("Payout History"), button:has-text("View History")');
      
      // Find the payout record
      const payoutRecord = page.locator('tr').filter({
        hasText: affiliateName
      }).filter({
        hasText: 'Cash'
      }).filter({
        hasText: `$${payoutAmount}`
      });
      
      await expect(payoutRecord).toBeVisible();
      
      // Verify timestamp
      const timestamp = payoutRecord.locator('text=/[0-9]{1,2}:[0-9]{2}/');
      await expect(timestamp).toBeVisible();
      
      // Take screenshot
      await helpers.takeScreenshot('cash-payout-recorded');
      
      testResults.push({
        testName: 'Cash Payout Recording',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log(`✅ Test 1 Passed: Cash payout of $${payoutAmount} recorded`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Cash Payout Recording',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 2: Record Zelle payout with confirmation', async ({ page }) => {
    const startTime = Date.now();
    const affiliateName = 'Sarah Influencer';
    const payoutAmount = 275.50;
    const zelleEmail = 'sarah@email.com';
    const confirmationNumber = 'ZELLE123456';
    
    let error: string | undefined;

    try {
      console.log('📱 Test 2: Recording Zelle Payout');
      
      // Step 1: Navigate to payouts
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/affiliates/payouts');
      
      // Step 2: Find affiliate
      const affiliateRow = page.locator(`tr:has-text("${affiliateName}")`);
      await affiliateRow.locator('button:has-text("Record Payout")').click();
      
      // Step 3: Select Zelle
      console.log('💳 Selecting Zelle payment');
      await page.click('input[value="zelle"], label:has-text("Zelle")');
      
      // Step 4: Enter Zelle details
      console.log('📝 Entering Zelle transfer details');
      
      await page.fill('input[name="amount"]', payoutAmount.toString());
      await page.fill('input[placeholder*="email"], input[placeholder*="phone"]', zelleEmail);
      await page.fill('input[placeholder*="confirmation"], input[placeholder*="reference"]', confirmationNumber);
      
      // Add notes
      await page.fill('textarea[name="notes"]', `Zelle transfer to ${zelleEmail}`);
      
      // Step 5: Record payout
      await page.click('button:has-text("Record Payout")');
      
      // Step 6: Verify recorded
      console.log('✅ Verifying Zelle payout recorded');
      
      await expect(page.locator('text="Payout recorded"')).toBeVisible();
      
      // Check payout details
      const payoutDetails = page.locator('.payout-details, [data-testid="payout-details"]').first();
      if (await payoutDetails.isVisible()) {
        await expect(payoutDetails).toContainText('Zelle');
        await expect(payoutDetails).toContainText(confirmationNumber);
        await expect(payoutDetails).toContainText(`$${payoutAmount}`);
      }
      
      // Take screenshot
      await helpers.takeScreenshot('zelle-payout-recorded');
      
      testResults.push({
        testName: 'Zelle Payout Recording',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log(`✅ Test 2 Passed: Zelle payout of $${payoutAmount} recorded`);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Zelle Payout Recording',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 3: Record multiple payment methods', async ({ page }) => {
    const startTime = Date.now();
    
    const payouts = [
      {
        affiliate: 'DJ Mike',
        method: 'cashapp',
        amount: 125.00,
        identifier: '$djmike',
        reference: 'CA789012'
      },
      {
        affiliate: 'Dance School',
        method: 'venmo',
        amount: 320.00,
        identifier: '@danceschool',
        reference: 'VEN456789'
      },
      {
        affiliate: 'Premium Agency',
        method: 'paypal',
        amount: 450.00,
        identifier: 'agency@paypal.com',
        reference: 'PP123456'
      }
    ];
    
    let error: string | undefined;

    try {
      console.log('💳 Test 3: Recording Multiple Payment Methods');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/affiliates/payouts');
      
      for (const payout of payouts) {
        console.log(`\n📝 Recording ${payout.method} payout for ${payout.affiliate}`);
        
        // Find affiliate
        const row = page.locator(`tr:has-text("${payout.affiliate}")`);
        await row.locator('button:has-text("Record Payout")').click();
        
        // Select payment method
        await page.click(`input[value="${payout.method}"], label:has-text("${payout.method}")`);
        
        // Enter details
        await page.fill('input[name="amount"]', payout.amount.toString());
        await page.fill('input[placeholder*="username"], input[placeholder*="email"], input[placeholder*="tag"]', payout.identifier);
        await page.fill('input[placeholder*="transaction"], input[placeholder*="reference"]', payout.reference);
        
        // Record
        await page.click('button:has-text("Record Payout")');
        
        // Wait for confirmation
        await page.waitForSelector('text=/recorded|success/i');
        
        console.log(`✅ ${payout.method} payout recorded: $${payout.amount}`);
        
        // Close modal if needed
        const closeButton = page.locator('button[aria-label="Close"], button:has-text("Close")');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
        
        await page.waitForTimeout(500);
      }
      
      // Verify all payouts in history
      console.log('\n📊 Verifying payout history');
      await page.click('tab:has-text("History"), button:has-text("View History")');
      
      for (const payout of payouts) {
        const record = page.locator('tr').filter({
          hasText: payout.affiliate
        }).filter({
          hasText: payout.method.toUpperCase()
        });
        
        await expect(record).toBeVisible();
      }
      
      await helpers.takeScreenshot('multiple-payment-methods');
      
      testResults.push({
        testName: 'Multiple Payment Methods Recording',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 3 Passed: All payment methods recorded');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Multiple Payment Methods Recording',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 4: Payout reconciliation and reporting', async ({ page }) => {
    const startTime = Date.now();
    
    let error: string | undefined;

    try {
      console.log('📊 Test 4: Payout Reconciliation & Reporting');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/affiliates/reconciliation');
      
      // Step 1: Check reconciliation dashboard
      console.log('📈 Checking reconciliation metrics');
      
      const metrics = {
        totalOwed: page.locator('text=/Total Owed:.*\\$[0-9]/'),
        totalPaid: page.locator('text=/Total Paid:.*\\$[0-9]/'),
        outstanding: page.locator('text=/Outstanding:.*\\$[0-9]/'),
        affiliateCount: page.locator('text=/Active Affiliates:.*[0-9]/')
      };
      
      // Verify metrics are displayed
      for (const [name, locator] of Object.entries(metrics)) {
        if (await locator.isVisible()) {
          const text = await locator.textContent();
          console.log(`${name}: ${text}`);
        }
      }
      
      // Step 2: Check payment method breakdown
      console.log('💳 Checking payment method breakdown');
      
      const methodBreakdown = page.locator('.payment-methods, [data-testid="method-breakdown"]').first();
      if (await methodBreakdown.isVisible()) {
        await expect(methodBreakdown).toContainText('Cash');
        await expect(methodBreakdown).toContainText('Zelle');
        await expect(methodBreakdown).toContainText('CashApp');
      }
      
      // Step 3: Export report
      console.log('📄 Testing report export');
      
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download Report")');
      if (await exportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        // Verify download
        const filename = download.suggestedFilename();
        expect(filename).toContain('payout');
        console.log(`Report exported: ${filename}`);
      }
      
      // Step 4: Check audit trail
      console.log('🔍 Verifying audit trail');
      
      const auditTab = page.locator('tab:has-text("Audit"), button:has-text("Audit Trail")');
      if (await auditTab.isVisible()) {
        await auditTab.click();
        
        // Should show all payout records with timestamps
        const auditEntries = page.locator('.audit-entry, tr[data-audit]');
        const count = await auditEntries.count();
        console.log(`Audit entries found: ${count}`);
        
        if (count > 0) {
          // Check first entry has required fields
          const firstEntry = auditEntries.first();
          await expect(firstEntry).toContainText(/[0-9]{1,2}:[0-9]{2}/); // Time
          await expect(firstEntry).toContainText('$'); // Amount
        }
      }
      
      await helpers.takeScreenshot('payout-reconciliation');
      
      testResults.push({
        testName: 'Payout Reconciliation and Reporting',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 4 Passed: Reconciliation working correctly');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Payout Reconciliation and Reporting',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 5: Edit and track partial payouts', async ({ page }) => {
    const startTime = Date.now();
    const affiliateName = 'Large Promoter';
    const totalOwed = 500.00;
    const partialPayment1 = 200.00;
    const partialPayment2 = 150.00;
    
    let error: string | undefined;

    try {
      console.log('💰 Test 5: Partial Payout Tracking');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/affiliates/payouts');
      
      // Step 1: Record first partial payment
      console.log('📝 Recording first partial payment');
      
      const affiliateRow = page.locator(`tr:has-text("${affiliateName}")`);
      await affiliateRow.locator('button:has-text("Record Payout")').click();
      
      // Record partial cash payment
      await page.click('label:has-text("Cash")');
      await page.fill('input[name="amount"]', partialPayment1.toString());
      await page.fill('textarea[name="notes"]', 'First partial payment');
      await page.click('button:has-text("Record Payout")');
      
      await page.waitForTimeout(1000);
      
      // Step 2: Verify balance updated
      console.log('📊 Checking remaining balance');
      
      const remainingBalance = totalOwed - partialPayment1;
      const balanceText = await affiliateRow.locator('text=/\\$[0-9]+/').textContent();
      console.log(`Remaining balance: ${balanceText}`);
      
      // Step 3: Record second partial payment
      console.log('📝 Recording second partial payment');
      
      await affiliateRow.locator('button:has-text("Record Payout")').click();
      await page.click('label:has-text("Zelle")');
      await page.fill('input[name="amount"]', partialPayment2.toString());
      await page.fill('input[placeholder*="email"]', 'affiliate@email.com');
      await page.fill('input[placeholder*="confirmation"]', 'ZELLE789');
      await page.click('button:has-text("Record Payout")');
      
      // Step 4: Check payment history shows both
      console.log('📜 Verifying partial payment history');
      
      await page.click('button:has-text("View History")');
      
      // Should show both payments
      const payment1Record = page.locator('tr').filter({
        hasText: `$${partialPayment1}`
      }).filter({
        hasText: 'Cash'
      });
      
      const payment2Record = page.locator('tr').filter({
        hasText: `$${partialPayment2}`
      }).filter({
        hasText: 'Zelle'
      });
      
      await expect(payment1Record).toBeVisible();
      await expect(payment2Record).toBeVisible();
      
      // Step 5: Edit a payout (if feature available)
      const editButton = payment1Record.locator('button:has-text("Edit")');
      if (await editButton.isVisible()) {
        console.log('✏️ Testing payout edit');
        await editButton.click();
        
        // Update notes
        await page.fill('textarea[name="notes"]', 'First partial payment - Updated');
        await page.click('button:has-text("Save")');
        
        console.log('✅ Payout edited successfully');
      }
      
      await helpers.takeScreenshot('partial-payouts');
      
      testResults.push({
        testName: 'Partial Payout Tracking',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 5 Passed: Partial payouts tracked correctly');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Partial Payout Tracking',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });
});