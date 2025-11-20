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

    // Wait for page to be fully loaded and interactive
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });

    // Hide Next.js dev overlay and any other potential overlays
    await this.page.evaluate(() => {
      const nextjsPortal = document.querySelector('nextjs-portal');
      if (nextjsPortal) {
        (nextjsPortal as HTMLElement).style.display = 'none';
      }
      // Also hide any floating elements that might interfere
      const floatingElements = document.querySelectorAll(
        '[style*="position: fixed"]',
      );
      floatingElements.forEach((el) => {
        if (
          el.tagName !== 'ASIDE' &&
          !(el as HTMLElement).closest('[data-radix-popper-content-wrapper]')
        ) {
          (el as HTMLElement).style.zIndex = '-1';
        }
      });
    });

    const trigger = this.page.locator('[data-test="account-dropdown-trigger"]');

    // Wait for the trigger to be visible and attached
    await trigger.waitFor({ state: 'visible', timeout: 10000 });

    // Scroll into view
    await trigger.scrollIntoViewIfNeeded();

    // Wait a bit for any animations
    await this.page.waitForTimeout(500);

    // Try clicking with regular Playwright click (not force, not JS)
    // This should properly trigger Radix UI event handlers
    await trigger.click({ timeout: 10000 });

    // Wait for the dropdown menu to appear
    await this.page.waitForTimeout(500);

    // Wait for dropdown menu content to be visible
    const signOutButton = this.page.locator(
      '[data-test="account-dropdown-sign-out"]',
    );
    await signOutButton.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    // Click sign out (don't wait for navigation - let tests handle their own expectations)
    await signOutButton.click({ timeout: 5000 });
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
      // Check more frequently to reduce time between email arrival and usage
      intervals: [1_000, 1_000, 2_000, 2_000, 3_000, 3_000],
      timeout: 30_000, // 30 seconds should be enough for local email
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
