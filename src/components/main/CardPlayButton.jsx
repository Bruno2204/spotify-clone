import { Play, Pause } from "@/icons/PlayerIcons.jsx";
import { usePlayerStore } from "@/store/playerStore.js";

export function CardPlayButton({ id, className = "" }) {
  const { isPlaying, setIsPlaying, currentMusic, setCurrentMusic } = usePlayerStore();

  const isPlayingPlaylist = isPlaying && currentMusic?.playlist?.id === id;
  const handleClick = () => {
    if (isPlayingPlaylist) {
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
    <div
      onClick={handleClick}
      className={`transition-all duration-500 bg-green-500 rounded-full p-3 ease-in-out text-black cursor-pointer hover:bg-green-400 hover:scale-105
      hover:shadow-2xl hover:shadow-black shadow-black shadow-7xl`}
    >
      {isPlayingPlaylist ? <Pause className={className} /> : <Play className={className} />}
    </div>
  );
}