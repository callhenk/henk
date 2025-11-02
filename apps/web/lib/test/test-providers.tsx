import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a fresh QueryClient for each test
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Test wrapper that provides React Query context
 */
export function QueryTestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Test wrapper that provides both Supabase and React Query context
 */
export function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Helper to render components with test providers
 */
import { render, type RenderOptions } from '@testing-library/react';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  });
}

export { render, screen, fireEvent, waitFor } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
