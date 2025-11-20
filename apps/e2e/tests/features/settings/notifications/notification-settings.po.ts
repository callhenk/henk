import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../../auth/auth.po';

export class NotificationSettingsPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
  }

  async setup(path: string = '/home/settings/notifications') {
    await this.auth.signUpFlow(path);

    // Wait for the notification settings page to fully load
    await this.page.waitForSelector('text=Notification Settings', {
      state: 'visible',
      timeout: 30000,
    });

    // Wait for settings to be loaded (check for at least one switch)
    await this.page.waitForSelector('button[role="switch"]', {
      state: 'visible',
      timeout: 10000,
    });
  }

  async toggleEmailNotifications() {
    const switchElement = this.page.locator('#email-notifications');
    await switchElement.click();

    // Wait for the toast notification
    await this.page.waitForSelector('li[data-sonner-toast]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async togglePushNotifications() {
    const switchElement = this.page.locator('#push-notifications');
    await switchElement.click();

    // Wait for the toast notification
    await this.page.waitForSelector('li[data-sonner-toast]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async toggleCampaignAlerts() {
    const switchElement = this.page.locator('#campaign-alerts');
    await switchElement.click();

    // Wait for the toast notification
    await this.page.waitForSelector('li[data-sonner-toast]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async toggleWeeklyReports() {
    const switchElement = this.page.locator('#weekly-reports');
    await switchElement.click();

    // Wait for the toast notification
    await this.page.waitForSelector('li[data-sonner-toast]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async getEmailNotificationStatus(): Promise<boolean> {
    const switchElement = this.page.locator('#email-notifications');
    const ariaChecked = await switchElement.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  async getPushNotificationStatus(): Promise<boolean> {
    const switchElement = this.page.locator('#push-notifications');
    const ariaChecked = await switchElement.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  async getCampaignAlertsStatus(): Promise<boolean> {
    const switchElement = this.page.locator('#campaign-alerts');
    const ariaChecked = await switchElement.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  async getWeeklyReportsStatus(): Promise<boolean> {
    const switchElement = this.page.locator('#weekly-reports');
    const ariaChecked = await switchElement.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  async waitForSettingsToLoad() {
    // Wait for loading state to disappear
    await this.page
      .waitForSelector('text=Loading settings', {
        state: 'hidden',
        timeout: 10000,
      })
      .catch(() => {
        // If the loading text doesn't exist, that's fine
      });

    // Wait for at least one switch to be visible
    await this.page.waitForSelector('button[role="switch"]', {
      state: 'visible',
      timeout: 10000,
    });
  }

  async navigateToNotificationSettings() {
    // Navigate to settings
    await this.page.goto('/home/settings/notifications');
    await this.waitForSettingsToLoad();
  }

  async verifyBadgeStatus(
    notificationType: 'email' | 'push' | 'campaign' | 'weekly',
    expectedStatus: 'Enabled' | 'Disabled',
  ) {
    let selector: string;

    switch (notificationType) {
      case 'email':
        selector = 'text=Email Notifications >> .. >> text=' + expectedStatus;
        break;
      case 'push':
        selector = 'text=Push Notifications >> .. >> text=' + expectedStatus;
        break;
      case 'campaign':
        selector = 'text=Campaign Alerts >> .. >> text=' + expectedStatus;
        break;
      case 'weekly':
        selector = 'text=Weekly Reports >> .. >> text=' + expectedStatus;
        break;
    }

    await expect(this.page.locator(selector).first()).toBeVisible({
      timeout: 5000,
    });
  }
}
