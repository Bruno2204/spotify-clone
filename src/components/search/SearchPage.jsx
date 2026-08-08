import { useState } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';
import { AddToPlaylistMenu } from '@/components/playlist/AddToPlaylistMenu.jsx';
import { formatDuration } from '@/lib/utils';
import { ArtistLink } from '@/components/main/ArtistLink.jsx';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'songs', label: 'Songs' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'artists', label: 'Artists' },
  { value: 'albums', label: 'Albums' },
  { value: 'podcasts', label: 'Podcasts & Shows' },
];

export function SearchPage({ q, initialTracks, initialArtists, initialAlbums, initialPlaylists, initialPodcasts }) {
  const [tab, setTab] = useState('all');
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  const topArtist = initialArtists[0];
  const topAlbum = initialAlbums[0];
  const featured = initialPlaylists.slice(0, 8);
  const topTracks = initialTracks.slice(0, 6);
  const topAlbums = initialAlbums.slice(0, 6);
  const topArtists = initialArtists.slice(0, 6);
  const topPlaylists = initialPlaylists.slice(0, 12);
  const topPodcasts = initialPodcasts;

  function playAllTracks() {
    if (initialTracks.length === 0) return;
    setCurrentMusic({
      playlist: { id: `search-${q}`, title: `Results for "${q}"`, cover: initialTracks[0].cover },
      songs: initialTracks,
      song: initialTracks[0],
    });
    setIsPlaying(true);
  }

  function playArtist(artist) {
    if (initialTracks.length === 0) return;
    setCurrentMusic({
      playlist: { id: `artist-${artist.deezerId}`, title: artist.name, cover: artist.picture },
      songs: initialTracks,
      song: initialTracks[0],
    });
    setIsPlaying(true);
  }

  if (!q) {
    return (
      <div className='p-6 overflow-y-auto h-full'>
        <h1 className='text-white text-2xl font-bold mb-4'>Search</h1>
        <p className='text-zinc-400'>Type something to search.</p>
      </div>
    );
  }

  return (
    <div className='p-6 overflow-y-auto h-full'>
      <div className='flex items-center gap-2 mb-6 flex-wrap'>
        {TABS.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              tab === t.value
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

          {tab === 'all' && (
        <>
          {topArtist && (
            <section className='mb-8 bg-zinc-800/40 rounded-lg p-6 flex items-center gap-6'>
              <img
                src={topArtist.picture}
                alt={topArtist.name}
                className='size-40 rounded-full shadow-2xl object-cover'
              />
              <div className='flex-1'>
                <p className='text-zinc-300 text-sm font-semibold uppercase'>Artist</p>
                <h2 className='text-white text-5xl font-extrabold mt-2 mb-4'>{topArtist.name}</h2>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => playArtist(topArtist)}
                    className='bg-green-500 hover:bg-green-400 text-black font-bold rounded-full size-14 flex items-center justify-center transition shadow-lg'
                    aria-label={`Play ${topArtist.name}`}
                  >
                    <Play className='size-6 fill-black' />
                  </button>
                </div>
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section className='mb-8'>
              <header className='flex items-center justify-between mb-4'>
                <h2 className='text-white text-2xl font-bold'>Featuring {topArtist?.name ?? q}</h2>
              </header>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {featured.map((pl) => (
                  <a
                    key={pl.deezerId}
                    href={`https://www.deezer.com/playlist/${pl.deezerId}`}
                    target='_blank'
                    rel='noreferrer'
                    className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition'
                  >
                    <div className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
                      <img src={pl.cover} alt={pl.title} className='w-full h-full object-cover' />
                      <button
                        type='button'
                        aria-label='Add'
                        className='absolute bottom-2 right-2 size-10 rounded-full bg-green-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition shadow-lg'
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info('Open the playlist on Deezer to listen');
                        }}
                      >
                        <Plus className='size-5' />
                      </button>
                    </div>
                    <p className='text-white text-sm font-semibold truncate'>{pl.title}</p>
                    <p className='text-zinc-400 text-xs truncate'>By {pl.user.name}</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {topAlbums.length > 0 && (
            <section className='mb-8'>
              <h2 className='text-white text-2xl font-bold mb-4'>Albums</h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
                {topAlbums.map((a) => (
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
                      id={a.artist?.deezerId ?? a.artistId}
                      name={a.artist?.name}
                      className='block text-zinc-400 text-xs truncate hover:underline'
                    />
                  </article>
                ))}
              </div>
            </section>
          )}

          {topTracks.length > 0 && (
            <section className='mb-8'>
              <header className='flex items-center justify-between mb-4'>
                <h2 className='text-white text-2xl font-bold'>Songs</h2>
                <button
                  type='button'
                  onClick={playAllTracks}
                  className='text-zinc-400 hover:text-white text-sm font-semibold transition'
                >
                  Play all
                </button>
              </header>
              <table className='table-fixed text-left w-full'>
                <colgroup>
                  <col className='w-12' />
                  <col />
                  <col className='w-10' />
                  <col className='w-10' />
                  <col className='w-16' />
                </colgroup>
                <tbody>
                  {topTracks.map((track) => (
                    <tr
                      key={track.deezerId}
                      className='text-zinc-300 hover:bg-white/10 transition-colors group'
                    >
                      <td className='py-2'>
                        <img src={track.cover} alt='' className='size-10 rounded' />
                      </td>
                      <td className='py-2 min-w-0'>
                        <p className='text-white truncate'>{track.title}</p>
                        <p className='text-zinc-400 text-sm truncate'>
                          <ArtistLink id={track.artistId} name={track.artist} />
                        </p>
                      </td>
                      <td className='py-2'>
                        <LikeButton song={track} />
                      </td>
                      <td className='py-2'>
                        <AddToPlaylistMenu song={track} compact />
                      </td>
                      <td className='py-2 text-right text-zinc-400 text-sm tabular-nums pr-2'>
                        {formatDuration(track.durationSec)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      {tab === 'songs' && <SongsList tracks={initialTracks} />}
      {tab === 'playlists' && <PlaylistGrid playlists={topPlaylists} />}
      {tab === 'artists' && <ArtistGrid artists={topArtists} />}
      {tab === 'albums' && <AlbumGrid albums={topAlbums} />}
      {tab === 'podcasts' && <PodcastGrid podcasts={topPodcasts} />}
    </div>
  );
}

function SongsList({ tracks }) {
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
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
        <col className='w-16' />
      </colgroup>
      <tbody>
        {tracks.map((track) => (
          <tr
            key={track.deezerId}
            className='text-zinc-300 hover:bg-white/10 transition-colors group'
          >
            <td className='py-2'>
              <img src={track.cover} alt='' className='size-10 rounded' />
            </td>
            <td className='py-2 min-w-0'>
              <p className='text-white truncate'>{track.title}</p>
              <p className='text-zinc-400 text-sm truncate'>
                <ArtistLink id={track.artistId} name={track.artist} />
              </p>
            </td>
            <td className='py-2'>
              <LikeButton song={track} />
            </td>
            <td className='py-2'>
              <AddToPlaylistMenu song={track} compact />
            </td>
            <td className='py-2 text-right text-zinc-400 text-sm tabular-nums pr-2'>
              {formatDuration(track.durationSec)}
            </td>
          </tr>
        ))}
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
            id={a.artist?.deezerId ?? a.artistId}
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
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
      {podcasts.map((p) => (
        <a
          key={p.deezerId}
          href={`/podcast/${p.deezerId}`}
          className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition'
        >
          <div className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
            <img src={p.picture} alt={p.title} className='w-full h-full object-cover' />
          </div>
          <p className='text-white text-sm font-semibold truncate'>{p.title}</p>
          <p className='text-zinc-400 text-xs line-clamp-2'>{p.description}</p>
        </a>
      ))}
    </div>
  );
}

function toast() {}
