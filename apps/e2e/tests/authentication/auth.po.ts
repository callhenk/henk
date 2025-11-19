import { Page, expect } from '@playwright/test';

import { Mailbox } from '../utils/mailbox';

export class AuthPageObject {
  private readonly page: Page;
  private readonly mailbox: Mailbox;

  constructor(page: Page) {
    this.page = page;
    this.mailbox = new Mailbox(page);
  }

  /**
   * Clear any blocking portals, toasts, or overlays
   * This helps prevent "element intercepts pointer events" errors
   */
  private async clearBlockingElements() {
    // Close any visible toasts
    const toastCloseButtons = this.page.locator(
      '[data-sonner-toast] button[aria-label*="close"], [data-sonner-toast] [data-close-button]',
    );
    const toastCount = await toastCloseButtons.count();

    for (let i = 0; i < toastCount; i++) {
      await toastCloseButtons
        .nth(i)
        .click({ force: true })
        .catch(() => {});
    }

    if (toastCount > 0) {
      await this.page.waitForTimeout(300);
    }

    // Wait for portals to clear
    await this.page
      .waitForSelector('nextjs-portal:empty, body:not(:has(nextjs-portal))', {
        timeout: 3000,
      })
      .catch(() => {});
  }

  goToSignIn() {
    return this.page.goto('/auth/sign-in');
  }

  goToSignUp() {
    return this.page.goto('/auth/sign-up');
  }

  async signOut() {
    // Wait for any existing portals/animations to clear
    await this.page.waitForTimeout(500);

    // Clear any blocking elements (toasts, portals, etc.)
    await this.clearBlockingElements();

    const trigger = this.page.locator('[data-test="account-dropdown-trigger"]');

    // Wait for the trigger to be visible and clickable (not just attached)
    await trigger.waitFor({ state: 'visible', timeout: 10000 });

    // Use force click to bypass any potential portal overlays
    await trigger.click({ force: true, timeout: 10000 });

    // Wait for dropdown menu content to be visible with longer timeout
    await this.page.waitForSelector('[data-test="account-dropdown-sign-out"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Click sign out button with force to ensure it works
    await this.page.click('[data-test="account-dropdown-sign-out"]', {
      force: true,
    });
  }

  async signIn(params: { email: string; password: string }) {
    await this.page.waitForTimeout(1000);

    await this.page.fill('input[name="email"]', params.email);
    await this.page.fill('input[name="password"]', params.password);
    await this.page.click('button[type="submit"]');
  }

  async signUp(params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) {
    await this.page.waitForTimeout(1000);

    await this.page.fill('input[name="email"]', params.email);
    await this.page.fill('input[name="password"]', params.password);
    await this.page.fill('input[name="repeatPassword"]', params.repeatPassword);

    await this.page.click('button[type="submit"]');
  }

  async visitConfirmEmailLink(
    email: string,
    params: {
      deleteAfter: boolean;
    } = {
      deleteAfter: true,
    },
  ) {
    return expect(async () => {
      const res = await this.mailbox.visitMailbox(email, params);

      expect(res).not.toBeNull();
    }).toPass({
      intervals: [2_000, 3_000, 5_000, 5_000],
      timeout: 60_000, // 60 seconds to wait for email
    });
  }

  createRandomEmail() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return `cyrus+e2e-${timestamp}-${random}@callhenk.com`;
  }

  async signUpFlow(path: string) {
    const email = this.createRandomEmail();

    await this.page.goto(`/auth/sign-up?next=${path}`);

    await this.signUp({
      email,
      password: 'password',
      repeatPassword: 'password',
    });

    await this.visitConfirmEmailLink(email);
  }

  async updatePassword(password: string) {
    await this.page.fill('[name="password"]', password);
    await this.page.fill('[name="repeatPassword"]', password);
    await this.page.click('[type="submit"]');
  }
}
