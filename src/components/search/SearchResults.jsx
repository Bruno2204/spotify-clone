import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';

const SKELETON_KEYS = [0, 1, 2, 3, 4, 5, 6, 7];

export function SearchResults({ query }) {
  const [state, setState] = useState({ status: 'idle', tracks: [], error: null });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState({ status: 'idle', tracks: [], error: null });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading', tracks: [], error: null });

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=25`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((tracks) => {
        setState({ status: 'success', tracks, error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ status: 'error', tracks: [], error: err.message });
      });

    return () => controller.abort();
  }, [query]);

  if (state.status === 'idle') {
    return <p className='text-zinc-400 text-sm'>Search for songs, artists, or albums.</p>;
  }

  if (state.status === 'loading') {
    return (
      <ul className='flex flex-col gap-2'>
        {SKELETON_KEYS.map((k) => (
          <li key={k} className='flex items-center gap-3 p-2 rounded-md'>
            <Skeleton className='size-12 rounded' />
            <div className='flex-1 flex flex-col gap-2'>
              <Skeleton className='h-3.5 w-1/3' />
              <Skeleton className='h-3 w-1/5' />
            </div>
            <Skeleton className='h-3 w-10' />
          </li>
        ))}
      </ul>
    );
  }

  if (state.status === 'error') {
    return (
      <div className='text-zinc-300 bg-zinc-800/50 border border-red-500/30 rounded-lg p-4'>
        <p className='font-semibold text-red-400 mb-1'>Couldn't fetch results</p>
        <p className='text-sm text-zinc-400'>{state.error}</p>
      </div>
    );
  }

  if (state.tracks.length === 0) {
    return <p className='text-zinc-400 text-sm'>No results for "{query}".</p>;
  }

  return (
    <ul className='flex flex-col'>
      {state.tracks.map((track) => (
        <SearchResultItem key={track.deezerId} track={track} songs={state.tracks} />
      ))}
    </ul>
  );
}

function SearchResultItem({ track, songs }) {
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  const handlePlay = () => {
    setCurrentMusic({ playlist: null, song: track, songs });
    setIsPlaying(true);
  };

  return (
    <li className='group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors'>
      <div className='relative size-12 shrink-0'>
        <img
          src={track.cover}
          alt={track.title}
          className='size-12 rounded object-cover bg-zinc-800'
        />
        <button
          onClick={handlePlay}
          aria-label={`Play ${track.title}`}
          className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded'
        >
          <Play className='size-5 fill-white text-white' />
        </button>
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-white text-sm font-medium truncate'>{track.title}</p>
        <p className='text-zinc-400 text-xs truncate'>{track.artist}</p>
      </div>
      <span className='text-zinc-400 text-xs tabular-nums mr-2'>{formatDuration(track.durationSec)}</span>
      <LikeButton song={track} />
    </li>
  );
}
