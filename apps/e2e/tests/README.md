# E2E Test Organization

This directory contains end-to-end tests for the Henk platform, organized by test type and feature area.

## Directory Structure

```
tests/
├── smoke/              # Critical path smoke tests
├── features/           # Feature-specific tests organized by domain
│   ├── auth/          # Authentication & authorization
│   ├── settings/      # All user/account settings
│   │   ├── account/   # Account settings, profile updates, MFA
│   │   ├── notifications/ # Notification preferences
│   │   ├── team/      # Team management, invitations
│   │   └── profile/   # User profile settings
│   ├── agents/        # AI agent management
│   ├── campaigns/     # Campaign creation and management
│   ├── conversations/ # Conversation history and details
│   ├── leads/         # Lead/donor management
│   ├── integrations/  # Third-party integrations
│   ├── workflows/     # Workflow builder and execution
│   └── analytics/     # Analytics and reporting
└── api/               # API-level integration tests
```

## Running Tests

### Run All Tests

```bash
pnpm test                    # Run all e2e tests
pnpm test:ui                 # Run with Playwright UI
```

### Run by Category

```bash
pnpm test:smoke              # Critical path smoke tests
pnpm test:features           # All feature tests
pnpm test:api                # API-level tests
```

### Run by Feature Area

```bash
pnpm test:auth               # Authentication tests
pnpm test:settings           # All settings tests
pnpm test:agents             # Agent management tests
pnpm test:campaigns          # Campaign tests
pnpm test:conversations      # Conversation tests
pnpm test:leads              # Lead management tests
pnpm test:integrations       # Integration tests
pnpm test:workflows          # Workflow tests
pnpm test:analytics          # Analytics tests
```

### Run Specific Settings Tests

```bash
pnpm test:settings:account         # Account settings only
pnpm test:settings:notifications   # Notification settings only
pnpm test:settings:team            # Team settings only
```

## Test Organization Principles

### 1. Smoke Tests (`smoke/`)

- **Purpose**: Quick validation of critical user paths
- **When to run**: Before every deployment, after major changes
- **Characteristics**: Fast, covers essential functionality
- **Examples**: Login, basic navigation, core feature availability

### 2. Feature Tests (`features/`)

- **Purpose**: Comprehensive testing of specific features
- **Organization**: Grouped by domain/feature area
- **Characteristics**: Detailed, covers edge cases and user flows
- **Examples**: Full authentication flow, campaign creation, settings updates

### 3. API Tests (`api/`)

- **Purpose**: Direct API endpoint testing
- **Characteristics**: Backend validation, webhook handling
- **Examples**: Conversation webhooks, API integrations

## Page Object Pattern

Tests use the Page Object Model for maintainability:

```typescript
// Example: notification-settings.po.ts
export class NotificationSettingsPageObject {
  constructor(page: Page) { ... }

  async toggleEmailNotifications() { ... }
  async getEmailNotificationStatus(): Promise<boolean> { ... }
}

// Usage in test:
const notificationSettings = new NotificationSettingsPageObject(page);
await notificationSettings.toggleEmailNotifications();
const status = await notificationSettings.getEmailNotificationStatus();
```

## Writing New Tests

### 1. Choose the Right Location

- **Smoke test**: If it's a critical path that must always work
- **Feature test**: If it tests specific functionality in detail
- **API test**: If it tests backend/API directly

### 2. Follow Naming Conventions

- **Spec files**: `feature-name.spec.ts` (kebab-case)
- **Page objects**: `feature-name.po.ts` (kebab-case)
- **Test descriptions**: Clear, action-oriented ("can toggle email notifications")

### 3. Use Page Objects

- Create reusable page objects for complex interactions
- Keep test specs clean and readable
- Share page objects across related tests

### 4. Add Test Scripts

When adding a new feature area, add corresponding test scripts to `package.json`:

```json
{
  "scripts": {
    "test:my-feature": "playwright test tests/features/my-feature/ --reporter=list"
  }
}
```

## Test Guidelines

### ✅ Do

- Use data-test attributes for reliable selectors
- Wait for elements and state changes
- Clean up test data
- Keep tests independent
- Use meaningful test descriptions

### ❌ Don't

- Use brittle selectors (CSS classes, complex XPath)
- Share state between tests
- Hard-code delays (use waitFor methods)
- Test implementation details
- Create flaky tests

## Debugging Tests

```bash
# Run in headed mode (see browser)
pnpm test:ui

# Run specific test file
pnpm exec playwright test tests/features/settings/notifications/notification-settings.spec.ts

# Debug mode (step through test)
pnpm exec playwright test --debug

# Generate test report
pnpm exec playwright test
pnpm report
```

## CI/CD Integration

Tests run automatically in CI:

- **Smoke tests**: On every PR
- **Feature tests**: On PR to main
- **Full suite**: Before production deployment

## Maintenance

### When to Update Tests

- Feature changes or additions
- UI changes affecting selectors
- New user flows or scenarios
- Bug fixes requiring test coverage

### Regular Maintenance Tasks

- Review and remove obsolete tests
- Update page objects for UI changes
- Keep dependencies up to date
- Monitor test execution times
- Fix flaky tests immediately

## Best Practices

1. **Test Real User Flows**: Focus on how users actually use the app
2. **Keep Tests Fast**: Mock external services, use test data
3. **Make Tests Readable**: Clear descriptions, organized code
4. **Handle Failures Gracefully**: Meaningful error messages, screenshots
5. **Maintain Independence**: Each test should run in isolation

## Getting Help

- Check existing tests for patterns and examples
- Review Playwright documentation: https://playwright.dev
- Ask in team chat for test strategy questions
- Update this README when adding new patterns or conventions
