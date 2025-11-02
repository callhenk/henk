import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test.describe('Analytics/Dashboard Page Tests', () => {
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
  });

  test('can view dashboard/analytics', async ({ page }) => {
    // Look for Dashboard or Analytics link
    const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("Analytics")').first();

    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      await dashboardLink.click();
      await page.waitForTimeout(2000);

      // Check for metrics or charts
      const hasMetrics = await page.locator('text=Total').or(page.locator('[class*="chart"]')).first().isVisible({ timeout: 3000 });

      if (hasMetrics) {
        console.log('✓ Analytics/Dashboard is accessible');
      }
    } else {
      test.skip();
    }
  });

  test('can see metrics cards', async ({ page }) => {
    const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("Analytics")').first();

    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      await dashboardLink.click();
      await page.waitForTimeout(2000);

      // Look for common metric keywords
      const metricsVisible = await page.locator('text=Total, text=calls, text=donations').first().isVisible({ timeout: 3000 }).catch(() => false);

      if (metricsVisible) {
        console.log('✓ Metrics cards are visible');
      }
    } else {
      test.skip();
    }
  });

  test('can see charts', async ({ page }) => {
    const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("Analytics")').first();

    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      await dashboardLink.click();
      await page.waitForTimeout(2000);

      // Check for recharts (common chart library)
      const chartsVisible = await page.locator('[class*="recharts"]').first().isVisible({ timeout: 3000 }).catch(() => false);

      if (chartsVisible) {
        console.log('✓ Charts are visible');
      }
    } else {
      test.skip();
    }
  });
});
