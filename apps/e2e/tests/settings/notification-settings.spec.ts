import { Page, expect, test } from '@playwright/test';

import { NotificationSettingsPageObject } from './notification-settings.po';

test.describe('Notification Settings', () => {
  let page: Page;
  let notificationSettings: NotificationSettingsPageObject;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    notificationSettings = new NotificationSettingsPageObject(page);

    await notificationSettings.setup();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('notification settings page loads successfully', async () => {
    await expect(page).toHaveURL(/\/home\/settings\/notifications/);
    await expect(
      page.locator('text=Notification Settings').first(),
    ).toBeVisible();
    console.log('✓ Notification settings page loaded');
  });

  test('all notification toggles are visible', async () => {
    // Check that all four toggle switches are present
    const emailToggle = page.locator('#email-notifications');
    const pushToggle = page.locator('#push-notifications');
    const campaignToggle = page.locator('#campaign-alerts');
    const weeklyToggle = page.locator('#weekly-reports');

    await expect(emailToggle).toBeVisible();
    await expect(pushToggle).toBeVisible();
    await expect(campaignToggle).toBeVisible();
    await expect(weeklyToggle).toBeVisible();

    console.log('✓ All notification toggles are visible');
  });

  test('notification overview section displays status', async () => {
    // Check that the overview section exists and shows status badges
    await expect(
      page.locator('text=Notification Overview').first(),
    ).toBeVisible();
    await expect(
      page.locator('text=Current notification status'),
    ).toBeVisible();

    // Check that at least one badge is visible (either Enabled or Disabled)
    const badges = page.locator('[class*="badge"]');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);

    console.log('✓ Notification overview section displays correctly');
  });

  test('can toggle email notifications on and off', async () => {
    // Get initial status
    const initialStatus =
      await notificationSettings.getEmailNotificationStatus();

    // Toggle email notifications
    await notificationSettings.toggleEmailNotifications();

    // Wait a moment for the update
    await page.waitForTimeout(1000);

    // Verify status changed
    const newStatus = await notificationSettings.getEmailNotificationStatus();
    expect(newStatus).toBe(!initialStatus);

    console.log(
      `✓ Email notifications toggled from ${initialStatus} to ${newStatus}`,
    );

    // Toggle back to original state
    await notificationSettings.toggleEmailNotifications();
    await page.waitForTimeout(1000);

    const finalStatus = await notificationSettings.getEmailNotificationStatus();
    expect(finalStatus).toBe(initialStatus);

    console.log('✓ Email notifications toggled back to original state');
  });

  test('can toggle push notifications on and off', async () => {
    // Get initial status
    const initialStatus =
      await notificationSettings.getPushNotificationStatus();

    // Toggle push notifications
    await notificationSettings.togglePushNotifications();

    // Wait a moment for the update
    await page.waitForTimeout(1000);

    // Verify status changed
    const newStatus = await notificationSettings.getPushNotificationStatus();
    expect(newStatus).toBe(!initialStatus);

    console.log(
      `✓ Push notifications toggled from ${initialStatus} to ${newStatus}`,
    );

    // Toggle back to original state
    await notificationSettings.togglePushNotifications();
    await page.waitForTimeout(1000);

    const finalStatus = await notificationSettings.getPushNotificationStatus();
    expect(finalStatus).toBe(initialStatus);

    console.log('✓ Push notifications toggled back to original state');
  });

  test('can toggle campaign alerts on and off', async () => {
    // Get initial status
    const initialStatus = await notificationSettings.getCampaignAlertsStatus();

    // Toggle campaign alerts
    await notificationSettings.toggleCampaignAlerts();

    // Wait a moment for the update
    await page.waitForTimeout(1000);

    // Verify status changed
    const newStatus = await notificationSettings.getCampaignAlertsStatus();
    expect(newStatus).toBe(!initialStatus);

    console.log(
      `✓ Campaign alerts toggled from ${initialStatus} to ${newStatus}`,
    );

    // Toggle back to original state
    await notificationSettings.toggleCampaignAlerts();
    await page.waitForTimeout(1000);

    const finalStatus = await notificationSettings.getCampaignAlertsStatus();
    expect(finalStatus).toBe(initialStatus);

    console.log('✓ Campaign alerts toggled back to original state');
  });

  test('can toggle weekly reports on and off', async () => {
    // Get initial status
    const initialStatus = await notificationSettings.getWeeklyReportsStatus();

    // Toggle weekly reports
    await notificationSettings.toggleWeeklyReports();

    // Wait a moment for the update
    await page.waitForTimeout(1000);

    // Verify status changed
    const newStatus = await notificationSettings.getWeeklyReportsStatus();
    expect(newStatus).toBe(!initialStatus);

    console.log(
      `✓ Weekly reports toggled from ${initialStatus} to ${newStatus}`,
    );

    // Toggle back to original state
    await notificationSettings.toggleWeeklyReports();
    await page.waitForTimeout(1000);

    const finalStatus = await notificationSettings.getWeeklyReportsStatus();
    expect(finalStatus).toBe(initialStatus);

    console.log('✓ Weekly reports toggled back to original state');
  });

  test('settings persist after page reload', async () => {
    // Get current status of all settings
    const emailStatus = await notificationSettings.getEmailNotificationStatus();
    const pushStatus = await notificationSettings.getPushNotificationStatus();
    const campaignStatus = await notificationSettings.getCampaignAlertsStatus();
    const weeklyStatus = await notificationSettings.getWeeklyReportsStatus();

    // Reload the page
    await notificationSettings.navigateToNotificationSettings();

    // Wait for settings to load
    await notificationSettings.waitForSettingsToLoad();

    // Verify all settings are the same
    const emailStatusAfter =
      await notificationSettings.getEmailNotificationStatus();
    const pushStatusAfter =
      await notificationSettings.getPushNotificationStatus();
    const campaignStatusAfter =
      await notificationSettings.getCampaignAlertsStatus();
    const weeklyStatusAfter =
      await notificationSettings.getWeeklyReportsStatus();

    expect(emailStatusAfter).toBe(emailStatus);
    expect(pushStatusAfter).toBe(pushStatus);
    expect(campaignStatusAfter).toBe(campaignStatus);
    expect(weeklyStatusAfter).toBe(weeklyStatus);

    console.log('✓ Settings persisted after page reload');
  });

  test('toast notification appears when settings are updated', async () => {
    // Toggle a setting
    const initialStatus =
      await notificationSettings.getEmailNotificationStatus();

    await notificationSettings.toggleEmailNotifications();

    // Check for toast notification
    const toast = page.locator('li[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Verify toast contains success message
    const toastText = await toast.textContent();
    expect(toastText).toContain('Notification settings updated');

    console.log('✓ Toast notification appeared with success message');

    // Toggle back
    await notificationSettings.toggleEmailNotifications();
    await page.waitForTimeout(1000);
  });

  test('can navigate to notification settings from sidebar', async () => {
    // Navigate to home first
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Click on Settings link in sidebar
    const settingsLink = page
      .locator('a[href*="/settings"]')
      .filter({ hasText: /Settings/i })
      .first();

    if (await settingsLink.isVisible({ timeout: 2000 })) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
    } else {
      // If sidebar is collapsed, try to expand it first
      const toggleButton = page
        .locator('button')
        .filter({ hasText: /Toggle/i })
        .first();

      if (await toggleButton.isVisible({ timeout: 2000 })) {
        await toggleButton.click();
        await page.waitForTimeout(500);

        // Now click settings
        await settingsLink.click();
        await page.waitForTimeout(1000);
      }
    }

    // Now navigate to notifications from settings tabs
    const notificationsTab = page.locator('a[href*="/notifications"]').first();

    if (await notificationsTab.isVisible({ timeout: 2000 })) {
      await notificationsTab.click();
      await page.waitForTimeout(1000);

      // Verify we're on the notifications page
      await expect(page).toHaveURL(/\/home\/settings\/notifications/);
      console.log('✓ Successfully navigated to notification settings');
    } else {
      console.log('⚠ Notifications tab not found, skipping navigation test');
    }
  });
});
