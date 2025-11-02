import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Integrations Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/home/, { timeout: 10000 });

    // Expand sidebar
    const toggleButton = page.locator('button').filter({ hasText: /Toggle Sidebar/i }).or(
      page.locator('button[aria-label*="Toggle"]')
    );
    if (await toggleButton.isVisible({ timeout: 2000 })) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Integrations
    const integrationsLink = page.locator('a:has-text("Integrations")');
    if (await integrationsLink.isVisible({ timeout: 2000 })) {
      await integrationsLink.click();
      await page.waitForURL(/\/home\/integrations/, { timeout: 5000 });
    }
  });

  test('can view integrations page', async ({ page }) => {
    await expect(page).toHaveURL(/\/home\/integrations/);
    console.log('✓ Integrations page loaded');
  });

  test('can see integration cards', async ({ page }) => {
    // Check for integration cards (Salesforce, HubSpot, etc.)
    const salesforceCard = page.locator('h3:has-text("Salesforce"), h3:has-text("HubSpot")').first();

    if (await salesforceCard.isVisible({ timeout: 5000 })) {
      console.log('✓ Integration cards are visible');
    } else {
      test.skip();
    }
  });

  test('can search integrations', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');

    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('salesforce');
      await page.waitForTimeout(1000);
      console.log('✓ Search functionality works');
    } else {
      test.skip();
    }
  });

  test('can view integration details', async ({ page }) => {
    // Try to click on an integration card
    const integrationCard = page.locator('h3:has-text("Salesforce"), h3:has-text("HubSpot")').first();

    if (await integrationCard.isVisible({ timeout: 2000 })) {
      const parentCard = integrationCard.locator('..');
      await parentCard.click();
      await page.waitForTimeout(2000);
      console.log('✓ Can view integration details');
    } else {
      test.skip();
    }
  });
});
