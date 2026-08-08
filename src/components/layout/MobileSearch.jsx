import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { ArtistLink } from '@/components/main/ArtistLink.jsx';

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef(null);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((tracks) => {
          setResults(tracks);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setLoading(false);
        });
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(track) {
    setCurrentMusic({ playlist: null, song: track, songs: results.length > 0 ? results : [track] });
    setIsPlaying(true);
    closeDialog();
  }

  function closeDialog() {
    setOpen(false);
    setQuery('');
    setResults([]);
    setHighlight(-1);
  }

  function handleKey(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h < results.length - 1 ? h + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h > 0 ? h - 1 : results.length - 1));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      handleSelect(results[highlight]);
    }
  }

  if (!open) {
    return (
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Search'
        className='md:hidden size-9 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition'
      >
        <Search className='size-4' />
      </button>
    );
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label='Search'
      className='md:hidden fixed inset-0 z-50 bg-black flex flex-col'
    >
      <header className='flex items-center gap-2 px-4 h-16 border-b border-zinc-800'>
        <button
          type='button'
          onClick={closeDialog}
          aria-label='Back'
          className='size-9 rounded-full hover:bg-zinc-800 flex items-center justify-center transition'
        >
          <ChevronLeft className='size-5' />
        </button>
        <div className='flex-1 relative flex items-center bg-zinc-900 rounded-full h-11'>
          <Search className='absolute left-4 size-5 text-zinc-400' />
          <input
            ref={inputRef}
            type='search'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(-1);
            }}
            onKeyDown={handleKey}
            placeholder='What do you want to play?'
            aria-label='Search'
            autoComplete='off'
            className='w-full bg-transparent text-white text-sm placeholder-zinc-400 outline-none pl-12 pr-12'
          />
          {query && (
            <button
              type='button'
              onClick={() => setQuery('')}
              aria-label='Clear'
              className='absolute right-3 size-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition'
            >
              <X className='size-4' />
            </button>
          )}
        </div>
      </header>

      <div className='flex-1 overflow-y-auto'>
        {loading && <p className='px-4 py-3 text-sm text-zinc-400'>Searching…</p>}
        {!loading && query.trim() && results.length === 0 && (
          <p className='px-4 py-3 text-sm text-zinc-400'>No results for "{query}"</p>
        )}
        {!loading && results.length > 0 && (
          <ul role='listbox' aria-label='Search results'>
            {results.map((track, i) => (
              <li
                key={track.deezerId}
                role='option'
                aria-selected={highlight === i}
                onClick={() => handleSelect(track)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                  highlight === i ? 'bg-zinc-800' : ''
                }`}
              >
                <img src={track.cover} alt='' className='size-12 rounded object-cover' />
                <div className='min-w-0 flex-1'>
                  <p className='text-white text-sm font-medium truncate'>{track.title}</p>
                  <p className='text-zinc-400 text-xs truncate'>
                    <ArtistLink id={track.artistId} name={track.artist} stopPropagation />
                  </p>
                </div>
                <span className='text-zinc-400 text-xs tabular-nums'>
                  {Math.floor(track.durationSec / 60)}:{(track.durationSec % 60).toString().padStart(2, '0')}
                </span>
              </li>
            ))}
            <li>
              <button
                type='button'
                onClick={() => {
                  window.location.assign(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className='block w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-white transition border-t border-zinc-800'
              >
                See all results for "{query}"
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
