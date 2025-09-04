import { test, expect } from '@playwright/test';
import { 
  QATestHelpers, 
  TestResult, 
  getFutureDate, 
  generateEventName,
  formatDateForDisplay 
} from './helpers/qa-test-helpers';

test.describe('Financial Reporting & Settlement', () => {
  let helpers: QATestHelpers;
  const testResults: TestResult[] = [];
  const PLATFORM_FEE_PER_TICKET = 1.50;

  test.beforeEach(async ({ page }) => {
    helpers = new QATestHelpers(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterAll(() => {
    console.log('\n========== FINANCIAL REPORTING TEST RESULTS ==========');
    testResults.forEach(result => helpers.logTestResult(result));
    console.log('======================================================\n');
  });

  test('Test 1: Revenue calculation with platform fees', async ({ page }) => {
    const startTime = Date.now();
    const eventId = 'test-financial-event';
    
    // Test data
    const ticketsSold = {
      general: { quantity: 100, price: 50.00 },
      vip: { quantity: 25, price: 100.00 },
      earlyBird: { quantity: 50, price: 35.00 }
    };
    
    let error: string | undefined;

    try {
      console.log('💰 Test 1: Revenue Calculation with Platform Fees');
      
      // Step 1: Navigate to financial dashboard
      await helpers.loginAsOrganizer();
      await page.goto(`/organizer/events/${eventId}/financials`);
      
      // Step 2: Calculate expected values
      console.log('📊 Calculating expected revenue');
      
      const grossRevenue = 
        (ticketsSold.general.quantity * ticketsSold.general.price) +
        (ticketsSold.vip.quantity * ticketsSold.vip.price) +
        (ticketsSold.earlyBird.quantity * ticketsSold.earlyBird.price);
      
      const totalTickets = 
        ticketsSold.general.quantity + 
        ticketsSold.vip.quantity + 
        ticketsSold.earlyBird.quantity;
      
      const platformFees = totalTickets * PLATFORM_FEE_PER_TICKET;
      const netRevenue = grossRevenue - platformFees;
      
      console.log(`Expected Gross Revenue: $${grossRevenue.toFixed(2)}`);
      console.log(`Expected Platform Fees: $${platformFees.toFixed(2)} (${totalTickets} tickets × $${PLATFORM_FEE_PER_TICKET})`);
      console.log(`Expected Net Revenue: $${netRevenue.toFixed(2)}`);
      
      // Step 3: Verify displayed values
      console.log('✅ Verifying calculated values');
      
      // Check gross revenue
      const grossRevenueDisplay = page.locator(`text=/Gross.*\\$${grossRevenue.toFixed(2).replace('.', '\\.')}/`);
      await expect(grossRevenueDisplay.first()).toBeVisible();
      
      // Check platform fees
      const platformFeeDisplay = page.locator(`text=/Platform.*\\$${platformFees.toFixed(2).replace('.', '\\.')}/`);
      await expect(platformFeeDisplay.first()).toBeVisible();
      
      // Verify fee calculation shows $1.50 per ticket
      const feeBreakdown = page.locator(`text=/${totalTickets}.*tickets.*\\$1\\.50/`);
      if (await feeBreakdown.count() > 0) {
        console.log('✅ Platform fee breakdown displayed correctly');
      }
      
      // Check net revenue
      const netRevenueDisplay = page.locator(`text=/Net.*\\$${netRevenue.toFixed(2).replace('.', '\\.')}/`);
      await expect(netRevenueDisplay.first()).toBeVisible();
      
      // Step 4: Check ticket breakdown
      console.log('🎫 Verifying ticket sales breakdown');
      
      const ticketBreakdown = page.locator('.ticket-breakdown, [data-testid="ticket-sales"]').first();
      if (await ticketBreakdown.isVisible()) {
        await expect(ticketBreakdown).toContainText('General');
        await expect(ticketBreakdown).toContainText('100');
        await expect(ticketBreakdown).toContainText('$5,000');
        
        await expect(ticketBreakdown).toContainText('VIP');
        await expect(ticketBreakdown).toContainText('25');
        await expect(ticketBreakdown).toContainText('$2,500');
      }
      
      // Take screenshot
      await helpers.takeScreenshot('revenue-calculation');
      
      testResults.push({
        testName: 'Revenue Calculation with Platform Fees',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 1 Passed: Revenue calculated correctly with $1.50/ticket fee');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Revenue Calculation with Platform Fees',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 2: Commission reporting and tracking', async ({ page }) => {
    const startTime = Date.now();
    
    const affiliateData = [
      { name: 'John Promoter', sales: 20, rate: 0.15, commission: 150.00 },
      { name: 'Sarah Influencer', sales: 35, rate: 0.15, commission: 262.50 },
      { name: 'DJ Mike', sales: 10, flatFee: 10, commission: 100.00 }
    ];
    
    let error: string | undefined;

    try {
      console.log('💸 Test 2: Commission Reporting');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/financials/commissions');
      
      // Step 1: Check total commissions
      console.log('📊 Checking total commission calculations');
      
      const totalCommissions = affiliateData.reduce((sum, a) => sum + a.commission, 0);
      console.log(`Expected Total Commissions: $${totalCommissions.toFixed(2)}`);
      
      const totalCommDisplay = page.locator(`text=/Total.*Commission.*\\$${totalCommissions.toFixed(2).replace('.', '\\.')}/`);
      await expect(totalCommDisplay.first()).toBeVisible();
      
      // Step 2: Verify individual affiliate commissions
      console.log('👥 Verifying individual affiliate commissions');
      
      for (const affiliate of affiliateData) {
        const affiliateRow = page.locator('tr').filter({
          hasText: affiliate.name
        });
        
        await expect(affiliateRow).toBeVisible();
        await expect(affiliateRow).toContainText(`${affiliate.sales}`);
        await expect(affiliateRow).toContainText(`$${affiliate.commission.toFixed(2)}`);
        
        if (affiliate.rate) {
          await expect(affiliateRow).toContainText(`${(affiliate.rate * 100)}%`);
        } else if (affiliate.flatFee) {
          await expect(affiliateRow).toContainText(`$${affiliate.flatFee}/ticket`);
        }
      }
      
      // Step 3: Check commission vs payout status
      console.log('💰 Checking payout status');
      
      const unpaidCommissions = page.locator('text=/Unpaid.*\\$[0-9]/');
      const paidCommissions = page.locator('text=/Paid.*\\$[0-9]/');
      
      if (await unpaidCommissions.count() > 0) {
        const unpaidText = await unpaidCommissions.textContent();
        console.log(`Unpaid commissions: ${unpaidText}`);
      }
      
      if (await paidCommissions.count() > 0) {
        const paidText = await paidCommissions.textContent();
        console.log(`Paid commissions: ${paidText}`);
      }
      
      // Step 4: Test commission export
      console.log('📄 Testing commission report export');
      
      const exportBtn = page.locator('button:has-text("Export Commission Report")');
      if (await exportBtn.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        const download = await downloadPromise;
        
        expect(download.suggestedFilename()).toContain('commission');
        console.log('✅ Commission report exported');
      }
      
      await helpers.takeScreenshot('commission-reporting');
      
      testResults.push({
        testName: 'Commission Reporting and Tracking',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 2 Passed: Commission tracking accurate');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Commission Reporting and Tracking',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 3: Organizer settlement calculation', async ({ page }) => {
    const startTime = Date.now();
    
    // Test data
    const financials = {
      grossRevenue: 10000.00,
      platformFees: 300.00, // 200 tickets × $1.50
      affiliateCommissions: 1500.00,
      affiliatePaidOut: 1200.00,
      processingFees: 290.00 // ~2.9% credit card fees
    };
    
    let error: string | undefined;

    try {
      console.log('💼 Test 3: Organizer Settlement Calculation');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/financials/settlement');
      
      // Step 1: Calculate expected settlement
      console.log('🧮 Calculating expected settlement');
      
      const netAfterPlatform = financials.grossRevenue - financials.platformFees;
      const netAfterCommissions = netAfterPlatform - financials.affiliateCommissions;
      const finalSettlement = netAfterCommissions - financials.processingFees;
      
      console.log(`Gross Revenue: $${financials.grossRevenue.toFixed(2)}`);
      console.log(`- Platform Fees: $${financials.platformFees.toFixed(2)}`);
      console.log(`- Affiliate Commissions: $${financials.affiliateCommissions.toFixed(2)}`);
      console.log(`- Processing Fees: $${financials.processingFees.toFixed(2)}`);
      console.log(`= Final Settlement: $${finalSettlement.toFixed(2)}`);
      
      // Step 2: Verify settlement breakdown
      console.log('📊 Verifying settlement breakdown');
      
      // Check each line item
      const breakdownItems = [
        { label: 'Gross Revenue', amount: financials.grossRevenue },
        { label: 'Platform Fee', amount: -financials.platformFees },
        { label: 'Affiliate Commission', amount: -financials.affiliateCommissions },
        { label: 'Processing Fee', amount: -financials.processingFees }
      ];
      
      for (const item of breakdownItems) {
        const itemDisplay = page.locator('tr, div').filter({
          hasText: item.label
        }).filter({
          hasText: `$${Math.abs(item.amount).toFixed(2)}`
        });
        
        await expect(itemDisplay.first()).toBeVisible();
      }
      
      // Check final settlement
      const settlementDisplay = page.locator(`text=/Settlement.*\\$${finalSettlement.toFixed(2).replace('.', '\\.')}/`);
      await expect(settlementDisplay.first()).toBeVisible();
      
      // Step 3: Check payout status
      console.log('💳 Checking payout status');
      
      const payoutStatus = page.locator('.payout-status, [data-testid="payout-status"]').first();
      if (await payoutStatus.isVisible()) {
        const statusText = await payoutStatus.textContent();
        console.log(`Payout status: ${statusText}`);
      }
      
      // Step 4: Test settlement request
      console.log('📤 Testing settlement request');
      
      const requestBtn = page.locator('button:has-text("Request Settlement")');
      if (await requestBtn.isVisible() && await requestBtn.isEnabled()) {
        await requestBtn.click();
        
        // Fill payout method
        await page.click('input[value="bank_transfer"]');
        await page.click('button:has-text("Confirm")');
        
        // Check for confirmation
        await expect(page.locator('text=/Settlement requested|Request submitted/')).toBeVisible();
        console.log('✅ Settlement requested successfully');
      }
      
      await helpers.takeScreenshot('organizer-settlement');
      
      testResults.push({
        testName: 'Organizer Settlement Calculation',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 3 Passed: Settlement calculated correctly');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Organizer Settlement Calculation',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 4: P&L statement generation', async ({ page }) => {
    const startTime = Date.now();
    const eventName = 'Summer Dance Festival';
    
    let error: string | undefined;

    try {
      console.log('📊 Test 4: P&L Statement Generation');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/financials/reports');
      
      // Step 1: Select event and date range
      console.log('📅 Selecting event and date range');
      
      // Select event
      const eventSelect = page.locator('select[name="event"]');
      if (await eventSelect.isVisible()) {
        await eventSelect.selectOption({ label: eventName });
      }
      
      // Set date range
      const startDate = getFutureDate(-30);
      const endDate = getFutureDate(0);
      
      await page.fill('input[name="start_date"]', startDate);
      await page.fill('input[name="end_date"]', endDate);
      
      // Generate report
      await page.click('button:has-text("Generate P&L")');
      
      // Step 2: Verify P&L sections
      console.log('📋 Verifying P&L statement sections');
      
      await page.waitForSelector('.pl-statement, [data-testid="pl-report"]');
      
      // Check revenue section
      const revenueSection = page.locator('section:has-text("Revenue"), .revenue-section');
      await expect(revenueSection).toBeVisible();
      await expect(revenueSection).toContainText('Ticket Sales');
      
      // Check expenses section
      const expenseSection = page.locator('section:has-text("Expenses"), .expense-section');
      await expect(expenseSection).toBeVisible();
      await expect(expenseSection).toContainText('Platform Fees');
      await expect(expenseSection).toContainText('Affiliate Commissions');
      await expect(expenseSection).toContainText('Processing Fees');
      
      // Check net profit
      const netProfit = page.locator('text=/Net Profit|Net Income/');
      await expect(netProfit).toBeVisible();
      
      // Step 3: Check detailed breakdown
      console.log('📊 Checking detailed breakdown');
      
      const details = [
        'Total Tickets Sold',
        'Average Ticket Price',
        'Platform Fee per Ticket: $1.50',
        'Total Affiliates',
        'Conversion Rate'
      ];
      
      for (const detail of details) {
        const detailElement = page.locator(`text="${detail}"`);
        if (await detailElement.count() > 0) {
          console.log(`✅ Found: ${detail}`);
        }
      }
      
      // Step 4: Export P&L
      console.log('💾 Testing P&L export');
      
      const exportButton = page.locator('button:has-text("Export PDF"), button:has-text("Download")');
      if (await exportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/P&L|profit.*loss|statement/i);
        console.log(`✅ P&L exported: ${filename}`);
      }
      
      await helpers.takeScreenshot('pl-statement');
      
      testResults.push({
        testName: 'P&L Statement Generation',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 4 Passed: P&L statement generated successfully');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'P&L Statement Generation',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });

  test('Test 5: Tax reporting preparation (1099 data)', async ({ page }) => {
    const startTime = Date.now();
    const taxYear = new Date().getFullYear();
    
    let error: string | undefined;

    try {
      console.log('📋 Test 5: Tax Reporting Preparation');
      
      await helpers.loginAsOrganizer();
      await page.goto('/organizer/financials/tax-reporting');
      
      // Step 1: Select tax year
      console.log('📅 Selecting tax year');
      
      const yearSelect = page.locator('select[name="tax_year"]');
      if (await yearSelect.isVisible()) {
        await yearSelect.selectOption(taxYear.toString());
      }
      
      // Step 2: Check 1099 eligible affiliates
      console.log('👥 Checking 1099 eligible affiliates');
      
      const eligible1099 = page.locator('.eligible-1099, [data-testid="1099-affiliates"]');
      if (await eligible1099.isVisible()) {
        // Check for $600+ threshold
        const threshold = page.locator('text=/$600 threshold/');
        await expect(threshold).toBeVisible();
        
        // Count eligible affiliates
        const eligibleRows = page.locator('tr[data-eligible="true"]');
        const count = await eligibleRows.count();
        console.log(`${count} affiliates eligible for 1099 (earned $600+)`);
      }
      
      // Step 3: Verify required tax info
      console.log('📝 Checking tax information status');
      
      const taxInfoStatus = page.locator('.tax-info-status');
      if (await taxInfoStatus.isVisible()) {
        // Check for missing info warnings
        const missingInfo = page.locator('text=/Missing.*W-9|Tax.*required/');
        if (await missingInfo.count() > 0) {
          console.log('⚠️ Some affiliates missing tax info');
        }
      }
      
      // Step 4: Generate 1099 summary
      console.log('📄 Generating 1099 summary');
      
      await page.click('button:has-text("Generate 1099 Summary")');
      
      // Wait for summary
      await page.waitForSelector('.tax-summary, [data-testid="1099-summary"]');
      
      // Verify summary contains required fields
      const summaryFields = [
        'Affiliate Name',
        'Tax ID/SSN',
        'Total Paid',
        'Commission',
        'Status'
      ];
      
      for (const field of summaryFields) {
        await expect(page.locator(`text="${field}"`)).toBeVisible();
      }
      
      // Step 5: Export tax data
      console.log('💾 Exporting tax data');
      
      const exportBtn = page.locator('button:has-text("Export 1099 Data")');
      if (await exportBtn.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        const download = await downloadPromise;
        
        const filename = download.suggestedFilename();
        expect(filename).toContain('1099');
        expect(filename).toContain(taxYear.toString());
        console.log(`✅ Tax data exported: ${filename}`);
      }
      
      await helpers.takeScreenshot('tax-reporting');
      
      testResults.push({
        testName: 'Tax Reporting Preparation (1099)',
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Test 5 Passed: Tax reporting data prepared');
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      testResults.push({
        testName: 'Tax Reporting Preparation (1099)',
        status: 'failed',
        duration: Date.now() - startTime,
        error
      });
      throw err;
    }
  });
});