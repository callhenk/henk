import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model for Analytics Page
 * Provides reusable selectors and actions for analytics page testing
 */
export class AnalyticsPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Metric cards
  readonly totalCallsCard: Locator;
  readonly successfulCallsCard: Locator;
  readonly conversionRateCard: Locator;
  readonly revenueCard: Locator;
  readonly avgDurationCard: Locator;
  readonly topAgentCard: Locator;

  // Filters
  readonly filtersSection: Locator;
  readonly campaignFilter: Locator;
  readonly agentFilter: Locator;
  readonly outcomeFilter: Locator;
  readonly dateRangeFilter: Locator;
  readonly dateRangeDisplay: Locator;
  readonly customDatePickerButton: Locator;

  // Charts
  readonly performanceChart: Locator;
  readonly performanceChartCallsButton: Locator;
  readonly performanceChartConversionsButton: Locator;
  readonly performanceChartRevenueButton: Locator;
  readonly agentComparisonChart: Locator;
  readonly agentComparisonSortDropdown: Locator;
  readonly timeOfDayChart: Locator;
  readonly outcomeDistributionChart: Locator;

  // Export controls
  readonly exportSection: Locator;
  readonly exportFormatSelect: Locator;
  readonly exportTypeSelect: Locator;
  readonly exportSummaryButton: Locator;
  readonly exportFullReportButton: Locator;
  readonly exportChartsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.locator('text=Analytics');
    this.pageDescription = page.locator(
      'text=Track campaign performance, agent efficiency, and donor engagement',
    );

    // Metric cards
    this.totalCallsCard = page.locator('text=Total Calls');
    this.successfulCallsCard = page.locator('text=Successful Calls');
    this.conversionRateCard = page.locator('text=Conversion Rate');
    this.revenueCard = page.locator('text=Revenue Generated');
    this.avgDurationCard = page.locator('text=Avg Call Duration');
    this.topAgentCard = page.locator('text=Top Agent');

    // Filters
    this.filtersSection = page.locator('text=Filters');
    this.campaignFilter = page.locator('label:has-text("Campaign")');
    this.agentFilter = page.locator('label:has-text("Agent")');
    this.outcomeFilter = page.locator('label:has-text("Outcome")');
    this.dateRangeFilter = page.locator('label:has-text("Date Range")');
    this.dateRangeDisplay = page.locator('[class*="text-muted-foreground"]', {
      hasText: /-/,
    });
    this.customDatePickerButton = page.locator(
      'button:has-text("Pick a date range")',
    );

    // Charts
    this.performanceChart = page.locator('text=Campaign Performance');
    this.performanceChartCallsButton = page
      .locator('button:has-text("Calls")')
      .first();
    this.performanceChartConversionsButton = page.locator(
      'button:has-text("Conversions")',
    );
    this.performanceChartRevenueButton = page.locator(
      'button:has-text("Revenue")',
    );
    this.agentComparisonChart = page.locator('text=Agent Performance');
    this.agentComparisonSortDropdown = page
      .locator('text=Agent Performance')
      .locator('..')
      .locator('button[role="combobox"]');
    this.timeOfDayChart = page.locator('text=Conversion by Time of Day');
    this.outcomeDistributionChart = page.locator(
      'text=Call Outcomes Distribution',
    );

    // Export
    this.exportSection = page.locator('text=Export Analytics');
    this.exportFormatSelect = page.locator('label:has-text("Export Format")');
    this.exportTypeSelect = page.locator('label:has-text("Report Type")');
    this.exportSummaryButton = page.locator(
      'button:has-text("Export Summary CSV")',
    );
    this.exportFullReportButton = page.locator(
      'button:has-text("Export Full Report")',
    );
    this.exportChartsButton = page.locator('button:has-text("Export Charts")');
  }

  /**
   * Navigate to analytics page
   */
  async goto() {
    await this.page.goto('/home/analytics');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to fully load with data
   */
  async waitForDataLoad(timeout = 5000) {
    await this.totalCallsCard.waitFor({ timeout });
  }

  /**
   * Select a date range preset
   */
  async selectDateRangePreset(preset: '7d' | '30d' | '90d' | 'thisMonth') {
    const dateRangeSelect = this.dateRangeFilter
      .locator('..')
      .locator('button');
    await dateRangeSelect.click();

    const presetMap = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      thisMonth: 'This Month',
    };

    await this.page.locator(`text=${presetMap[preset]}`).click();
  }

  /**
   * Open custom date picker
   */
  async openCustomDatePicker() {
    const dateRangeSelect = this.dateRangeFilter
      .locator('..')
      .locator('button');
    await dateRangeSelect.click();
    await this.page.locator('text=Custom Range').click();
  }

  /**
   * Select a campaign filter
   */
  async selectCampaign(campaignName: string) {
    const campaignSelect = this.campaignFilter.locator('..').locator('button');
    await campaignSelect.click();
    await this.page.locator(`text=${campaignName}`).click();
  }

  /**
   * Select an agent filter
   */
  async selectAgent(agentName: string) {
    const agentSelect = this.agentFilter.locator('..').locator('button');
    await agentSelect.click();
    await this.page.locator(`text=${agentName}`).click();
  }

  /**
   * Toggle performance chart metric
   */
  async togglePerformanceMetric(
    metric: 'calls' | 'conversions' | 'revenue',
  ): Promise<void> {
    const buttonMap = {
      calls: this.performanceChartCallsButton,
      conversions: this.performanceChartConversionsButton,
      revenue: this.performanceChartRevenueButton,
    };

    await buttonMap[metric].click();
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Get metric card value
   */
  async getMetricValue(metric: string): Promise<string> {
    const card = this.page.locator(`text=${metric}`).locator('..');
    const value = await card.textContent();
    return value || '';
  }

  /**
   * Check if loading skeletons are visible
   */
  async hasLoadingSkeletons(): Promise<boolean> {
    const skeletons = this.page.locator('[class*="animate-pulse"]');
    const count = await skeletons.count();
    return count > 0;
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorMessage = this.page.locator('text=Error Loading');
    return await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Check if no data message is displayed
   */
  async hasNoDataMessage(): Promise<boolean> {
    const noDataMessage = this.page.locator(
      'text=No data available for the selected filters',
    );
    return await noDataMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Get count of Recharts elements (for charts verification)
   */
  async getRechartsElementCount(): Promise<number> {
    const recharts = this.page.locator('[class*="recharts"]');
    return await recharts.count();
  }
}
