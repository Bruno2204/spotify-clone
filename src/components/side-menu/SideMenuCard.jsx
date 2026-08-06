import { usePlayerStore } from '@/store/playerStore.ts';

export function SideMenuCard({ playlist }) {
  const { id, title, cover, artists } = playlist;
  const artistsString = artists.join(', ');
  const isCurrentPlaylist = usePlayerStore((state) => state.currentMusic?.playlist?.id === id);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  return (
    <a
      href={`/playlist/${id}`}
      className='flex flex-row gap-4 hover:bg-zinc-800 w-fit md:w-full p-2 rounded-md transition-colors duration-200 ease-in-out justify-center md:justify-start place-self-center'
    >
      <picture className='aspect-square w-14 place-content-center'>
        <img src={cover} alt={title} className='rounded' />
      </picture>
      <div className='gap-1 hidden md:flex-col md:flex'>
        <h3 className={`${isCurrentPlaylist && isPlaying ? 'text-green-500' : 'text-white'} text-md font-normal truncate`}>{title}</h3>
        <p className='text-zinc-400 text-sm font-normal truncate'>{artistsString}</p>
      </div>
    </a>
  )
}
