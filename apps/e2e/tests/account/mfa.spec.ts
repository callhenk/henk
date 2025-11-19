import { expect, test } from '@playwright/test';

import { AccountPageObject } from './account.po';

test.describe('Multi-Factor Authentication (MFA)', () => {
  test('user can setup MFA with TOTP', async ({ page }) => {
    const account = new AccountPageObject(page);

    // Setup: Sign up and navigate to settings
    await account.setup();

    // Navigate to security settings
    await page.goto('/home/settings/security');

    // Click on "Setup a new Factor" button
    await page.click('[data-test="setup-mfa-button"]');

    // Wait for the MFA setup dialog to open
    await page.waitForSelector('role=dialog', { timeout: 10000 });

    // Enter factor name
    const factorName = `My Phone - ${Date.now()}`;
    await page.fill('[name="name"]', factorName);
    await page.click('button[type="submit"]');

    // Wait for QR code to be generated
    await page.waitForSelector('img[alt="QR Code"]', { timeout: 10000 });

    // Verify QR code is visible
    const qrCode = page.locator('img[alt="QR Code"]');
    await expect(qrCode).toBeVisible();

    // Note: In a real test, you would scan the QR code with an authenticator app
    // and enter the TOTP code. For E2E tests, we'll just verify the UI flow.

    // Verify the verification code input is visible
    await expect(
      page.locator('text=Enter the verification code'),
    ).toBeVisible();
  });

  test('MFA setup shows error for invalid verification code', async ({
    page,
  }) => {
    const account = new AccountPageObject(page);
    await account.setup();
    await page.goto('/home/settings/security');

    // Setup MFA
    await page.click('[data-test="setup-mfa-button"]');
    await page.waitForSelector('role=dialog');

    const factorName = `Test Factor - ${Date.now()}`;
    await page.fill('[name="name"]', factorName);
    await page.click('button[type="submit"]');

    // Wait for QR code
    await page.waitForSelector('img[alt="QR Code"]', { timeout: 10000 });

    // Enter invalid verification code
    const otpInput = page.locator('[data-input-otp]').first();
    await otpInput.click();
    await page.keyboard.type('000000');

    // Submit the form
    await page.click('button[type="submit"]:has-text("Enable Factor")');

    // Wait for error message
    await expect(
      page.locator('text=/Invalid.*code|Verification.*failed/i'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('user can cancel MFA setup', async ({ page }) => {
    const account = new AccountPageObject(page);
    await account.setup();
    await page.goto('/home/settings/security');

    // Start MFA setup
    await page.click('[data-test="setup-mfa-button"]');
    await page.waitForSelector('role=dialog');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('MFA setup handles QR code generation error gracefully', async ({
    page,
  }) => {
    const account = new AccountPageObject(page);
    await account.setup();
    await page.goto('/home/settings/security');

    // Log all network requests to debug
    page.on('request', (request) => {
      if (request.url().includes('factors')) {
        console.log('REQUEST:', request.method(), request.url());
      }
    });

    // Intercept the MFA enroll API call and make it fail - try broader pattern
    await page.route('**/*factors*', async (route) => {
      console.log(
        'INTERCEPTED:',
        route.request().method(),
        route.request().url(),
      );
      if (
        route.request().method() === 'POST' &&
        route.request().url().includes('/auth/v1/factors')
      ) {
        console.log('FULFILLING WITH ERROR');
        // Return error in GoTrue format
        await route.fulfill({
          status: 422, // Unprocessable Entity - common for validation errors
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'mfa_factor_name_conflict',
            error_description: 'Unable to enroll factor',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Try to setup MFA
    await page.click('[data-test="setup-mfa-button"]');
    await page.waitForSelector('role=dialog');

    const factorName = `Test Factor - ${Date.now()}`;
    await page.fill('[name="name"]', factorName);

    // Wait for the API call to be made and intercepted
    const responsePromise = page.waitForResponse((response) => {
      const isFactorsEndpoint = response.url().includes('factors');
      const isPost = response.request().method() === 'POST';
      console.log(
        'RESPONSE:',
        response.request().method(),
        response.url(),
        'Match:',
        isFactorsEndpoint && isPost,
      );
      return isFactorsEndpoint && isPost;
    });

    await page.click('button[type="submit"]');
    const response = await responsePromise;
    console.log('RESPONSE STATUS:', response.status());
    console.log('RESPONSE BODY:', await response.text());

    // Wait a bit for the component to process the error
    await page.waitForTimeout(1000);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'mfa-error-debug.png' });

    // Wait for error alert
    await expect(page.locator('text=QR Code Error')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('text=/weren.*t able to generate/i'),
    ).toBeVisible();

    // Verify retry button is present (labeled as "Retry" in the component)
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('user cannot setup MFA without being authenticated', async ({
    page,
  }) => {
    // Try to access MFA setup without authentication
    await page.goto('/home/settings/security');

    // Should redirect to sign in
    await page.waitForURL('**/auth/sign-in**', { timeout: 10000 });
    expect(page.url()).toContain('/auth/sign-in');
  });
});

test.describe('MFA Factor Management', () => {
  test('user can view enrolled MFA factors', async ({ page }) => {
    const account = new AccountPageObject(page);
    await account.setup();
    await page.goto('/home/settings/security');

    // Check if there's a section showing enrolled factors
    // (This assumes the UI shows a list of factors)
    const factorsList = page.locator('[data-test="mfa-factors-list"]');

    // If no factors enrolled, should show empty state with the MFA heading
    if ((await factorsList.count()) === 0) {
      await expect(
        page.locator(
          'text=/Secure your account.*Multi-Factor Authentication/i',
        ),
      ).toBeVisible();
    }
  });

  test('MFA setup form validates factor name', async ({ page }) => {
    const account = new AccountPageObject(page);
    await account.setup();
    await page.goto('/home/settings/security');

    await page.click('[data-test="setup-mfa-button"]');
    await page.waitForSelector('role=dialog');

    // Try to submit without entering a name
    await page.click('button[type="submit"]');

    // Should show validation error (HTML5 validation will prevent submission)
    // The input field has 'required' attribute, so the form won't submit
    const nameInput = page.locator('[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });
});
