import { Page, expect } from '@playwright/test';

export class MFAPageObject {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to security settings page
   */
  async goToSecuritySettings() {
    await this.page.goto('/home/settings/security');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click the "Setup a new Factor" button to open MFA setup dialog
   */
  async openMFASetupDialog() {
    await this.page.click('[data-test="setup-mfa-button"]');
    await this.page.waitForSelector('text=Setup a new Factor', {
      timeout: 10000,
    });
  }

  /**
   * Enter a factor name in the MFA setup form
   */
  async enterFactorName(name: string) {
    await this.page.fill('[name="name"]', name);
  }

  /**
   * Submit the factor name form to generate QR code
   */
  async submitFactorName() {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Wait for QR code to be generated and displayed
   */
  async waitForQRCode(timeout = 10000) {
    await this.page.waitForSelector('img[alt="QR Code"]', { timeout });
  }

  /**
   * Get the QR code element
   */
  getQRCode() {
    return this.page.locator('img[alt="QR Code"]');
  }

  /**
   * Enter TOTP verification code
   */
  async enterVerificationCode(code: string) {
    const otpInput = this.page.locator('[data-input-otp]').first();
    await otpInput.click();
    await this.page.keyboard.type(code);
  }

  /**
   * Submit the verification code to complete MFA enrollment
   */
  async submitVerificationCode() {
    await this.page.click('button[type="submit"]:has-text("Enable Factor")');
  }

  /**
   * Cancel MFA setup
   */
  async cancelSetup() {
    await this.page.click('button:has-text("Cancel")');
  }

  /**
   * Verify MFA setup dialog is closed
   */
  async verifyDialogClosed() {
    await expect(
      this.page.locator('text=Setup a new Factor'),
    ).not.toBeVisible();
  }

  /**
   * Verify QR code error is displayed
   */
  async verifyQRCodeError() {
    await expect(this.page.locator('text=QR Code Error')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      this.page.locator('text=/weren.*t able to generate/i'),
    ).toBeVisible();
  }

  /**
   * Verify retry button is present
   */
  async verifyRetryButton() {
    await expect(this.page.locator('button:has-text("Retry")')).toBeVisible();
  }

  /**
   * Verify verification code input is visible
   */
  async verifyVerificationCodeInput() {
    await expect(
      this.page.locator('text=/Enter.*verification code/i'),
    ).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(errorPattern: RegExp) {
    await expect(this.page.locator(`text=${errorPattern}`)).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Get the list of enrolled MFA factors
   */
  getEnrolledFactors() {
    return this.page.locator('[data-test="mfa-factors-list"]');
  }

  /**
   * Verify empty state is shown when no factors are enrolled
   */
  async verifyEmptyState() {
    await expect(
      this.page.locator('text=/No factors.*enrolled|Setup.*first factor/i'),
    ).toBeVisible();
  }

  /**
   * Verify MFA factor with given name is in the list
   */
  async verifyFactorInList(factorName: string) {
    await expect(this.page.locator(`text=${factorName}`)).toBeVisible();
  }

  /**
   * Mock MFA enrollment API to fail
   */
  async mockEnrollmentFailure() {
    await this.page.route('**/auth/v1/factors', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: 'invalid_request',
          error_description: 'Unable to enroll factor',
        }),
      });
    });
  }

  /**
   * Complete full MFA setup flow (name + QR + verify)
   * Note: This doesn't include actual TOTP code generation
   */
  async setupMFAFlow(factorName: string) {
    await this.openMFASetupDialog();
    await this.enterFactorName(factorName);
    await this.submitFactorName();
    await this.waitForQRCode();
  }
}
