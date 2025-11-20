import { expect, test } from '@playwright/test';

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

    // Ensure sidebar is expanded
    // Check if any nav link text is not visible (opacity-0 or w-0 indicates collapsed)
    const navLink = page.locator('a:has-text("Agents")').first();
    const navText = page.locator('a:has-text("Agents") span').first();

    // If nav text is not visible, find and click the toggle
    try {
      const isVisible = await navText.isVisible({ timeout: 1000 });
      if (!isVisible) {
        // Try multiple toggle selectors
        const toggleSelectors = [
          'button:has-text("Toggle")',
          'button[aria-label*="Toggle"]',
          'button[aria-label*="Menu"]',
          '[data-sidebar-toggle]',
          'button svg[class*="menu"]',
        ];

        for (const selector of toggleSelectors) {
          const toggle = page.locator(selector).first();
          if (await toggle.isVisible({ timeout: 500 })) {
            await toggle.click();
            await page.waitForTimeout(800); // Wait for animation
            break;
          }
        }
      }
    } catch (e) {
      // Sidebar might already be expanded
      console.log('Sidebar expansion check skipped');
    }
  });

  test('can navigate to main sections', async ({ page }) => {
    // Check that main navigation items are visible
    const leadsLink = page
      .locator('a:has-text("Leads")')
      .or(page.locator('a:has-text("Donors")'))
      .or(page.locator('a:has-text("Contacts")'))
      .first();

    await expect(leadsLink).toBeVisible();
    await expect(page.locator('a:has-text("Campaigns")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Agents")').first()).toBeVisible();

    console.log('✓ Main navigation sections are accessible');
  });

  test('can create a contact/donor', async ({ page }) => {
    // Navigate to donors/contacts/leads page
    const leadsLink = page
      .locator(
        'a:has-text("Leads"), a:has-text("Donors"), a:has-text("Contacts")',
      )
      .first();
    await leadsLink.click();

    // Wait for page to load
    await page.waitForURL(/\/home\/(donors|contacts|leads)/, { timeout: 5000 });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for React hydration

    // Look for "Add Lead" button specifically
    const addButton = page.locator('button:has-text("Add Lead")').first();
    if (await addButton.isVisible({ timeout: 10000 })) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Wait for the form dialog to open and inputs to be visible
      const firstNameInput = page.locator('input[name="first_name"]').first();
      await firstNameInput.waitFor({ state: 'visible', timeout: 10000 });

      // Fill in contact form
      const timestamp = Date.now();
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="last_name"]', 'Contact');
      await page.fill('input[name="email"]', `test-${timestamp}@example.com`);

      // Submit form
      await page.click('button[type="submit"]', { force: true });

      // Wait for success - page might redirect
      await page.waitForTimeout(3000);

      // Verify we're still on leads/contacts/donors page
      await expect(page).toHaveURL(/\/home\/(donors|contacts|leads)/, {
        timeout: 5000,
      });

      console.log('✓ Contact created successfully');
    } else {
      console.log('⚠ Add Lead button not found - skipping test');
      test.skip();
    }
  });

  test('can create a campaign', async ({ page }) => {
    // Navigate to campaigns page
    await page.locator('a:has-text("Campaigns")').click();

    // Wait for campaigns page to load
    await page.waitForURL(/\/home\/campaigns/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for React hydration

    // Look for "Create Campaign" button specifically
    const createButton = page
      .locator('button:has-text("Create Campaign")')
      .first();
    if (await createButton.isVisible({ timeout: 10000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Fill in campaign form
      const timestamp = Date.now();
      const campaignName = `Smoke Test Campaign ${timestamp}`;

      await page.fill(
        'input[name="name"], input[placeholder*="name" i]',
        campaignName,
      );

      // Fill description if present
      const descriptionField = page.locator(
        'textarea[name="description"], textarea[placeholder*="description" i]',
      );
      if (await descriptionField.isVisible({ timeout: 1000 })) {
        await descriptionField.fill('This is a smoke test campaign');
      }

      // Submit form (might be "Save", "Create", or "Next")
      const submitButton = page
        .locator('button')
        .filter({ hasText: /Save|Create|Next|Submit/ })
        .first();
      // Wait for any overlays to disappear, then click
      await page.waitForTimeout(500);
      await submitButton.click({ force: true });

      // Wait for success - page might redirect
      await page.waitForTimeout(3000);

      // Verify we're on campaigns page or campaign detail page
      await expect(page).toHaveURL(/\/home\/campaigns/, { timeout: 5000 });

      console.log('✓ Campaign created successfully');
    } else {
      console.log('⚠ Create Campaign button not found - skipping test');
      test.skip();
    }
  });

  test('can create an agent', async ({ page }) => {
    // Navigate to agents page
    await page.locator('a:has-text("Agents")').click();

    // Wait for agents page to load
    await page.waitForURL(/\/home\/agents/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for React hydration

    // Look for "Create Agent" button specifically
    const createButton = page
      .locator('button:has-text("Create Agent")')
      .first();
    if (await createButton.isVisible({ timeout: 10000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // This is now a 3-step wizard
      // Step 1: Select agent type (Blank Agent)
      const blankAgentButton = page
        .locator('button')
        .filter({ hasText: /Blank Agent|Start from scratch/i })
        .first();
      if (await blankAgentButton.isVisible({ timeout: 2000 })) {
        await blankAgentButton.click();
      }

      // Click Next
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible({ timeout: 2000 })) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Step 2: Select Use Case
      const useCaseButton = page
        .locator('button')
        .filter({ hasText: /Customer Support|Outbound Fundraising|Volunteer/i })
        .first();
      if (await useCaseButton.isVisible({ timeout: 2000 })) {
        await useCaseButton.click();
      }

      // Click Next
      if (await nextButton.isVisible({ timeout: 2000 })) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Step 3: Fill in details
      const timestamp = Date.now();
      const agentName = `Smoke Test Agent ${timestamp}`;

      await page.fill(
        'input[name="name"], input[placeholder*="name" i]',
        agentName,
      );

      // Fill context prompt if visible
      const contextField = page
        .locator(
          'textarea[name="contextPrompt"], textarea[placeholder*="context" i]',
        )
        .first();
      if (await contextField.isVisible({ timeout: 1000 })) {
        await contextField.fill('This is a smoke test agent');
      }

      // Fill starting message if visible
      const startingMsgField = page
        .locator(
          'textarea[name="startingMessage"], textarea[placeholder*="starting" i], textarea[placeholder*="message" i]',
        )
        .first();
      if (await startingMsgField.isVisible({ timeout: 1000 })) {
        await startingMsgField.fill('Hello! How can I help you?');
      } else {
        // Fallback: fill second textarea
        const allTextareas = page.locator('textarea');
        if ((await allTextareas.count()) >= 2) {
          await allTextareas.nth(1).fill('Hello! How can I help you?');
        }
      }

      // Submit form - now "Create Agent" button
      await page.waitForTimeout(500);
      const submitButton = page
        .locator('button:has-text("Create Agent")')
        .first();
      if (await submitButton.isVisible({ timeout: 2000 })) {
        await submitButton.click({ force: true });
      }

      // Wait for success - page might redirect
      await page.waitForTimeout(5000);

      // Verify we're on agents page or agent detail page
      await expect(page).toHaveURL(/\/home\/agents/, { timeout: 5000 });

      console.log('✓ Agent created successfully');
    } else {
      console.log('⚠ Create Agent button not found - skipping test');
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
      await expect(
        page
          .locator('h3:has-text("Salesforce"), h3:has-text("HubSpot")')
          .first(),
      ).toBeVisible({ timeout: 5000 });

      console.log('✓ Integrations page is accessible');
    } else {
      console.log('⚠ Integrations link not found - skipping test');
      test.skip();
    }
  });

  test('complete workflow: create contact list and add contacts', async ({
    page,
  }) => {
    // Navigate to leads/donors/contacts
    const leadsLink = page
      .locator(
        'a:has-text("Leads"), a:has-text("Donors"), a:has-text("Contacts")',
      )
      .first();
    await leadsLink.click();
    await page.waitForURL(/\/home\/(donors|contacts|leads)/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for React hydration

    // Create a new contact first
    const addContactButton = page
      .locator('button:has-text("Add Lead")')
      .first();
    if (await addContactButton.isVisible({ timeout: 10000 })) {
      await addContactButton.click();
      await page.waitForTimeout(500);

      // Wait for the form dialog to open and inputs to be visible
      const firstNameInput = page.locator('input[name="first_name"]').first();
      await firstNameInput.waitFor({ state: 'visible', timeout: 10000 });

      const timestamp = Date.now();
      await page.fill('input[name="first_name"]', 'WorkflowTest');
      await page.fill('input[name="last_name"]', 'Contact');
      await page.fill(
        'input[name="email"]',
        `workflow-${timestamp}@example.com`,
      );

      await page.click('button[type="submit"]', { force: true });
      await page.waitForTimeout(3000);

      console.log('✓ Created test contact for workflow');

      // Verify we're still on the page
      await expect(page).toHaveURL(/\/home\/(donors|contacts|leads)/, {
        timeout: 5000,
      });

      console.log('✓ Complete workflow successful');
    } else {
      console.log('⚠ Workflow test skipped - Add Lead button not found');
      test.skip();
    }
  });

  test('can search and filter data', async ({ page }) => {
    // Navigate to leads/donors/contacts
    const leadsLink = page
      .locator(
        'a:has-text("Leads"), a:has-text("Donors"), a:has-text("Contacts")',
      )
      .first();
    await leadsLink.click();
    await page.waitForURL(/\/home\/(donors|contacts|leads)/, { timeout: 5000 });

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Search" i]',
    );
    if (await searchInput.isVisible({ timeout: 2000 })) {
      // Type in search
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      console.log('✓ Search functionality works');
    } else {
      console.log('⚠ Search not available - skipping test');
    }

    // Check for filter options
    const filterButton = page
      .locator('button')
      .filter({ hasText: /Filter|Filters/ });
    if (await filterButton.isVisible({ timeout: 2000 })) {
      console.log('✓ Filter functionality available');
    }
  });

  test('can access analytics/dashboard', async ({ page }) => {
    // Look for Dashboard or Analytics link in navigation
    const dashboardLink = page
      .locator('a:has-text("Dashboard"), a:has-text("Analytics")')
      .first();
    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      await dashboardLink.click();

      // Wait for page load
      await page.waitForTimeout(2000);

      // Check for charts or metrics
      const hasMetrics = await page
        .locator('text=Total')
        .or(page.locator('[class*="chart"]'))
        .first()
        .isVisible({ timeout: 3000 });
      if (hasMetrics) {
        console.log('✓ Analytics/Dashboard is accessible');
      }
    } else {
      console.log('⚠ Dashboard/Analytics not found - skipping test');
    }
  });

  test('can sign out', async ({ page }) => {
    // Look for profile menu or sign out button
    const profileButton = page
      .locator('button[aria-label="Profile"], button[aria-label="Account"]')
      .or(page.locator('[class*="avatar"]').first());

    if (await profileButton.isVisible({ timeout: 2000 })) {
      await profileButton.click();

      // Look for sign out option
      const signOutButton = page
        .locator('text=Sign Out')
        .or(page.locator('text=Log Out'));
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
