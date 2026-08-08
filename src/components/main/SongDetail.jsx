import { useState, useEffect } from 'react';
import { Play, Clock, Disc3, User, Plus, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';
import { AddToPlaylistMenu } from '@/components/playlist/AddToPlaylistMenu.jsx';
import { ArtistLink } from './ArtistLink.jsx';
import { toast } from 'sonner';

export function SongDetail({ trackId }) {
  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  useEffect(() => {
    fetch(`/api/tracks/${trackId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d.track);
        const id = String(d.track.albumId);
        if (/^[1-9]\d*$/.test(id)) {
          return fetch(`/api/albums/${id}`)
            .then((r) => r.ok ? r.json() : null)
            .then((album) => {
              if (album?.album?.tracks) {
                setRelated(album.album.tracks.filter((t) => String(t.deezerId) !== String(trackId)).slice(0, 6));
              }
            });
        }
      })
      .catch((e) => setError(e.message));
  }, [trackId]);

  if (error) {
    return <div className='p-6 text-red-400'>{error}</div>;
  }
  if (!data) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  function playSong() {
    setCurrentMusic({
      playlist: { id: `song-${trackId}`, title: data.title, cover: data.cover },
      songs: related.length > 0 ? [data, ...related] : [data],
      song: data,
    });
    setIsPlaying(true);
  }

  const song = { ...data, artist: data.artist, album: data.album };

  return (
    <div className='p-6 overflow-y-auto h-full'>
      <header
        className='flex items-end gap-6 pb-6 mb-6'
        style={{ background: 'linear-gradient(to bottom, rgba(29, 185, 84, 0.3), transparent)' }}
      >
        <img
          src={data.cover}
          alt={data.title}
          className='size-48 rounded shadow-2xl object-cover bg-zinc-800'
        />
        <div className='flex-1 min-w-0'>
          <p className='text-zinc-300 text-sm font-semibold uppercase'>Song</p>
          <h1 className='text-white text-5xl font-extrabold mt-2 mb-3 truncate'>{data.title}</h1>
          <div className='flex items-center gap-2 text-zinc-300 text-sm flex-wrap'>
            <a
              href={`/artist/${data.artistId}`}
              className='font-semibold text-white hover:underline flex items-center gap-1'
            >
              <User className='size-4' />
              {data.artist}
            </a>
            {data.albumId && (
              <>
                <span className='text-zinc-400'>·</span>
                <a
                  href={`/album/${data.albumId}`}
                  className='hover:underline flex items-center gap-1'
                >
                  <Disc3 className='size-4' />
                  {data.album}
                </a>
              </>
            )}
            <span className='text-zinc-400'>·</span>
            <span className='flex items-center gap-1'>
              <Clock className='size-4' />
              {formatDuration(data.durationSec)}
            </span>
          </div>
        </div>
      </header>

      <div className='flex items-center gap-3 mb-8'>
        <button
          type='button'
          onClick={playSong}
          className='bg-green-500 hover:bgbg-green-400 hover:bg-green-400 text-black font-bold rounded-full px-6 py-2.5 flex items-center gap-2 transition shadow-lg'
        >
          <Play className='size-4 fill-black' />
          Play
        </button>
        <LikeButton song={song} />
        <AddToPlaylistMenu song={song} />
      </div>

      {related.length > 0 && (
        <section>
          <h2 className='text-white text-2xl font-bold mb-4'>More from this album</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch'>
            {related.map((track) => (
              <article
                key={track.deezerId}
                className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition h-full'
              >
                <a href={`/song/${track.deezerId}`} className='block relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'>
                  <img src={track.cover} alt={track.title} className='w-full h-full object-cover' />
                </a>
                <a
                  href={`/song/${track.deezerId}`}
                  className='block text-white text-sm font-semibold truncate hover:underline'
                >
                  {track.title}
                </a>
                <ArtistLink
                  id={track.artistId}
                  name={track.artist}
                  className='block text-zinc-400 text-xs truncate hover:underline'
                />
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
