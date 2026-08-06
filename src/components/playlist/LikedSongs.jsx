import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore.ts';
import { formatDuration } from '@/lib/utils.ts';

export function LikedSongs() {
  const [songs, setSongs] = useState(null);
  const [error, setError] = useState(null);
  const setCurrentMusic = usePlayerStore((state) => state.setCurrentMusic);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);

  useEffect(() => {
    fetch('/api/me/liked-songs')
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        return r.json();
      })
      .then((data) => setSongs(data.songs))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className='p-6 text-red-400'>{error}</div>;
  }
  if (songs === null) {
    return <div className='p-6 text-zinc-400'>Loading…</div>;
  }

  function playSong(song) {
    const playlist = {
      id: 'liked-songs',
      title: 'Liked Songs',
      cover: song.coverUrl,
    };
    setCurrentMusic({ playlist, songs, song });
    setIsPlaying(true);
  }

  return (
    <div className='p-6 flex flex-col gap-6'>
      <header className='flex items-center gap-4'>
        <div className='size-32 rounded bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center'>
          <Heart className='size-16 text-white fill-white' />
        </div>
        <div>
          <p className='text-zinc-400 text-sm font-semibold uppercase'>Playlist</p>
          <h1 className='text-white text-4xl font-extrabold'>Liked Songs</h1>
          <p className='text-zinc-400 text-sm mt-2'>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </header>

      {songs.length === 0 ? (
        <p className='text-zinc-400'>
          No liked songs yet. Click the heart on any song to add it here.
        </p>
      ) : (
        <table className='table-auto text-left min-w-full divide-y divide-white/10'>
          <thead>
            <tr className='text-gray-500 text-sm font-light'>
              <th className='py-2 w-14'>#</th>
              <th className='pr-4 py-2'>Title</th>
              <th className='pr-3 py-2'>Album</th>
              <th className='pr-1 py-2'>Duration</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr
                key={song.deezerTrackId}
                className='text-gray-400 hover:bg-white/10 transition-colors duration-200 ease-in-out group'
              >
                <td className='py-2 w-14'>
                  <button
                    type='button'
                    onClick={() => playSong(song)}
                    className='text-zinc-400 hover:text-white text-sm font-semibold'
                    aria-label={`Play ${song.title}`}
                  >
                    {index + 1}
                  </button>
                </td>
                <td className='pr-4 py-2 flex items-center gap-2'>
                  <img
                    src={song.coverUrl}
                    alt=''
                    className='size-10 rounded'
                  />
                  <div className='flex flex-col overflow-x-hidden'>
                    <h3 className='text-base font-normal line-clamp-1 text-white'>
                      {song.title}
                    </h3>
                    <span className='text-zinc-400 text-sm font-normal line-clamp-1'>
                      {song.artistName}
                    </span>
                  </div>
                </td>
                <td className='pr-3 py-2 overflow-x-hidden'>
                  <span className='line-clamp-1'>{song.albumTitle}</span>
                </td>
                <td className='pr-1 py-2'>
                  {formatDuration(song.durationSec)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
