import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock navigator.clipboard for tests
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Custom matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
    };
  },

  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedPhone = received.replace(/[\s()-]/g, '');
    const pass = phoneRegex.test(cleanedPhone);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid phone number`
          : `Expected ${received} to be a valid phone number`,
    };
  },

  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid UUID`
          : `Expected ${received} to be a valid UUID`,
    };
  },
});

// Extend Vitest matchers type
declare module 'vitest' {
  interface Assertion {
    toBeValidEmail(): void;
    toBeValidPhoneNumber(): void;
    toBeValidUUID(): void;
    // @testing-library/jest-dom matchers
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toBeEnabled(): void;
    toHaveClass(...classNames: string[]): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveTextContent(text: string | RegExp): void;
    toBeVisible(): void;
    toBeEmptyDOMElement(): void;
    toContainElement(element: HTMLElement | null): void;
    toContainHTML(html: string): void;
    toHaveAccessibleDescription(description?: string | RegExp): void;
    toHaveAccessibleName(name?: string | RegExp): void;
    toHaveStyle(css: string | Record<string, unknown>): void;
    toHaveFocus(): void;
    toHaveFormValues(values: Record<string, unknown>): void;
    toHaveValue(value?: string | string[] | number): void;
    toHaveDisplayValue(value?: string | string[]): void;
    toBeChecked(): void;
    toBePartiallyChecked(): void;
    toHaveErrorMessage(message?: string | RegExp): void;
    toBeInvalid(): void;
    toBeValid(): void;
    toBeRequired(): void;
  }
}

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(),
}));

// Suppress console errors in tests (optional - comment out if you want to see them)
// global.console.error = vi.fn();
// global.console.warn = vi.fn();
