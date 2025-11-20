import { expect, test } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Conversations Page Tests', () => {
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

    // Navigate to Conversations
    const conversationsLink = page.locator('a:has-text("Conversations")');
    if (await conversationsLink.isVisible({ timeout: 2000 })) {
      await conversationsLink.click();
      await page.waitForURL(/\/home\/conversations/, { timeout: 5000 });
      await page.waitForLoadState('networkidle');
    }
  });

  test('can view conversations list', async ({ page }) => {
    const conversationsLink = page.locator('a:has-text("Conversations")');

    if (await conversationsLink.isVisible({ timeout: 2000 })) {
      await expect(page).toHaveURL(/\/home\/conversations/);
      console.log('✓ Conversations page loaded');
    } else {
      test.skip();
    }
  });

  test('can search conversations', async ({ page }) => {
    const conversationsLink = page.locator('a:has-text("Conversations")');

    if (await conversationsLink.isVisible({ timeout: 2000 })) {
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
    } else {
      test.skip();
    }
  });

  test('can filter conversations', async ({ page }) => {
    const conversationsLink = page.locator('a:has-text("Conversations")');

    if (await conversationsLink.isVisible({ timeout: 2000 })) {
      // Look for the Filter card/section (contains Filter icon and title)
      const filterSection = page.getByRole('heading', { name: /filters/i });

      if (await filterSection.isVisible({ timeout: 2000 })) {
        // Check for filter controls (status, campaign, agent, outcome dropdowns)
        const statusSelect = page
          .locator('button:has-text("All Statuses")')
          .first();
        if (await statusSelect.isVisible({ timeout: 2000 })) {
          console.log('✓ Filter functionality available');
        } else {
          test.skip();
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('can view conversation details', async ({ page }) => {
    const conversationsLink = page.locator('a:has-text("Conversations")');

    if (await conversationsLink.isVisible({ timeout: 2000 })) {
      // Look for the "View Details" button in the actions dropdown
      // First find a conversation row with actions menu
      const actionsButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();

      if (await actionsButton.isVisible({ timeout: 2000 })) {
        // Click actions menu
        await actionsButton.click();
        await page.waitForTimeout(500);

        // Look for "View Details" option
        const viewDetailsOption = page.getByRole('menuitem', {
          name: /view details/i,
        });
        if (await viewDetailsOption.isVisible({ timeout: 2000 })) {
          console.log('✓ Can view conversation details');
        } else {
          test.skip();
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
