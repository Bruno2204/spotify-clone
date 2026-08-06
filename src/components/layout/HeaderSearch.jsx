import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef(null);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

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

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleSelect(track) {
    setCurrentMusic({ playlist: null, song: track, songs: results.length > 0 ? results : [track] });
    setIsPlaying(true);
    setOpen(false);
    setQuery('');
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
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      window.location.assign(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form
      ref={ref}
      action='/search'
      method='get'
      role='search'
      onSubmit={handleSubmit}
      className='flex-1 max-w-xl relative'
    >
      <div className='relative flex items-center bg-zinc-900 hover:bg-zinc-800 focus-within:bg-zinc-800 rounded-full h-11 transition group'>
        <Search className='absolute left-4 size-5 text-zinc-400' />
        <input
          type='search'
          name='q'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder='What do you want to play?'
          aria-label='Search'
          autoComplete='off'
          className='w-full bg-transparent text-white text-sm placeholder-zinc-400 outline-none pl-12 pr-12'
        />
        {query && (
          <button
            type='button'
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            aria-label='Clear'
            className='absolute right-3 size-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition'
          >
            <X className='size-4' />
          </button>
        )}
      </div>
      {open && query.trim() && (
        <div className='absolute left-0 right-0 top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden z-50'>
          {loading && (
            <ul role='listbox' aria-label='Search results' aria-busy='true'>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <li
                  key={k}
                  role='option'
                  aria-hidden='true'
                  className='flex items-center gap-3 px-3 py-2'
                >
                  <div className='size-10 rounded bg-zinc-700 animate-pulse shrink-0' />
                  <div className='flex-1 flex flex-col gap-2 min-w-0'>
                    <div className='h-3.5 w-2/3 rounded bg-zinc-700 animate-pulse' />
                    <div className='h-3 w-1/3 rounded bg-zinc-700/60 animate-pulse' />
                  </div>
                  <div className='h-3 w-10 rounded bg-zinc-700/60 animate-pulse' />
                </li>
              ))}
            </ul>
          )}
          {!loading && results.length === 0 && (
            <p className='px-4 py-3 text-sm text-zinc-400'>No results for "{query}"</p>
          )}
          {!loading && results.length > 0 && (
            <ul role='listbox' aria-label='Search results'>
              {results.map((track, i) => (
                <li
                  key={track.deezerId}
                  role='option'
                  aria-selected={highlight === i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(track)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                    highlight === i ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'
                  }`}
                >
                  <img src={track.cover} alt='' className='size-10 rounded object-cover' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-white text-sm font-medium truncate'>{track.title}</p>
                    <p className='text-zinc-400 text-xs truncate'>{track.artist}</p>
                  </div>
                  <span className='text-zinc-400 text-xs tabular-nums'>
                    {Math.floor(track.durationSec / 60)}:{(track.durationSec % 60).toString().padStart(2, '0')}
                  </span>
                </li>
              ))}
              <li className='border-t border-zinc-700'>
                <button
                  type='submit'
                  className='block w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-white transition'
                >
                  See all results for "{query}"
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
