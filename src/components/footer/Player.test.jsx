import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Player from './Player.jsx';

describe('<Player />', () => {
  // Reset persisted Zustand state between tests so we always start from defaults.
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = render(<Player />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders an <audio> element', () => {
    const { container } = render(<Player />);
    const audio = container.querySelector('audio');
    expect(audio).toBeInTheDocument();
  });
});
