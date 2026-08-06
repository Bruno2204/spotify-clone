import { useState, useEffect, useRef } from 'react';
import { Plus, Search, ArrowUpDown, Maximize2, History, Play } from 'lucide-react';
import { CreatePlaylistDialog } from '@/components/playlist/CreatePlaylistDialog.jsx';
import { usePlayerStore } from '@/store/playerStore';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recents' },
  { value: 'name', label: 'Name' },
];

const TABS = [
  { value: 'playlists', label: 'Playlists' },
  { value: 'history', label: 'History' },
  { value: 'artists', label: 'Artists' },
  { value: 'podcasts', label: 'Podcasts' },
];

export function Library({ initialPlaylists = [] }) {
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [artists, setArtists] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortMode, setSortMode] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const playHistory = usePlayerStore((s) => s.playHistory);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  useEffect(() => {
    if (tab === 'artists' && artists.length === 0) {
      setLoading(true);
      fetch('/api/artists/top')
        .then((r) => r.json())
        .then(setArtists)
        .finally(() => setLoading(false));
    } else if (tab === 'podcasts' && podcasts.length === 0) {
      setLoading(true);
      fetch('/api/podcasts/top')
        .then((r) => r.json())
        .then(setPodcasts)
        .finally(() => setLoading(false));
    }
  }, [tab, artists.length, podcasts.length]);

  useEffect(() => {
    if (!sortOpen) return;
    function handle(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [sortOpen]);

  function handleCreated(playlist) {
    setPlaylists((prev) => [
      { id: playlist.id, title: playlist.title, coverUrl: playlist.coverUrl, _count: { songs: 0 }, updatedAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  function playHistoryTrack(track) {
    setCurrentMusic({ playlist: null, song: track, songs: [track] });
    setIsPlaying(true);
  }

  const items = (() => {
    if (tab === 'playlists') return playlists;
    if (tab === 'artists') return artists;
    if (tab === 'podcasts') return podcasts;
    return playHistory;
  })();

  const filtered = items
    .filter((item) => {
      const name = item.title ?? item.name ?? '';
      return name.toLowerCase().includes(filter.toLowerCase());
    })
    .sort((a, b) => {
      if (sortMode === 'name') {
        const na = (a.title ?? a.name ?? '').toLowerCase();
        const nb = (b.title ?? b.name ?? '').toLowerCase();
        return na.localeCompare(nb);
      }
      if (tab === 'history') return 0;
      const ta = new Date(a.updatedAt ?? 0).getTime();
      const tb = new Date(b.updatedAt ?? 0).getTime();
      return tb - ta;
    });

  const showSort = tab !== 'history';
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Recents';

  return (
    <div className='flex flex-col gap-4 h-full'>
      <header className='flex items-center justify-between'>
        <button
          type='button'
          className='flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold'
        >
          <span>Your Library</span>
        </button>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => setShowCreate(true)}
            aria-label='Create'
            className='size-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 flex items-center justify-center transition'
          >
            <Plus className='size-4' />
          </button>
          <button
            type='button'
            aria-label='Expand'
            className='size-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 flex items-center justify-center transition'
          >
            <Maximize2 className='size-4' />
          </button>
        </div>
      </header>

      <div className='flex items-center gap-1 flex-wrap'>
        {TABS.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
              tab === t.value
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='flex items-center justify-between text-xs text-zinc-400'>
        <button
          type='button'
          aria-label='Search'
          className='size-7 rounded-full hover:bg-zinc-800 flex items-center justify-center transition'
        >
          <Search className='size-4' />
        </button>
        {showSort && (
          <div ref={sortRef} className='relative'>
            <button
              type='button'
              onClick={() => setSortOpen((v) => !v)}
              aria-haspopup='menu'
              aria-expanded={sortOpen}
              className='flex items-center gap-1 hover:text-white transition'
            >
              <span>{currentSortLabel}</span>
              <ArrowUpDown className='size-3' />
            </button>
            {sortOpen && (
              <div
                role='menu'
                className='absolute right-0 top-full mt-1 w-36 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-50'
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    role='menuitemradio'
                    aria-checked={sortMode === opt.value}
                    onClick={() => {
                      setSortMode(opt.value);
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm transition ${
                      sortMode === opt.value
                        ? 'text-green-500 font-semibold'
                        : 'text-white hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'history' && (
          <span className='flex items-center gap-1'>
            <History className='size-3' />
            Last {playHistory.length}
          </span>
        )}
      </div>

      <div className='flex-1 overflow-y-auto -mx-2 px-2'>
        {loading && <p className='text-xs text-zinc-500 py-2'>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className='text-xs text-zinc-500 py-2'>
            {tab === 'playlists' ? 'No playlists yet' : tab === 'history' ? 'No recently played' : `No ${tab} found`}
          </p>
        )}
        {filtered.map((item) => {
          if (tab === 'playlists') {
            return (
              <a
                key={item.id}
                href={`/playlist/${item.id}`}
                className='flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition'
              >
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt='' className='size-12 rounded object-cover' />
                ) : (
                  <div className='size-12 rounded bg-zinc-800' />
                )}
                <div className='min-w-0 flex-1'>
                  <p className='text-white text-sm font-normal truncate'>{item.title}</p>
                  <p className='text-zinc-400 text-xs truncate'>
                    Playlist · {item._count?.songs ?? 0} songs
                  </p>
                </div>
              </a>
            );
          }
          if (tab === 'artists') {
            return (
              <a
                key={item.deezerId}
                href={`/artist/${item.deezerId}`}
                className='flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition'
              >
                <img
                  src={item.picture}
                  alt={item.name}
                  className='size-12 rounded-full object-cover'
                />
                <div className='min-w-0 flex-1'>
                  <p className='text-white text-sm font-normal truncate'>{item.name}</p>
                  <p className='text-zinc-400 text-xs truncate'>Artist</p>
                </div>
              </a>
            );
          }
          if (tab === 'podcasts') {
            return (
              <a
                key={item.deezerId}
                href={`/podcast/${item.deezerId}`}
                className='flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition'
              >
                <img src={item.picture} alt={item.title} className='size-12 rounded object-cover' />
                <div className='min-w-0 flex-1'>
                  <p className='text-white text-sm font-normal truncate'>{item.title}</p>
                  <p className='text-zinc-400 text-xs truncate'>Podcast</p>
                </div>
              </a>
            );
          }
          // history tab
          return (
            <button
              key={item.deezerId}
              type='button'
              onClick={() => playHistoryTrack(item)}
              className='w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition group'
            >
              <img src={item.cover} alt='' className='size-12 rounded' />
              <div className='min-w-0 flex-1'>
                <p className='text-white text-sm font-normal truncate'>{item.title}</p>
                <p className='text-zinc-400 text-xs truncate'>{item.artist}</p>
              </div>
              <Play className='size-4 text-zinc-400 group-hover:text-white' />
            </button>
          );
        })}
      </div>

      {showCreate && (
        <CreatePlaylistDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
