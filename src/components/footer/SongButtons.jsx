import { usePlayerStore } from '@/store/playerStore.ts';
import { Play, Pause, Prev, Next } from '@/icons/PlayerIcons.jsx';
import { Shuffle, Repeat } from 'lucide-react';

export function SongButtons({ audio }) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const setRepeat = usePlayerStore((s) => s.setRepeat);

  return (
    <div className='flex items-center gap-4'>
      <button
        type='button'
        onClick={toggleShuffle}
        aria-label='Shuffle'
        aria-pressed={shuffle}
        className={`hover:scale-110 transition-transform cursor-pointer duration-300 ${
          shuffle ? 'text-green-500' : 'opacity-50 hover:opacity-100'
        }`}
      >
        <Shuffle className='size-4' />
      </button>
      <button
        type='button'
        onClick={() => {
          if (audio.current) audio.current.currentTime = 0;
          playPrev();
        }}
        aria-label='Previous'
        className='opacity-50 hover:opacity-100 transition-opacity duration-300'
      >
        <Prev />
      </button>
      <button
        type='button'
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className='bg-white text-black rounded-full p-2.5 hover:opacity-90 transition duration-300'
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button
        type='button'
        onClick={playNext}
        aria-label='Next'
        className='opacity-50 hover:opacity-100 transition-opacity duration-300'
      >
        <Next />
      </button>
      <button
        type='button'
        onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
        aria-label={`Repeat: ${repeat}`}
        className={`hover:scale-110 transition-transform cursor-pointer duration-300 ${
          repeat !== 'off' ? 'text-green-500' : 'opacity-50 hover:opacity-100'
        }`}
      >
        <Repeat className='size-4' />
        {repeat === 'one' && (
          <span className='absolute -mt-2 text-[8px] font-bold'>1</span>
        )}
      </button>
    </div>
  );
}
