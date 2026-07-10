import { Play, Pause } from "@/icons/PlayerIcons.jsx";
import { usePlayerStore } from "@/store/playerStore.ts";

export function CardPlayButton({ id, className = "" }) {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic } = usePlayerStore();

  const isCurrentPlaylist = currentMusic?.playlist?.id === id;
  const handleClick = () => {
    if (isCurrentPlaylist) {
      setIsPlaying(!isPlaying);
      return;
    }
    fetch(`/api/get-info-playlist.json?id=${id}`)
      .then(res => res.json())
      .then(data => {
        const { playlist, songs } = data
        setIsPlaying(true)
        setCurrentMusic({ playlist, songs, song: songs[0] })
      })
  };


  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isPlaying && isCurrentPlaylist ? 'Pause playlist' : 'Play playlist'}
      className={`transition-all duration-500 bg-green-500 rounded-full p-3 ease-in-out text-black cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/80 hover:bg-green-400 hover:scale-105
      hover:shadow-2xl hover:shadow-black shadow-black shadow-7xl`}
    >
      {isPlaying && isCurrentPlaylist ? <Pause className={className} /> : <Play className={className} />}
    </button>
  );
}