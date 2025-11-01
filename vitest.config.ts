import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'apps/e2e/**',
      'node_modules/**',
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
