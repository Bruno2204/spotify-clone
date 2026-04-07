import { usePlayerStore } from "@/store/playerStore.ts";
import { Play, Pause, Prev, Next } from "@/icons/PlayerIcons.jsx";

export function SongButtons({ audio }) {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic } = usePlayerStore();

  const handlePlay = () => {
    if (!audio.current.src) return
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const { song, songs, playlist } = currentMusic;
    if (!songs || songs.length === 0) return;

    const currentIndex = songs.findIndex((s) => s.id === song?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];

    setCurrentMusic({ playlist, song: nextSong, songs });
  };

  const handlePrev = () => {
    const { song, songs, playlist } = currentMusic;
    if (!songs || songs.length === 0) return;

    const currentIndex = songs.findIndex((s) => s.id === song?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];

    setCurrentMusic({ playlist, song: prevSong, songs });
  };
  return (
    <div className='flex items-center gap-5 *:hover:scale-110 *:transition-transform *:cursor-pointer *:duration-300'>
      <button onClick={handlePrev}>
        <Prev className='opacity-50 hover:opacity-100 transition-opacity duration-300' />
      </button>
      <button
        className='bg-white text-black rounded-full p-2.5 hover:opacity-90 transition duration-300'
        onClick={handlePlay}
      >
        {isPlaying ? <Pause /> :
          <Play />
        }
      </button>
      <button className='opacity-50 hover:opacity-100 transition-opacity duration-300' onClick={handleNext}>
        <Next />
      </button>

    </div>
  )
}