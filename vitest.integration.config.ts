import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.integration.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'apps/e2e/**'],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000,
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
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@kit/ui': path.resolve(__dirname, './packages/ui/src'),
      '@kit/supabase': path.resolve(__dirname, './packages/supabase/src'),
      '@kit/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
