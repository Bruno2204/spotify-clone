import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', { error, info });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }
      return (
        <div
          role='alert'
          className='flex flex-col items-center justify-center gap-4 p-8 m-8 bg-zinc-900 border border-zinc-700 rounded-lg text-center'
        >
          <h2 className='text-white text-2xl font-bold'>Something went wrong</h2>
          <p className='text-zinc-400 max-w-md'>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={this.handleReset}
              className='bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-full px-4 py-2 transition'
            >
              Try again
            </button>
            <button
              type='button'
              onClick={this.handleReload}
              className='bg-green-500 hover:bg-green-400 text-black font-bold rounded-full px-4 py-2 transition'
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
