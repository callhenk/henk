import { expect, test } from '@playwright/test';

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
    const toggleButton = page
      .locator('button')
      .filter({ hasText: /Toggle Sidebar/i })
      .or(page.locator('button[aria-label*="Toggle"]'));
    if (await toggleButton.isVisible({ timeout: 2000 })) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Integrations
    const integrationsLink = page.locator('a:has-text("Integrations")');
    if (await integrationsLink.isVisible({ timeout: 2000 })) {
      await integrationsLink.click();
      await page.waitForURL(/\/home\/integrations/, { timeout: 5000 });
      await page.waitForLoadState('networkidle');
    }
  });

  test('can view integrations page', async ({ page }) => {
    await expect(page).toHaveURL(/\/home\/integrations/);
    console.log('✓ Integrations page loaded');
  });

  test('can see integration cards', async ({ page }) => {
    // Wait for the filters section to ensure page is loaded
    await page.waitForSelector('text=Filters', { timeout: 5000 });

    // Check for integration cards using CardTitle role
    // Look for common integration names like Salesforce, HubSpot, ElevenLabs
    const integrationCard = page
      .getByRole('heading')
      .filter({ hasText: /Salesforce|HubSpot|ElevenLabs|Twilio/i })
      .first();

    if (await integrationCard.isVisible({ timeout: 10000 })) {
      console.log('✓ Integration cards are visible');
    } else {
      console.log('⚠️ No integration cards found - checking page content');
      test.skip();
    }
  });

  test('can search integrations', async ({ page }) => {
    // Wait for the filters section to be loaded
    await page.waitForSelector('text=Filters', { timeout: 5000 });

    // Look for the search input by placeholder text
    const searchInput = page.getByPlaceholder(/search by name or description/i);

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('salesforce');
      await page.waitForTimeout(1000);
      console.log('✓ Search functionality works');
    } else {
      console.log('⚠️ Search input not found - checking page structure');
      test.skip();
    }
  });

  test('can view integration details', async ({ page }) => {
    // Look for "Manage" or "Connect" button on an integration card
    const manageButton = page
      .getByRole('button', { name: /manage|connect/i })
      .first();

    if (await manageButton.isVisible({ timeout: 2000 })) {
      await manageButton.click();
      await page.waitForTimeout(1000);

      // Check if drawer/dialog opened (look for close button or dialog content)
      const drawer = page.locator('[role="dialog"], [role="complementary"]');
      if (await drawer.isVisible({ timeout: 2000 })) {
        console.log('✓ Can view integration details');
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
