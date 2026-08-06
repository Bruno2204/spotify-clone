import { useState } from 'react';
import { toast } from 'sonner';

export function CreatePlaylistDialog({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed (${res.status})`);
      return;
    }

    const { playlist } = await res.json();
    setTitle('');
    setDescription('');
    onCreated?.(playlist);
    onClose();
    toast.success(`Playlist "${playlist.title}" created`);
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='create-playlist-title'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className='bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md flex flex-col gap-4'
      >
        <h2
          id='create-playlist-title'
          className='text-white text-2xl font-bold'
        >
          Create playlist
        </h2>

        {error && (
          <div
            role='alert'
            className='text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3'
          >
            {error}
          </div>
        )}

        <label className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-white'>Title</span>
          <input
            type='text'
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='bg-zinc-800 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60'
          />
        </label>

        <label className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-white'>
            Description (optional)
          </span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='bg-zinc-800 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500/60 resize-none'
          />
        </label>

        <div className='flex gap-2 justify-end'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 rounded-full text-white font-semibold hover:bg-zinc-800 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-full px-4 py-2 transition'
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
