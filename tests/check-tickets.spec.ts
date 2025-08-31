import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3003',
  viewport: { width: 1280, height: 720 },
});

test('Check ticket availability on event pages', async ({ page }) => {
  await page.goto('/');
  
  // Click on first event
  await page.locator('text=View Details').first().click();
  await page.waitForURL('**/event/**');
  
  console.log('\n🎫 Checking Event Ticket Information:');
  console.log('=====================================');
  
  // Check for ticket types
  const ticketSections = await page.locator('text=/VIP|General|Student|Early/i').allTextContents();
  
  if (ticketSections.length > 0) {
    console.log('✅ Ticket types found:');
    for (const ticket of ticketSections.slice(0, 10)) {
      console.log(`   - ${ticket}`);
    }
  } else {
    console.log('❌ No ticket types displayed');
  }
  
  // Check for purchase button
  const purchaseButton = page.locator('button:has-text("Purchase"), button:has-text("Buy"), button:has-text("Get Tickets")');
  const hasPurchaseButton = await purchaseButton.isVisible({ timeout: 3000 }).catch(() => false);
  
  console.log(`\nPurchase Button: ${hasPurchaseButton ? '✅ Available' : '❌ Not found'}`);
  
  // Check for price display
  const prices = await page.locator('text=/$\\d+/').allTextContents();
  
  if (prices.length > 0) {
    console.log('\n💰 Prices displayed:');
    for (const price of prices.slice(0, 5)) {
      console.log(`   ${price}`);
    }
  } else {
    console.log('\n❌ No prices displayed');
  }
  
  // Check page content
  const pageContent = await page.content();
  const hasTicketType = pageContent.includes('VIP') || pageContent.includes('General');
  const hasEarlyBird = pageContent.includes('Early Bird');
  
  console.log('\n📋 Page Content Analysis:');
  console.log(`   Has ticket types: ${hasTicketType ? '✅' : '❌'}`);
  console.log(`   Has early bird: ${hasEarlyBird ? '✅' : '❌'}`);
  
  // Try to find ticket component
  const ticketComponent = page.locator('[data-testid*="ticket"], [class*="ticket"], div:has-text("Ticket")');
  const hasTicketComponent = await ticketComponent.count() > 0;
  
  console.log(`   Has ticket component: ${hasTicketComponent ? '✅' : '❌'}`);
});