import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/tests/**',
        '**/test/**',
        '**/__tests__/**',
        '**/coverage/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    include: [
      'apps/web/lib/**/*.{test,spec}.{ts,tsx}',
      'apps/web/lib/**/*.integration.test.{ts,tsx}',
      'apps/web/app/**/*.{test,spec}.{ts,tsx}',
      'packages/ui/src/**/*.{test,spec}.{ts,tsx}',
      'packages/supabase/src/**/*.{test,spec}.{ts,tsx}',
      'packages/shared/src/**/*.{test,spec}.{ts,tsx}',
      'packages/features/*/src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'apps/e2e/**',
      '**/coverage/**',
      '**/.turbo/**',
      'packages/ui/node_modules/**',
      'packages/supabase/node_modules/**',
      'packages/shared/node_modules/**',
      'packages/next/node_modules/**',
      'packages/features/*/node_modules/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@kit/ui': path.resolve(__dirname, './packages/ui/src'),
      '@kit/supabase': path.resolve(__dirname, './packages/supabase/src'),
      '@kit/shared': path.resolve(__dirname, './packages/shared/src'),
      '~': path.resolve(__dirname, './apps/web'),
    },
    conditions: ['module', 'import', 'node'],
  },
});
