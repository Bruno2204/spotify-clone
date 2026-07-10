// Vitest config — reuses Vite (same bundler as Astro) and adds jsdom for DOM tests.
// Note: the `@/*` alias is also defined in tsconfig.json, but Vite/Vitest don't
// read tsconfig paths — they need their own resolve.alias. Keep both in sync.

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    // happy-dom gives us a fake browser: document, window, HTMLAudioElement,
    // ResizeObserver, and modern CSS support. Chosen over jsdom because:
    // - jsdom 29's css-tree 3.2.1 fails on Tailwind v4 modern CSS (oklch, color-mix)
    // - happy-dom is 2-3x faster
    // - happy-dom includes ResizeObserver (jsdom doesn't)
    environment: 'happy-dom',

    // Enable `describe`, `it`, `expect` as globals (no need to import per-test).
    // Trade-off: less explicit, but cleaner test files.
    globals: true,

    // Setup file runs before every test (registers @testing-library/jest-dom matchers
    // and auto-cleans DOM after each test).
    setupFiles: ['./src/test/setup.ts'],

    // Match `.test.{js,jsx,ts,tsx}` and `.spec.{...}` files under src/.
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],

    // Show coverage for tracked files only (excludes node_modules, dist, etc.).
    // Run with `pnpm test:coverage` once @vitest/coverage-v8 is installed.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/test/**', '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{...}'],
    },
  },
  resolve: {
    // Mirror the @/* alias from tsconfig.json (Vite doesn't read tsconfig paths).
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Explicit JSX transform. The tsconfig says "react-jsx" (automatic runtime,
  // no need to import React), but Vite/esbuild doesn't read tsconfig for JSX
  // by default — must be set explicitly. Without this, every test file fails
  // with "ReferenceError: React is not defined".
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
});
