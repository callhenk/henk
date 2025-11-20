import { test } from '@playwright/test';

import { AuthPageObject } from './auth.po';

const newPassword = (Math.random() * 10000).toString();
const emailAddress = (Math.random() * 10000).toFixed(0);

test.describe('Password Reset Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('will reset the password and sign in with new one', async ({ page }) => {
    const email = `${emailAddress}@henk.dev`;
    const auth = new AuthPageObject(page);

    await page.goto('/auth/sign-up');

    await auth.signUp({
      email,
      password: 'password',
      repeatPassword: 'password',
    });

    await auth.visitConfirmEmailLink(email);
    await auth.signOut();

    // Wait for sign out to complete (redirects to root or sign-in page)
    await page
      .waitForURL(/^\/(auth\/sign-in)?$/, { timeout: 10000 })
      .catch(() => {
        // If it doesn't match the pattern, just wait for load state
        return page.waitForLoadState('networkidle');
      });

    await page.goto('/auth/password-reset');

    await page.fill('[name="email"]', email);
    await page.click('[type="submit"]');

    // Wait a moment for the email to be sent
    await page.waitForTimeout(1000);

    await auth.visitConfirmEmailLink(email, { deleteAfter: true });

    await page.waitForURL('/update-password', { timeout: 15000 });

    await auth.updatePassword(newPassword);

    await page
      .locator('a', {
        hasText: 'Back to Home Page',
      })
      .click();

    await page.waitForURL('/home');

    await auth.signOut();

    // Wait for sign out to complete (redirects to root or sign-in page)
    await page
      .waitForURL(/^\/(auth\/sign-in)?$/, { timeout: 10000 })
      .catch(() => {
        // If it doesn't match the pattern, just wait for load state
        return page.waitForLoadState('networkidle');
      });

    await page.waitForTimeout(500);

    // Navigate directly to sign-in page instead of clicking link
    await page.goto('/auth/sign-in');

    await auth.signIn({
      email,
      password: newPassword,
    });

    await page.waitForURL('/home');
  });
});
