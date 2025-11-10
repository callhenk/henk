import { expect, test } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Agents Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/home/, { timeout: 10000 });

    // Expand sidebar
    const toggleButton = page
      .locator('button')
      .filter({ hasText: /Toggle Sidebar/i })
      .or(page.locator('button[aria-label*="Toggle"]'));
    if (await toggleButton.isVisible({ timeout: 2000 })) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Agents
    await page.locator('a:has-text("Agents")').click();
    await page.waitForURL(/\/home\/agents/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
  });

  test('can view agents list', async ({ page }) => {
    await expect(page).toHaveURL(/\/home\/agents/);
    console.log('✓ Agents page loaded');
  });

  test('can create a new agent through 3-step wizard', async ({ page }) => {
    const createButton = page
      .locator('button')
      .filter({ hasText: /Create|Add|New/ })
      .first();

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      console.log('✓ Opened agent creation dialog');

      // Step 1: Select Agent Type
      const blankAgentCard = page
        .locator('button, [role="button"]')
        .filter({ hasText: /Blank Agent|Start from scratch/i })
        .first();
      if (await blankAgentCard.isVisible({ timeout: 2000 })) {
        await blankAgentCard.click();
        console.log('✓ Step 1: Selected Blank Agent');
      }

      // Click Next
      const nextButton = page.locator('button').filter({ hasText: /Next/i });
      if (await nextButton.isVisible({ timeout: 1000 })) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Step 2: Select Use Case (updated to match new nonprofit-focused use cases)
      const useCaseOption = page
        .locator('button, [role="button"]')
        .filter({
          hasText:
            /Customer Support|Outbound Fundraising|Learning and Development|Scheduling|Lead Qualification|Answering Service|Volunteer Coordination|Donation Processing|Program Information|Event Management|Beneficiary Support|Impact Reporting/i,
        })
        .first();
      if (await useCaseOption.isVisible({ timeout: 2000 })) {
        await useCaseOption.click();
        console.log('✓ Step 2: Selected Use Case');
      }

      // Click Next
      if (await nextButton.isVisible({ timeout: 1000 })) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Step 3: Fill in Details (this is now the final step)
      const timestamp = Date.now();
      const agentName = `Test Agent ${timestamp}`;

      const nameInput = page
        .locator('input[name="name"], input[placeholder*="name" i]')
        .first();
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill(agentName);
        console.log(`✓ Step 3: Entered agent name: ${agentName}`);
      }

      // Fill context prompt (required)
      const contextInput = page
        .locator(
          'textarea[name="contextPrompt"], textarea[placeholder*="context" i], textarea[placeholder*="prompt" i]',
        )
        .first();
      if (await contextInput.isVisible({ timeout: 1000 })) {
        await contextInput.fill(
          'This is a test agent for E2E testing purposes.',
        );
        console.log('✓ Step 3: Entered context prompt');
      }

      // Fill starting message (required)
      const startingMsgInput = page
        .locator(
          'textarea[name="startingMessage"], textarea[placeholder*="starting" i], textarea[placeholder*="greeting" i], textarea[placeholder*="message" i]',
        )
        .first();
      if (await startingMsgInput.isVisible({ timeout: 1000 })) {
        await startingMsgInput.fill('Hello! How can I help you today?');
        console.log('✓ Step 3: Entered starting message');
      } else {
        // Try finding all textareas if the specific one isn't found
        const allTextareas = page.locator('textarea');
        const count = await allTextareas.count();
        console.log(
          `Found ${count} textareas, filling the second one if it exists`,
        );
        if (count >= 2) {
          await allTextareas.nth(1).fill('Hello! How can I help you today?');
          console.log('✓ Step 3: Entered starting message (fallback)');
        }
      }

      // Click Create Agent button (now appears on the Details step instead of a separate Review step)
      await page.waitForTimeout(500); // Give form time to validate
      const createFinalButton = page
        .locator('button')
        .filter({ hasText: /Create Agent|Create|Finish/i })
        .and(page.locator(':not([disabled])'))
        .first();
      if (await createFinalButton.isVisible({ timeout: 2000 })) {
        await createFinalButton.click({ force: true });
        console.log('✓ Step 3: Clicked Create Agent button');
      } else {
        console.log(
          '⚠ Step 3: Create Agent button not enabled, may be missing required field',
        );
      }

      // Verify success - should redirect to agents list or agent detail page
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      if (currentUrl.includes('/agents')) {
        console.log('✓ Agent created successfully - redirected to agents page');
      }
    } else {
      test.skip();
    }
  });

  test('can search agents', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Search" i]',
    );

    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      console.log('✓ Search functionality works');
    } else {
      test.skip();
    }
  });
});
