// Vitest setup — runs before every test file.
// Registers @testing-library/jest-dom matchers and auto-cleans the DOM after each test.
// (happy-dom already includes ResizeObserver and HTMLMediaElement stubs, so we
// don't need the polyfills we previously had for jsdom.)

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto-clean DOM after each test. Without this, leftover elements from one test
// can leak into the next and cause false positives/negatives.
afterEach(() => {
  cleanup();
});
