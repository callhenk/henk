import { Page, expect, test } from '@playwright/test';

import { AccountPageObject } from './account.po';

test.describe('Account Settings', () => {
  let page: Page;
  let account: AccountPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    account = new AccountPageObject(page);

    await account.setup();
  });

  test('user can update their profile name', async () => {
    const name = 'John Doe';

    const request = account.updateName(name);

    const response = page.waitForResponse((resp) => {
      return resp.url().includes('accounts');
    });

    await Promise.all([request, response]);

    await expect(account.getProfileName()).toHaveText(name);
  });

  test('user can update their password', async () => {
    const password = (Math.random() * 100000).toString();

    // Navigate to security page (password update is now in security settings)
    await page.goto('/home/settings/security');

    // Wait for security page to load
    await page.waitForSelector('text=Security Settings', { timeout: 10000 });

    // Update the password
    await account.updatePassword(password);

    // Wait for the success toast to appear (indicates password was updated)
    await page.waitForSelector('li[data-sonner-toast]', {
      state: 'visible',
      timeout: 10000,
    });

    // Give it a moment for the toast to be visible
    await page.waitForTimeout(1000);
  });
});

test.describe('Account Deletion', () => {
  test('user can delete their own account', async ({ page }) => {
    const account = new AccountPageObject(page);

    await account.setup();

    const request = account.deleteAccount();

    const response = page
      .waitForResponse((resp) => {
        return (
          resp.url().includes('home/settings') &&
          resp.request().method() === 'POST'
        );
      })
      .then((response) => {
        expect(response.status()).toBe(303);
      });

    await Promise.all([request, response]);
  });
});
