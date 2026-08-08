import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { ArtistLink } from '@/components/main/ArtistLink.jsx';

export function QueuePanel({ onClose }) {
  const ref = useRef(null);
  const queue = usePlayerStore((s) => s.queue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  function playFromQueue(idx) {
    const song = queue[idx];
    setCurrentMusic({
      playlist: { id: 'queue', title: 'Queue', cover: song.cover },
      songs: queue.slice(idx),
      song,
    });
    setIsPlaying(true);
  }

  return (
    <div
      ref={ref}
      role='dialog'
      aria-label='Queue'
      className='absolute bottom-full right-0 mb-2 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 z-50 max-h-[60vh] overflow-y-auto'
    >
      <header className='flex items-center justify-between mb-2 sticky top-0 bg-zinc-900 pb-2 border-b border-zinc-700'>
        <h2 className='text-white text-sm font-bold'>Queue ({queue.length})</h2>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close queue'
          className='p-1 text-zinc-400 hover:text-white'
        >
          <X className='size-4' />
        </button>
      </header>
      {queue.length === 0 ? (
        <p className='text-zinc-400 text-sm py-2 text-center'>Queue is empty</p>
      ) : (
        <ul className='flex flex-col gap-1'>
          {queue.map((song, i) => (
            <li
              key={`${song.deezerId}-${i}`}
              className='flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 group'
            >
              <img src={song.cover} alt='' className='size-10 rounded shrink-0' />
              <button
                type='button'
                onClick={() => playFromQueue(i)}
                className='flex-1 min-w-0 text-left'
              >
                <p className='text-white text-sm truncate'>{song.title}</p>
                <p className='text-zinc-400 text-xs truncate'>
                  <ArtistLink
                    id={song.artistId}
                    name={song.artist}
                    stopPropagation
                  />
                </p>
              </button>
              <button
                type='button'
                onClick={() => removeFromQueue(i)}
                aria-label='Remove from queue'
                className='p-1 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition'
              >
                <X className='size-3' />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
