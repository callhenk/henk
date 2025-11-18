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

    // More specific selector: look for Card components that are clickable (cursor-pointer)
    // and are within the business selection grid
    const businessCards = this.page.locator(
      '[class*="glass-panel"][class*="cursor-pointer"]',
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

    // Verify team members section appears
    await expect(this.page.getByText(/Team Members -/)).toBeVisible({
      timeout: 10000,
    });
  }

  async hasBusinesses(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');
    const businessCards = this.page.locator(
      '[class*="glass-panel"][class*="cursor-pointer"]',
    );
    const count = await businessCards.count();
    return count > 0;
  }

  async selectBusinessByName(name: string) {
    await this.page.waitForLoadState('networkidle');
    const businessCard = this.page.locator(
      `[class*="glass-panel"]:has-text("${name}")`,
    );
    await businessCard.click();

    await expect(this.page.getByText(/Team Members -/)).toBeVisible();
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
      timeout: 5000,
    });
  }

  async switchToTab(tabName: 'All Members' | 'Active' | 'Invited') {
    await this.page
      .getByRole('tab', { name: new RegExp(tabName, 'i') })
      .click();
  }

  async getMemberCount(status?: 'all' | 'active' | 'invited') {
    if (status === 'active') {
      const activeTab = await this.page
        .getByRole('tab', { name: /Active/ })
        .textContent();
      const match = activeTab?.match(/\((\d+)\)/);
      return match ? parseInt(match[1]) : 0;
    } else if (status === 'invited') {
      const invitedTab = await this.page
        .getByRole('tab', { name: /Invited/ })
        .textContent();
      const match = invitedTab?.match(/\((\d+)\)/);
      return match ? parseInt(match[1]) : 0;
    } else {
      const allTab = await this.page
        .getByRole('tab', { name: /All Members/ })
        .textContent();
      const match = allTab?.match(/\((\d+)\)/);
      return match ? parseInt(match[1]) : 0;
    }
  }

  async updateMemberRole(
    memberEmail: string,
    newRole: 'owner' | 'admin' | 'member' | 'viewer',
  ) {
    // Find the row containing the member
    const row = this.page.locator(`tr:has-text("${memberEmail}")`);

    // Click the role select
    await row.locator('button[role="combobox"]').click();

    // Select new role
    await this.page.getByRole('option', { name: newRole, exact: true }).click();
  }

  async removeMember(memberEmail: string) {
    // Find the row containing the member
    const row = this.page.locator(`tr:has-text("${memberEmail}")`);

    // Click Remove button
    await row.getByRole('button', { name: 'Remove' }).click();

    // Confirm in dialog
    await expect(this.page.getByText('Remove Team Member')).toBeVisible();
    await this.page.getByRole('button', { name: 'Remove' }).last().click();

    // Wait for removal to complete
    await this.page.waitForTimeout(1000);
  }

  async verifyMemberExists(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
  }

  async verifyMemberNotExists(email: string) {
    await expect(this.page.getByText(email)).not.toBeVisible();
  }

  async verifyRolePermissionsGuide() {
    // Use heading role to target the specific Role Permissions section, not table headers
    await expect(
      this.page.getByRole('heading', { name: 'Role Permissions' }),
    ).toBeVisible();
  }
}
