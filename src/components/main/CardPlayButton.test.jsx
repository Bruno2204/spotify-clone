// CardPlayButton.test.jsx — B5 regression test
// Verifies the play button renders as a real <button> (not a <div onClick>),
// making it keyboard-accessible and screen-reader-friendly.

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { CardPlayButton } from './CardPlayButton.jsx';

describe('<CardPlayButton />', () => {
  // Reset persisted Zustand state between tests so we always start from defaults.
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders as a <button> (not a <div>)', () => {
    const { container } = render(<CardPlayButton id="any-id" />);
    const btn = container.querySelector('button');
    expect(btn).toBeInTheDocument();
  });

  it('has an accessible aria-label', () => {
    const { container } = render(<CardPlayButton id="any-id" />);
    const btn = container.querySelector('button');
    expect(btn).toHaveAttribute('aria-label');
  });
});
