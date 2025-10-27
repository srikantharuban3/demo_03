const { test, expect } = require('@playwright/test');
const fs = require('fs-extra');

test.describe('ParaBank Test Suite', () => {
  
  test('TC 001 - Verify that user can register a new customer', async ({ page, browser }) => {
    // Generate unique username with timestamp
    const timestamp = Date.now();
    const uniqueUsername = `test${timestamp.toString().slice(-6)}`;
    
    console.log(`🧪 Starting TC 001 with username: ${uniqueUsername}`);
    
    // Step 1: Navigate to ParaBank
    await test.step('Navigate to ParaBank index page', async () => {
      await page.goto('/parabank/index.htm');
      await expect(page).toHaveTitle(/ParaBank/);
      console.log('✅ Successfully navigated to ParaBank');
    });

    // Check if user is already logged in and logout if needed
    await test.step('Ensure clean session', async () => {
      try {
        const logoutLink = page.locator('a[href="logout.htm"]');
        if (await logoutLink.isVisible({ timeout: 5000 })) {
          await logoutLink.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Logged out existing session');
        }
      } catch (error) {
        console.log('ℹ️ No existing session to logout');
      }
    });

    // Step 2: Click on Register link
    await test.step('Click on Register link', async () => {
      const registerLink = page.locator('text=Register');
      await expect(registerLink).toBeVisible();
      await registerLink.click();
      await expect(page).toHaveTitle(/Register for Free Online Account Access/);
      console.log('✅ Successfully clicked Register link');
    });

    // Step 3: Fill registration form
    await test.step('Fill registration form with unique data', async () => {
      // Fill personal information
      await page.fill('input[name="customer.firstName"]', 'TestUser');
      await page.fill('input[name="customer.lastName"]', 'Auto');
      await page.fill('input[name="customer.address.street"]', '123 Test Street');
      await page.fill('input[name="customer.address.city"]', 'TestCity');
      await page.fill('input[name="customer.address.state"]', 'TC');
      await page.fill('input[name="customer.address.zipCode"]', '12345');
      await page.fill('input[name="customer.phoneNumber"]', '555-TEST-001');
      await page.fill('input[name="customer.ssn"]', '111-22-3333');
      
      // Fill credentials with unique username (10 characters as required)
      await page.fill('input[name="customer.username"]', uniqueUsername);
      await page.fill('input[name="customer.password"]', 'TestPass123!');
      await page.fill('input[name="repeatedPassword"]', 'TestPass123!');
      
      console.log(`✅ Filled registration form with username: ${uniqueUsername} (${uniqueUsername.length} characters)`);
      
      // Verify username length requirement
      expect(uniqueUsername.length).toBe(10);
    });

    // Step 4: Submit registration form
    await test.step('Submit registration form', async () => {
      const registerButton = page.locator('input[value="Register"]').or(page.locator('button:has-text("Register")'));
      await expect(registerButton).toBeVisible();
      
      // Use Promise.race to handle both successful navigation and potential form validation
      await Promise.race([
        registerButton.click(),
        page.waitForURL(/.*/, { timeout: 5000 })
      ]);
      
      // Wait a bit for the form submission to process
      await page.waitForTimeout(2000);
      console.log('✅ Submitted registration form');
    });

    // Step 5: Verify successful registration
    await test.step('Verify successful registration', async () => {
      // Wait for page to load and check title with longer timeout for CI
      await page.waitForLoadState('networkidle', { timeout: process.env.CI ? 60000 : 30000 });
      
      // Check if we're still on the registration page (form validation error)
      const currentTitle = await page.title();
      if (currentTitle.includes('Register for Free Online Account Access')) {
        // Check for validation errors
        const errorMessages = await page.locator('.error').allTextContents();
        if (errorMessages.length > 0) {
          throw new Error(`Registration failed with validation errors: ${errorMessages.join(', ')}`);
        }
        // If no explicit errors, try submitting again
        const registerButton = page.locator('input[value="Register"]').or(page.locator('button:has-text("Register")'));
        await registerButton.click();
        await page.waitForLoadState('networkidle', { timeout: 30000 });
      }
      
      await expect(page).toHaveTitle(/Customer Created/, { timeout: 15000 });
      
      // Verify welcome message with username
      const welcomeHeading = page.locator('h1.title').or(page.locator('h1:has-text("Welcome")'));
      await expect(welcomeHeading).toContainText(`Welcome ${uniqueUsername}`, { timeout: 10000 });
      
      // Verify success message
      const successMessage = page.locator('p:has-text("Your account was created successfully")');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Verify user is logged in - check for account services
      const accountServices = page.locator('h2:has-text("Account Services")');
      await expect(accountServices).toBeVisible({ timeout: 10000 });
      
      console.log(`✅ Registration verified successfully for user: ${uniqueUsername}`);
    });

    // Take screenshot for evidence
    await test.step('Capture test evidence', async () => {
      await page.screenshot({ 
        path: `test-results/TC001-registration-success-${uniqueUsername}.png`,
        fullPage: true 
      });
      console.log('📸 Screenshot captured for test evidence');
    });

    // Generate test report data
    await test.step('Generate test report data', async () => {
      const testData = {
        testCaseId: 'TC 001',
        testCaseName: 'Verify that user can register a new customer',
        status: 'PASSED',
        username: uniqueUsername,
        executionTime: new Date().toISOString(),
        browser: browser.browserType().name(),
        steps: [
          'Navigate to ParaBank index page',
          'Ensure clean session',
          'Click on Register link',
          'Fill registration form with unique data',
          'Submit registration form',
          'Verify successful registration',
          'Capture test evidence'
        ]
      };
      
      await fs.ensureDir('test-results');
      await fs.writeJson(`test-results/TC001-${uniqueUsername}-report.json`, testData, { spaces: 2 });
      console.log('📊 Test report data generated');
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Cleanup: Logout if test passed
    if (testInfo.status === 'passed') {
      try {
        const logoutLink = page.locator('a[href="logout.htm"]');
        if (await logoutLink.isVisible()) {
          await logoutLink.click();
          console.log('🧹 Cleaned up session after test');
        }
      } catch (error) {
        console.log('⚠️ Cleanup not needed or failed silently');
      }
    }
  });

});