import { Page, expect } from '@playwright/test';

export class TeamPageObject {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goToTeamSettings() {
    await this.page.goto('/home/settings/team');
    await this.page.waitForLoadState('networkidle');
  }

  async selectFirstBusiness() {
    // Wait for "Select Business" section to be visible
    await expect(this.page.getByText('Select Business')).toBeVisible();

    // Wait for network to settle
    await this.page.waitForLoadState('networkidle');

    // Look for business cards by finding Cards with cursor-pointer within the business selection section
    // Business cards have: h3 headings (business name) and are clickable
    const businessCards = this.page.locator(
      'div[class*="cursor-pointer"][class*="border-2"]',
    );

    // Check if any business cards exist
    const count = await businessCards.count();

    if (count === 0) {
      throw new Error(
        'No businesses found. User needs to create a business first.',
      );
    }

    // Click the first business card
    await businessCards.first().click();

    // Verify team members section appears (use exact match to avoid strict mode violation)
    await expect(
      this.page.getByRole('heading', { name: 'Team Members', exact: true }),
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async hasBusinesses(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');
    // Look for business cards with the actual classes used in BusinessCard component
    const businessCards = this.page.locator(
      'div[class*="cursor-pointer"][class*="border-2"]',
    );
    const count = await businessCards.count();
    return count > 0;
  }

  async selectBusinessByName(name: string) {
    await this.page.waitForLoadState('networkidle');
    const businessCard = this.page.locator(
      `div[class*="cursor-pointer"][class*="border-2"]:has-text("${name}")`,
    );
    await businessCard.click();

    // Verify team members section appears
    await expect(
      this.page.getByRole('heading', { name: 'Team Members', exact: true }),
    ).toBeVisible();
  }

  async openInviteDialog() {
    await this.page.getByRole('button', { name: 'Invite Member' }).click();
    await expect(this.page.getByText('Invite Team Member')).toBeVisible();
  }

  async inviteMember(params: {
    email: string;
    role?: 'owner' | 'admin' | 'member' | 'viewer';
  }) {
    await this.openInviteDialog();

    // Fill in email
    await this.page.fill('#invite-email', params.email);

    // Select role if specified
    if (params.role && params.role !== 'member') {
      await this.page.click('#invite-role');
      await this.page
        .getByRole('option', { name: params.role, exact: true })
        .click();
    }

    // Submit invitation
    await this.page
      .getByRole('button', { name: /Invite Member/i })
      .last()
      .click();

    // Wait for dialog to close
    await expect(this.page.getByText('Invite Team Member')).not.toBeVisible({
      timeout: 10000,
    });

    // Wait for dialog backdrop to be fully removed
    await this.page.waitForTimeout(500);
  }

  async switchToTab(tabName: 'All Members' | 'Active' | 'Invited') {
    // Wait for tabs to be visible first
    await this.page.waitForSelector('[role="tablist"]', { timeout: 5000 });

    // Find and click the tab - match by partial text since tabs include counts like "Active (2)"
    const tab = this.page.locator('[role="tab"]', {
      hasText: tabName,
    });

    await tab.waitFor({ state: 'visible', timeout: 5000 });
    await tab.click({ timeout: 5000 });

    // Give the tab content a moment to start rendering
    await this.page.waitForTimeout(500);
  }

  async getMemberCount(status?: 'all' | 'active' | 'invited') {
    let tabLocator;

    if (status === 'active') {
      tabLocator = this.page.locator('[role="tab"]', { hasText: 'Active' });
    } else if (status === 'invited') {
      tabLocator = this.page.locator('[role="tab"]', { hasText: 'Invited' });
    } else {
      tabLocator = this.page.locator('[role="tab"]', {
        hasText: 'All Members',
      });
    }

    const tabText = await tabLocator.textContent();
    const match = tabText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async updateMemberRole(
    memberIdentifier: string,
    newRole: 'owner' | 'admin' | 'member' | 'viewer',
  ) {
    // This only works on the "All Members" tab which has a table view
    // Find the row containing the member (by user_id or email)
    const row = this.page.locator(`tr:has-text("${memberIdentifier}")`);

    // Click the role select dropdown
    await row.locator('button[role="combobox"]').click();

    // Select new role from dropdown
    await this.page.getByRole('option', { name: newRole, exact: true }).click();

    // Wait for update to complete
    await this.page.waitForTimeout(1000);
  }

  async removeMember(memberIdentifier: string) {
    // This only works on the "All Members" tab which has a table view with Remove buttons
    // Find the row containing the member (by user_id or email)
    const row = this.page.locator(`tr:has-text("${memberIdentifier}")`);

    // Click Remove button
    await row.getByRole('button', { name: 'Remove' }).click();

    // Confirm in alert dialog
    await expect(this.page.getByText('Remove Team Member')).toBeVisible();
    await this.page
      .getByRole('button', { name: 'Remove' })
      .filter({ hasNotText: 'Cancel' })
      .last()
      .click();

    // Wait for removal to complete
    await this.page.waitForTimeout(1000);
  }

  async verifyMemberExists(identifier: string) {
    // Member could be shown by user_id or email depending on the implementation
    await expect(this.page.getByText(identifier)).toBeVisible();
  }

  async verifyMemberNotExists(identifier: string) {
    await expect(this.page.getByText(identifier)).not.toBeVisible();
  }

  async verifyRolePermissionsGuide() {
    // Use heading role to target the specific Role Permissions section, not table headers
    await expect(
      this.page.getByRole('heading', { name: 'Role Permissions' }),
    ).toBeVisible();
  }

  async verifyActiveTabGridView() {
    // Verify Active tab shows grid layout with cards
    await this.switchToTab('Active');

    // Wait for the Active tab content to appear
    await expect(this.page.getByText('Active Members')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      this.page.getByText('Team members with active status'),
    ).toBeVisible();
  }

  async verifyInvitedTabGridView() {
    // Verify Invited tab shows grid layout with cards
    await this.switchToTab('Invited');

    // Wait for the Invited tab content to appear
    await expect(this.page.getByText('Invited Members')).toBeVisible({
      timeout: 10000,
    });
    await expect(this.page.getByText('Pending invitations')).toBeVisible();
  }

  async verifyAllMembersTabTableView() {
    // Verify All Members tab shows table layout
    await this.switchToTab('All Members');

    // Wait for the All Members tab content to appear
    await expect(this.page.getByText('All Team Members')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      this.page.getByText('Complete list of team members and their roles'),
    ).toBeVisible();

    // Check for table structure by looking for table element and headers as text
    const table = this.page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers exist (using text content)
    const headerRow = table.locator('thead tr');
    await expect(headerRow.getByText('Member')).toBeVisible();
    await expect(headerRow.getByText('Role')).toBeVisible();
    await expect(headerRow.getByText('Status')).toBeVisible();
    await expect(headerRow.getByText('Joined')).toBeVisible();
    await expect(headerRow.getByText('Actions')).toBeVisible();
  }
}
