import 'vitest';

declare module 'vitest' {
  interface Assertion<_T = unknown> {
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
