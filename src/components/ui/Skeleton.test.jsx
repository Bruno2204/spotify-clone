import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton.jsx';

describe('<Skeleton />', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renderiza con clase de animación pulse', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild;
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });

  it('acepta className custom y la concatena', () => {
    const { container } = render(<Skeleton className='h-4 w-20' />);
    const el = container.firstChild;
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-20');
  });

  it('es aria-hidden', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
