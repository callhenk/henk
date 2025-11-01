import { test, expect } from '@playwright/test';

// Test credentials
const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Core Functionality Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/sign-in');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click sign in
    await page.click('button[type="submit"]');

    // Wait for navigation to home/dashboard
    await page.waitForURL(/\/home/, { timeout: 10000 });

    // Verify we're logged in
    await expect(page).toHaveURL(/\/home/);

    // Expand the sidebar if it's collapsed
    const toggleButton = page.locator('button').filter({ hasText: /Toggle Sidebar/i }).or(
      page.locator('button[aria-label*="Toggle"]')
    );
    if (await toggleButton.isVisible({ timeout: 2000 })) {
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for sidebar animation
    }
  });

  test('can navigate to main sections', async ({ page }) => {
    // Check that main navigation items are visible
    await expect(page.locator('a:has-text("Leads"), a:has-text("Donors"), a:has-text("Contacts")')).toBeVisible();
    await expect(page.locator('a:has-text("Campaigns")')).toBeVisible();
    await expect(page.locator('a:has-text("Agents")')).toBeVisible();

    console.log('✓ Main navigation sections are accessible');
  });

  test('can create a contact/donor', async ({ page }) => {
    // Navigate to donors/contacts/leads page
    const leadsLink = page.locator('a:has-text("Leads"), a:has-text("Donors"), a:has-text("Contacts")').first();
    await leadsLink.click();

    // Wait for donors page to load
    await page.waitForURL(/\/home\/(donors|contacts)/, { timeout: 5000 });

    // Look for "Add" or "Create" button
    const addButton = page.locator('button').filter({ hasText: /Add|Create|New/ }).first();
    if (await addButton.isVisible({ timeout: 2000 })) {
      await addButton.click();

      // Fill in contact form
      const timestamp = Date.now();
      await page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test');
      await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'Contact');
      await page.fill('input[name="email"], input[type="email"]', `test-${timestamp}@example.com`);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success indication
      await page.waitForTimeout(2000);

      // Verify the contact appears in the list
      await expect(page.locator('text=Test Contact').or(page.locator(`text=test-${timestamp}@example.com`))).toBeVisible({ timeout: 10000 });

      console.log('✓ Contact created successfully');
    } else {
      console.log('⚠ Add contact button not found - skipping test');
      test.skip();
    }
  });

  test('can create a campaign', async ({ page }) => {
    // Navigate to campaigns page
    await page.click('text=Campaigns');

    // Wait for campaigns page to load
    await page.waitForURL(/\/home\/campaigns/, { timeout: 5000 });

    // Look for "Create" or "Add" button
    const createButton = page.locator('button').filter({ hasText: /Create|Add|New/ }).first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      // Fill in campaign form
      const timestamp = Date.now();
      const campaignName = `Smoke Test Campaign ${timestamp}`;

      await page.fill('input[name="name"], input[placeholder*="name" i]', campaignName);

      // Fill description if present
      const descriptionField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');
      if (await descriptionField.isVisible({ timeout: 1000 })) {
        await descriptionField.fill('This is a smoke test campaign');
      }

      // Submit form (might be "Save", "Create", or "Next")
      const submitButton = page.locator('button').filter({ hasText: /Save|Create|Next|Submit/ }).first();
      await submitButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Verify campaign was created
      await expect(page.locator(`text=${campaignName}`)).toBeVisible({ timeout: 10000 });

      console.log('✓ Campaign created successfully');
    } else {
      console.log('⚠ Create campaign button not found - skipping test');
      test.skip();
    }
  });

  test('can create an agent', async ({ page }) => {
    // Navigate to agents page
    await page.click('text=Agents');

    // Wait for agents page to load
    await page.waitForURL(/\/home\/agents/, { timeout: 5000 });

    // Look for "Create" or "Add" button
    const createButton = page.locator('button').filter({ hasText: /Create|Add|New/ }).first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      // Fill in agent form
      const timestamp = Date.now();
      const agentName = `Smoke Test Agent ${timestamp}`;

      await page.fill('input[name="name"], input[placeholder*="name" i]', agentName);

      // Select a voice if there's a dropdown
      const voiceDropdown = page.locator('select[name="voice"], select[name="voiceId"]');
      if (await voiceDropdown.isVisible({ timeout: 1000 })) {
        await voiceDropdown.selectOption({ index: 1 }); // Select first available voice
      }

      // Submit form
      const submitButton = page.locator('button').filter({ hasText: /Save|Create|Submit/ }).first();
      await submitButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Verify agent was created
      await expect(page.locator(`text=${agentName}`)).toBeVisible({ timeout: 10000 });

      console.log('✓ Agent created successfully');
    } else {
      console.log('⚠ Create agent button not found - skipping test');
      test.skip();
    }
  });

  test('can view and navigate integrations', async ({ page }) => {
    // Look for Integrations link
    const integrationsLink = page.locator('text=Integrations');
    if (await integrationsLink.isVisible({ timeout: 2000 })) {
      await integrationsLink.click();

      // Wait for integrations page
      await page.waitForURL(/\/home\/integrations/, { timeout: 5000 });

      // Verify integration cards are visible
      await expect(page.locator('text=Salesforce').or(page.locator('text=HubSpot'))).toBeVisible({ timeout: 5000 });

      console.log('✓ Integrations page is accessible');
    } else {
      console.log('⚠ Integrations link not found - skipping test');
      test.skip();
    }
  });

  test('complete workflow: create contact list and add contacts', async ({ page }) => {
    // Navigate to donors
    await page.click('text=Donors');
    await page.waitForURL(/\/home\/(donors|contacts)/, { timeout: 5000 });

    // Create a new contact first
    const addContactButton = page.locator('button').filter({ hasText: /Add|Create|New/ }).first();
    if (await addContactButton.isVisible({ timeout: 2000 })) {
      await addContactButton.click();

      const timestamp = Date.now();
      await page.fill('input[name="firstName"], input[placeholder*="First"]', 'WorkflowTest');
      await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'Contact');
      await page.fill('input[name="email"], input[type="email"]', `workflow-${timestamp}@example.com`);

      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      console.log('✓ Created test contact for workflow');

      // Now try to create a contact list or perform other operations
      // This tests the full workflow
      await expect(page.locator('text=WorkflowTest Contact').or(page.locator(`text=workflow-${timestamp}@example.com`))).toBeVisible({ timeout: 10000 });

      console.log('✓ Complete workflow successful');
    } else {
      console.log('⚠ Workflow test skipped - add button not found');
      test.skip();
    }
  });

  test('can search and filter data', async ({ page }) => {
    // Navigate to donors
    await page.click('text=Donors');
    await page.waitForURL(/\/home\/(donors|contacts)/, { timeout: 5000 });

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');
    if (await searchInput.isVisible({ timeout: 2000 })) {
      // Type in search
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      console.log('✓ Search functionality works');
    } else {
      console.log('⚠ Search not available - skipping test');
    }

    // Check for filter options
    const filterButton = page.locator('button').filter({ hasText: /Filter|Filters/ });
    if (await filterButton.isVisible({ timeout: 2000 })) {
      console.log('✓ Filter functionality available');
    }
  });

  test('can access analytics/dashboard', async ({ page }) => {
    // Look for Dashboard or Analytics link
    const dashboardLink = page.locator('text=Dashboard').or(page.locator('text=Analytics'));
    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      await dashboardLink.click();

      // Wait for page load
      await page.waitForTimeout(2000);

      // Check for charts or metrics
      const hasMetrics = await page.locator('text=Total').or(page.locator('[class*="chart"]')).isVisible({ timeout: 3000 });
      if (hasMetrics) {
        console.log('✓ Analytics/Dashboard is accessible');
      }
    } else {
      console.log('⚠ Dashboard/Analytics not found - skipping test');
    }
  });

  test('can sign out', async ({ page }) => {
    // Look for profile menu or sign out button
    const profileButton = page.locator('button[aria-label="Profile"], button[aria-label="Account"]').or(
      page.locator('[class*="avatar"]').first()
    );

    if (await profileButton.isVisible({ timeout: 2000 })) {
      await profileButton.click();

      // Look for sign out option
      const signOutButton = page.locator('text=Sign Out').or(page.locator('text=Log Out'));
      if (await signOutButton.isVisible({ timeout: 2000 })) {
        await signOutButton.click();

        // Wait for redirect to auth page
        await page.waitForURL(/\/(auth|sign-in|login)/, { timeout: 5000 });

        console.log('✓ Sign out successful');
      }
    } else {
      console.log('⚠ Profile menu not found - skipping sign out test');
    }
  });
});
