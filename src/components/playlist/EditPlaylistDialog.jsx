import { useState } from 'react';
import { toast } from 'sonner';

export function EditPlaylistDialog({ open, onClose, playlist, onUpdated }) {
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description ?? '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || null,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed (${res.status})`);
      return;
    }
    const { playlist: updated } = await res.json();
    onUpdated?.(updated);
    onClose();
    toast.success('Playlist updated');
  }

  async function handleDelete() {
    if (!confirm(`Delete "${playlist.title}"?`)) return;
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? 'Could not delete');
      return;
    }
    toast.success('Playlist deleted');
    window.location.assign('/');
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='edit-playlist-title'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className='bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md flex flex-col gap-4'
      >
        <h2
          id='edit-playlist-title'
          className='text-white text-2xl font-bold'
        >
          Edit playlist
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

        <div className='flex justify-between items-center pt-2'>
          <button
            type='button'
            onClick={handleDelete}
            className='text-red-400 hover:text-red-300 text-sm font-semibold transition'
          >
            Delete playlist
          </button>
          <div className='flex gap-2'>
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
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
