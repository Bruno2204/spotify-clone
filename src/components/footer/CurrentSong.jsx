import { Play } from 'lucide-react';
import { ArtistLink } from '@/components/main/ArtistLink.jsx';

export function CurrentSong({ song }) {
  if (!song) {
    return (
      <div className='flex items-center gap-3 overflow-hidden relative'>
        <picture className='size-16 shrink-0'>
          <div className='size-16 rounded-md bg-zinc-800 shadow-lg flex items-center justify-center'>
            <Play className='size-5 text-zinc-600' />
          </div>
        </picture>
        <div>
          <h3 className='text-zinc-600 text-md font-normal line-clamp-1'></h3>
          <p className='text-zinc-600 text-sm font-normal line-clamp-1'></p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 overflow-hidden relative'>
      <picture className='size-16 shrink-0'>
        <img
          src={song.cover}
          alt={song.title}
          className='size-16 rounded-md shadow-lg object-cover'
        />
      </picture>
      <div className='min-w-0'>
        <h3 className='text-white text-md font-normal line-clamp-1 truncate'>{song.title}</h3>
        <p className='text-zinc-400 text-sm font-normal line-clamp-1 truncate'>
          <ArtistLink id={song.artistId} name={song.artist ?? song.artistName} />
        </p>
      </div>
    </div>
  );
}
