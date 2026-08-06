import { useState } from 'react';
import { authClient } from '@/lib/authClient';

function nextFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('next') ?? '/';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? 'Login failed');
      return;
    }
    window.location.assign(nextFromUrl());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-4 w-full max-w-sm'
    >
      <h1 className='text-white text-3xl font-bold'>Log in</h1>

      {error && (
        <div
          role='alert'
          className='text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3'
        >
          {error}
        </div>
      )}

      <label className='flex flex-col gap-1'>
        <span className='text-sm font-semibold text-white'>Email</span>
        <input
          type='email'
          required
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='bg-zinc-800 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
        />
      </label>

      <label className='flex flex-col gap-1'>
        <span className='text-sm font-semibold text-white'>Password</span>
        <input
          type='password'
          required
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='bg-zinc-800 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
        />
      </label>

      <button
        type='submit'
        disabled={loading}
        className='bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-full py-3 transition'
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className='text-zinc-400 text-sm text-center'>
        Don't have an account?{' '}
        <a href='/register' className='text-white hover:underline'>
          Sign up
        </a>
      </p>
    </form>
  );
}
