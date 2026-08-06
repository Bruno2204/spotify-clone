import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { LikeButton } from '@/components/playlist/LikeButton.jsx';
import { AddToPlaylistMenu } from '@/components/playlist/AddToPlaylistMenu.jsx';
import { AddToQueueButton } from '@/components/playlist/AddToQueueButton.jsx';

export function TrackCard({ track, songs }) {
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
        playlist: { id: `track-${track.deezerId}`, title: track.title, cover: track.cover },
        songs: songs ?? [track],
        song: track,
      });
      setIsPlaying(true);
    }
  }

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className='group relative bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg p-3 transition cursor-pointer'
    >
      <div
        onClick={handlePlay}
        className='relative aspect-square mb-3 rounded overflow-hidden bg-zinc-900'
      >
        <img
          src={track.cover}
          alt={track.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            hover ? 'scale-105' : 'scale-100'
          }`}
        />
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
        <div
          className={`absolute top-2 right-2 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <LikeButton song={track} />
        </div>
        <div
          className={`absolute bottom-2 left-2 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <AddToQueueButton song={track} />
        </div>
      </div>
      <p className='text-white text-sm font-semibold truncate'>{track.title}</p>
      <p className='text-zinc-400 text-xs truncate'>
        {track.artistId ? (
          <a
            href={`/artist/${track.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className='hover:underline hover:text-white'
          >
            {track.artist}
          </a>
        ) : (
          track.artist
        )}
      </p>
      <div
        className='mt-1 transition-opacity duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        <AddToPlaylistMenu song={track} compact />
      </div>
    </article>
  );
}
