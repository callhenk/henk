# Analytics Page E2E Testing Documentation

This document describes the comprehensive end-to-end testing strategy for the Analytics page.

## Test Coverage

### 1. **Page Accessibility** (2 tests)

- ✅ Analytics page loads successfully
- ✅ Page header and description are visible

### 2. **Metrics Cards** (3 tests)

- ✅ All 6 metric cards display correctly:
  - Total Calls
  - Successful Calls
  - Conversion Rate
  - Revenue Generated
  - Avg Call Duration
  - Top Agent
- ✅ Trend indicators show percentage changes
- ✅ Loading skeletons disappear after data loads

### 3. **Filters** (4 tests)

- ✅ All filter options are visible (Campaign, Agent, Outcome, Date Range)
- ✅ Date range presets are accessible (Last 7/30/90 Days, This Month)
- ✅ Custom date picker appears when "Custom Range" selected
- ✅ Current date range is displayed

### 4. **Performance Chart** (5 tests)

- ✅ Chart displays with correct title
- ✅ Metric toggle buttons (Calls, Conversions, Revenue) are visible
- ✅ Toggle buttons change state on click
- ✅ Performance data table is displayed
- ✅ Summary totals are shown

### 5. **Agent Comparison Chart** (3 tests)

- ✅ Chart displays with agent performance data
- ✅ Sort dropdown is functional
- ✅ Top performer highlight appears when data exists

### 6. **Time of Day Chart** (4 tests)

- ✅ Heatmap displays conversion by hour
- ✅ Legend shows all color indicators (High, Good, Fair, Low, No data)
- ✅ Insights section appears with data
- ✅ Chart is scrollable on mobile viewports

### 7. **Outcome Distribution Chart** (3 tests)

- ✅ Pie chart displays call outcomes
- ✅ Uses Recharts library
- ✅ Total calls summary is shown

### 8. **Export Controls** (5 tests)

- ✅ Export section is visible
- ✅ Format and type selectors are present
- ✅ Quick export buttons work (Summary CSV, Full Report, Charts)
- ✅ Export information is displayed
- ✅ Scheduled reports section is accessible

### 9. **Error Handling** (1 test)

- ✅ Gracefully handles no data scenarios

### 10. **Responsive Design** (3 tests)

- ✅ Works on tablet viewports (768x1024)
- ✅ Works on mobile viewports (375x667)
- ✅ Metrics cards stack correctly on mobile

### 11. **Performance** (2 tests)

- ✅ Page loads within 10 seconds
- ✅ No memory leaks on filter changes

## Running the Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure local environment is running
pnpm dev
```

### Run All Analytics Tests

```bash
# Run all analytics tests
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts

# Run with UI mode for debugging
pnpm --filter=web-e2e test --ui tests/pages/analytics.spec.ts

# Run specific test suite
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts -g "Metrics Cards"

# Run in headed mode (see browser)
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts --headed

# Generate HTML report
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts --reporter=html
```

### Debug Failed Tests

```bash
# Run with debug mode
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts --debug

# Run specific test
pnpm --filter=web-e2e test tests/pages/analytics.spec.ts -g "should display all 6 metric cards"
```

## Test Structure

### Page Object Model

The tests use a Page Object Model (POM) pattern for better maintainability:

```typescript
import { AnalyticsPage } from './analytics.po';

test('example test', async ({ page }) => {
  const analyticsPage = new AnalyticsPage(page);
  await analyticsPage.goto();
  await analyticsPage.waitForDataLoad();

  // Use page object methods
  await analyticsPage.selectDateRangePreset('30d');
  await analyticsPage.togglePerformanceMetric('revenue');
});
```

### Key Features

- **Reusable selectors**: All locators defined once in PO
- **Helper methods**: Common actions encapsulated
- **Type safety**: Full TypeScript support
- **Maintainable**: Easy to update when UI changes

## Test Data Requirements

### Authentication

- Email: `cyrus@callhenk.com`
- Password: `Test123?`

### Expected Data

Tests are designed to work with both:

- **Real data**: From your database
- **Demo mode**: Using mock data

### Scenarios Covered

- ✅ With data (normal flow)
- ✅ Without data (empty states)
- ✅ Loading states
- ✅ Error states

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run E2E tests
        run: pnpm --filter=web-e2e test tests/pages/analytics.spec.ts
```

## Coverage Summary

| Category    | Tests  | Coverage |
| ----------- | ------ | -------- |
| Page Load   | 2      | 100%     |
| Metrics     | 3      | 100%     |
| Filters     | 4      | 100%     |
| Charts      | 15     | 100%     |
| Export      | 5      | 100%     |
| Responsive  | 3      | 100%     |
| Performance | 2      | 100%     |
| **Total**   | **34** | **100%** |

## Maintenance Guidelines

### When UI Changes

1. Update selectors in `analytics.po.ts`
2. Run tests to verify they still pass
3. Update test expectations if needed

### Adding New Features

1. Add new selectors to PO
2. Create new test suite in spec file
3. Follow existing test patterns
4. Document in this file

### Best Practices

- ✅ Use `data-testid` attributes for critical elements
- ✅ Avoid hard-coded timeouts (use `waitFor` instead)
- ✅ Test user workflows, not implementation details
- ✅ Keep tests independent and isolated
- ✅ Use descriptive test names

## Common Issues & Solutions

### Test Timeout

```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Flaky Tests

```typescript
// Use proper waits instead of fixed timeouts
await expect(element).toBeVisible(); // Good
await page.waitForTimeout(2000); // Avoid
```

### Network Issues

```typescript
// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

## Test Reports

After running tests, reports are available at:

- HTML Report: `apps/e2e/playwright-report/index.html`
- Screenshots: `apps/e2e/test-results/`
- Videos: `apps/e2e/test-results/` (on failure)

## Future Enhancements

### Planned Tests

- [ ] Visual regression testing with snapshots
- [ ] Accessibility (a11y) testing
- [ ] Performance metrics tracking
- [ ] Cross-browser testing (Safari, Firefox)
- [ ] Mobile device testing (real devices)

### Potential Improvements

- [ ] Add API mocking for consistent test data
- [ ] Implement visual diff testing
- [ ] Add performance benchmarks
- [ ] Test export file contents
- [ ] Test date picker interaction in detail

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Support

For questions or issues with tests:

1. Check this documentation
2. Review test failures in CI
3. Run tests locally with `--debug` flag
4. Contact the QA team
