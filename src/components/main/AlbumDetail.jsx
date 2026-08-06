import { useState } from 'react';
import { Play, Clock, User } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';
import { AddToPlaylistMenu } from '@/components/playlist/AddToPlaylistMenu.jsx';

export function AlbumDetail({ initialData }) {
  const [data] = useState(initialData);
  const error = null;
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  if (error) {
    return <div className='p-6 text-red-400'>{error}</div>;
  }
  if (!data) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  const tracks = data.tracks ?? [];

  function playAll() {
    if (tracks.length === 0) return;
    setCurrentMusic({
      playlist: { id: `album-${data.deezerId}`, title: data.title, cover: data.cover },
      songs: tracks,
      song: tracks[0],
    });
    setIsPlaying(true);
  }

  const year = data.releaseDate ? data.releaseDate.split('-')[0] : '';

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
          <p className='text-zinc-300 text-sm font-semibold uppercase'>Album</p>
          <h1 className='text-white text-5xl font-extrabold mt-2 mb-4 truncate'>{data.title}</h1>
          <div className='flex items-center gap-2 text-zinc-300 text-sm'>
            <a
              href={`/artist/${data.artist.deezerId}`}
              className='font-semibold text-white hover:underline flex items-center gap-1'
            >
              {data.artist.picture && (
                <img src={data.artist.picture} alt='' className='size-6 rounded-full' />
              )}
              {data.artist.name}
            </a>
            {year && <span className='text-zinc-400'>· {year}</span>}
            <span className='text-zinc-400'>· {data.nbTracks} tracks</span>
          </div>
        </div>
      </header>

      {tracks.length > 0 && (
        <section className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-white text-2xl font-bold'>Tracks</h2>
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
              <col />
              <col className='w-12' />
              <col className='w-10' />
            </colgroup>
            <tbody>
              {tracks.map((track, i) => (
                <tr
                  key={track.deezerId}
                  className='text-zinc-300 hover:bg-white/10 transition-colors group'
                >
                  <td className='py-2 text-zinc-400'>{i + 1}</td>
                  <td className='py-2 min-w-0'>
                    <p className='text-white truncate'>{track.title}</p>
                  </td>
                  <td className='py-2 text-right text-zinc-400 text-sm tabular-nums pr-2'>
                    {formatDuration(track.durationSec)}
                  </td>
                  <td className='py-2'>
                    <div className='flex items-center gap-1'>
                      <LikeButton song={track} />
                      <AddToPlaylistMenu song={track} compact />
                    </div>
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
