import { useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore.ts';
import { formatDuration } from '@/lib/utils.ts';
import { LikeButton } from './LikeButton.jsx';
import { AddToPlaylistMenu } from './AddToPlaylistMenu.jsx';
import { toast } from 'sonner';

export function PlaylistSongs({ playlist, songs, isOwner = false }) {
  const [removingId, setRemovingId] = useState(null);
  const setCurrentMusic = usePlayerStore((s) => s.setCurrentMusic);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  async function handleRemove(deezerId) {
    if (!confirm('Remove this song from the playlist?')) return;
    setRemovingId(deezerId);
    const res = await fetch(`/api/playlists/${playlist.id}/songs/${deezerId}`, {
      method: 'DELETE',
    });
    setRemovingId(null);
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? 'Could not remove');
      return;
    }
    window.location.reload();
  }

  return (
    <table className='table-fixed text-left w-full divide-y divide-white/10'>
      <colgroup>
        <col className='w-10' />
        <col />
        <col className='w-32' />
        <col className='w-16' />
        <col className='w-10' />
        <col className='w-10' />
        {isOwner && <col className='w-10' />}
      </colgroup>
      <thead>
        <tr className='text-gray-500 text-sm font-light'>
          <th className='py-2 text-center'>#</th>
          <th className='pr-4 py-2 min-w-0'>Title</th>
          <th className='pr-3 py-2'>Album</th>
          <th className='pr-1 py-2 truncate'>Duration</th>
          <th className='py-2'></th>
          <th className='py-2'></th>
          {isOwner && <th className='py-2'></th>}
        </tr>
      </thead>

      <tbody>
        <tr className='h-4'><td></td></tr>
        {songs.map((song, index) => (
          <PlaylistRow
            key={song.deezerId}
            playlist={playlist}
            songs={songs}
            song={song}
            index={index}
            isOwner={isOwner}
            removing={removingId === song.deezerId}
            onRemove={handleRemove}
          />
        ))}
      </tbody>
    </table>
  );
}

function PlaylistRow({ playlist, songs, song, index, isOwner, removing, onRemove, draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setCurrentMusic = usePlayerStore((state) => state.setCurrentMusic);
  const isCurrentSong = usePlayerStore((state) => state.currentMusic.song?.deezerId === song.deezerId);
  const isCurrentPlaylist = usePlayerStore((state) => state.currentMusic.playlist?.id === playlist.id)

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaySong = () => {
    setCurrentMusic({ playlist, songs, song });
    setIsPlaying(true);
  };

  return (
    <tr
      draggable={draggable || false}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      aria-current={isCurrentSong && isCurrentPlaylist ? 'true' : undefined}
      className={`text-gray-400 hover:bg-white/10 transition-colors duration-200 ease-in-out w-full group ${
        isDragOver ? 'border-t-2 border-green-500' : ''
      }`}
    >

      <td className={`py-2 place-items-center rounded-l-lg ${isCurrentSong && isCurrentPlaylist ? "text-green-500" : "text-gray-400"}`}>
        <div className='relative flex items-center justify-center w-6 h-6'>
          {isCurrentSong && isCurrentPlaylist ? (
            <button className='cursor-pointer transition-transform duration-200 ease-in-out' onClick={handlePausePlay}>{isPlaying ? <Pause /> : <Play />}</button>
          ) : (
            <>
              <button onClick={handlePlaySong} className='absolute opacity-0 group-hover:opacity-100 transition-all duration-200 z-2'>
                <Play className='size-4 hover:text-white hover:opacity-100 transition-colors duration-200 ease-in-out cursor-pointer opacity-0 group-hover:opacity-100' />
              </button>
              <span className='absolute opacity-100 group-hover:opacity-0 transition-all duration-200 select-none z-1'>
                {index + 1}
              </span>
            </>
          )}
        </div>
      </td>
      {isOwner && (
        <td className='py-2 text-zinc-500 cursor-grab active:cursor-grabbing'>
          <GripVertical className='size-4 mx-auto' />
        </td>
      )}
      <td className='pr-4 py-2 flex items-center gap-2 justify-start min-w-0'>
        <picture className='aspect-square w-10 h-10 shrink-0'>
          <img src={song.cover} alt={song.title} className='w-full' />
        </picture>
        <div className='flex flex-col overflow-hidden min-w-0'>
          <h3
            className={`text-base font-normal line-clamp-1 truncate ${(isCurrentSong && isCurrentPlaylist) ? 'text-green-500' : 'text-white'}`}
          >
            <a href={`/song/${song.deezerId}`} className='hover:underline'>
              {song.title}
            </a>
          </h3>
          <span className='text-zinc-400 text-sm font-normal line-clamp-1 truncate'>
            {song.artistId ? (
              <a
                href={`/artist/${song.artistId}`}
                onClick={(e) => e.stopPropagation()}
                className='hover:underline hover:text-white'
              >
                {song.artist}
              </a>
            ) : (
              song.artist
            )}
          </span>
        </div>
      </td>
      <td className='pr-3 py-2 overflow-hidden'>
        <a href={`/album/${song.albumId ?? ''}`} className='line-clamp-1 truncate block hover:underline hover:text-white transition text-sm text-zinc-400'>
          {song.album}
        </a>
      </td>
      <td className='pr-1 py-2 rounded-r-lg text-zinc-400 text-sm tabular-nums'>
        {formatDuration(song.durationSec)}
      </td>
      <td className='py-2'>
        <LikeButton song={song} />
      </td>
      <td className='py-2'>
        <AddToPlaylistMenu song={song} compact />
      </td>
      {isOwner && (
        <td className='py-2'>
          <button
            type='button'
            onClick={() => onRemove(song.deezerId)}
            disabled={removing}
            aria-label='Remove from playlist'
            className='p-1 text-zinc-400 hover:text-red-400 disabled:opacity-50 transition'
          >
            <X className='size-4' />
          </button>
        </td>
      )}
    </tr>
  );
}
