import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { TrackCard } from './TrackCard.jsx';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';
import { AddToQueueButton } from '@/components/playlist/AddToQueueButton.jsx';
import { AddToPlaylistMenu } from '@/components/playlist/AddToPlaylistMenu.jsx';
import { formatDuration } from '@/lib/utils';
import { ArtistLink } from './ArtistLink.jsx';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'songs', label: 'Songs' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'artists', label: 'Artists' },
  { value: 'albums', label: 'Albums' },
  { value: 'podcasts', label: 'Podcasts & Shows' },
];

function HorizontalRow({ title, items, songs, renderItem, showAllHref = '#' }) {
  if (!items || items.length === 0) return null;
  return (
    <section className='mb-8'>
      <header className='flex items-center justify-between mb-4'>
        <h2 className='text-white text-2xl font-bold'>{title}</h2>
        <a href={showAllHref} className='text-zinc-400 hover:text-white text-sm font-semibold transition'>
          Show all
        </a>
      </header>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
        {items.map((item, i) => (
          <div key={item.deezerId ?? i} className='h-full'>
            {renderItem(item, i, songs)}
          </div>
        ))}
      </div>
    </section>
  );
}

function TrackCardLocal({ track, songs }) {
  return <TrackCard track={track} songs={songs} />;
}

export function RadioCard({ track }) {
  const [hover, setHover] = useState(false);
  const isCurrent = usePlayerStore((s) => s.currentMusic.song?.deezerId === track.deezerId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  function handlePlay() {
    if (isCurrent) {
      togglePlay();
    } else {
      setCurrentMusic({
        playlist: { id: `radio-${track.deezerId}`, title: track.artist, cover: track.cover },
        songs: [track],
        song: track,
      });
      setIsPlaying(true);
    }
  }

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handlePlay}
      className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition cursor-pointer overflow-hidden'
    >
      <div className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
        <img
          src={track.cover}
          alt={track.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            hover ? 'scale-105' : 'scale-100'
          }`}
        />
        <span className='absolute top-2 right-2 bg-zinc-900/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded'>
          Radio
        </span>
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none' />
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className={`absolute right-2 bottom-2 size-12 rounded-full bg-green-500 text-black flex items-center justify-center shadow-xl transition-opacity duration-200 ${
            isCurrent || hover ? 'opacity-100' : 'opacity-0'
          } hover:scale-105 hover:bg-green-400`}
        >
          {isCurrent && isPlaying ? (
            <Pause className='size-5 fill-black' />
          ) : (
            <Play className='size-5 fill-black' />
          )}
        </button>
      </div>
      <p className='text-white text-sm font-semibold truncate'>
        <ArtistLink
          id={track.artistId}
          name={track.artist}
          className='hover:underline'
          stopPropagation
        />
      </p>
      <p className='text-zinc-400 text-xs truncate'>With {track.album}</p>
    </article>
  );
}

function SongsList({ tracks, songs }) {
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentSongId = usePlayerStore((s) => s.currentMusic.song?.deezerId);
  if (tracks.length === 0) {
    return <p className='text-zinc-400'>No songs found.</p>;
  }
  return (
    <table className='table-fixed text-left w-full'>
      <colgroup>
        <col className='w-12' />
        <col />
        <col className='w-10' />
        <col className='w-10' />
        <col className='w-10' />
        <col className='w-16' />
      </colgroup>
      <tbody>
        {tracks.map((track) => {
          const isCurrent = currentSongId === track.deezerId;
          return (
            <tr
              key={track.deezerId}
              onClick={() => {
                if (isCurrent) togglePlay();
                else {
                  setCurrentMusic({ playlist: null, song: track, songs: songs ?? [track] });
                  setIsPlaying(true);
                }
              }}
              className='text-zinc-300 hover:bg-white/10 transition-colors group cursor-pointer'
            >
              <td className='py-2'>
                <div className='size-10 rounded bg-zinc-800 flex items-center justify-center'>
                  {isCurrent && isPlaying ? (
                    <div className='flex gap-0.5'>
                      <div className='w-0.5 h-3 bg-green-500 animate-pulse' />
                      <div className='w-0.5 h-4 bg-green-500 animate-pulse' style={{ animationDelay: '0.1s' }} />
                      <div className='w-0.5 h-2 bg-green-500 animate-pulse' style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <img src={track.cover} alt='' className='size-10 rounded' />
                  )}
                </div>
              </td>
              <td className='py-2 min-w-0'>
                <p className={`truncate ${isCurrent ? 'text-green-500' : 'text-white'}`}>
                  {track.title}
                </p>
                <p className='text-zinc-400 text-sm truncate'>
                  <ArtistLink id={track.artistId} name={track.artist} stopPropagation />
                </p>
              </td>
              <td className='py-2' onClick={(e) => e.stopPropagation()}>
                <LikeButton song={track} />
              </td>
              <td className='py-2' onClick={(e) => e.stopPropagation()}>
                <AddToQueueButton song={track} compact />
              </td>
              <td className='py-2' onClick={(e) => e.stopPropagation()}>
                <AddToPlaylistMenu song={track} compact />
              </td>
              <td className='py-2 text-right text-zinc-400 text-sm tabular-nums pr-2'>
                {formatDuration(track.durationSec)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PlaylistGrid({ playlists }) {
  if (playlists.length === 0) return <p className='text-zinc-400'>No playlists found.</p>;
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
      {playlists.map((pl) => (
        <a
          key={pl.deezerId}
          href={`https://www.deezer.com/playlist/${pl.deezerId}`}
          target='_blank'
          rel='noreferrer'
          className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full'
        >
          <div className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
            <img src={pl.cover} alt={pl.title} className='w-full h-full object-cover' />
          </div>
          <p className='text-white text-sm font-semibold truncate'>{pl.title}</p>
          <p className='text-zinc-400 text-xs truncate'>By {pl.user.name}</p>
        </a>
      ))}
    </div>
  );
}

function ArtistGrid({ artists }) {
  if (artists.length === 0) return <p className='text-zinc-400'>No artists found.</p>;
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
      {artists.map((a) => (
        <a
          key={a.deezerId}
          href={`/artist/${a.deezerId}`}
          className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full'
        >
          <div className='relative aspect-square mb-3 rounded-full overflow-hidden bg-zinc-900'>
            <img src={a.picture} alt={a.name} className='w-full h-full object-cover' />
          </div>
          <p className='text-white text-sm font-semibold truncate text-center hover:underline'>{a.name}</p>
          <p className='text-zinc-400 text-xs text-center'>Artist</p>
        </a>
      ))}
    </div>
  );
}

function AlbumGrid({ albums }) {
  if (albums.length === 0) return <p className='text-zinc-400'>No albums found.</p>;
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
      {albums.map((a) => (
        <article
          key={a.deezerId}
          className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full'
        >
          <a href={`/album/${a.deezerId}`} className='block relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
            <img src={a.cover} alt={a.title} className='w-full h-full object-cover' />
          </a>
          <a
            href={`/album/${a.deezerId}`}
            className='block text-white text-sm font-semibold truncate hover:underline'
          >
            {a.title}
          </a>
          <ArtistLink
            id={a.artist?.deezerId}
            name={a.artist?.name}
            className='block text-zinc-400 text-xs truncate hover:underline'
          />
        </article>
      ))}
    </div>
  );
}

function PodcastGrid({ podcasts }) {
  if (podcasts.length === 0) return <p className='text-zinc-400'>No podcasts found.</p>;
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
      {podcasts.map((p) => (
        <a
          key={p.deezerId}
          href={`/podcast/${p.deezerId}`}
          className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full'
        >
          <div className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
            <img src={p.picture} alt={p.title} className='w-full h-full object-cover' />
          </div>
          <p className='text-white text-sm font-semibold truncate hover:underline'>{p.title}</p>
          <p className='text-zinc-400 text-xs line-clamp-2'>{p.description}</p>
        </a>
      ))}
    </div>
  );
}

export function HomePage({ initialTracks = [], initialArtists = [], initialPodcasts = [] }) {
  const [tab, setTab] = useState('all');
  const tracks = initialTracks;
  const artists = initialArtists;
  const podcasts = initialPodcasts;
  const topPlaylists = [];
  const topAlbums = initialAlbums(tracks);

  function initialAlbums(trackList) {
    const seen = new Set();
    return trackList.filter((t) => {
      if (seen.has(t.albumId)) return false;
      seen.add(t.albumId);
      return true;
    }).slice(0, 6);
  }

  const pickedForYou = tracks.slice(0, 6);
  const radio = tracks.slice(2, 10);

  if (tracks.length === 0) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  const visibleSections = (() => {
    if (tab === 'all') {
      return (
        <>
          <HorizontalRow
            title='Picked for you'
            items={pickedForYou}
            songs={tracks}
            renderItem={(t, _i, songs) => <TrackCardLocal track={t} songs={songs} />}
          />
          <HorizontalRow
            title='Popular radio'
            items={radio}
            renderItem={(t) => <RadioCard track={t} />}
          />
          <HorizontalRow
            title='Popular albums and singles'
            items={topAlbums}
            songs={tracks}
            renderItem={(t, _i, songs) => <TrackCardLocal track={t} songs={songs} />}
          />
          <HorizontalRow
            title='Popular artists'
            items={artists.slice(0, 6)}
            renderItem={(a) => (
              <a
                href={`/artist/${a.deezerId}`}
                className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full block'
              >
                <div className='relative aspect-square mb-3 rounded-full overflow-hidden bg-zinc-900'>
                  <img src={a.picture} alt={a.name} className='w-full h-full object-cover' />
                </div>
                <p className='text-white text-sm font-semibold truncate text-center hover:underline'>{a.name}</p>
                <p className='text-zinc-400 text-xs text-center'>Artist</p>
              </a>
            )}
          />
        </>
      );
    }
    if (tab === 'songs') return <SongsList tracks={tracks} songs={tracks} />;
    if (tab === 'playlists') return <PlaylistGrid playlists={topPlaylists} />;
    if (tab === 'artists') return <ArtistGrid artists={artists.slice(0, 18)} />;
    if (tab === 'albums') return <AlbumGrid albums={topAlbums} />;
    if (tab === 'podcasts') return <PodcastGrid podcasts={podcasts} />;
    return null;
  })();

  return (
    <div className='p-6 overflow-y-auto h-full'>
      <div className='flex items-center gap-2 mb-6 flex-wrap'>
        {TABS.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
              tab === t.value
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {visibleSections}
    </div>
  );
}
