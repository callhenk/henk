import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';

export class AccountPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
  }

  async setup(path: string = '/home/settings') {
    await this.auth.signUpFlow(path);

    // Wait for the settings page to fully load
    // The page shows a loading overlay until user data is fetched
    await this.page.waitForSelector('[data-test="update-account-name-form"]', {
      state: 'visible',
      timeout: 30000,
    });
  }

  async updateName(name: string) {
    await this.page.fill('[data-test="update-account-name-form"] input', name);
    await this.page.click('[data-test="update-account-name-form"] button');
  }

  async updatePassword(password: string) {
    // Fill current password (the password used during sign up)
    await this.page.fill(
      '[data-test="account-password-form-current-password-input"]',
      'password',
    );

    // Fill new password
    await this.page.fill(
      '[data-test="account-password-form-password-input"]',
      password,
    );

    // Fill repeat new password
    await this.page.fill(
      '[data-test="account-password-form-repeat-password-input"]',
      password,
    );

    await this.page.click('[data-test="account-password-form"] button');
  }

  async deleteAccount() {
    await expect(async () => {
      await this.page.click('[data-test="delete-account-button"]');

      await this.page.fill(
        '[data-test="delete-account-input-field"]',
        'DELETE',
      );

      const click = this.page.click(
        '[data-test="confirm-delete-account-button"]',
      );

      const response = await this.page
        .waitForResponse((resp) => {
          return (
            resp.url().includes('home/settings') &&
            resp.request().method() === 'POST'
          );
        })
        .then((response) => {
          expect(response.status()).toBe(303);
        });

      await Promise.all([click, response]);
    }).toPass();
  }

  getProfileName() {
    return this.page.locator('[data-test="account-dropdown-display-name"]');
  }
}
