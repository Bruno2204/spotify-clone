import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export function LikeButton({ song }) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    const optimistic = !liked;
    setLiked(optimistic);

    const deezerId = String(song.deezerId);
    const res = await fetch(`/api/songs/${deezerId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deezerTrackId: deezerId,
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
      setLiked(!optimistic);
      toast.error('Could not update like');
      return;
    }
    const data = await res.json();
    const finalLiked = Boolean(data.liked);
    setLiked(finalLiked);
    if (finalLiked) toast.success(`Added to Liked Songs`);
    else toast.success('Removed from Liked Songs');
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={busy}
      aria-label={liked ? 'Unlike song' : 'Like song'}
      aria-pressed={liked}
      className='p-1 hover:scale-110 transition-transform disabled:opacity-50'
    >
      <Heart
        className={`size-4 ${liked ? 'fill-green-500 text-green-500' : 'text-zinc-400 hover:text-white'}`}
      />
    </button>
  );
}
