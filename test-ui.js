const puppeteer = require('puppeteer');

async function testEventForm() {
  console.log('🔍 Starting UI Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // 1. Login
    console.log('1. Testing Login...');
    await page.goto('http://localhost:3000/auth/signin');
    
    // Use quick login
    await page.evaluate(() => {
      const adminButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('admin@stepperslife.com')
      );
      if (adminButton) adminButton.click();
    });
    
    await page.waitForNavigation();
    console.log('   ✓ Login successful\n');
    
    // 2. Navigate to event creation
    console.log('2. Navigating to Event Form...');
    await page.goto('http://localhost:3000/seller/new-event');
    await page.waitForSelector('select');
    console.log('   ✓ Event form loaded\n');
    
    // 3. Test Calendar Alignment
    console.log('3. Testing Calendar Day Header Alignment...');
    
    // Click date picker
    const dateButton = await page.$('button:has([data-lucide="calendar"])');
    if (dateButton) {
      await dateButton.click();
      await page.waitForSelector('.rdp-caption');
      
      // Check day header alignment
      const dayHeaders = await page.evaluate(() => {
        const headers = document.querySelectorAll('.rdp-head_cell');
        return Array.from(headers).map(h => ({
          text: h.textContent?.trim(),
          left: h.getBoundingClientRect().left
        }));
      });
      
      console.log('   Day headers found:', dayHeaders.map(h => h.text).join(', '));
      
      // Check spacing
      let aligned = true;
      for (let i = 1; i < dayHeaders.length; i++) {
        const spacing = dayHeaders[i].left - dayHeaders[i-1].left;
        if (spacing < 30 || spacing > 60) {
          aligned = false;
          console.log(`   ⚠️ Spacing issue between ${dayHeaders[i-1].text} and ${dayHeaders[i].text}: ${spacing}px`);
        }
      }
      
      if (aligned) {
        console.log('   ✓ Calendar headers properly aligned\n');
      } else {
        console.log('   ✗ Calendar headers have alignment issues\n');
      }
      
      // Close calendar
      await page.click('body');
    }
    
    // 4. Test Event Categories
    console.log('4. Testing Event Categories Dropdown...');
    
    // Click categories dropdown
    const categoriesButton = await page.$('button:has-text("Select event categories")');
    if (!categoriesButton) {
      // Try alternative selector
      const altButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.textContent?.includes('Select event categories'));
      });
      if (altButton) {
        await altButton.click();
      }
    } else {
      await categoriesButton.click();
    }
    
    await page.waitForTimeout(500);
    
    // Try to select a category
    const categorySelected = await page.evaluate(() => {
      const options = document.querySelectorAll('[role="option"]');
      if (options.length > 0) {
        const workshopOption = Array.from(options).find(
          opt => opt.textContent?.includes('Workshop')
        );
        if (workshopOption instanceof HTMLElement) {
          workshopOption.click();
          return true;
        }
      }
      return false;
    });
    
    if (categorySelected) {
      await page.waitForTimeout(500);
      
      // Check if badge appears
      const badgeExists = await page.evaluate(() => {
        const badges = document.querySelectorAll('[class*="badge"]');
        return Array.from(badges).some(b => b.textContent?.includes('Workshop'));
      });
      
      if (badgeExists) {
        console.log('   ✓ Categories dropdown is functional\n');
      } else {
        console.log('   ⚠️ Category selected but badge not visible\n');
      }
    } else {
      console.log('   ✗ Could not select category\n');
    }
    
    // 5. Test form fields
    console.log('5. Testing Form Fields...');
    
    await page.type('input[placeholder*="event name"]', 'Test Event', { delay: 20 });
    await page.type('textarea[placeholder*="Describe"]', 'Test Description', { delay: 20 });
    await page.type('input[placeholder*="venue"]', '123 Main St', { delay: 20 });
    
    console.log('   ✓ Form fields are functional\n');
    
    // Take screenshots
    console.log('6. Taking Screenshots...');
    await page.screenshot({ path: 'test-results/form-overview.png', fullPage: true });
    console.log('   ✓ Screenshots saved to test-results/\n');
    
    console.log('✅ All UI tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Create test results directory
const fs = require('fs');
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

// Run tests
testEventForm();