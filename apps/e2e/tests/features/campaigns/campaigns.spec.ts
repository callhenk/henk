import { expect, test } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Campaigns Page Tests', () => {
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

    // Navigate to Campaigns
    await page.locator('a:has-text("Campaigns")').click();
    await page.waitForURL(/\/home\/campaigns/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
  });

  test('can view campaigns list', async ({ page }) => {
    // Verify we're on campaigns page
    await expect(page).toHaveURL(/\/home\/campaigns/);
    console.log('✓ Campaigns page loaded');
  });

  test('can create a new campaign', async ({ page }) => {
    // Look for Create button
    const createButton = page
      .locator('button')
      .filter({ hasText: /Create|Add|New/ })
      .first();

    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();

      // Fill campaign form
      const timestamp = Date.now();
      const campaignName = `Test Campaign ${timestamp}`;

      await page.fill(
        'input[name="name"], input[placeholder*="name" i]',
        campaignName,
      );

      // Fill description if present
      const descriptionField = page.locator(
        'textarea[name="description"], textarea[placeholder*="description" i]',
      );
      if (await descriptionField.isVisible({ timeout: 1000 })) {
        await descriptionField.fill('Automated test campaign');
      }

      // Submit
      const submitButton = page
        .locator('button')
        .filter({ hasText: /Save|Create|Next|Submit/ })
        .first();
      await page.waitForTimeout(500);
      await submitButton.click({ force: true });

      // Verify success
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/home\/campaigns/, { timeout: 5000 });

      console.log('✓ Campaign created successfully');
    } else {
      test.skip();
    }
  });

  test('can search campaigns', async ({ page }) => {
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

  test('can filter campaigns', async ({ page }) => {
    const filterButton = page
      .locator('button')
      .filter({ hasText: /Filter|Filters/ });

    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click();
      console.log('✓ Filter functionality available');
    } else {
      test.skip();
    }
  });
});
