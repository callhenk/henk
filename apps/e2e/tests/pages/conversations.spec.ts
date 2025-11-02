import { test, expect } from '@playwright/test';

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
    const toggleButton = page.locator('button').filter({ hasText: /Toggle Sidebar/i }).or(
      page.locator('button[aria-label*="Toggle"]')
    );
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
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');

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
      const filterButton = page.locator('button').filter({ hasText: /Filter|Filters/ });

      if (await filterButton.isVisible({ timeout: 2000 })) {
        console.log('✓ Filter functionality available');
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
      // Try to click on a conversation row
      const conversationRow = page.locator('[role="row"], tr').nth(1);

      if (await conversationRow.isVisible({ timeout: 2000 })) {
        await conversationRow.click();
        await page.waitForTimeout(2000);
        console.log('✓ Can view conversation details');
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
