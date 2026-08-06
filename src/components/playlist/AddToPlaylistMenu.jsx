import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AddToPlaylistMenu({ song, onCreated, compact = false }) {
  const [playlists, setPlaylists] = useState([]);
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [addedTo, setAddedTo] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/playlists')
      .then((r) => r.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .catch(() => setError('Failed to load playlists'));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  async function addTo(playlistId) {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deezerTrackId: String(song.deezerId),
        title: song.title,
        artistName: song.artist,
        albumTitle: song.album,
        coverUrl: song.cover,
        previewUrl: song.previewUrl,
        durationSec: song.durationSec,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed (${res.status})`);
      toast.error('Could not add to playlist');
      return;
    }
    const playlist = playlists.find((p) => p.id === playlistId);
    setAddedTo(playlistId);
    toast.success(`Added to ${playlist?.title ?? 'playlist'}`);
    setTimeout(() => {
      setOpen(false);
      setAddedTo(null);
    }, 800);
  }

  async function createAndAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setBusy(true);

    const createRes = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!createRes.ok) {
      setBusy(false);
      const data = await createRes.json().catch(() => ({}));
      setError(data.error ?? `Failed (${createRes.status})`);
      toast.error('Could not create playlist');
      return;
    }
    const { playlist } = await createRes.json();
    onCreated?.(playlist);
    setNewTitle('');
    setShowCreate(false);
    await addTo(playlist.id);
  }

  return (
    <div ref={ref} className='relative inline-block'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={compact ? 'Add to playlist' : undefined}
        className={
          compact
            ? 'p-1 text-zinc-400 hover:text-white transition'
            : 'text-zinc-400 hover:text-white text-sm font-semibold transition'
        }
      >
        {compact ? <Plus className='size-4' /> : 'Add to playlist'}
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 top-full mt-1 w-56 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg py-1 z-50'
        >
          {error && (
            <div className='px-3 py-2 text-xs text-red-400'>{error}</div>
          )}

          {playlists.length === 0 && !showCreate && (
            <div className='px-3 py-2 text-xs text-zinc-400'>
              No playlists yet
            </div>
          )}

          {playlists.map((p) => (
            <button
              key={p.id}
              type='button'
              role='menuitem'
              disabled={busy}
              onClick={() => addTo(p.id)}
              className='block w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50'
            >
              {addedTo === p.id ? '✓ Added' : p.title}
            </button>
          ))}

          {showCreate ? (
            <form
              onSubmit={createAndAdd}
              className='px-3 py-2 border-t border-zinc-700 flex gap-2'
            >
              <input
                type='text'
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder='Playlist name'
                className='flex-1 bg-zinc-800 text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-green-500/60'
              />
              <button
                type='submit'
                disabled={busy}
                className='text-green-500 hover:text-green-400 text-sm font-semibold disabled:opacity-50'
              >
                Add
              </button>
            </form>
          ) : (
            <button
              type='button'
              role='menuitem'
              onClick={() => setShowCreate(true)}
              className='block w-full text-left px-3 py-2 text-sm text-green-500 hover:bg-zinc-800 border-t border-zinc-700'
            >
              + New playlist
            </button>
          )}
        </div>
      )}
    </div>
  );
}
