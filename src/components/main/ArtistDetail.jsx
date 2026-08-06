import { useState } from 'react';
import { Play, Users, Disc3 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';

export function ArtistDetail({ initialData }) {
  const [data, setData] = useState(initialData);
  const error = null;
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  if (error) {
    return <div className='p-6 text-red-400'>{error}</div>;
  }
  if (!data) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  const { artist, top } = data;

  function playAll() {
    if (top.length === 0) return;
    setCurrentMusic({ playlist: { id: `artist-${artist.deezerId}`, title: artist.name, cover: artist.picture }, songs: top, song: top[0] });
    setIsPlaying(true);
  }

  return (
    <div className='p-6 overflow-y-auto h-full'>
      <header
        className='flex items-end gap-6 pb-6 mb-6'
        style={{ background: 'linear-gradient(to bottom, rgba(29, 185, 84, 0.3), transparent)' }}
      >
        <img
          src={artist.picture}
          alt={artist.name}
          className='size-48 rounded-full shadow-2xl object-cover'
        />
        <div className='flex-1 min-w-0'>
          <p className='text-zinc-300 text-sm font-semibold'>Artist</p>
          <h1 className='text-white text-5xl font-extrabold mt-2 mb-4 truncate'>{artist.name}</h1>
          <div className='flex items-center gap-4 text-zinc-300 text-sm'>
            <span className='flex items-center gap-1'>
              <Users className='size-4' />
              {artist.nbFan.toLocaleString()} fans
            </span>
            <span className='flex items-center gap-1'>
              <Disc3 className='size-4' />
              {artist.nbAlbum} albums
            </span>
          </div>
        </div>
      </header>

      {top.length > 0 && (
        <section className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-white text-2xl font-bold'>Popular</h2>
            <button
              type='button'
              onClick={playAll}
              className='bg-green-500 hover:bg-green-400 text-black font-bold rounded-full px-6 py-2 flex items-center gap-2 transition'
            >
              <Play className='size-4 fill-black' />
              Play
            </button>
          </div>
          <table className='table-fixed text-left w-full'>
            <colgroup>
              <col className='w-10' />
              <col className='w-12' />
              <col />
              <col className='w-32' />
              <col className='w-10' />
              <col className='w-16' />
            </colgroup>
            <tbody>
              {top.map((track, i) => (
                <tr
                  key={track.deezerId}
                  className='text-zinc-300 hover:bg-white/10 transition-colors group'
                >
                  <td className='py-2 text-zinc-400'>{i + 1}</td>
                  <td className='py-2'>
                    <img src={track.cover} alt='' className='size-10 rounded' />
                  </td>
                  <td className='py-2 min-w-0'>
                    <p className='text-white truncate'>{track.title}</p>
                    <p className='text-zinc-400 text-sm truncate'>{track.artist}</p>
                  </td>
                  <td className='py-2'>
                    <a href={`/album/${track.albumId ?? ''}`} className='line-clamp-1 truncate block hover:underline hover:text-white transition text-sm text-zinc-400'>
                      {track.album}
                    </a>
                  </td>
                  <td className='py-2'>
                    <LikeButton song={track} />
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
    </div>
  );
}
