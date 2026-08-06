import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary.jsx';

function Boom() {
  throw new Error('Kaboom');
}

describe('<ErrorBoundary />', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('muestra fallback UI cuando un child tira error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Kaboom')).toBeInTheDocument();
  });

  it('fallback custom se usa cuando se provee', () => {
    render(
      <ErrorBoundary
        fallback={({ error }) => <p>Custom: {error.message}</p>}
      >
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom: Kaboom')).toBeInTheDocument();
  });

  it('botón Try again resetea el error state', () => {
    let shouldThrow = true;
    function MaybeBoom() {
      if (shouldThrow) throw new Error('Once');
      return <p>Recovered</p>;
    }
    const { rerender } = render(
      <ErrorBoundary>
        <MaybeBoom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    const tryAgainBtn = screen.getByText('Try again');
    tryAgainBtn.click();

    rerender(
      <ErrorBoundary>
        <MaybeBoom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
