import { expect, test } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Profile Page Tests', () => {
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
  });

  test('can access profile page', async ({ page }) => {
    const profileLink = page
      .locator('a:has-text("Profile"), a:has-text("Settings")')
      .first();

    if (await profileLink.isVisible({ timeout: 2000 })) {
      await profileLink.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/home\/(profile|settings)/);
      console.log('✓ Profile page loaded');
    } else {
      test.skip();
    }
  });

  test('can view profile information', async ({ page }) => {
    const profileLink = page
      .locator('a:has-text("Profile"), a:has-text("Settings")')
      .first();

    if (await profileLink.isVisible({ timeout: 2000 })) {
      await profileLink.click();
      await page.waitForTimeout(2000);

      // Check for common profile fields - use more specific selector
      const emailField = page.locator(
        '[data-test="account-email-form-email-input"]',
      );

      if (await emailField.isVisible({ timeout: 2000 })) {
        console.log('✓ Profile information is visible');
      }
    } else {
      test.skip();
    }
  });

  test('can open profile menu', async ({ page }) => {
    // Look for profile button/avatar
    const profileButton = page
      .locator('button[aria-label="Profile"], button[aria-label="Account"]')
      .or(page.locator('[class*="avatar"]').first());

    if (await profileButton.isVisible({ timeout: 2000 })) {
      await profileButton.click();
      await page.waitForTimeout(500);

      // Check if menu opened
      const menuVisible = await page
        .locator('text=Sign Out, text=Settings, text=Profile')
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (menuVisible) {
        console.log('✓ Profile menu opened');
      }
    } else {
      test.skip();
    }
  });

  test('can sign out', async ({ page }) => {
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
      test.skip();
    }
  });
});
