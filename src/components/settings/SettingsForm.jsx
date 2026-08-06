import { useState } from 'react';
import { authClient } from '@/lib/authClient';
import { toast } from 'sonner';

export function SettingsForm({ user }) {
  const [name, setName] = useState(user.name ?? '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed (${res.status})`);
      return;
    }
    toast.success('Profile updated');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError(null);
    if (newPwd.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const { error: err } = await authClient.changePassword({
      currentPassword: currentPwd,
      newPassword: newPwd,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Could not change password');
      return;
    }
    setCurrentPwd('');
    setNewPwd('');
    toast.success('Password changed');
  }

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.assign('/');
  }

  async function handleDelete() {
    if (!confirm('Delete your account? This is permanent.')) return;
    setDeleting(true);
    const res = await fetch('/api/me', { method: 'DELETE' });
    if (res.status !== 204) {
      setDeleting(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed (${res.status})`);
      return;
    }
    await authClient.signOut();
    window.location.assign('/');
  }

  return (
    <div className='p-6 max-w-2xl mx-auto w-full overflow-y-auto h-full'>
      <h1 className='text-white text-3xl font-bold mb-6'>Settings</h1>

      {error && (
        <div
          role='alert'
          className='text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3 mb-6'
        >
          {error}
        </div>
      )}

      <section className='mb-8 bg-zinc-800/40 rounded-lg p-6'>
        <h2 className='text-white text-xl font-bold mb-4'>Profile</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <label className='flex flex-col gap-1'>
            <span className='text-sm font-semibold text-zinc-400'>Email</span>
            <input
              type='email'
              value={user.email}
              readOnly
              className='bg-zinc-900 text-zinc-500 rounded-md p-3 outline-none cursor-not-allowed'
            />
          </label>
          <label className='flex flex-col gap-1'>
            <span className='text-sm font-semibold text-zinc-400'>Display name</span>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={50}
              className='bg-zinc-900 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
            />
          </label>
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={loading || name === user.name}
              className='bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-full px-6 py-2 transition'
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </section>

      <section className='mb-8 bg-zinc-800/40 rounded-lg p-6'>
        <h2 className='text-white text-xl font-bold mb-4'>Change password</h2>
        <form onSubmit={handleChangePassword} className='flex flex-col gap-4'>
          <label className='flex flex-col gap-1'>
            <span className='text-sm font-semibold text-zinc-400'>Current password</span>
            <input
              type='password'
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              required
              className='bg-zinc-900 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
            />
          </label>
          <label className='flex flex-col gap-1'>
            <span className='text-sm font-semibold text-zinc-400'>New password</span>
            <input
              type='password'
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              minLength={8}
              className='bg-zinc-900 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
            />
          </label>
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={loading || !currentPwd || !newPwd}
              className='bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-full px-6 py-2 transition'
            >
              {loading ? 'Changing…' : 'Change password'}
            </button>
          </div>
        </form>
      </section>

      <section className='mb-8 bg-zinc-800/40 rounded-lg p-6'>
        <h2 className='text-white text-xl font-bold mb-4'>Account</h2>
        <div className='flex flex-col gap-3'>
          <button
            type='button'
            onClick={handleSignOut}
            disabled={signingOut}
            className='bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold rounded-full px-6 py-2 transition self-start'
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          <button
            type='button'
            onClick={handleDelete}
            disabled={deleting}
            className='bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-full px-6 py-2 transition self-start'
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </section>
    </div>
  );
}
