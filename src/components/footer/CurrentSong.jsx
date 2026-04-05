export function CurrentSong({ song }) {
  return (
    <div className='flex items-center gap-3 overflow-hidden relative'>
      <picture className='size-16 shrink-0'>
        {song?.image ? (
          <img
            src={song.image}
            alt={song.title}
            className='size-16 rounded-md bg-zinc-800 shadow-lg object-cover' />
        ) : (
          <div className='size-16 rounded-md bg-zinc-800 shadow-lg flex items-center justify-center'>
            <span className="text-zinc-600 text-xs"></span>
          </div>
        )}
      </picture>
      <div>
        <h3 className='text-white text-md font-normal line-clamp-1'>{song?.title}</h3>
        <p className='text-zinc-400 text-sm font-normal line-clamp-1'>{song?.artists.join(', ')}</p>
      </div>
    </div>
  );
}
