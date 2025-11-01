import { test, expect } from '@playwright/test';

// Test credentials
const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

test('debug: check what happens after login', async ({ page }) => {
  // Login
  await page.goto('/auth/sign-in');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\\/home/, { timeout: 10000 });

  // Print the current URL
  console.log('✓ Current URL:', page.url());

  // Take a screenshot
  await page.screenshot({ path: 'after-login.png', fullPage: true });
  console.log('✓ Screenshot saved to after-login.png');

  // Print all visible text on the page
  const bodyText = await page.locator('body').innerText();
  console.log('✓ Page content preview:', bodyText.substring(0, 500));

  // Check for Donors/Contacts link
  const donorsLink = page.locator('text=Donors');
  const contactsLink = page.locator('text=Contacts');
  const donorsVisible = await donorsLink.isVisible({ timeout: 2000 }).catch(() => false);
  const contactsVisible = await contactsLink.isVisible({ timeout: 2000 }).catch(() => false);

  console.log('✓ Donors link visible:', donorsVisible);
  console.log('✓ Contacts link visible:', contactsVisible);

  // Check for Campaigns link
  const campaignsLink = page.locator('text=Campaigns');
  const campaignsVisible = await campaignsLink.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('✓ Campaigns link visible:', campaignsVisible);

  // Check for Agents link
  const agentsLink = page.locator('text=Agents');
  const agentsVisible = await agentsLink.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('✓ Agents link visible:', agentsVisible);

  // List all links on the page
  const links = await page.locator('a').allTextContents();
  console.log('✓ All links on page:', links);

  // Wait a bit to keep browser open
  await page.waitForTimeout(5000);
});
